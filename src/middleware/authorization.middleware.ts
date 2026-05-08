import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/db";
import { TipoRequisicao } from "../models/Solicitacao";
import { UserAdmin } from "../models/UserAdmin";
import { UserAprovacao } from "../models/UserAprovacao";
import { UserBipagem } from "../models/UserBipagem";
import { UserCriacaoSolicitacao } from "../models/UserCriacaoSolicitacao";
import { UserSeparacao } from "../models/UserSeparacao";
import { CustomError } from "../types/CustomError";

export const MASTER_ADMIN_SECTOR = "automacao";

export type AuthorizationContext = {
  isMasterAdmin: boolean;
  isAdmin: boolean;
  adminPermissions: TipoRequisicao[];
  creationPermissions: TipoRequisicao[];
  approvalPermissions: TipoRequisicao[];
  bipagemPermissions: TipoRequisicao[];
  canApproveTrade: boolean;
  separationPermissions: TipoRequisicao[];
  tradeApprovalPermissions: TipoRequisicao[] | null;
  allowedSolicitacaoTypes: TipoRequisicao[] | null;
  dashboardPermissions: TipoRequisicao[] | null;
  canViewDashboard: boolean;
};

const getAuthenticatedMatricula = (req: Request): number => {
  const matricula = req.user?.matricula;

  if (!matricula) {
    throw new CustomError("Usuário não autenticado", 401);
  }

  const parsed = Number(matricula);
  if (Number.isNaN(parsed)) {
    throw new CustomError("Matrícula do usuário autenticado inválida", 400);
  }

  return parsed;
};

const normalizePermissions = (tipos?: TipoRequisicao[] | null): TipoRequisicao[] =>
  Array.isArray(tipos) ? tipos : [];

const uniquePermissions = (...groups: TipoRequisicao[][]): TipoRequisicao[] =>
  [...new Set(groups.flat())];

export const loadAuthorizationContext = async (req: Request): Promise<AuthorizationContext> => {
  if (
    req.allowedSolicitacaoTypes !== undefined
    && req.isMasterAdmin !== undefined
    && req.isAdmin !== undefined
  ) {
    return {
      isMasterAdmin: req.isMasterAdmin,
      isAdmin: req.isAdmin,
      adminPermissions: req.adminPermissions ?? [],
      creationPermissions: req.creationPermissions ?? [],
      approvalPermissions: req.approvalPermissions ?? [],
      bipagemPermissions: req.bipagemPermissions ?? [],
      canApproveTrade: req.canApproveTrade ?? false,
      separationPermissions: req.separationPermissions ?? [],
      tradeApprovalPermissions: req.tradeApprovalPermissions ?? null,
      allowedSolicitacaoTypes: req.allowedSolicitacaoTypes,
      dashboardPermissions: req.dashboardPermissions ?? null,
      canViewDashboard: req.canViewDashboard ?? false,
    };
  }

  const matricula = getAuthenticatedMatricula(req);
  const userSector = req.user?.setor?.toLowerCase().trim() ?? "";
  const isMasterAdmin = userSector === MASTER_ADMIN_SECTOR;

  const [userAdmin, userAprovacao, userSeparacao, userCriacao, userBipagem] = await Promise.all([
    isMasterAdmin
      ? Promise.resolve(null)
      : AppDataSource.getRepository(UserAdmin).findOne({ where: { matricula } }),
    AppDataSource.getRepository(UserAprovacao).findOne({ where: { matricula } }),
    AppDataSource.getRepository(UserSeparacao).findOne({ where: { matricula } }),
    AppDataSource.getRepository(UserCriacaoSolicitacao).findOne({ where: { matricula } }),
    AppDataSource.getRepository(UserBipagem).findOne({ where: { matricula } }),
  ]);

  const adminPermissions = isMasterAdmin
    ? Object.values(TipoRequisicao)
    : normalizePermissions(userAdmin?.tipo_requisicao);
  const creationPermissions = normalizePermissions(userCriacao?.tipo_requisicao);
  const approvalPermissions = normalizePermissions(userAprovacao?.tipo_requisicao);
  const separationPermissions = normalizePermissions(userSeparacao?.tipo_requisicao);
  const bipagemPermissions = normalizePermissions(userBipagem?.tipo_requisicao);
  const tradeApprovalPermissions = userAprovacao?.pode_aprovar_troca
    ? (userAprovacao.tipo_requisicao ?? null)
    : null;

  const allowedSolicitacaoTypes = isMasterAdmin
    ? null
    : userAdmin
      ? adminPermissions
      : uniquePermissions(approvalPermissions, separationPermissions, creationPermissions);

  const hasAnyPermission = !!userAdmin
    || !!userAprovacao
    || creationPermissions.length > 0
    || separationPermissions.length > 0
    || bipagemPermissions.length > 0;
  const canViewDashboard = isMasterAdmin
    || hasAnyPermission;
  const dashboardPermissions = canViewDashboard
    ? null
    : [];

  req.isMasterAdmin = isMasterAdmin;
  req.isAdmin = isMasterAdmin || !!userAdmin;
  req.adminPermissions = adminPermissions;
  req.creationPermissions = creationPermissions;
  req.approvalPermissions = approvalPermissions;
  req.bipagemPermissions = bipagemPermissions;
  req.canApproveTrade = !!userAprovacao?.pode_aprovar_troca;
  req.separationPermissions = separationPermissions;
  req.tradeApprovalPermissions = tradeApprovalPermissions;
  req.allowedSolicitacaoTypes = allowedSolicitacaoTypes;
  req.canViewDashboard = canViewDashboard;
  req.dashboardPermissions = dashboardPermissions;

  return {
    isMasterAdmin,
    isAdmin: req.isAdmin,
    adminPermissions,
    creationPermissions,
    approvalPermissions,
    bipagemPermissions,
    canApproveTrade: req.canApproveTrade,
    separationPermissions,
    tradeApprovalPermissions,
    allowedSolicitacaoTypes,
    dashboardPermissions,
    canViewDashboard,
  };
};

export const isMasterAdmin = async (req: Request, _res: Response, next: NextFunction) => {
  const context = await loadAuthorizationContext(req);

  if (!context.isMasterAdmin) {
    throw new CustomError("Usuário sem permissão de administrador master", 403);
  }

  next();
};

export const isAdmin = async (req: Request, _res: Response, next: NextFunction) => {
  const context = await loadAuthorizationContext(req);

  if (!context.isAdmin) {
    throw new CustomError("Usuário sem permissão administrativa", 403);
  }

  next();
};

export const authorizeSolicitacaoView = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const context = await loadAuthorizationContext(req);

  if (context.isMasterAdmin) {
    return next();
  }

  const hasOperationalScope =
    context.isAdmin
    || context.creationPermissions.length > 0
    || context.approvalPermissions.length > 0
    || context.separationPermissions.length > 0;

  if (!hasOperationalScope || !context.allowedSolicitacaoTypes || context.allowedSolicitacaoTypes.length === 0) {
    throw new CustomError("Usuário sem permissão para visualizar solicitações", 403);
  }

  next();
};

export const authorizeDashboardView = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const context = await loadAuthorizationContext(req);

  if (
    !context.canViewDashboard
    || (!context.isMasterAdmin && Array.isArray(context.dashboardPermissions) && context.dashboardPermissions.length === 0)
  ) {
    throw new CustomError("Usuário sem permissão para visualizar dashboard", 403);
  }

  next();
};

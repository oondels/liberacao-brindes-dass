import { AppDataSource } from "../config/db";
import { TipoRequisicao } from "../models/Solicitacao";
import { UserBipagem } from "../models/UserBipagem";
import { UserCriacaoSolicitacao } from "../models/UserCriacaoSolicitacao";
import { ServiceResult } from "../types/service";

type AuthorizationContext = {
  isMasterAdmin: boolean;
  isAdmin: boolean;
  adminPermissions: TipoRequisicao[];
  approvalPermissions: TipoRequisicao[];
  canApproveTrade: boolean;
  separationPermissions: TipoRequisicao[];
  tradeApprovalPermissions: TipoRequisicao[] | null;
  allowedSolicitacaoTypes: TipoRequisicao[] | null;
};

export type UserPermissoesResponse = {
  isAdmin: boolean;
  isMasterAdmin: boolean;
  canCreateSolicitacao: boolean;
  canBiparVoucher: boolean;
  canApprove: boolean;
  canSeparate: boolean;
  canApproveTrade: boolean;
  canViewSolicitacoes: boolean;
  canManageAprovacao: boolean;
  canManageSolicitacaoUsers: boolean;
  canManageBipagemUsers: boolean;
  canManageSeparacaoUsers: boolean;
  canManageAdminUsers: boolean;
  canViewDashboard: boolean;
  tipos: {
    criacao: TipoRequisicao[];
    bipagem: TipoRequisicao[];
    aprovacao: TipoRequisicao[];
    separacao: TipoRequisicao[];
    admin: TipoRequisicao[];
    visualizacao: TipoRequisicao[] | null;
    aprovacaoTroca: TipoRequisicao[] | null;
  };
};

const normalizeTipos = (tipos?: TipoRequisicao[] | null): TipoRequisicao[] =>
  Array.isArray(tipos) ? tipos : [];

const canViewSolicitacoes = (context: AuthorizationContext): boolean => {
  if (context.isMasterAdmin) {
    return true;
  }

  const hasOperationalScope =
    context.isAdmin
    || context.approvalPermissions.length > 0
    || context.separationPermissions.length > 0;

  return Boolean(
    hasOperationalScope
    && context.allowedSolicitacaoTypes
    && context.allowedSolicitacaoTypes.length > 0
  );
};

export const obterPermissoesUsuario = async (
  matricula: number,
  context: AuthorizationContext
): Promise<ServiceResult<UserPermissoesResponse>> => {
  const [criacao, bipagem] = await Promise.all([
    AppDataSource.getRepository(UserCriacaoSolicitacao).findOne({ where: { matricula } }),
    AppDataSource.getRepository(UserBipagem).findOne({ where: { matricula } }),
  ]);

  const criacaoTipos = normalizeTipos(criacao?.tipo_requisicao);
  const bipagemTipos = normalizeTipos(bipagem?.tipo_requisicao);
  const canManageAdminArea = context.isAdmin;

  return {
    status: 200,
    body: {
      isAdmin: context.isAdmin,
      isMasterAdmin: context.isMasterAdmin,
      canCreateSolicitacao: criacaoTipos.length > 0,
      canBiparVoucher: bipagemTipos.length > 0,
      canApprove: context.approvalPermissions.length > 0,
      canSeparate: context.separationPermissions.length > 0,
      canApproveTrade: context.canApproveTrade,
      canViewSolicitacoes: canViewSolicitacoes(context),
      canManageAprovacao: canManageAdminArea,
      canManageSolicitacaoUsers: canManageAdminArea,
      canManageBipagemUsers: canManageAdminArea,
      canManageSeparacaoUsers: canManageAdminArea,
      canManageAdminUsers: context.isMasterAdmin,
      canViewDashboard: canManageAdminArea,
      tipos: {
        criacao: criacaoTipos,
        bipagem: bipagemTipos,
        aprovacao: context.approvalPermissions,
        separacao: context.separationPermissions,
        admin: context.adminPermissions,
        visualizacao: context.allowedSolicitacaoTypes,
        aprovacaoTroca: context.tradeApprovalPermissions,
      },
    },
  };
};

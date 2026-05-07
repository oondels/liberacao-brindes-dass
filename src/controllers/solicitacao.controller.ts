import { NextFunction, Request, Response } from "express";
import {
  aprovarSolicitacao,
  aprovarTrocaSolicitacao,
  cancelarSolicitacao,
  criarSolicitacao,
  listarSolicitacoesSeparacao,
  listarSolicitacoes,
  listarSolicitacoesTroca,
  obterSolicitacaoPorId,
  rejeitarSolicitacao,
  validarSeparacao,
} from "../services/solicitacao.service";
import {
  AprovarSolicitacaoInput,
  CreateSolicitacaoInput,
  ListSolicitacaoSeparacaoQuery,
  ListSolicitacaoQuery,
  SepararSolicitacaoInput,
} from "../schemas/solicitacao.schema";
import {CustomError} from "../types/CustomError";
import { TipoRequisicao } from "../models/Solicitacao";

export const postSolicitacoes = async (
  req: Request<{}, {}, CreateSolicitacaoInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;

    if (!user?.matricula) {
      throw new CustomError("Usuário não autenticado", 401);
    }

    const usuarioCriador = Number(user.matricula);
    if (Number.isNaN(usuarioCriador)) {
      throw new CustomError("Matrícula do usuário autenticado inválida", 400);
    }

    const payload = {
      ...req.body,
      usuario_criador: usuarioCriador,
    }
    const result = await criarSolicitacao(payload as CreateSolicitacaoInput & { usuario_criador?: number });
    res.status(result.status).json(result.body);
    return;
  } catch (error) {
    console.error("Erro ao criar solicitação. Entre em contato com a equipe de automação.", error);
    next(error)
  }
};

export const getSolicitacoes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const matricula = req.user?.matricula !== undefined ? Number(req.user.matricula) : undefined;
    const isPureSeparator =
      !(req.isMasterAdmin ?? false)
      && !(req.isAdmin ?? false)
      && !(req.canApproveTrade ?? false)
      && (req.approvalPermissions ?? []).length === 0
      && (req.separationPermissions ?? []).length > 0;

    const result = await listarSolicitacoes(
      req.query as unknown as ListSolicitacaoQuery,
      {
        userMatricula: Number.isNaN(matricula) ? undefined : matricula,
        isMasterAdmin: req.isMasterAdmin ?? false,
        allowedTypes: req.allowedSolicitacaoTypes ?? [],
        canApproveTrade: req.canApproveTrade ?? false,
        tradeApprovalPermissions: req.tradeApprovalPermissions ?? null,
        restrictToSeparationStatus: isPureSeparator,
      }
    );
    res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Erro ao listar solicitações: ", error);
    next(error);
  }
  return;
};

export const getSolicitacoesSeparacao = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;

    if (!user?.matricula) {
      throw new CustomError("Usuário não autenticado", 401);
    }

    const matricula = Number(user.matricula);
    if (Number.isNaN(matricula)) {
      throw new CustomError("Matrícula do usuário autenticado inválida", 400);
    }

    const result = await listarSolicitacoesSeparacao(
      matricula,
      (req.separationPermissions ?? []) as TipoRequisicao[],
      req.query as unknown as ListSolicitacaoSeparacaoQuery
    );
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const getSolicitacoesTroca = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;

    if (!user?.matricula) {
      throw new CustomError("Usuário não autenticado", 401);
    }

    const matricula = Number(user.matricula);
    if (Number.isNaN(matricula)) {
      throw new CustomError("Matrícula do usuário autenticado inválida", 400);
    }

    const result = await listarSolicitacoesTroca(
      matricula,
      req.query as unknown as ListSolicitacaoSeparacaoQuery
    );
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const getSolicitacaoById = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = _req.params.id as string
    const result = await obterSolicitacaoPorId(id);

    res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Erro ao buscar solicitação por id: ", error);
    next(error)
  }
};

export const postSolicitacaoAprovar = async (
  req: Request<{ id: string }, {}, AprovarSolicitacaoInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = req.user;

    if (!user?.matricula) {
      throw new CustomError("Usuário não autenticado", 401);
    }

    const usuario_aprovador_id = Number(user.matricula);
    const result = await aprovarSolicitacao(id, usuario_aprovador_id, req.body);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const postSolicitacaoSeparar = async (
  req: Request<{ id: string }, {}, SepararSolicitacaoInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = req.user;

    if (!user?.matricula) {
      throw new CustomError("Usuário não autenticado", 401);
    }

    const operadorMatricula = Number(user.matricula);
    if (Number.isNaN(operadorMatricula)) {
      throw new CustomError("Matrícula do usuário autenticado inválida", 400);
    }

    const result = await validarSeparacao(id, operadorMatricula, req.body);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const postSolicitacaoAprovarTroca = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = req.user;

    if (!user?.matricula) {
      throw new CustomError("Usuário não autenticado", 401);
    }

    const usuario_aprovador_id = Number(user.matricula);
    if (Number.isNaN(usuario_aprovador_id)) {
      throw new CustomError("Matrícula do usuário autenticado inválida", 400);
    }

    const result = await aprovarTrocaSolicitacao(id, usuario_aprovador_id);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const postSolicitacaoRejeitar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = req.user;

    if (!user?.matricula) {
      throw new CustomError("Usuário não autenticado", 401);
    }

    const usuario_id = user ? Number(user.matricula) : undefined;
    const result = await rejeitarSolicitacao(id, usuario_id);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const postSolicitacaoCancelar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { motivo } = req.body;
    const usuarioCancelamento = req.user?.matricula !== undefined
      ? Number(req.user.matricula)
      : undefined;

    if (usuarioCancelamento !== undefined && Number.isNaN(usuarioCancelamento)) {
      throw new CustomError("Matrícula do usuário autenticado inválida", 400);
    }

    const result = await cancelarSolicitacao(id, motivo, usuarioCancelamento);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

import { NextFunction, Request, Response } from "express";
import {
  aprovarSolicitacao,
  cancelarSolicitacao,
  criarSolicitacao,
  listarSolicitacoes,
  obterSolicitacaoPorId,
  rejeitarSolicitacao,
} from "../services/solicitacao.service";
import {
  CreateSolicitacaoInput,
  ListSolicitacaoQuery,
} from "../schemas/solicitacao.schema";
import {CustomError} from "../types/CustomError";

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

    const payload = {
      ...req.body,
      usuario_criador: user ? user.matricula : undefined,
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
  res: Response
): Promise<void> => {
  try {
    const result = await listarSolicitacoes(req.query as unknown as ListSolicitacaoQuery);
    res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Erro ao listar solicitações: ", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
  return;
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

    const usuario_aprovador_id = Number(user.matricula);
    const result = await aprovarSolicitacao(id, usuario_aprovador_id);
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
    const result = await cancelarSolicitacao(id, motivo);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

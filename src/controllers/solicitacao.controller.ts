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

export const postSolicitacoes = async (
  req: Request<{}, {}, CreateSolicitacaoInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await criarSolicitacao(req.body);
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
    // TODO: extrair usuario_aprovador_id da autenticação quando implementado
    const usuario_aprovador_id = Number(req.body?.usuario_aprovador_id) || 1;
    const result = await aprovarSolicitacao(id, usuario_aprovador_id);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const postSolicitacaoRejeitar = async (
  _req: Request,
  res: Response
): Promise<void> => {
  const result = await rejeitarSolicitacao();
  res.status(result.status).json(result.body);
};

export const postSolicitacaoCancelar = async (
  _req: Request,
  res: Response
): Promise<void> => {
  const result = await cancelarSolicitacao();
  res.status(result.status).json(result.body);
};

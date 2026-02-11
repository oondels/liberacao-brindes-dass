import { Request, Response } from "express";
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
  res: Response
): Promise<void> => {
  const result = await criarSolicitacao(req.body);
  res.status(result.status).json(result.body);
  return;
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
  res: Response
): Promise<void> => {
  const result = await obterSolicitacaoPorId();
  res.status(result.status).json(result.body);
};

export const postSolicitacaoAprovar = async (
  _req: Request,
  res: Response
): Promise<void> => {
  const result = await aprovarSolicitacao();
  res.status(result.status).json(result.body);
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

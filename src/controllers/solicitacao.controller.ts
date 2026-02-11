import { Request, Response } from "express";
import {
  aprovarSolicitacao,
  cancelarSolicitacao,
  criarSolicitacao,
  listarSolicitacoes,
  obterSolicitacaoPorId,
  rejeitarSolicitacao,
} from "../services/solicitacao.service";

export const postSolicitacoes = async (_req: Request, res: Response): Promise<void> => {
  console.log('nova solicitação');
  console.log(_req.body);
  
  // const result = await criarSolicitacao();
  res.send('test')
  // res.status(201).json(result.body);
};

export const getSolicitacoes = async (_req: Request, res: Response): Promise<void> => {
  const result = await listarSolicitacoes();
  res.status(result.status).json(result.body);
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

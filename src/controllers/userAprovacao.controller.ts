import { NextFunction, Request, Response } from "express";
import {
  criarUserAprovacao,
  listarUserAprovacao,
  obterUserAprovacaoPorId,
  atualizarUserAprovacao,
} from "../services/userAprovacao.service";
import {
  CreateUserAprovacaoInput,
  PatchUserAprovacaoInput,
} from "../schemas/userAprovacao.schema";

export const postUserAprovacao = async (
  req: Request<{}, {}, CreateUserAprovacaoInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await criarUserAprovacao(req.body);
    res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Erro ao criar user aprovação:", error);
    next(error);
  }
};

export const getUserAprovacao = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await listarUserAprovacao();
    res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Erro ao listar users aprovação:", error);
    next(error);
  }
};

export const getUserAprovacaoById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const result = await obterUserAprovacaoPorId(id);
    res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Erro ao buscar user aprovação por id:", error);
    next(error);
  }
};

export const patchUserAprovacao = async (
  req: Request<{ id: string }, {}, PatchUserAprovacaoInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await atualizarUserAprovacao(id, req.body);
    res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Erro ao atualizar user aprovação:", error);
    next(error);
  }
};

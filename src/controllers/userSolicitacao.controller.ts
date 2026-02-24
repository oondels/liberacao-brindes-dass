import { NextFunction, Request, Response } from "express";
import {
  CreateUserSolicitacaoInput,
  ListUserSolicitacaoQueryInput,
  PutUserSolicitacaoInput,
  UserSolicitacaoIdParam,
} from "../schemas/userSolicitacao.schema";
import {
  atualizarUserSolicitacao,
  criarUserSolicitacao,
  deletarUserSolicitacao,
  listarUserSolicitacao,
  obterUserSolicitacaoPorId,
} from "../services/userSolicitacao.service";
import { CustomError } from "../types/CustomError";

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

export const postUserSolicitacao = async (
  req: Request<{}, {}, CreateUserSolicitacaoInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const createdBy = getAuthenticatedMatricula(req);
    const result = await criarUserSolicitacao(req.body, createdBy);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const getUserSolicitacao = async (
  req: Request<{}, {}, {}, ListUserSolicitacaoQueryInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await listarUserSolicitacao(req.query);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const getUserSolicitacaoById = async (
  req: Request<UserSolicitacaoIdParam>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await obterUserSolicitacaoPorId(req.params.id);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const putUserSolicitacao = async (
  req: Request<UserSolicitacaoIdParam, {}, PutUserSolicitacaoInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const updatedBy = getAuthenticatedMatricula(req);
    const result = await atualizarUserSolicitacao(req.params.id, req.body, updatedBy);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const deleteUserSolicitacao = async (
  req: Request<UserSolicitacaoIdParam>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await deletarUserSolicitacao(req.params.id);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

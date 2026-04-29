import { NextFunction, Request, Response } from "express";
import {
  CreateUserSeparacaoInput,
  ListUserSeparacaoQueryInput,
  PutUserSeparacaoInput,
  UserSeparacaoIdParam,
} from "../schemas/userSeparacao.schema";
import {
  atualizarUserSeparacao,
  criarUserSeparacao,
  deletarUserSeparacao,
  listarUserSeparacao,
  obterUserSeparacaoPorId,
} from "../services/userSeparacao.service";
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

export const postUserSeparacao = async (
  req: Request<{}, {}, CreateUserSeparacaoInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const createdBy = getAuthenticatedMatricula(req);
    const result = await criarUserSeparacao(req.body, createdBy);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const getUserSeparacao = async (
  req: Request<{}, {}, {}, ListUserSeparacaoQueryInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await listarUserSeparacao(req.query);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const getUserSeparacaoById = async (
  req: Request<UserSeparacaoIdParam>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await obterUserSeparacaoPorId(req.params.id);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const putUserSeparacao = async (
  req: Request<UserSeparacaoIdParam, {}, PutUserSeparacaoInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const updatedBy = getAuthenticatedMatricula(req);
    const result = await atualizarUserSeparacao(req.params.id, req.body, updatedBy);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const deleteUserSeparacao = async (
  req: Request<UserSeparacaoIdParam>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await deletarUserSeparacao(req.params.id);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

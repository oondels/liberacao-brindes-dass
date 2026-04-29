import { NextFunction, Request, Response } from "express";
import {
  CreateUserBipagemInput,
  ListUserBipagemQueryInput,
  PutUserBipagemInput,
  UserBipagemIdParam,
} from "../schemas/userBipagem.schema";
import {
  atualizarUserBipagem,
  criarUserBipagem,
  deletarUserBipagem,
  listarUserBipagem,
  obterUserBipagemPorId,
} from "../services/userBipagem.service";
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

export const postUserBipagem = async (
  req: Request<{}, {}, CreateUserBipagemInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const createdBy = getAuthenticatedMatricula(req);
    const result = await criarUserBipagem(req.body, createdBy);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const getUserBipagem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await listarUserBipagem(req.query as unknown as ListUserBipagemQueryInput);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const getUserBipagemById = async (
  req: Request<UserBipagemIdParam>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await obterUserBipagemPorId(req.params.id);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const putUserBipagem = async (
  req: Request<UserBipagemIdParam, {}, PutUserBipagemInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const updatedBy = getAuthenticatedMatricula(req);
    const result = await atualizarUserBipagem(req.params.id, req.body, updatedBy);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const deleteUserBipagem = async (
  req: Request<UserBipagemIdParam>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await deletarUserBipagem(req.params.id);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

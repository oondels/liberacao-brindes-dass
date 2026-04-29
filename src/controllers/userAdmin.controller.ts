import { NextFunction, Request, Response } from "express";
import {
  CreateUserAdminInput,
  ListUserAdminQueryInput,
  PutUserAdminInput,
  UserAdminIdParam,
} from "../schemas/userAdmin.schema";
import {
  atualizarUserAdmin,
  criarUserAdmin,
  deletarUserAdmin,
  listarUserAdmin,
  obterUserAdminPorId,
} from "../services/userAdmin.service";
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

export const postUserAdmin = async (
  req: Request<{}, {}, CreateUserAdminInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const createdBy = getAuthenticatedMatricula(req);
    const result = await criarUserAdmin(req.body, createdBy);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const getUserAdmin = async (
  req: Request<{}, {}, {}, ListUserAdminQueryInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await listarUserAdmin(req.query);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const getUserAdminById = async (
  req: Request<UserAdminIdParam>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await obterUserAdminPorId(req.params.id);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const putUserAdmin = async (
  req: Request<UserAdminIdParam, {}, PutUserAdminInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await atualizarUserAdmin(req.params.id, req.body);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const deleteUserAdmin = async (
  req: Request<UserAdminIdParam>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await deletarUserAdmin(req.params.id);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

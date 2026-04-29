import { NextFunction, Request, Response } from "express";
import {
  BrindeAtivoIdParam,
  CreateBrindeAtivoInput,
  ListBrindeAtivoQueryInput,
  PutBrindeAtivoInput,
} from "../schemas/brindeAtivo.schema";
import {
  atualizarBrindeAtivo,
  criarBrindeAtivo,
  deletarBrindeAtivo,
  listarBrindesAtivos,
  obterBrindeAtivoPorId,
} from "../services/brindeAtivo.service";
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

export const postBrindeAtivo = async (
  req: Request<{}, {}, CreateBrindeAtivoInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const createdBy = getAuthenticatedMatricula(req);
    const result = await criarBrindeAtivo(req.body, createdBy);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const getBrindesAtivos = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await listarBrindesAtivos(req.query as unknown as ListBrindeAtivoQueryInput);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const getBrindeAtivoById = async (
  req: Request<BrindeAtivoIdParam>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await obterBrindeAtivoPorId(req.params.id);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const putBrindeAtivo = async (
  req: Request<BrindeAtivoIdParam, {}, PutBrindeAtivoInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const updatedBy = getAuthenticatedMatricula(req);
    const result = await atualizarBrindeAtivo(req.params.id, req.body, updatedBy);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const deleteBrindeAtivo = async (
  req: Request<BrindeAtivoIdParam>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const updatedBy = getAuthenticatedMatricula(req);
    const result = await deletarBrindeAtivo(req.params.id, updatedBy);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

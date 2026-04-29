import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/db";
import { UserBipagem } from "../models/UserBipagem";
import { CustomError } from "../types/CustomError";

export const canBiparRetirada = async (req: Request, _res: Response, next: NextFunction) => {
  const matricula = req.user?.matricula;

  if (!matricula) {
    throw new CustomError("Usuário não autenticado", 401);
  }

  const parsed = Number(matricula);
  if (Number.isNaN(parsed)) {
    throw new CustomError("Matrícula do usuário autenticado inválida", 400);
  }

  const repository = AppDataSource.getRepository(UserBipagem);
  const userBipagem = await repository.findOne({
    where: { matricula: parsed },
  });

  if (!userBipagem) {
    throw new CustomError("Usuário sem permissão para bipagem de retiradas", 403);
  }

  req.bipagemPermissions = userBipagem.tipo_requisicao;
  next();
};

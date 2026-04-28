import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/db";
import { UserAprovacao } from "../models/UserAprovacao";
import { CustomError } from "../types/CustomError";

export const canApproveTroca = async (req: Request, _res: Response, next: NextFunction) => {
  const matricula = req.user?.matricula;

  if (!matricula) {
    throw new CustomError("Usuário não autenticado", 401);
  }

  const parsed = Number(matricula);
  if (Number.isNaN(parsed)) {
    throw new CustomError("Matrícula do usuário autenticado inválida", 400);
  }

  const repository = AppDataSource.getRepository(UserAprovacao);
  const userAprovacao = await repository.findOne({
    where: { matricula: parsed },
  });

  if (!userAprovacao || !userAprovacao.pode_aprovar_troca) {
    throw new CustomError("Usuário sem permissão para aprovação de trocas", 403);
  }

  req.tradeApprovalPermissions = userAprovacao.tipo_requisicao ?? null;
  next();
};

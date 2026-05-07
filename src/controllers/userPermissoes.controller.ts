import { NextFunction, Request, Response } from "express";
import { loadAuthorizationContext } from "../middleware/authorization.middleware";
import { obterPermissoesUsuario } from "../services/userPermissoes.service";
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

export const getUserPermissoes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const matricula = getAuthenticatedMatricula(req);
    const context = await loadAuthorizationContext(req);
    const result = await obterPermissoesUsuario(matricula, context);

    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

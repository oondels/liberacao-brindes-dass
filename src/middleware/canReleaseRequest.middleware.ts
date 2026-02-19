import { NextFunction, Request, Response } from "express";
import { CustomError } from "../types/CustomError";

/**
 * Middleware de autorização para liberação de brinde.
 *
 * Permite o acesso apenas para usuários que atendam a pelo menos um dos critérios:
 * - Possuam o cargo de **portaria**.
 * - Pertençam aos setores de **automacao**, **portaria**.
 *
 * @throws {CustomError} 401 - Caso o usuário não esteja autenticado (sem matrícula).
 * @throws {CustomError} 403 - Caso o usuário não possua cargo ou setor permitido.
 */
export const canReleaseRequest = async (req: Request, _res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user?.matricula) {
    throw new CustomError("Usuário não autenticado", 401);
  }

  const role = user.funcao?.toLowerCase() || "";
  const sector = user.setor?.toLowerCase() || "";
  const allowedSectors = ["automacao", "portaria"];
  if (!role.includes("portaria") && !allowedSectors.includes(sector)) {
    throw new CustomError("Usuário não autorizado! Somente usuários com cargo de portaria ou setores permitidos podem acessar esta funcionalidade", 403);
  }

  next();
}
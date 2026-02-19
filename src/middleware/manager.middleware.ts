import { NextFunction, Request, Response } from "express";
import { CustomError } from "../types/CustomError";

/**
 * Middleware de autorização alteração nas solicitações.
 *
 * Permite o acesso apenas para usuários que atendam a pelo menos um dos critérios:
 * - Possuam o cargo de **gerente** (verificação parcial, ex: "vice-gerente" também é permitido).
 * - Pertençam aos setores de **automacao**.
 *
 * @throws {CustomError} 401 - Caso o usuário não esteja autenticado (sem matrícula).
 * @throws {CustomError} 403 - Caso o usuário não possua cargo ou setor permitido.
 */
export const isManager = async (req: Request, _res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user?.matricula) {
    throw new CustomError("Usuário não autenticado", 401);
  }

  const role = user.funcao?.toLowerCase() || "";
  const sector = user.setor?.toLowerCase() || "";
  if (!role.includes("gerente") && sector !== "automacao") {
    throw new CustomError("Usuário não autorizado! Somente gerentes podem acessar esta funcionalidade", 403);
  }

  next();
}
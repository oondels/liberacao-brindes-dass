import { NextFunction, Request, Response } from "express";
import { CustomError } from "../types/CustomError";
import { loadAuthorizationContext } from "./authorization.middleware";

export const canApproveTroca = async (req: Request, _res: Response, next: NextFunction) => {
  const context = await loadAuthorizationContext(req);

  if (!context.canApproveTrade) {
    throw new CustomError("Usuário sem permissão para aprovação de trocas", 403);
  }

  next();
};

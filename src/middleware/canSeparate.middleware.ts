import { NextFunction, Request, Response } from "express";
import { CustomError } from "../types/CustomError";
import { loadAuthorizationContext } from "./authorization.middleware";

export const canSeparate = async (req: Request, _res: Response, next: NextFunction) => {
  const context = await loadAuthorizationContext(req);

  if (!context.separationPermissions || context.separationPermissions.length === 0) {
    throw new CustomError("Usuário sem permissão para separação de solicitações", 403);
  }

  next();
};

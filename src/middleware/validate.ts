import { RequestHandler, Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

type RequestPart = "body" | "query" | "params";

type ValidationError = {
  error: string;
};

export const validateRequest = (
  type: RequestPart,
  schema: ZodSchema
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[type]);
    
    
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "Requisição inválida";
      
      const payload: ValidationError = { error: message };
      res.status(400).json(payload);
      return;
    }
    
    if (type === "query" || type === "params") {
      const target = req[type] as Record<string, unknown>;
      Object.keys(target).forEach((key) => {
        delete target[key];
      });
      Object.assign(target, result.data as Record<string, unknown>);
    } else {
      req[type] = result.data;
    }
    next();
  };
};

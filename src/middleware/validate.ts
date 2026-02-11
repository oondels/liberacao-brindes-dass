import { RequestHandler } from "express";
import { ZodTypeAny } from "zod";

type RequestPart = "body" | "query" | "params";

type ValidationError = {
  error: string;
};

export const validateRequest = (
  type: RequestPart,
  schema: ZodTypeAny
): RequestHandler => {
  return (req, res, next) => {
    const result = schema.safeParse(req[type]);

    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "Requisição inválida";
      
      const payload: ValidationError = { error: message };
      res.status(400).json(payload);
      return;
    }

    req[type] = result.data;
    next();
  };
};

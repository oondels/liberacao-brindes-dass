/// <reference path="../types/express.d.ts" />
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { config } from "../config/dotenv";
import { CustomError } from "../types/CustomError";

const PRIVATE_KEY = config.jwtSecret;

export interface DecodedToken {
  id: string;
  usuario: string;
  codbarras: string;
  rfid: string;
  matricula: string;
  setor: string;
  nivel: string;
  unidade: string;
  funcao: string;
  is_admin?: boolean;
}

export const extractCandidateTokens = (req: Request): string[] => {
  const authHeader = req.headers?.authorization;
  const bearerToken = authHeader && /^Bearer\s+/i.test(authHeader)
    ? authHeader.replace(/^Bearer\s+/i, "").trim()
    : null;
  const cookieToken = req.cookies?.token ? String(req.cookies.token).trim() : null;
  const candidates = [cookieToken, bearerToken].filter((t): t is string => Boolean(t));
  return [...new Set(candidates)];
};

export const authenticateToken = (req: Request, _res: Response, next: NextFunction) => {
  const tokens = extractCandidateTokens(req);

  if (tokens.length === 0) {
    return next(new CustomError("Token de autenticação não encontrado", 401));
  }

  let lastError: unknown = null;
  for (const token of tokens) {
    try {
      const decoded = jwt.verify(token, PRIVATE_KEY);
      if (decoded && typeof decoded !== "string") {
        req.user = decoded as DecodedToken;
        return next();
      }
    } catch (error) {
      lastError = error;
    }
  }

  console.error("Erro ao verificar token JWT: ", lastError);
  return next(new CustomError("Token de autenticação inválido", 401));
};
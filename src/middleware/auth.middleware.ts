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
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  if (!token) {
    return next(new CustomError("Token de autenticação não encontrado", 401));
  }

  jwt.verify(token, PRIVATE_KEY, (error: jwt.VerifyErrors | null, decoded: jwt.JwtPayload | string | undefined) => {
    if (error) {
      console.error("Erro ao verificar token JWT: ", error);
      return next(new CustomError("Token de autenticação inválido", 401));
    }

    if (!decoded || typeof decoded === "string") {
      return next(new CustomError("Token de autenticação inválido", 401));
    }

    req.user = decoded as DecodedToken;
    next();
  })
}
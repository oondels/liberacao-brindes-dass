import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/db";
import { TipoRequisicao } from "../models/Solicitacao";
import { UserCriacaoSolicitacao } from "../models/UserCriacaoSolicitacao";
import { CustomError } from "../types/CustomError";

/**
 * Middleware de autorização para criação de solicitações.
 *
 * Permite o acesso apenas para usuários cadastrados na tabela
 * `user_criacao_solicitacao` e que tenham autorização para o
 * `tipo_requisicao` informado na requisição.
 *
 * @throws {CustomError} 401 - Caso o usuário não esteja autenticado (sem matrícula).
 * @throws {CustomError} 400 - Caso o tipo de requisição esteja ausente ou inválido.
 * @throws {CustomError} 403 - Caso o usuário não possua permissão para criar solicitação.
 */
export const createSolicitation = async (req: Request, _res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user?.matricula) {
    throw new CustomError("Usuário não autenticado", 401);
  }

  const userMatricula = Number(user.matricula);
  if (Number.isNaN(userMatricula)) {
    throw new CustomError("Matrícula do usuário inválida", 400);
  }

  const tiposNaRequisicao: Set<string> = new Set();
  
  if (typeof req.body?.tipo_requisicao === "string" && req.body.tipo_requisicao.trim()) {
    tiposNaRequisicao.add(req.body.tipo_requisicao);
  } else if (Array.isArray(req.body?.solicitacoes)) {
    for (const sol of req.body.solicitacoes) {
      if (typeof sol.tipo_requisicao === "string" && sol.tipo_requisicao.trim()) {
        tiposNaRequisicao.add(sol.tipo_requisicao);
      }
    }
  }

  if (tiposNaRequisicao.size === 0) {
    throw new CustomError("tipo_requisicao é obrigatório para criar solicitação", 400);
  }

  for (const tipo of tiposNaRequisicao) {
    if (!Object.values(TipoRequisicao).includes(tipo as TipoRequisicao)) {
      throw new CustomError(`tipo_requisicao inválido: ${tipo}`, 400);
    }
  }

  const repository = AppDataSource.getRepository(UserCriacaoSolicitacao);
  const permissaoCriacao = await repository.findOne({
    where: { matricula: userMatricula },
  });

  if (!permissaoCriacao) {
    throw new CustomError("Usuário sem permissão para criação de solicitações", 403);
  }

  const tiposPermitidos = permissaoCriacao.tipo_requisicao as string[];
  for (const tipo of tiposNaRequisicao) {
    if (!tiposPermitidos.includes(tipo)) {
      throw new CustomError(
        `Usuário sem permissão para criar solicitações do tipo '${tipo}'`,
        403
      );
    }
  }

  next();
};

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

  const tipoRequisicao = req.body?.tipo_requisicao;
  if (typeof tipoRequisicao !== "string" || !tipoRequisicao.trim()) {
    throw new CustomError("tipo_requisicao é obrigatório para criar solicitação", 400);
  }

  if (!Object.values(TipoRequisicao).includes(tipoRequisicao as TipoRequisicao)) {
    throw new CustomError(`tipo_requisicao inválido: ${tipoRequisicao}`, 400);
  }

  const repository = AppDataSource.getRepository(UserCriacaoSolicitacao);
  const permissaoCriacao = await repository.findOne({
    where: { matricula: userMatricula },
  });

  if (!permissaoCriacao) {
    throw new CustomError("Usuário sem permissão para criação de solicitações", 403);
  }

  const tiposPermitidos = permissaoCriacao.tipo_requisicao as string[];
  if (!tiposPermitidos.includes(tipoRequisicao)) {
    throw new CustomError(
      `Usuário sem permissão para criar solicitações do tipo '${tipoRequisicao}'`,
      403
    );
  }

  next();
};

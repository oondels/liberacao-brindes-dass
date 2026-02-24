import { AppDataSource } from "../config/db";
import { UserCriacaoSolicitacao } from "../models/UserCriacaoSolicitacao";
import { ServiceResult } from "../types/service";
import { CustomError } from "../types/CustomError";
import {
  CreateUserSolicitacaoInput,
  ListUserSolicitacaoQueryInput,
  PutUserSolicitacaoInput,
} from "../schemas/userSolicitacao.schema";

const getRepository = () => AppDataSource.getRepository(UserCriacaoSolicitacao);

export const criarUserSolicitacao = async (
  input: CreateUserSolicitacaoInput,
  createdBy: number
): Promise<ServiceResult<UserCriacaoSolicitacao>> => {
  const repository = getRepository();

  const existing = await repository.findOne({
    where: { matricula: input.matricula },
  });

  if (existing) {
    throw new CustomError(
      `Já existe um usuário com a matrícula ${input.matricula} na permissão de criação`,
      409
    );
  }

  const payload = repository.create({
    ...input,
    created_by: createdBy,
    updated_by: createdBy,
  });

  const saved = await repository.save(payload);
  return { status: 201, body: saved };
};

export const listarUserSolicitacao = async (
  filters: ListUserSolicitacaoQueryInput
): Promise<ServiceResult<UserCriacaoSolicitacao[]>> => {
  const repository = getRepository();
  const queryBuilder = repository
    .createQueryBuilder("userCriacaoSolicitacao")
    .orderBy("userCriacaoSolicitacao.created_at", "DESC");

  if (filters.matricula !== undefined) {
    queryBuilder.andWhere("userCriacaoSolicitacao.matricula = :matricula", {
      matricula: filters.matricula,
    });
  }

  if (filters.tipo_requisicao) {
    queryBuilder.andWhere(":tipo = ANY(userCriacaoSolicitacao.tipo_requisicao)", {
      tipo: filters.tipo_requisicao,
    });
  }

  const users = await queryBuilder.getMany();

  return { status: 200, body: users };
};

export const obterUserSolicitacaoPorId = async (
  id: string
): Promise<ServiceResult<UserCriacaoSolicitacao>> => {
  const repository = getRepository();
  const user = await repository.findOne({ where: { id } });

  if (!user) {
    throw new CustomError("Usuário de criação de solicitação não encontrado", 404);
  }

  return { status: 200, body: user };
};

export const atualizarUserSolicitacao = async (
  id: string,
  input: PutUserSolicitacaoInput,
  updatedBy: number
): Promise<ServiceResult<UserCriacaoSolicitacao>> => {
  const repository = getRepository();
  const existing = await repository.findOne({ where: { id } });

  if (!existing) {
    throw new CustomError("Usuário de criação de solicitação não encontrado", 404);
  }

  if (existing.matricula !== input.matricula) {
    const matriculaEmUso = await repository.findOne({
      where: { matricula: input.matricula },
    });

    if (matriculaEmUso) {
      throw new CustomError(
        `Já existe um usuário com a matrícula ${input.matricula} na permissão de criação`,
        409
      );
    }
  }

  await repository.update(id, {
    ...input,
    updated_by: updatedBy,
  });

  const updated = await repository.findOne({ where: { id } });
  return { status: 200, body: updated! };
};

export const deletarUserSolicitacao = async (
  id: string
): Promise<ServiceResult<{ message: string }>> => {
  const repository = getRepository();
  const existing = await repository.findOne({ where: { id } });

  if (!existing) {
    throw new CustomError("Usuário de criação de solicitação não encontrado", 404);
  }

  await repository.remove(existing);
  return { status: 200, body: { message: "Registro removido com sucesso" } };
};

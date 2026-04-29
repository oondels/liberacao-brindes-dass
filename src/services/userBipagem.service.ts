import { AppDataSource } from "../config/db";
import { TipoRequisicao } from "../models/Solicitacao";
import { UserBipagem } from "../models/UserBipagem";
import {
  CreateUserBipagemInput,
  ListUserBipagemQueryInput,
  PutUserBipagemInput,
} from "../schemas/userBipagem.schema";
import { CustomError } from "../types/CustomError";
import { ServiceResult } from "../types/service";

const getRepository = () => AppDataSource.getRepository(UserBipagem);

const DEFAULT_TIPOS_BIPAGEM = Object.values(TipoRequisicao);

const resolveTiposBipagem = (tipos?: TipoRequisicao[]): TipoRequisicao[] =>
  tipos && tipos.length > 0 ? tipos : DEFAULT_TIPOS_BIPAGEM;

export const criarUserBipagem = async (
  input: CreateUserBipagemInput,
  createdBy: number
): Promise<ServiceResult<UserBipagem>> => {
  const repository = getRepository();

  const existing = await repository.findOne({
    where: { matricula: input.matricula },
  });

  if (existing) {
    throw new CustomError(
      `Já existe um usuário com a matrícula ${input.matricula} na permissão de bipagem`,
      409
    );
  }

  const payload = repository.create({
    ...input,
    tipo_requisicao: resolveTiposBipagem(input.tipo_requisicao),
    created_by: createdBy,
    updated_by: createdBy,
  });

  const saved = await repository.save(payload);
  return { status: 201, body: saved };
};

export const listarUserBipagem = async (
  filters: ListUserBipagemQueryInput
): Promise<ServiceResult<UserBipagem[]>> => {
  const repository = getRepository();
  const queryBuilder = repository
    .createQueryBuilder("userBipagem")
    .orderBy("userBipagem.created_at", "DESC");

  if (filters.matricula !== undefined) {
    queryBuilder.andWhere("userBipagem.matricula = :matricula", {
      matricula: filters.matricula,
    });
  }

  if (filters.tipo_requisicao) {
    queryBuilder.andWhere(":tipo = ANY(userBipagem.tipo_requisicao)", {
      tipo: filters.tipo_requisicao,
    });
  }

  const users = await queryBuilder.getMany();
  return { status: 200, body: users };
};

export const obterUserBipagemPorId = async (
  id: string
): Promise<ServiceResult<UserBipagem>> => {
  const repository = getRepository();
  const user = await repository.findOne({ where: { id } });

  if (!user) {
    throw new CustomError("Usuário de bipagem não encontrado", 404);
  }

  return { status: 200, body: user };
};

export const atualizarUserBipagem = async (
  id: string,
  input: PutUserBipagemInput,
  updatedBy: number
): Promise<ServiceResult<UserBipagem>> => {
  const repository = getRepository();
  const existing = await repository.findOne({ where: { id } });

  if (!existing) {
    throw new CustomError("Usuário de bipagem não encontrado", 404);
  }

  if (String(existing.matricula) !== String(input.matricula)) {
    const matriculaEmUso = await repository.findOne({
      where: { matricula: input.matricula },
    });

    if (matriculaEmUso) {
      throw new CustomError(
        `Já existe um usuário com a matrícula ${input.matricula} na permissão de bipagem`,
        409
      );
    }
  }

  await repository.update(id, {
    ...input,
    tipo_requisicao: resolveTiposBipagem(input.tipo_requisicao),
    updated_by: updatedBy,
  });

  const updated = await repository.findOne({ where: { id } });
  return { status: 200, body: updated! };
};

export const deletarUserBipagem = async (
  id: string
): Promise<ServiceResult<{ message: string }>> => {
  const repository = getRepository();
  const existing = await repository.findOne({ where: { id } });

  if (!existing) {
    throw new CustomError("Usuário de bipagem não encontrado", 404);
  }

  await repository.remove(existing);
  return { status: 200, body: { message: "Registro removido com sucesso" } };
};

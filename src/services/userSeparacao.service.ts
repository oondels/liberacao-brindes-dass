import { AppDataSource } from "../config/db";
import { TipoRequisicao } from "../models/Solicitacao";
import { UserSeparacao } from "../models/UserSeparacao";
import {
  CreateUserSeparacaoInput,
  ListUserSeparacaoQueryInput,
  PutUserSeparacaoInput,
} from "../schemas/userSeparacao.schema";
import { ServiceResult } from "../types/service";
import { CustomError } from "../types/CustomError";

const getRepository = () => AppDataSource.getRepository(UserSeparacao);

const DEFAULT_TIPOS_SEPARACAO = Object.values(TipoRequisicao).filter(
  (tipo) => tipo !== TipoRequisicao.TESTE_CALCE
);

const resolveTiposSeparacao = (tipos?: TipoRequisicao[]): TipoRequisicao[] =>
  tipos && tipos.length > 0 ? tipos : DEFAULT_TIPOS_SEPARACAO;

export const criarUserSeparacao = async (
  input: CreateUserSeparacaoInput,
  createdBy: number
): Promise<ServiceResult<UserSeparacao>> => {
  const repository = getRepository();

  const existing = await repository.findOne({
    where: { matricula: input.matricula },
  });

  if (existing) {
    throw new CustomError(
      `Já existe um usuário com a matrícula ${input.matricula} na permissão de separação`,
      409
    );
  }

  const payload = repository.create({
    ...input,
    tipo_requisicao: resolveTiposSeparacao(input.tipo_requisicao),
    created_by: createdBy,
    updated_by: createdBy,
  });

  const saved = await repository.save(payload);
  return { status: 201, body: saved };
};

export const listarUserSeparacao = async (
  filters: ListUserSeparacaoQueryInput
): Promise<ServiceResult<UserSeparacao[]>> => {
  const repository = getRepository();
  const queryBuilder = repository
    .createQueryBuilder("userSeparacao")
    .orderBy("userSeparacao.created_at", "DESC");

  if (filters.matricula !== undefined) {
    queryBuilder.andWhere("userSeparacao.matricula = :matricula", {
      matricula: filters.matricula,
    });
  }

  if (filters.tipo_requisicao) {
    queryBuilder.andWhere(":tipo = ANY(userSeparacao.tipo_requisicao)", {
      tipo: filters.tipo_requisicao,
    });
  }

  const users = await queryBuilder.getMany();

  return { status: 200, body: users };
};

export const obterUserSeparacaoPorId = async (
  id: string
): Promise<ServiceResult<UserSeparacao>> => {
  const repository = getRepository();
  const user = await repository.findOne({ where: { id } });

  if (!user) {
    throw new CustomError("Usuário de separação não encontrado", 404);
  }

  return { status: 200, body: user };
};

export const atualizarUserSeparacao = async (
  id: string,
  input: PutUserSeparacaoInput,
  updatedBy: number
): Promise<ServiceResult<UserSeparacao>> => {
  const repository = getRepository();
  const existing = await repository.findOne({ where: { id } });

  if (!existing) {
    throw new CustomError("Usuário de separação não encontrado", 404);
  }

  if (String(existing.matricula) !== String(input.matricula)) {
    const matriculaEmUso = await repository.findOne({
      where: { matricula: input.matricula },
    });

    if (matriculaEmUso) {
      throw new CustomError(
        `Já existe um usuário com a matrícula ${input.matricula} na permissão de separação`,
        409
      );
    }
  }

  await repository.update(id, {
    ...input,
    tipo_requisicao: resolveTiposSeparacao(input.tipo_requisicao),
    updated_by: updatedBy,
  });

  const updated = await repository.findOne({ where: { id } });
  return { status: 200, body: updated! };
};

export const deletarUserSeparacao = async (
  id: string
): Promise<ServiceResult<{ message: string }>> => {
  const repository = getRepository();
  const existing = await repository.findOne({ where: { id } });

  if (!existing) {
    throw new CustomError("Usuário de separação não encontrado", 404);
  }

  await repository.remove(existing);
  return { status: 200, body: { message: "Registro removido com sucesso" } };
};

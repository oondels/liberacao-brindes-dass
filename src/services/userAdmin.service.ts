import { AppDataSource } from "../config/db";
import { UserAdmin } from "../models/UserAdmin";
import {
  CreateUserAdminInput,
  ListUserAdminQueryInput,
  PutUserAdminInput,
} from "../schemas/userAdmin.schema";
import { CustomError } from "../types/CustomError";
import { ServiceResult } from "../types/service";

const getRepository = () => AppDataSource.getRepository(UserAdmin);

export const criarUserAdmin = async (
  input: CreateUserAdminInput,
  createdByMatricula: number
): Promise<ServiceResult<UserAdmin>> => {
  const repository = getRepository();
  const existing = await repository.findOne({ where: { matricula: input.matricula } });

  if (existing) {
    throw new CustomError(`Já existe um admin com a matrícula ${input.matricula}`, 409);
  }

  const payload = repository.create({
    ...input,
    created_by_matricula: createdByMatricula,
  });

  const saved = await repository.save(payload);
  return { status: 201, body: saved };
};

export const listarUserAdmin = async (
  filters: ListUserAdminQueryInput
): Promise<ServiceResult<UserAdmin[]>> => {
  const repository = getRepository();
  const queryBuilder = repository
    .createQueryBuilder("userAdmin")
    .orderBy("userAdmin.created_at", "DESC");

  if (filters.matricula !== undefined) {
    queryBuilder.andWhere("userAdmin.matricula = :matricula", {
      matricula: filters.matricula,
    });
  }

  if (filters.tipo_requisicao) {
    queryBuilder.andWhere(":tipo = ANY(userAdmin.tipo_requisicao)", {
      tipo: filters.tipo_requisicao,
    });
  }

  const users = await queryBuilder.getMany();
  return { status: 200, body: users };
};

export const obterUserAdminPorId = async (id: string): Promise<ServiceResult<UserAdmin>> => {
  const repository = getRepository();
  const user = await repository.findOne({ where: { id } });

  if (!user) {
    throw new CustomError("Admin não encontrado", 404);
  }

  return { status: 200, body: user };
};

export const atualizarUserAdmin = async (
  id: string,
  input: PutUserAdminInput
): Promise<ServiceResult<UserAdmin>> => {
  const repository = getRepository();
  const existing = await repository.findOne({ where: { id } });

  if (!existing) {
    throw new CustomError("Admin não encontrado", 404);
  }

  if (String(existing.matricula) !== String(input.matricula)) {
    const matriculaEmUso = await repository.findOne({ where: { matricula: input.matricula } });

    if (matriculaEmUso) {
      throw new CustomError(`Já existe um admin com a matrícula ${input.matricula}`, 409);
    }
  }

  await repository.update(id, input);
  const updated = await repository.findOne({ where: { id } });

  return { status: 200, body: updated! };
};

export const deletarUserAdmin = async (
  id: string
): Promise<ServiceResult<{ message: string }>> => {
  const repository = getRepository();
  const existing = await repository.findOne({ where: { id } });

  if (!existing) {
    throw new CustomError("Admin não encontrado", 404);
  }

  await repository.remove(existing);
  return { status: 200, body: { message: "Registro removido com sucesso" } };
};

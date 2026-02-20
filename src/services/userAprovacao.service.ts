import { AppDataSource } from "../config/db";
import { UserAprovacao } from "../models/UserAprovacao";
import { ServiceResult } from "../types/service";
import { CustomError } from "../types/CustomError";
import {
  CreateUserAprovacaoInput,
  PatchUserAprovacaoInput,
} from "../schemas/userAprovacao.schema";

const getRepository = () => AppDataSource.getRepository(UserAprovacao);

export type UserAprovacaoResponse =
  | UserAprovacao
  | UserAprovacao[]
  | { error: string };

export const criarUserAprovacao = async (
  input: CreateUserAprovacaoInput
): Promise<ServiceResult<UserAprovacao>> => {
  const repository = getRepository();

  const existing = await repository.findOne({
    where: { matricula: input.matricula },
  });

  if (existing) {
    throw new CustomError(
      `Já existe um usuário com a matrícula ${input.matricula}`,
      409
    );
  }

  const user = repository.create(input);
  const saved = await repository.save(user);

  return { status: 201, body: saved };
};

export const listarUserAprovacao = async (): Promise<
  ServiceResult<UserAprovacao[]>
> => {
  const repository = getRepository();
  const users = await repository.find({ order: { created_at: "DESC" } });
  return { status: 200, body: users };
};

export const obterUserAprovacaoPorId = async (
  id: string
): Promise<ServiceResult<UserAprovacao>> => {
  const repository = getRepository();
  const user = await repository.findOne({ where: { id } });

  if (!user) {
    throw new CustomError("Usuário não encontrado", 404);
  }

  return { status: 200, body: user };
};

export const atualizarUserAprovacao = async (
  id: string,
  input: PatchUserAprovacaoInput
): Promise<ServiceResult<UserAprovacao>> => {
  const repository = getRepository();

  const existing = await repository.findOne({ where: { id } });

  if (!existing) {
    throw new CustomError("Usuário não encontrado", 404);
  }

  await repository.update(id, input);

  const updated = await repository.findOne({ where: { id } });

  return { status: 200, body: updated! };
};

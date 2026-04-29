import { AppDataSource } from "../config/db";
import { BrindeAtivo } from "../models/BrindeAtivo";
import { SolicitacaoBrinde } from "../models/Solicitacao";
import {
  CreateBrindeAtivoInput,
  ListBrindeAtivoQueryInput,
  PutBrindeAtivoInput,
} from "../schemas/brindeAtivo.schema";
import { CustomError } from "../types/CustomError";
import { ServiceResult } from "../types/service";

const getRepository = () => AppDataSource.getRepository(BrindeAtivo);
const getSolicitacaoRepository = () => AppDataSource.getRepository(SolicitacaoBrinde);

type BrindeAtivoListPayload = {
  data: BrindeAtivo[];
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export const criarBrindeAtivo = async (
  input: CreateBrindeAtivoInput,
  createdBy: number
): Promise<ServiceResult<BrindeAtivo>> => {
  const repository = getRepository();
  const payload = repository.create({
    ...input,
    ativo: input.ativo ?? true,
    created_by: createdBy,
    updated_by: createdBy,
  });

  const saved = await repository.save(payload);
  return { status: 201, body: saved };
};

export const listarBrindesAtivos = async (
  filters: ListBrindeAtivoQueryInput
): Promise<ServiceResult<BrindeAtivoListPayload>> => {
  const repository = getRepository();
  const pageSize = 20;
  const page = filters.page ?? 1;
  const take = pageSize + 1;
  const skip = (page - 1) * pageSize;

  const queryBuilder = repository
    .createQueryBuilder("brinde")
    .orderBy("brinde.created_at", "DESC")
    .skip(skip)
    .take(take);

  if (filters.tipo_requisicao) {
    queryBuilder.andWhere("brinde.tipo_requisicao = :tipo", {
      tipo: filters.tipo_requisicao,
    });
  }

  if (filters.subgrupo_campanha) {
    queryBuilder.andWhere("brinde.subgrupo_campanha = :subgrupo", {
      subgrupo: filters.subgrupo_campanha,
    });
  }

  if (filters.genero) {
    queryBuilder.andWhere("brinde.genero = :genero", {
      genero: filters.genero,
    });
  }

  if (filters.ativo !== undefined) {
    queryBuilder.andWhere("brinde.ativo = :ativo", { ativo: filters.ativo });
  }

  if (filters.num_calce !== undefined) {
    queryBuilder.andWhere("brinde.num_calce = :numCalce", {
      numCalce: filters.num_calce,
    });
  }

  const entities = await queryBuilder.getMany();
  const hasMore = entities.length > pageSize;
  const data = hasMore ? entities.slice(0, pageSize) : entities;

  return {
    status: 200,
    body: { data, page, pageSize, hasMore },
  };
};

export const obterBrindeAtivoPorId = async (
  id: string
): Promise<ServiceResult<BrindeAtivo>> => {
  const repository = getRepository();
  const brinde = await repository.findOne({ where: { id } });

  if (!brinde) {
    throw new CustomError("Brinde não encontrado", 404);
  }

  return { status: 200, body: brinde };
};

export const atualizarBrindeAtivo = async (
  id: string,
  input: PutBrindeAtivoInput,
  updatedBy: number
): Promise<ServiceResult<BrindeAtivo>> => {
  const repository = getRepository();
  const existing = await repository.findOne({ where: { id } });

  if (!existing) {
    throw new CustomError("Brinde não encontrado", 404);
  }

  await repository.update(id, {
    ...input,
    updated_by: updatedBy,
  });

  const updated = await repository.findOne({ where: { id } });
  return { status: 200, body: updated! };
};

export const deletarBrindeAtivo = async (
  id: string,
  updatedBy: number
): Promise<ServiceResult<{ message: string }>> => {
  const repository = getRepository();
  const solicitacaoRepository = getSolicitacaoRepository();
  const existing = await repository.findOne({ where: { id } });

  if (!existing) {
    throw new CustomError("Brinde não encontrado", 404);
  }

  const emUso = await solicitacaoRepository.count({
    where: { brinde_id: id },
  });

  if (emUso > 0) {
    existing.ativo = false;
    existing.updated_by = updatedBy;
    await repository.save(existing);
    return {
      status: 200,
      body: { message: "Brinde inativado porque já possui solicitações vinculadas" },
    };
  }

  await repository.remove(existing);
  return { status: 200, body: { message: "Brinde removido com sucesso" } };
};

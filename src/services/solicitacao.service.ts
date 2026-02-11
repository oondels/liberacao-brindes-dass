import { Between, FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { AppDataSource } from "../config/db";
import { SolicitacaoBrinde } from "../models/Solicitacao";
import {
  CreateSolicitacaoInput,
  ListSolicitacaoQuery,
} from "../schemas/solicitacao.schema";
import { ServiceResult } from "../types/service";
import { TipoRequisicao, StatusSolicitacaoBrinde } from "../models/Solicitacao";

type SolicitacaoListPayload = {
  data: SolicitacaoBrinde[];
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export type SolicitacaoResponse =
  | { error: string }
  | { data: SolicitacaoBrinde }
  | SolicitacaoListPayload;

const notImplemented = (): ServiceResult<SolicitacaoResponse> => ({
  status: 501,
  body: { error: "not implemented" },
});

export const criarSolicitacao = async (
  input: CreateSolicitacaoInput
): Promise<ServiceResult<SolicitacaoResponse>> => {
  const toNumber = (value: string, field: string): number | null => {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const matricula = toNumber(input.matricula, "matricula");
  const numCalce = toNumber(input.num_calce, "num_calce");
  const rfid = input.rfid ? toNumber(input.rfid, "rfid") : null;
  const codbarras = input.codbarras ? toNumber(input.codbarras, "codbarras") : null;

  if (matricula === null || numCalce === null) {
    return { status: 400, body: { error: "Campos numericos invalidos" } };
  }

  try {
    const repository = AppDataSource.getRepository(SolicitacaoBrinde);

    const solicitacao = repository.create({
      nome: input.nome,
      matricula,
      rfid: rfid ?? undefined,
      codbarras: codbarras ?? undefined,
      setor: input.setor,
      gerente: input.gerente,
      tipo_requisicao: input.tipo_requisicao as TipoRequisicao,
      usuario_criador: matricula,
      marca: input.marca,
      modelo: input.modelo,
      num_calce: numCalce,
      status: StatusSolicitacaoBrinde.PENDENTE_APROVACAO,
    });

    const saved = await repository.save(solicitacao);
    return { status: 201, body: { data: saved } };
  } catch (error) {
    return { status: 500, body: { error: "Erro ao criar solicitacao" } };
  }
};

export const listarSolicitacoes = async (
  filters: ListSolicitacaoQuery
): Promise<ServiceResult<SolicitacaoResponse>> => {
  const repository = AppDataSource.getRepository(SolicitacaoBrinde);
  const where: FindOptionsWhere<SolicitacaoBrinde> = {};

  if (filters.status) {
    where.status = filters.status as StatusSolicitacaoBrinde;
  }

  if (filters.gerente) {
    where.gerente = filters.gerente;
  }

  if (filters.setor) {
    where.setor = filters.setor;
  }

  if (filters.tipo_requisicao) {
    where.tipo_requisicao = filters.tipo_requisicao as TipoRequisicao;
  }

  if (filters.matricula !== undefined) {
    where.matricula = filters.matricula;
  }

  if (filters.rfid !== undefined) {
    where.rfid = filters.rfid;
  }

  if (filters.codbarras !== undefined) {
    where.codbarras = filters.codbarras;
  }

  if (filters.data_inicial && filters.data_final) {
    where.created_at = Between(filters.data_inicial, filters.data_final);
  } else if (filters.data_inicial) {
    where.created_at = MoreThanOrEqual(filters.data_inicial);
  } else if (filters.data_final) {
    where.created_at = LessThanOrEqual(filters.data_final);
  }

  const pageSize = 20;
  const page = filters.page ?? 1;
  const take = pageSize + 1;
  const skip = (page - 1) * pageSize;

  try {
    const results = await repository.find({
      where,
      order: { created_at: "DESC" },
      take,
      skip,
    });

    const hasMore = results.length > pageSize;
    const data = hasMore ? results.slice(0, pageSize) : results;

    return {
      status: 200,
      body: {
        data,
        page,
        pageSize,
        hasMore,
      },
    };
  } catch (error) {
    return { status: 500, body: { error: "Erro ao listar solicitacoes" } };
  }
};

export const obterSolicitacaoPorId = async (): Promise<ServiceResult<SolicitacaoResponse>> =>
  notImplemented();

export const aprovarSolicitacao = async (): Promise<ServiceResult<SolicitacaoResponse>> =>
  notImplemented();

export const rejeitarSolicitacao = async (): Promise<ServiceResult<SolicitacaoResponse>> =>
  notImplemented();

export const cancelarSolicitacao = async (): Promise<ServiceResult<SolicitacaoResponse>> =>
  notImplemented();

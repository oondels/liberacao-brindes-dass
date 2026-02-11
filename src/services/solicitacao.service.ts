import { AppDataSource } from "../config/db";
import { SolicitacaoBrinde } from "../models/Solicitacao";
import { CreateSolicitacaoInput } from "../schemas/solicitacao.schema";
import { ServiceResult } from "../types/service";
import { TipoRequisicao, StatusSolicitacaoBrinde } from "../models/Solicitacao";

export type SolicitacaoResponse = { error: string } | { data: SolicitacaoBrinde };

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

export const listarSolicitacoes = async (): Promise<ServiceResult<SolicitacaoResponse>> =>
  notImplemented();

export const obterSolicitacaoPorId = async (): Promise<ServiceResult<SolicitacaoResponse>> =>
  notImplemented();

export const aprovarSolicitacao = async (): Promise<ServiceResult<SolicitacaoResponse>> =>
  notImplemented();

export const rejeitarSolicitacao = async (): Promise<ServiceResult<SolicitacaoResponse>> =>
  notImplemented();

export const cancelarSolicitacao = async (): Promise<ServiceResult<SolicitacaoResponse>> =>
  notImplemented();

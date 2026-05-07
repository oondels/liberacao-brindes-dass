import { AppDataSource } from "../config/db";
import { SolicitacaoBrinde, StatusSolicitacaoBrinde, TipoRequisicao } from "../models/Solicitacao";
import { AcaoSolicitacaoHistorico, SolicitacaoHistorico } from "../models/SolicitacaoHistorico";
import { User } from "../models/User";
import { StatusSVouncher, VoucherSolicitacao } from "../models/VoucherSolicitacao";
import { BiparVoucherInput } from "../schemas/retirada.schema";
import { ServiceResult } from "../types/service";

type ErrorResponse = { error: string };

type BiparRetiradaSuccess = {
  message: string;
  voucher_id: string;
  solicitacao_id: string;
};

type SolicitarTrocaSuccess = BiparRetiradaSuccess;
type BiparRetiradaResponse = BiparRetiradaSuccess | ErrorResponse;
type SolicitarTrocaResponse = SolicitarTrocaSuccess | ErrorResponse;
type VoucherRetiradaPreview = {
  id: string;
  codigo_voucher: string;
  status: StatusSVouncher;
  ativo: boolean;
  data_resgate: Date | null;
  created_at: Date;
  solicitacao: {
    id: string;
    status: StatusSolicitacaoBrinde;
    created_at: Date;
    data_aprovado: Date | null;
    colaborador: {
      nome: string;
      matricula: number;
      setor: string;
    };
    brinde: {
      tipo_requisicao: TipoRequisicao;
      subgrupo_campanha: string | null;
      genero: string | null;
      marca: string | null;
      modelo: string | null;
      num_calce: number;
      categoria_infantil: boolean;
    };
    aprovador: {
      matricula: number | null;
      nome: string | null;
    };
  };
};
type VoucherRetiradaPreviewResponse = { data: VoucherRetiradaPreview } | ErrorResponse;

const notImplemented = (): ServiceResult<ErrorResponse> => ({
  status: 501,
  body: { error: "not implemented" },
});

export const previewRetirada = async (): Promise<ServiceResult<ErrorResponse>> =>
  notImplemented();

const carregarVoucherComSolicitacao = async (codigoVoucher: string) => {
  const voucherRepo = AppDataSource.getRepository(VoucherSolicitacao);

  return voucherRepo.findOne({
    where: { codigo_voucher: codigoVoucher },
    relations: ["solicitacao"],
  });
};

const validarPermissaoBipagem = (
  tiposPermitidos: TipoRequisicao[] | undefined,
  tipoSolicitacao: TipoRequisicao,
  operacao: "bipagem de retiradas" | "solicitar trocas" | "consultar vouchers"
): ServiceResult<ErrorResponse> | null => {
  if (!tiposPermitidos || tiposPermitidos.length === 0) {
    return { status: 403, body: { error: `Usuário sem permissão para ${operacao}` } };
  }

  if (!tiposPermitidos.includes(tipoSolicitacao)) {
    return {
      status: 403,
      body: { error: `Usuário sem permissão para ${operacao} do tipo '${tipoSolicitacao}'` },
    };
  }

  return null;
};

export const buscarVoucherParaRetirada = async (
  input: { codigo_voucher: string; tipos_permitidos?: TipoRequisicao[] }
): Promise<ServiceResult<VoucherRetiradaPreviewResponse>> => {
  const voucher = await carregarVoucherComSolicitacao(input.codigo_voucher);

  if (!voucher) {
    return { status: 404, body: { error: "Voucher não encontrado" } };
  }

  if (!voucher.solicitacao) {
    return { status: 409, body: { error: "Voucher sem solicitação vinculada" } };
  }

  const validacaoPermissao = validarPermissaoBipagem(
    input.tipos_permitidos,
    voucher.solicitacao.tipo_requisicao,
    "consultar vouchers"
  );

  if (validacaoPermissao) {
    return validacaoPermissao;
  }

  const aprovador = voucher.solicitacao.gerente_aprovacao
    ? await AppDataSource.getRepository(User).findOne({
        where: { matricula: String(voucher.solicitacao.gerente_aprovacao) },
      })
    : null;

  return {
    status: 200,
    body: {
      data: {
        id: voucher.id,
        codigo_voucher: voucher.codigo_voucher,
        status: voucher.status,
        ativo: voucher.ativo,
        data_resgate: voucher.data_resgate ?? null,
        created_at: voucher.created_at,
        solicitacao: {
          id: voucher.solicitacao.id,
          status: voucher.solicitacao.status,
          created_at: voucher.solicitacao.created_at,
          data_aprovado: voucher.solicitacao.data_aprovado ?? null,
          colaborador: {
            nome: voucher.solicitacao.nome,
            matricula: voucher.solicitacao.matricula,
            setor: voucher.solicitacao.setor,
          },
          brinde: {
            tipo_requisicao: voucher.solicitacao.tipo_requisicao,
            subgrupo_campanha: voucher.solicitacao.subgrupo_campanha ?? null,
            genero: voucher.solicitacao.genero ?? null,
            marca: voucher.solicitacao.marca ?? null,
            modelo: voucher.solicitacao.modelo ?? null,
            num_calce: voucher.solicitacao.num_calce,
            categoria_infantil: voucher.solicitacao.categoria_infantil,
          },
          aprovador: {
            matricula: voucher.solicitacao.gerente_aprovacao ?? null,
            nome: aprovador?.nome ?? null,
          },
        },
      },
    },
  };
};

export const biparRetirada = async (
  input: BiparVoucherInput & { matricula?: number; tipos_permitidos?: TipoRequisicao[] }
): Promise<ServiceResult<BiparRetiradaResponse>> => {
  const voucher = await carregarVoucherComSolicitacao(input.codigo_voucher);

  if (!voucher) {
    return { status: 404, body: { error: "Voucher não encontrado" } };
  }

  if (!voucher.solicitacao) {
    return { status: 409, body: { error: "Voucher sem solicitação vinculada" } };
  }

  const validacaoPermissao = validarPermissaoBipagem(
    input.tipos_permitidos,
    voucher.solicitacao.tipo_requisicao,
    "bipagem de retiradas"
  );
  if (validacaoPermissao) {
    return validacaoPermissao;
  }

  if (!voucher.ativo) {
    return { status: 409, body: { error: "Voucher inativo" } };
  }

  if (voucher.status !== StatusSVouncher.PENDENTE) {
    return { status: 409, body: { error: "Voucher já foi resgatado ou cancelado" } };
  }

  const now = new Date();

  try {
    await AppDataSource.transaction(async (manager) => {
      await manager.update(VoucherSolicitacao, voucher.id, {
        status: StatusSVouncher.RESGATADO,
        ativo: false,
        data_resgate: now,
      });

      await manager.update(SolicitacaoBrinde, voucher.solicitacao.id, {
        entregue: true,
        entregue_por: input.matricula,
        data_entregue: now,
        status: StatusSolicitacaoBrinde.RETIRADO,
        updated_by: input.matricula,
      });

      const historico = manager.create(SolicitacaoHistorico, {
        solicitacao_id: voucher.solicitacao.id,
        status_anterior: voucher.solicitacao.status,
        status_novo: StatusSolicitacaoBrinde.RETIRADO,
        acao: AcaoSolicitacaoHistorico.RETIRADA,
        usuario_matricula: Number(input.matricula),
        marca_nova: voucher.solicitacao.marca ?? null,
        modelo_novo: voucher.solicitacao.modelo ?? null,
      });

      await manager.save(SolicitacaoHistorico, historico);
    });
  } catch (err) {
    console.error("Erro ao resgatar voucher:", err);
    return { status: 500, body: { error: "Erro ao resgatar voucher" } };
  }

  return {
    status: 200,
    body: {
      message: "Voucher resgatado com sucesso",
      voucher_id: voucher.id,
      solicitacao_id: voucher.solicitacao.id,
    },
  };
};

export const solicitarTroca = async (
  input: BiparVoucherInput & { matricula?: number; tipos_permitidos?: TipoRequisicao[] }
): Promise<ServiceResult<SolicitarTrocaResponse>> => {
  const voucher = await carregarVoucherComSolicitacao(input.codigo_voucher);

  if (!voucher) {
    return { status: 404, body: { error: "Voucher não encontrado" } };
  }

  if (!voucher.solicitacao) {
    return { status: 409, body: { error: "Voucher sem solicitação vinculada" } };
  }

  const validacaoPermissao = validarPermissaoBipagem(
    input.tipos_permitidos,
    voucher.solicitacao.tipo_requisicao,
    "solicitar trocas"
  );
  if (validacaoPermissao) {
    return validacaoPermissao;
  }

  if (voucher.ativo) {
    return { status: 409, body: { error: "Voucher ainda está ativo e não pode entrar em troca" } };
  }

  if (voucher.status !== StatusSVouncher.RESGATADO) {
    return { status: 409, body: { error: "A troca só pode ser solicitada para vouchers já resgatados" } };
  }

  if (voucher.solicitacao.status !== StatusSolicitacaoBrinde.RETIRADO) {
    return { status: 409, body: { error: "A solicitação vinculada não está no status retirado" } };
  }

  const now = new Date();

  try {
    await AppDataSource.transaction(async (manager) => {
      const statusAnterior = voucher.solicitacao.status;

      voucher.solicitacao.entregue = false;
      voucher.solicitacao.entregue_por = undefined;
      voucher.solicitacao.data_entregue = undefined;
      voucher.solicitacao.status = StatusSolicitacaoBrinde.AGUARDANDO_TROCA;
      voucher.solicitacao.updated_by = input.matricula;
      voucher.solicitacao.updated_at = now;

      await manager.save(SolicitacaoBrinde, voucher.solicitacao);

      const historico = manager.create(SolicitacaoHistorico, {
        solicitacao_id: voucher.solicitacao.id,
        status_anterior: statusAnterior,
        status_novo: StatusSolicitacaoBrinde.AGUARDANDO_TROCA,
        acao: AcaoSolicitacaoHistorico.SOLICITACAO_TROCA,
        usuario_matricula: Number(input.matricula),
        marca_nova: voucher.solicitacao.marca ?? null,
        modelo_novo: voucher.solicitacao.modelo ?? null,
        metadata: {
          codigo_voucher: voucher.codigo_voucher,
          voucher_id: voucher.id,
          data_resgate_original: voucher.data_resgate?.toISOString() ?? null,
        },
      });

      await manager.save(SolicitacaoHistorico, historico);
    });
  } catch (err) {
    console.error("Erro ao solicitar troca de voucher:", err);
    return { status: 500, body: { error: "Erro ao solicitar troca de voucher" } };
  }

  return {
    status: 200,
    body: {
      message: "Troca solicitada com sucesso",
      voucher_id: voucher.id,
      solicitacao_id: voucher.solicitacao.id,
    },
  };
};

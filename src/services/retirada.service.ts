import { AppDataSource } from "../config/db";
import { SolicitacaoBrinde, StatusSolicitacaoBrinde, TipoRequisicao } from "../models/Solicitacao";
import { AcaoSolicitacaoHistorico, SolicitacaoHistorico } from "../models/SolicitacaoHistorico";
import { StatusSVouncher, VoucherSolicitacao } from "../models/VoucherSolicitacao";
import { BiparVoucherInput } from "../schemas/retirada.schema";
import { ServiceResult } from "../types/service";

type ErrorResponse = { error: string };

type BiparRetiradaSuccess = {
  message: string;
  voucher_id: string;
  solicitacao_id: string;
};

type BiparRetiradaResponse = BiparRetiradaSuccess | ErrorResponse;

const notImplemented = (): ServiceResult<ErrorResponse> => ({
  status: 501,
  body: { error: "not implemented" },
});

export const previewRetirada = async (): Promise<ServiceResult<ErrorResponse>> =>
  notImplemented();

export const biparRetirada = async (
  input: BiparVoucherInput & { matricula?: number; tipos_permitidos?: TipoRequisicao[] }
): Promise<ServiceResult<BiparRetiradaResponse>> => {
  const voucherRepo = AppDataSource.getRepository(VoucherSolicitacao);

  const voucher = await voucherRepo.findOne({
    where: { codigo_voucher: input.codigo_voucher },
    relations: ["solicitacao"],
  });

  if (!voucher) {
    return { status: 404, body: { error: "Voucher não encontrado" } };
  }

  if (!voucher.solicitacao) {
    return { status: 409, body: { error: "Voucher sem solicitação vinculada" } };
  }

  if (!input.tipos_permitidos || input.tipos_permitidos.length === 0) {
    return { status: 403, body: { error: "Usuário sem permissão para bipagem de retiradas" } };
  }

  if (!input.tipos_permitidos.includes(voucher.solicitacao.tipo_requisicao)) {
    return {
      status: 403,
      body: { error: `Usuário sem permissão para bipar retiradas do tipo '${voucher.solicitacao.tipo_requisicao}'` },
    };
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

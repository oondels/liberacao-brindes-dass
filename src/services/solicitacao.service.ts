import { Between, FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { AppDataSource } from "../config/db";
import { SolicitacaoBrinde } from "../models/Solicitacao";
import { VoucherSolicitacao, StatusSVouncher } from "../models/VoucherSolicitacao";
import { UserAprovacao } from "../models/UserAprovacao";
import {
  AprovarSolicitacaoInput,
  CreateSolicitacaoInput,
  ListSolicitacaoQuery,
} from "../schemas/solicitacao.schema";
import { ServiceResult } from "../types/service";
import { TipoRequisicao, StatusSolicitacaoBrinde } from "../models/Solicitacao";
import { CustomError } from "../types/CustomError";
import { nanoid } from "nanoid";

const repository = AppDataSource.getRepository(SolicitacaoBrinde);
const tiposComBrindeDefinidoNaAprovacao = [TipoRequisicao.CAMPANHA, TipoRequisicao.FALTA_ZERO];

const verificarPermissaoAprovacao = async (
  matricula: number,
  tipoRequisicao: string
): Promise<void> => {
  const userAprovacaoRepository = AppDataSource.getRepository(UserAprovacao);

  const userAprovacao = await userAprovacaoRepository.findOne({
    where: { matricula },
  });

  if (!userAprovacao) {
    throw new CustomError("Usuário sem permissão para aprovação de solicitações", 403);
  }

  const tiposPermitidos = userAprovacao.tipo_requisicao as string[];
  if (!tiposPermitidos.includes(tipoRequisicao)) {
    throw new CustomError(
      `Usuário sem permissão para aprovar solicitações do tipo '${tipoRequisicao}'`,
      403
    );
  }
};

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

export const criarSolicitacao = async (
  input: CreateSolicitacaoInput & { usuario_criador?: number }
): Promise<ServiceResult<SolicitacaoResponse>> => {
  const toNumber = (value: string, field: string): number | null => {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };
  const matricula = toNumber(input.matricula, "matricula");
  const numCalce = toNumber(input.num_calce, "num_calce");
  const rfid = input.rfid ? toNumber(input.rfid, "rfid") : null;
  const codbarras = input.codbarras ? toNumber(input.codbarras, "codbarras") : null;
  const tipoRequisicao = input.tipo_requisicao as TipoRequisicao;
  const marca = input.marca?.trim();
  const modelo = input.modelo?.trim();

  if (matricula === null || numCalce === null) {
    throw new CustomError("Campos numerios invalidos", 400)
  }

  const tipoPermiteBrindeVazioNaCriacao = tiposComBrindeDefinidoNaAprovacao.includes(tipoRequisicao);
  if (!tipoPermiteBrindeVazioNaCriacao && (!marca || !modelo)) {
    throw new CustomError(
      "Marca e modelo são obrigatórios para este tipo de solicitação",
      400
    );
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
      tipo_requisicao: tipoRequisicao,
      usuario_criador: input.usuario_criador,
      marca: marca || undefined,
      modelo: modelo || undefined,
      num_calce: numCalce,
      status: StatusSolicitacaoBrinde.PENDENTE_APROVACAO,
    });

    const saved = await repository.save(solicitacao);
    return { status: 201, body: { data: saved } };
  } catch (error) {
    if (error instanceof CustomError) throw error;

    throw new CustomError("Erro ao criar solicitação", 500)
  }
};

export const listarSolicitacoes = async (
  filters: ListSolicitacaoQuery
): Promise<ServiceResult<SolicitacaoResponse>> => {
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
    throw new CustomError("Erro ao listar solicitacoes", 500)
  }
};

export const obterSolicitacaoPorId = async (id: string): Promise<ServiceResult<SolicitacaoResponse>> => {
  try {
    const solicitacao = await repository.findOne({ where: { id }, relations: ["voucher"] });
    if (!solicitacao) throw new CustomError("Solicitação não encontrada", 404)

    return {
      body: {
        data: solicitacao
      },
      status: 200
    }
  } catch (error) {
    if (error instanceof CustomError) throw error
    throw new CustomError(`Erro ao obter solicitação por id: ${id}`, 500)
  }
}

export const aprovarSolicitacao = async (
  id: string,
  user_aprovador: number,
  input: AprovarSolicitacaoInput
): Promise<ServiceResult<SolicitacaoResponse>> => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const solicitacao = await queryRunner.manager.findOne(SolicitacaoBrinde, {
      where: { id },
    });

    if (!solicitacao) {
      throw new CustomError("Solicitação não encontrada", 404);
    }

    if (solicitacao.status !== StatusSolicitacaoBrinde.PENDENTE_APROVACAO) {
      throw new CustomError("Solicitação não está pendente de aprovação", 400);
    }

    await verificarPermissaoAprovacao(user_aprovador, solicitacao.tipo_requisicao);

    const tipoDefineBrindeNaAprovacao = tiposComBrindeDefinidoNaAprovacao.includes(solicitacao.tipo_requisicao);
    if (tipoDefineBrindeNaAprovacao) {
      const marcaAprovacao = input.marca?.trim();
      const modeloAprovacao = input.modelo?.trim();

      if (!marcaAprovacao || !modeloAprovacao) {
        throw new CustomError(
          "Para aprovar solicitações dos tipos campanha e falta_zero, informe marca e modelo",
          400
        );
      }

      solicitacao.marca = marcaAprovacao;
      solicitacao.modelo = modeloAprovacao;
    } else if (!solicitacao.marca || !solicitacao.modelo) {
      throw new CustomError("Solicitação sem marca/modelo para aprovação", 400);
    }

    // Atualiza a solicitação
    solicitacao.status = StatusSolicitacaoBrinde.APROVADO;
    solicitacao.gerente_aprovacao = user_aprovador;
    solicitacao.updated_by = user_aprovador;
    const updateDate = new Date();
    solicitacao.data_aprovado = updateDate;
    solicitacao.updated_at = updateDate;
    await queryRunner.manager.save(SolicitacaoBrinde, solicitacao);

    // Cria o voucher vinculado
    const voucher = queryRunner.manager.create(VoucherSolicitacao, {
      codigo_voucher: nanoid(10),
      ativo: true,
      solicitacao,
    });
    await queryRunner.manager.save(VoucherSolicitacao, voucher);

    await queryRunner.commitTransaction();

    // Recarrega a solicitação com o voucher associado
    const solicitacaoAtualizada = await repository.findOne({
      where: { id },
      relations: ["voucher"],
    });

    return {
      status: 200,
      body: { data: solicitacaoAtualizada! },
    };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.log("Erro ao aprovar solicitação: ", error);


    if (error instanceof CustomError) throw error;
    throw new CustomError("Erro ao aprovar solicitação", 500);
  } finally {
    await queryRunner.release();
  }
}

export const rejeitarSolicitacao = async (
  id: string,
  usuario_id: number | undefined
): Promise<ServiceResult<SolicitacaoResponse>> => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const solicitacao = await queryRunner.manager.findOne(SolicitacaoBrinde, {
      where: { id },
    });

    if (!solicitacao) {
      throw new CustomError("Solicitação não encontrada", 404);
    }

    if (solicitacao.status !== StatusSolicitacaoBrinde.PENDENTE_APROVACAO) {
      throw new CustomError("Solicitação não está pendente de aprovação", 400);
    }

    if (usuario_id === undefined) {
      throw new CustomError("Usuário não autenticado", 401);
    }

    await verificarPermissaoAprovacao(usuario_id, solicitacao.tipo_requisicao);

    solicitacao.status = StatusSolicitacaoBrinde.REJEITADO;
    solicitacao.updated_by = usuario_id;
    solicitacao.updated_at = new Date();
    await queryRunner.manager.save(SolicitacaoBrinde, solicitacao);

    await queryRunner.commitTransaction();

    return {
      status: 200,
      body: { data: solicitacao },
    };
  } catch (error) {
    await queryRunner.rollbackTransaction();

    if (error instanceof CustomError) throw error;
    throw new CustomError("Erro ao rejeitar solicitação", 500);
  } finally {
    await queryRunner.release();
  }
};

export const cancelarSolicitacao = async (
  id: string,
  motivo: string
): Promise<ServiceResult<SolicitacaoResponse>> => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const solicitacao = await queryRunner.manager.findOne(SolicitacaoBrinde, {
      where: { id },
      relations: ["voucher"],
    });

    if (!solicitacao) {
      throw new CustomError("Solicitação não encontrada", 404);
    }

    const statusPermitidos = [
      StatusSolicitacaoBrinde.PENDENTE_APROVACAO,
      StatusSolicitacaoBrinde.APROVADO,
    ];

    if (!statusPermitidos.includes(solicitacao.status)) {
      throw new CustomError(
        "Solicitação não pode ser cancelada no status atual",
        400
      );
    }

    // Atualiza a solicitação
    solicitacao.status = StatusSolicitacaoBrinde.CANCELADO;
    solicitacao.updated_at = new Date();
    await queryRunner.manager.save(SolicitacaoBrinde, solicitacao);

    // Se houver voucher vinculado, cancela-o também
    if (solicitacao.voucher) {
      solicitacao.voucher.ativo = false;
      solicitacao.voucher.status = StatusSVouncher.CANCELADO;
      await queryRunner.manager.save(VoucherSolicitacao, solicitacao.voucher);
    }

    await queryRunner.commitTransaction();

    return {
      status: 200,
      body: { data: solicitacao },
    };
  } catch (error) {
    await queryRunner.rollbackTransaction();

    if (error instanceof CustomError) throw error;
    throw new CustomError("Erro ao cancelar solicitação", 500);
  } finally {
    await queryRunner.release();
  }
};

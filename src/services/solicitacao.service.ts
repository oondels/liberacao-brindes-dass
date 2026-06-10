import { Brackets, EntityManager } from "typeorm";
import { nanoid } from "nanoid";
import { AppDataSource } from "../config/db";
import { BrindeAtivo } from "../models/BrindeAtivo";
import {
  GeneroSolicitacao,
  SolicitacaoBrinde,
  StatusSolicitacaoBrinde,
  SubgrupoCampanha,
  TipoRequisicao,
} from "../models/Solicitacao";
import { AcaoSolicitacaoHistorico, SolicitacaoHistorico } from "../models/SolicitacaoHistorico";
import { UserAprovacao } from "../models/UserAprovacao";
import { UserSeparacao } from "../models/UserSeparacao";
import { User } from "../models/User";
import { StatusSVouncher, VoucherSolicitacao } from "../models/VoucherSolicitacao";
import {
  AprovarSolicitacaoInput,
  CreateSolicitacaoInput,
  ListSolicitacaoQuery,
  ListSolicitacaoSeparacaoQuery,
  SepararSolicitacaoInput,
} from "../schemas/solicitacao.schema";
import { CustomError } from "../types/CustomError";
import { ServiceResult } from "../types/service";

const repository = AppDataSource.getRepository(SolicitacaoBrinde);
const tiposComBrindeDefinidoNaAprovacao = [TipoRequisicao.CAMPANHA, TipoRequisicao.FALTA_ZERO];
const tiposComVoucherGeradoNaAprovacao = [TipoRequisicao.TESTE_CALCE, TipoRequisicao.GRATIFICACAO];

type InvalidarVoucherAccess = {
  isMasterAdmin: boolean;
  allowedTypes: TipoRequisicao[] | null;
};

type VoucherDTO = {
  id: string;
  codigo_voucher: string;
  status: StatusSVouncher;
  ativo: boolean;
  data_resgate: Date | null;
  created_at: Date;
  updated_at: Date;
};

type BrindeAtivoDTO = {
  id: string;
  nome: string;
  tipo_requisicao: TipoRequisicao;
  subgrupo_campanha: SubgrupoCampanha | null;
  marca: string | null;
  modelo: string | null;
  genero: GeneroSolicitacao | null;
  num_calce: number | null;
  ativo: boolean;
  created_at: Date;
  updated_at: Date;
};

type SolicitacaoHistoricoDTO = {
  id: string;
  solicitacao_id: string;
  status_anterior: StatusSolicitacaoBrinde | null;
  status_novo: StatusSolicitacaoBrinde;
  acao: AcaoSolicitacaoHistorico;
  usuario_matricula: number;
  marca_anterior: string | null;
  modelo_anterior: string | null;
  marca_nova: string | null;
  modelo_novo: string | null;
  metadata: Record<string, unknown> | null;
  created_at: Date;
};

type SolicitacaoDetalheDTO = Omit<SolicitacaoBrinde, "voucher" | "historico" | "brinde"> & {
  voucher: VoucherDTO | null;
  brinde: BrindeAtivoDTO | null;
  historico: SolicitacaoHistoricoDTO[];
  solicitante: {
    nome: string | null;
    matricula: number;
  };
  separacao: {
    realizada: boolean;
    separado_por?: number;
    data_separacao?: Date;
    alteracoes?: {
      marca?: { antes: string | null; depois: string | null };
      modelo?: { antes: string | null; depois: string | null };
    };
  };
};

type SolicitacaoListPayload<T> = {
  data: T[];
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export type SolicitacaoResponse =
  | { error: string }
  | { data: SolicitacaoBrinde | SolicitacaoDetalheDTO }
  | SolicitacaoListPayload<SolicitacaoBrinde>;

export type SolicitacaoSeparacaoListItem = {
  id: string;
  nome: string;
  matricula: number;
  setor: string;
  gerente: string;
  tipo_requisicao: TipoRequisicao;
  subgrupo_campanha: SubgrupoCampanha | null;
  genero: GeneroSolicitacao | null;
  brinde_id: string | null;
  marca: string | null;
  modelo: string | null;
  num_calce: number;
  categoria_infantil: boolean;
  status: StatusSolicitacaoBrinde;
  created_at: Date;
  data_aprovado: Date | null;
};

export type SolicitacaoSeparacaoResponse =
  | { error: string }
  | SolicitacaoListPayload<SolicitacaoSeparacaoListItem>;

type SnapshotContext = {
  tipo_requisicao: TipoRequisicao;
  subgrupo_campanha?: SubgrupoCampanha | null;
  genero?: GeneroSolicitacao | null;
  num_calce: number;
  brinde_id?: string | null;
  marca?: string | null;
  modelo?: string | null;
};

type ResolveSnapshotInput = {
  manager: EntityManager;
  context: SnapshotContext;
  inputBrindeId?: string;
  inputMarca?: string;
  inputModelo?: string;
};

type ResolvedBrindeSnapshot = {
  brinde: BrindeAtivo | null;
  brinde_id: string | null;
  marca: string | null;
  modelo: string | null;
};

const normalizeOptionalString = (value?: string | null): string | null => {
  if (typeof value !== "string") {
    return value ?? null;
  }

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

const toVoucherDTO = (voucher?: VoucherSolicitacao | null): VoucherDTO | null =>
  voucher
    ? {
      id: voucher.id,
      codigo_voucher: voucher.codigo_voucher,
      status: voucher.status,
      ativo: voucher.ativo,
      data_resgate: voucher.data_resgate ?? null,
      created_at: voucher.created_at,
      updated_at: voucher.updated_at,
    }
    : null;

const toBrindeDTO = (brinde?: BrindeAtivo | null): BrindeAtivoDTO | null =>
  brinde
    ? {
      id: brinde.id,
      nome: brinde.nome,
      tipo_requisicao: brinde.tipo_requisicao,
      subgrupo_campanha: brinde.subgrupo_campanha ?? null,
      marca: brinde.marca ?? null,
      modelo: brinde.modelo ?? null,
      genero: brinde.genero ?? null,
      num_calce: brinde.num_calce ?? null,
      ativo: brinde.ativo,
      created_at: brinde.created_at,
      updated_at: brinde.updated_at,
    }
    : null;

const toHistoricoDTO = (item: SolicitacaoHistorico): SolicitacaoHistoricoDTO => ({
  id: item.id,
  solicitacao_id: item.solicitacao_id,
  status_anterior: item.status_anterior ?? null,
  status_novo: item.status_novo,
  acao: item.acao,
  usuario_matricula: item.usuario_matricula,
  marca_anterior: item.marca_anterior ?? null,
  modelo_anterior: item.modelo_anterior ?? null,
  marca_nova: item.marca_nova ?? null,
  modelo_novo: item.modelo_novo ?? null,
  metadata: (item.metadata as Record<string, unknown> | null | undefined) ?? null,
  created_at: item.created_at,
});

const buildSeparacaoPayload = (historico: SolicitacaoHistoricoDTO[]) => {
  const ultimoEvento = [...historico]
    .reverse()
    .find((item) => item.acao === AcaoSolicitacaoHistorico.SEPARACAO_CONFIRMADA);

  if (!ultimoEvento) {
    return { realizada: false };
  }

  const alteracoes: {
    marca?: { antes: string | null; depois: string | null };
    modelo?: { antes: string | null; depois: string | null };
  } = {};

  if (ultimoEvento.marca_anterior !== ultimoEvento.marca_nova) {
    alteracoes.marca = {
      antes: ultimoEvento.marca_anterior ?? null,
      depois: ultimoEvento.marca_nova ?? null,
    };
  }

  if (ultimoEvento.modelo_anterior !== ultimoEvento.modelo_novo) {
    alteracoes.modelo = {
      antes: ultimoEvento.modelo_anterior ?? null,
      depois: ultimoEvento.modelo_novo ?? null,
    };
  }

  return {
    realizada: true,
    separado_por: ultimoEvento.usuario_matricula,
    data_separacao: ultimoEvento.created_at,
    alteracoes: Object.keys(alteracoes).length > 0 ? alteracoes : undefined,
  };
};

const toDetalheDTO = (
  solicitacao: SolicitacaoBrinde & {
    voucher?: VoucherSolicitacao | null;
    historico?: SolicitacaoHistorico[];
    brinde?: BrindeAtivo | null;
  },
  solicitante: { nome: string | null; matricula: number }
): SolicitacaoDetalheDTO => {
  const historico = (solicitacao.historico ?? [])
    .sort((a, b) => a.created_at.getTime() - b.created_at.getTime())
    .map(toHistoricoDTO);

  return {
    ...solicitacao,
    voucher: toVoucherDTO(solicitacao.voucher),
    brinde: toBrindeDTO(solicitacao.brinde),
    historico,
    solicitante,
    separacao: buildSeparacaoPayload(historico),
  };
};

const verificarPermissaoAprovacao = async (
  matricula: number,
  tipoRequisicao: TipoRequisicao
): Promise<void> => {
  const userAprovacaoRepository = AppDataSource.getRepository(UserAprovacao);
  const userAprovacao = await userAprovacaoRepository.findOne({ where: { matricula } });

  if (!userAprovacao) {
    throw new CustomError("Usuário sem permissão para aprovação de solicitações", 403);
  }

  if (!userAprovacao.tipo_requisicao || !userAprovacao.tipo_requisicao.includes(tipoRequisicao)) {
    throw new CustomError(
      `Usuário sem permissão para aprovar solicitações do tipo '${tipoRequisicao}'`,
      403
    );
  }
};

const obterAprovadorTroca = async (matricula: number): Promise<UserAprovacao> => {
  const userAprovacaoRepository = AppDataSource.getRepository(UserAprovacao);
  const userAprovacao = await userAprovacaoRepository.findOne({ where: { matricula } });

  if (!userAprovacao || !userAprovacao.pode_aprovar_troca) {
    throw new CustomError("Usuário sem permissão para aprovação de trocas", 403);
  }

  return userAprovacao;
};

const verificarPermissaoAprovacaoTroca = async (
  matricula: number,
  tipoRequisicao: TipoRequisicao
): Promise<UserAprovacao> => {
  const userAprovacao = await obterAprovadorTroca(matricula);

  if (
    Array.isArray(userAprovacao.tipo_requisicao)
    && userAprovacao.tipo_requisicao.length > 0
    && !userAprovacao.tipo_requisicao.includes(tipoRequisicao)
  ) {
    throw new CustomError(
      `Usuário sem permissão para aprovar trocas do tipo '${tipoRequisicao}'`,
      403
    );
  }

  return userAprovacao;
};

const verificarPermissaoSeparacao = async (
  matricula: number,
  tipoRequisicao: TipoRequisicao
): Promise<UserSeparacao> => {
  const separacaoRepository = AppDataSource.getRepository(UserSeparacao);
  const userSeparacao = await separacaoRepository.findOne({ where: { matricula } });

  if (!userSeparacao) {
    throw new CustomError("Usuário sem permissão para separação de solicitações", 403);
  }

  if (!userSeparacao.tipo_requisicao.includes(tipoRequisicao)) {
    throw new CustomError(
      `Usuário sem permissão para separar solicitações do tipo '${tipoRequisicao}'`,
      403
    );
  }

  return userSeparacao;
};

const verificarPermissaoInvalidacaoVoucher = (
  access: InvalidarVoucherAccess,
  tipoRequisicao: TipoRequisicao
): void => {
  if (access.isMasterAdmin) {
    return;
  }

  if (!access.allowedTypes || !access.allowedTypes.includes(tipoRequisicao)) {
    throw new CustomError(
      `Usuário sem permissão para invalidar vouchers do tipo '${tipoRequisicao}'`,
      403
    );
  }
};

const registrarHistorico = async (
  manager: EntityManager,
  input: {
    solicitacao: SolicitacaoBrinde;
    status_anterior?: StatusSolicitacaoBrinde | null;
    status_novo: StatusSolicitacaoBrinde;
    acao: AcaoSolicitacaoHistorico;
    usuario_matricula: number;
    marca_anterior?: string | null;
    modelo_anterior?: string | null;
    marca_nova?: string | null;
    modelo_novo?: string | null;
    metadata?: Record<string, unknown>;
  }
): Promise<void> => {
  const historico = manager.create(SolicitacaoHistorico, {
    solicitacao: input.solicitacao,
    solicitacao_id: input.solicitacao.id,
    status_anterior: input.status_anterior ?? null,
    status_novo: input.status_novo,
    acao: input.acao,
    usuario_matricula: input.usuario_matricula,
    marca_anterior: input.marca_anterior ?? null,
    modelo_anterior: input.modelo_anterior ?? null,
    marca_nova: input.marca_nova ?? null,
    modelo_novo: input.modelo_novo ?? null,
    metadata: input.metadata ?? null,
  });

  await manager.save(SolicitacaoHistorico, historico);
};

const criarVoucherParaSolicitacao = async (
  manager: EntityManager,
  solicitacao: SolicitacaoBrinde
): Promise<VoucherSolicitacao> => {
  const existingVoucher = await manager.findOne(VoucherSolicitacao, {
    where: { solicitacao: { id: solicitacao.id } },
    relations: ["solicitacao"],
  });

  if (existingVoucher) {
    return existingVoucher;
  }

  const voucher = manager.create(VoucherSolicitacao, {
    codigo_voucher: nanoid(10),
    ativo: true,
    solicitacao,
  });

  return manager.save(VoucherSolicitacao, voucher);
};

const carregarBrindeAtivo = async (
  manager: EntityManager,
  brindeId: string
): Promise<BrindeAtivo> => {
  const brinde = await manager.findOne(BrindeAtivo, {
    where: { id: brindeId, ativo: true },
  });

  if (!brinde) {
    throw new CustomError("Brinde ativo não encontrado", 404);
  }

  return brinde;
};

const validarCompatibilidadeBrinde = (
  context: SnapshotContext,
  brinde: BrindeAtivo
): void => {
  if (brinde.tipo_requisicao !== context.tipo_requisicao) {
    throw new CustomError("Brinde incompatível com o tipo de requisição", 400);
  }

  if (context.tipo_requisicao === TipoRequisicao.CAMPANHA) {
    if (!context.subgrupo_campanha || brinde.subgrupo_campanha !== context.subgrupo_campanha) {
      throw new CustomError("Brinde incompatível com o subgrupo da campanha", 400);
    }
  }

  if (brinde.genero && context.genero && brinde.genero !== context.genero) {
    throw new CustomError("Brinde incompatível com o gênero informado", 400);
  }

  if (brinde.num_calce && brinde.num_calce !== context.num_calce) {
    throw new CustomError("Brinde incompatível com o número de calce informado", 400);
  }
};

const resolverSnapshotBrinde = async ({
  manager,
  context,
  inputBrindeId,
  inputMarca,
  inputModelo,
}: ResolveSnapshotInput): Promise<ResolvedBrindeSnapshot> => {
  const brindeId = inputBrindeId ?? context.brinde_id ?? null;
  let brinde: BrindeAtivo | null = null;

  if (brindeId) {
    brinde = await carregarBrindeAtivo(manager, brindeId);
    validarCompatibilidadeBrinde(context, brinde);
  }

  const marca = normalizeOptionalString(inputMarca)
    ?? normalizeOptionalString(brinde?.marca)
    ?? normalizeOptionalString(context.marca)
    ?? null;

  const modelo = normalizeOptionalString(inputModelo)
    ?? normalizeOptionalString(brinde?.modelo)
    ?? normalizeOptionalString(context.modelo)
    ?? null;

  return {
    brinde,
    brinde_id: brinde?.id ?? null,
    marca,
    modelo,
  };
};

const carregarSolicitacaoDetalhe = async (id: string): Promise<SolicitacaoDetalheDTO> => {
  const solicitacao = await repository.findOne({
    where: { id },
    relations: ["voucher", "historico", "brinde"],
  });

  if (!solicitacao) {
    throw new CustomError("Solicitação não encontrada", 404);
  }

  const user = await AppDataSource.getRepository(User).findOne({
    where: { matricula: String(solicitacao.usuario_criador) }
  });

  return toDetalheDTO(solicitacao, {
    nome: user?.nome ?? null,
    matricula: solicitacao.usuario_criador
  });
};

export const criarSolicitacao = async (
  input: CreateSolicitacaoInput & { usuario_criador?: number }
): Promise<ServiceResult<SolicitacaoResponse>> => {
  const toNumber = (value: string): number | null => {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const matricula = toNumber(input.matricula);
  const numCalce = toNumber(input.num_calce);
  const rfid = input.rfid ? toNumber(input.rfid) : null;
  const codbarras = input.codbarras ? toNumber(input.codbarras) : null;
  const tipoRequisicao = input.tipo_requisicao as TipoRequisicao;
  const subgrupoCampanha = (input.subgrupo_campanha as SubgrupoCampanha | undefined) ?? null;
  const genero = input.genero as GeneroSolicitacao;
  const bonificacaoUserLiberacao = input.bonificacao_user_liberacao ? toNumber(input.bonificacao_user_liberacao) : null;

  if (matricula === null || numCalce === null) {
    throw new CustomError("Campos numerios invalidos", 400);
  }

  if (!input.usuario_criador) {
    throw new CustomError("Usuário criador é obrigatório", 400);
  }

  try {
    const saved = await AppDataSource.transaction(async (manager) => {
      const snapshot = await resolverSnapshotBrinde({
        manager,
        context: {
          tipo_requisicao: tipoRequisicao,
          subgrupo_campanha: subgrupoCampanha,
          genero,
          num_calce: numCalce,
        },
        inputBrindeId: input.brinde_id?.toString(),
        inputMarca: input.marca,
        inputModelo: input.modelo,
      });

      if (tiposComVoucherGeradoNaAprovacao.includes(tipoRequisicao) && (!snapshot.marca || !snapshot.modelo)) {
        throw new CustomError("Marca e modelo são obrigatórios para solicitações de teste_calce ou gratificacao", 400);
      }

      const solicitacao = manager.create(SolicitacaoBrinde, {
        nome: input.nome,
        matricula,
        rfid: rfid ?? undefined,
        codbarras: codbarras ?? undefined,
        setor: input.setor,
        gerente: input.gerente,
        tipo_requisicao: tipoRequisicao,
        subgrupo_campanha: subgrupoCampanha ?? undefined,
        usuario_criador: input.usuario_criador,
        brinde_id: snapshot.brinde_id,
        marca: snapshot.marca ?? undefined,
        modelo: snapshot.modelo ?? undefined,
        genero,
        num_calce: numCalce,
        categoria_infantil: input.categoria_infantil ?? false,
        bonificacao_user_liberacao: bonificacaoUserLiberacao ?? undefined,
        status: StatusSolicitacaoBrinde.PENDENTE_APROVACAO,
      });

      const persisted = await manager.save(SolicitacaoBrinde, solicitacao);
      await registrarHistorico(manager, {
        solicitacao: persisted,
        status_novo: StatusSolicitacaoBrinde.PENDENTE_APROVACAO,
        acao: AcaoSolicitacaoHistorico.CRIACAO,
        usuario_matricula: input.usuario_criador!,
        marca_nova: persisted.marca ?? null,
        modelo_novo: persisted.modelo ?? null,
        metadata: {
          brinde_id: persisted.brinde_id ?? null,
          genero: persisted.genero ?? null,
          categoria_infantil: persisted.categoria_infantil,
        },
      });

      return persisted;
    });

    return { status: 201, body: { data: saved } };
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError("Erro ao criar solicitação", 500);
  }
};

export const criarSolicitacoesEmLote = async (
  solicitacoesLote: (CreateSolicitacaoInput & { usuario_criador?: number })[]
): Promise<ServiceResult<{ sucesso: boolean; quantidade: number; solicitacoes: SolicitacaoBrinde[] }>> => {
  const toNumber = (value: string): number | null => {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  try {
    const savedLote = await AppDataSource.transaction(async (manager) => {
      const persistedItems: SolicitacaoBrinde[] = [];

      for (const input of solicitacoesLote) {
        const matricula = toNumber(input.matricula);
        const numCalce = toNumber(input.num_calce);
        const rfid = input.rfid ? toNumber(input.rfid) : null;
        const codbarras = input.codbarras ? toNumber(input.codbarras) : null;
        const tipoRequisicao = input.tipo_requisicao as TipoRequisicao;
        const subgrupoCampanha = (input.subgrupo_campanha as SubgrupoCampanha | undefined) ?? null;
        const genero = input.genero as GeneroSolicitacao;
        const bonificacaoUserLiberacao = input.bonificacao_user_liberacao ? toNumber(input.bonificacao_user_liberacao) : null;

        if (matricula === null || numCalce === null) {
          throw new CustomError("Campos numericos invalidos em um ou mais itens do lote", 400);
        }

        if (!input.usuario_criador) {
          throw new CustomError("Usuário criador é obrigatório em todas as solicitações", 400);
        }

        const snapshot = await resolverSnapshotBrinde({
          manager,
          context: {
            tipo_requisicao: tipoRequisicao,
            subgrupo_campanha: subgrupoCampanha,
            genero,
            num_calce: numCalce,
          },
          inputBrindeId: input.brinde_id,
          inputMarca: input.marca,
          inputModelo: input.modelo,
        });

        if (tiposComVoucherGeradoNaAprovacao.includes(tipoRequisicao) && (!snapshot.marca || !snapshot.modelo)) {
          throw new CustomError("Marca e modelo são obrigatórios para solicitações de teste_calce ou gratificacao", 400);
        }

        const solicitacao = manager.create(SolicitacaoBrinde, {
          nome: input.nome,
          matricula,
          rfid: rfid ?? undefined,
          codbarras: codbarras ?? undefined,
          setor: input.setor,
          gerente: input.gerente,
          tipo_requisicao: tipoRequisicao,
          subgrupo_campanha: subgrupoCampanha ?? undefined,
          usuario_criador: input.usuario_criador,
          brinde_id: snapshot.brinde_id,
          marca: snapshot.marca ?? undefined,
          modelo: snapshot.modelo ?? undefined,
          genero,
          num_calce: numCalce,
          categoria_infantil: input.categoria_infantil ?? false,
          bonificacao_user_liberacao: bonificacaoUserLiberacao ?? undefined,
          status: StatusSolicitacaoBrinde.PENDENTE_APROVACAO,
        });

        const persisted = await manager.save(SolicitacaoBrinde, solicitacao);
        await registrarHistorico(manager, {
          solicitacao: persisted,
          status_novo: StatusSolicitacaoBrinde.PENDENTE_APROVACAO,
          acao: AcaoSolicitacaoHistorico.CRIACAO,
          usuario_matricula: input.usuario_criador,
          marca_nova: persisted.marca ?? null,
          modelo_novo: persisted.modelo ?? null,
          metadata: {
            brinde_id: persisted.brinde_id ?? null,
            genero: persisted.genero ?? null,
            categoria_infantil: persisted.categoria_infantil,
            origem: "lote",
          },
        });

        persistedItems.push(persisted);
      }

      return persistedItems;
    });

    return {
      status: 201, body: {
        sucesso: true, quantidade: savedLote.length, solicitacoes: savedLote
      }
    };
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError("Erro ao criar solicitações em lote", 500);
  }
};

export const listarSolicitacoes = async (
  filters: ListSolicitacaoQuery,
  access: {
    userMatricula?: number;
    isMasterAdmin: boolean;
    allowedTypes: TipoRequisicao[] | null;
    canApproveTrade: boolean;
    tradeApprovalPermissions: TipoRequisicao[] | null;
    restrictToSeparationStatus?: boolean;
  }
): Promise<ServiceResult<SolicitacaoResponse>> => {
  const pageSize = 20;
  const page = filters.page ?? 1;
  const take = pageSize + 1;
  const skip = (page - 1) * pageSize;

  try {
    const allowedTypes = access.allowedTypes;
    const tradePermissions = access.tradeApprovalPermissions;
    const possuiPermissaoGlobalTroca = access.canApproveTrade && !Array.isArray(tradePermissions);

    if (
      access.restrictToSeparationStatus
      && filters.status
      && filters.status !== StatusSolicitacaoBrinde.AGUARDANDO_SEPARACAO
    ) {
      throw new CustomError("Filtro de status fora das permissões do usuário", 403);
    }

    if (filters.status === StatusSolicitacaoBrinde.AGUARDANDO_TROCA) {
      if (!access.isMasterAdmin && !access.canApproveTrade) {
        throw new CustomError("Usuário sem permissão para visualizar solicitações em troca", 403);
      }

      if (
        !access.isMasterAdmin &&
        filters.tipo_requisicao
        && Array.isArray(tradePermissions)
        && tradePermissions.length > 0
        && !tradePermissions.includes(filters.tipo_requisicao as TipoRequisicao)
      ) {
        throw new CustomError("Filtro de tipo_requisicao fora das permissões do usuário", 403);
      }
    }

    const query = repository.createQueryBuilder("solicitacao");

    if (!access.isMasterAdmin) {
      if (!allowedTypes || allowedTypes.length === 0) {
        throw new CustomError("Usuário sem permissão para visualizar solicitações", 403);
      }

      query.andWhere("solicitacao.tipo_requisicao IN (:...allowedTypes)", {
        allowedTypes,
      });
    }

    if (access.restrictToSeparationStatus) {
      query.andWhere("solicitacao.status = :statusSeparacao", {
        statusSeparacao: StatusSolicitacaoBrinde.AGUARDANDO_SEPARACAO,
      });
    } else if ((filters as any).status) {
      query.andWhere("solicitacao.status = :status", { status: (filters as any).status });
    } else if (!access.isMasterAdmin && !access.canApproveTrade) {
      query.andWhere("solicitacao.status != :statusTroca", {
        statusTroca: StatusSolicitacaoBrinde.AGUARDANDO_TROCA,
      });
    } else if (!access.isMasterAdmin && Array.isArray(tradePermissions) && tradePermissions.length > 0) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where("solicitacao.status != :statusTroca", {
            statusTroca: StatusSolicitacaoBrinde.AGUARDANDO_TROCA,
          }).orWhere(
            "solicitacao.status = :statusTroca AND solicitacao.tipo_requisicao IN (:...tiposTroca)",
            {
              statusTroca: StatusSolicitacaoBrinde.AGUARDANDO_TROCA,
              tiposTroca: tradePermissions,
            }
          );
        })
      );
    } else if (!access.isMasterAdmin && !possuiPermissaoGlobalTroca) {
      query.andWhere("solicitacao.status != :statusTroca", {
        statusTroca: StatusSolicitacaoBrinde.AGUARDANDO_TROCA,
      });
    }

    if (filters.gerente) {
      query.andWhere("solicitacao.gerente = :gerente", { gerente: filters.gerente });
    }

    if (filters.setor) {
      query.andWhere("solicitacao.setor = :setor", { setor: filters.setor });
    }

    if (filters.tipo_requisicao) {
      query.andWhere("solicitacao.tipo_requisicao = :tipoRequisicao", {
        tipoRequisicao: filters.tipo_requisicao,
      });
    }

    if (filters.matricula !== undefined) {
      query.andWhere("solicitacao.matricula = :matricula", { matricula: filters.matricula });
    }

    if (filters.rfid !== undefined) {
      query.andWhere("solicitacao.rfid = :rfid", { rfid: filters.rfid });
    }

    if (filters.codbarras !== undefined) {
      query.andWhere("solicitacao.codbarras = :codbarras", { codbarras: filters.codbarras });
    }

    if (filters.data_inicial && filters.data_final) {
      query.andWhere("solicitacao.created_at BETWEEN :dataInicial AND :dataFinal", {
        dataInicial: filters.data_inicial,
        dataFinal: filters.data_final,
      });
    } else if (filters.data_inicial) {
      query.andWhere("solicitacao.created_at >= :dataInicial", {
        dataInicial: filters.data_inicial,
      });
    } else if (filters.data_final) {
      query.andWhere("solicitacao.created_at <= :dataFinal", {
        dataFinal: filters.data_final,
      });
    }

    const results = await query
      .orderBy("solicitacao.created_at", "DESC")
      .take(take)
      .skip(skip)
      .getMany();

    const hasMore = results.length > pageSize;
    const data = hasMore ? results.slice(0, pageSize) : results;

    return {
      status: 200,
      body: { data, page, pageSize, hasMore },
    };
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    console.log(error);

    throw new CustomError("Erro ao listar solicitacoes", 500);
  }
};

export const listarSolicitacoesSeparacao = async (
  userMatricula: number,
  permissoes: TipoRequisicao[],
  filters: ListSolicitacaoSeparacaoQuery
): Promise<ServiceResult<SolicitacaoSeparacaoResponse>> => {
  if (permissoes.length === 0) {
    throw new CustomError("Usuário sem permissão para separação de solicitações", 403);
  }

  if (filters.tipo_requisicao && !permissoes.includes(filters.tipo_requisicao as TipoRequisicao)) {
    throw new CustomError("Filtro de tipo_requisicao fora das permissões do usuário", 403);
  }

  const tiposPermitidos = filters.tipo_requisicao
    ? [filters.tipo_requisicao as TipoRequisicao]
    : permissoes;

  const pageSize = 20;
  const page = filters.page ?? 1;
  const take = pageSize + 1;
  const skip = (page - 1) * pageSize;

  let query = repository
    .createQueryBuilder("solicitacao")
    .where("solicitacao.tipo_requisicao IN (:...tiposPermitidos)", { tiposPermitidos });
    
  if ((filters as any).status) {
    query = query.andWhere("solicitacao.status = :status", { status: (filters as any).status });
  }

  const entities = await query
    .orderBy("solicitacao.created_at", "DESC")
    .skip(skip)
    .take(take)
    .getMany();

  const hasMore = entities.length > pageSize;
  const data = (hasMore ? entities.slice(0, pageSize) : entities).map((item) => ({
    id: item.id,
    nome: item.nome,
    matricula: item.matricula,
    setor: item.setor,
    gerente: item.gerente,
    tipo_requisicao: item.tipo_requisicao,
    subgrupo_campanha: item.subgrupo_campanha ?? null,
    genero: item.genero ?? null,
    brinde_id: item.brinde_id ?? null,
    marca: item.marca ?? null,
    modelo: item.modelo ?? null,
    num_calce: item.num_calce,
    categoria_infantil: item.categoria_infantil,
    status: item.status,
    created_at: item.created_at,
    data_aprovado: item.data_aprovado ?? null,
  }));

  return {
    status: 200,
    body: { data, page, pageSize, hasMore },
  };
};

export const listarSolicitacoesTroca = async (
  userMatricula: number,
  filters: ListSolicitacaoSeparacaoQuery
): Promise<ServiceResult<SolicitacaoSeparacaoResponse>> => {
  const userAprovacao = await obterAprovadorTroca(userMatricula);
  const permissoes = userAprovacao.tipo_requisicao ?? null;

  if (
    filters.tipo_requisicao
    && Array.isArray(permissoes)
    && permissoes.length > 0
    && !permissoes.includes(filters.tipo_requisicao as TipoRequisicao)
  ) {
    throw new CustomError("Filtro de tipo_requisicao fora das permissões do usuário", 403);
  }

  const pageSize = 20;
  const page = filters.page ?? 1;
  const take = pageSize + 1;
  const skip = (page - 1) * pageSize;

  const query = repository
    .createQueryBuilder("solicitacao")
    .where("solicitacao.status = :status", {
      status: StatusSolicitacaoBrinde.AGUARDANDO_TROCA,
    });

  if (filters.tipo_requisicao) {
    query.andWhere("solicitacao.tipo_requisicao = :tipoRequisicao", {
      tipoRequisicao: filters.tipo_requisicao,
    });
  } else if (Array.isArray(permissoes) && permissoes.length > 0) {
    query.andWhere("solicitacao.tipo_requisicao IN (:...tiposPermitidos)", {
      tiposPermitidos: permissoes,
    });
  }

  const entities = await query
    .orderBy("solicitacao.created_at", "DESC")
    .skip(skip)
    .take(take)
    .getMany();

  const hasMore = entities.length > pageSize;
  const data = (hasMore ? entities.slice(0, pageSize) : entities).map((item) => ({
    id: item.id,
    nome: item.nome,
    matricula: item.matricula,
    setor: item.setor,
    gerente: item.gerente,
    tipo_requisicao: item.tipo_requisicao,
    subgrupo_campanha: item.subgrupo_campanha ?? null,
    genero: item.genero ?? null,
    brinde_id: item.brinde_id ?? null,
    marca: item.marca ?? null,
    modelo: item.modelo ?? null,
    num_calce: item.num_calce,
    categoria_infantil: item.categoria_infantil,
    status: item.status,
    created_at: item.created_at,
    data_aprovado: item.data_aprovado ?? null,
  }));

  return {
    status: 200,
    body: { data, page, pageSize, hasMore },
  };
};

export const obterSolicitacaoPorId = async (id: string): Promise<ServiceResult<SolicitacaoResponse>> => {
  try {
    const solicitacao = await carregarSolicitacaoDetalhe(id);
    return {
      body: { data: solicitacao },
      status: 200,
    };
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError(`Erro ao obter solicitação por id: ${id}`, 500);
  }
};

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

    const snapshot = await resolverSnapshotBrinde({
      manager: queryRunner.manager,
      context: {
        tipo_requisicao: solicitacao.tipo_requisicao,
        subgrupo_campanha: solicitacao.subgrupo_campanha ?? null,
        genero: solicitacao.genero ?? null,
        num_calce: solicitacao.num_calce,
        brinde_id: solicitacao.brinde_id ?? null,
        marca: solicitacao.marca ?? null,
        modelo: solicitacao.modelo ?? null,
      },
      inputBrindeId: input.brinde_id,
      inputMarca: input.marca,
      inputModelo: input.modelo,
    });

    const tipoDefineBrindeNaAprovacao = tiposComBrindeDefinidoNaAprovacao.includes(solicitacao.tipo_requisicao);
    const precisaBrindeFinalAgora =
      tipoDefineBrindeNaAprovacao
      || tiposComVoucherGeradoNaAprovacao.includes(solicitacao.tipo_requisicao);
    if (precisaBrindeFinalAgora && (!snapshot.marca || !snapshot.modelo)) {
      throw new CustomError("A solicitação precisa de marca e modelo definidos para aprovação", 400);
    }

    const statusAnterior = solicitacao.status;
    const updateDate = new Date();
    const brindeAnteriorId = solicitacao.brinde_id ?? null;

    solicitacao.brinde_id = snapshot.brinde_id;
    solicitacao.marca = snapshot.marca ?? undefined;
    solicitacao.modelo = snapshot.modelo ?? undefined;
    solicitacao.gerente_aprovacao = user_aprovador;
    if (input.bonificacao_user_liberacao !== undefined) {
      solicitacao.bonificacao_user_liberacao = input.bonificacao_user_liberacao;
    }
    solicitacao.updated_by = user_aprovador;
    solicitacao.data_aprovado = updateDate;
    solicitacao.updated_at = updateDate;

    if (tiposComVoucherGeradoNaAprovacao.includes(solicitacao.tipo_requisicao)) {
      solicitacao.status = StatusSolicitacaoBrinde.APROVADO;
      await queryRunner.manager.save(SolicitacaoBrinde, solicitacao);
      await criarVoucherParaSolicitacao(queryRunner.manager, solicitacao);
      await registrarHistorico(queryRunner.manager, {
        solicitacao,
        status_anterior: statusAnterior,
        status_novo: solicitacao.status,
        acao: AcaoSolicitacaoHistorico.APROVACAO,
        usuario_matricula: user_aprovador,
        marca_nova: solicitacao.marca ?? null,
        modelo_novo: solicitacao.modelo ?? null,
        metadata: {
          brinde_anterior_id: brindeAnteriorId,
          brinde_novo_id: solicitacao.brinde_id ?? null,
          bonificacao_user_liberacao: solicitacao.bonificacao_user_liberacao ?? null,
        },
      });
    } else {
      solicitacao.status = StatusSolicitacaoBrinde.AGUARDANDO_SEPARACAO;
      await queryRunner.manager.save(SolicitacaoBrinde, solicitacao);
      await registrarHistorico(queryRunner.manager, {
        solicitacao,
        status_anterior: statusAnterior,
        status_novo: solicitacao.status,
        acao: AcaoSolicitacaoHistorico.ENCAMINHADA_SEPARACAO,
        usuario_matricula: user_aprovador,
        marca_nova: solicitacao.marca ?? null,
        modelo_novo: solicitacao.modelo ?? null,
        metadata: {
          brinde_anterior_id: brindeAnteriorId,
          brinde_novo_id: solicitacao.brinde_id ?? null,
        },
      });
    }

    await queryRunner.commitTransaction();

    const solicitacaoAtualizada = await carregarSolicitacaoDetalhe(id);
    return { status: 200, body: { data: solicitacaoAtualizada } };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof CustomError) throw error;
    throw new CustomError("Erro ao aprovar solicitação", 500);
  } finally {
    await queryRunner.release();
  }
};

export const validarSeparacao = async (
  id: string,
  operadorMatricula: number,
  input: SepararSolicitacaoInput
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

    if (solicitacao.status !== StatusSolicitacaoBrinde.AGUARDANDO_SEPARACAO) {
      throw new CustomError("Solicitação não está aguardando separação", 400);
    }

    await verificarPermissaoSeparacao(operadorMatricula, solicitacao.tipo_requisicao);

    const marcaAnterior = solicitacao.marca ?? null;
    const modeloAnterior = solicitacao.modelo ?? null;
    const brindeAnteriorId = solicitacao.brinde_id ?? null;
    const snapshot = await resolverSnapshotBrinde({
      manager: queryRunner.manager,
      context: {
        tipo_requisicao: solicitacao.tipo_requisicao,
        subgrupo_campanha: solicitacao.subgrupo_campanha ?? null,
        genero: solicitacao.genero ?? null,
        num_calce: solicitacao.num_calce,
        brinde_id: solicitacao.brinde_id ?? null,
        marca: solicitacao.marca ?? null,
        modelo: solicitacao.modelo ?? null,
      },
      inputBrindeId: input.brinde_id,
      inputMarca: input.marca,
      inputModelo: input.modelo,
    });

    if (!snapshot.marca) {
      throw new CustomError("Separação exige marca final preenchida", 400);
    }

    solicitacao.brinde_id = snapshot.brinde_id;
    solicitacao.marca = snapshot.marca;
    solicitacao.modelo = snapshot.modelo ?? undefined;
    solicitacao.status = StatusSolicitacaoBrinde.APROVADO;
    solicitacao.updated_by = operadorMatricula;
    solicitacao.updated_at = new Date();

    await queryRunner.manager.save(SolicitacaoBrinde, solicitacao);
    await criarVoucherParaSolicitacao(queryRunner.manager, solicitacao);
    await registrarHistorico(queryRunner.manager, {
      solicitacao,
      status_anterior: StatusSolicitacaoBrinde.AGUARDANDO_SEPARACAO,
      status_novo: solicitacao.status,
      acao: AcaoSolicitacaoHistorico.SEPARACAO_CONFIRMADA,
      usuario_matricula: operadorMatricula,
      marca_anterior: marcaAnterior,
      modelo_anterior: modeloAnterior,
      marca_nova: solicitacao.marca ?? null,
      modelo_novo: solicitacao.modelo ?? null,
      metadata: {
        override_aplicado: Boolean(input.marca || input.modelo),
        brinde_anterior_id: brindeAnteriorId,
        brinde_novo_id: solicitacao.brinde_id ?? null,
      },
    });

    await queryRunner.commitTransaction();

    const solicitacaoAtualizada = await carregarSolicitacaoDetalhe(id);
    return { status: 200, body: { data: solicitacaoAtualizada } };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof CustomError) throw error;
    throw new CustomError("Erro ao validar separação", 500);
  } finally {
    await queryRunner.release();
  }
};

export const separarSolicitacoesLote = async (
  input: { ids: string[]; brinde_id?: number; marca?: string; modelo?: string; operadorMatricula?: number },
): Promise<ServiceResult<{ success: boolean; message: string; count: number }>> => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    let successCount = 0;
    // Opcionalmente: Receber usuario logado. Como a chamada atual não passa usuario de separação,
    // usamos fallback de admin (1) ou adaptamos se necessário
    const operadorMatricula = input.operadorMatricula ?? 1; 
    
    for (const id of input.ids) {
      const solicitacao = await queryRunner.manager.findOne(SolicitacaoBrinde, { where: { id } });
      if (!solicitacao || solicitacao.status !== StatusSolicitacaoBrinde.AGUARDANDO_SEPARACAO) {
        continue;
      }
      
      const marcaAnterior = solicitacao.marca ?? null;
      const modeloAnterior = solicitacao.modelo ?? null;
      const brindeAnteriorId = solicitacao.brinde_id ?? null;

      const snapshot = await resolverSnapshotBrinde({
        manager: queryRunner.manager,
        context: {
          tipo_requisicao: solicitacao.tipo_requisicao,
          subgrupo_campanha: solicitacao.subgrupo_campanha ?? null,
          genero: solicitacao.genero ?? null,
          num_calce: solicitacao.num_calce,
          brinde_id: solicitacao.brinde_id ?? null,
          marca: solicitacao.marca ?? null,
          modelo: solicitacao.modelo ?? null,
        },
        inputBrindeId: input.brinde_id?.toString(),
        inputMarca: input.marca,
        inputModelo: input.modelo,
      });

      if (!snapshot.marca) {
        throw new CustomError(`Separação do item ${solicitacao.matricula} exige marca preenchida`, 400);
      }

      solicitacao.brinde_id = snapshot.brinde_id;
      solicitacao.marca = snapshot.marca;
      solicitacao.modelo = snapshot.modelo ?? undefined;
      solicitacao.status = StatusSolicitacaoBrinde.APROVADO;
      solicitacao.updated_by = operadorMatricula;
      solicitacao.updated_at = new Date();

      await queryRunner.manager.save(SolicitacaoBrinde, solicitacao);
      await criarVoucherParaSolicitacao(queryRunner.manager, solicitacao);
      await registrarHistorico(queryRunner.manager, {
        solicitacao,
        status_anterior: StatusSolicitacaoBrinde.AGUARDANDO_SEPARACAO,
        status_novo: solicitacao.status,
        acao: AcaoSolicitacaoHistorico.SEPARACAO_CONFIRMADA,
        usuario_matricula: operadorMatricula,
        marca_anterior: marcaAnterior,
        modelo_anterior: modeloAnterior,
        marca_nova: solicitacao.marca ?? null,
        modelo_novo: solicitacao.modelo ?? null,
        metadata: {
          override_aplicado: Boolean(input.marca || input.modelo),
          brinde_anterior_id: brindeAnteriorId,
          brinde_novo_id: solicitacao.brinde_id ?? null,
        },
      });

      successCount++;
    }

    await queryRunner.commitTransaction();
    return { status: 200, body: { success: true, message: "Lote separado com sucesso", count: successCount } };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof CustomError) throw error;
    throw new CustomError("Erro ao validar separação em lote", 500);
  } finally {
    await queryRunner.release();
  }
};

export const aprovarTrocaSolicitacao = async (
  id: string,
  user_aprovador: number
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

    if (solicitacao.status !== StatusSolicitacaoBrinde.AGUARDANDO_TROCA) {
      throw new CustomError("Solicitação não está aguardando troca", 400);
    }

    await verificarPermissaoAprovacaoTroca(user_aprovador, solicitacao.tipo_requisicao);

    if (!solicitacao.voucher) {
      throw new CustomError("Solicitação sem voucher vinculado", 409);
    }

    if (solicitacao.voucher.status !== StatusSVouncher.RESGATADO || solicitacao.voucher.ativo) {
      throw new CustomError("Voucher vinculado não está elegível para reativação de troca", 409);
    }

    const statusAnterior = solicitacao.status;
    const statusNovo = tiposComVoucherGeradoNaAprovacao.includes(solicitacao.tipo_requisicao)
      ? StatusSolicitacaoBrinde.APROVADO
      : StatusSolicitacaoBrinde.AGUARDANDO_SEPARACAO;
    const now = new Date();

    solicitacao.voucher.status = StatusSVouncher.PENDENTE;
    solicitacao.voucher.ativo = true;
    solicitacao.voucher.data_resgate = undefined;
    solicitacao.voucher.updated_at = now;

    await queryRunner.manager.save(VoucherSolicitacao, solicitacao.voucher);

    solicitacao.status = statusNovo;
    solicitacao.updated_by = user_aprovador;
    solicitacao.updated_at = now;
    solicitacao.data_aprovado = now;
    solicitacao.gerente_aprovacao = user_aprovador;

    await queryRunner.manager.save(SolicitacaoBrinde, solicitacao);

    await registrarHistorico(queryRunner.manager, {
      solicitacao,
      status_anterior: statusAnterior,
      status_novo: statusNovo,
      acao: AcaoSolicitacaoHistorico.APROVACAO_TROCA,
      usuario_matricula: user_aprovador,
      marca_nova: solicitacao.marca ?? null,
      modelo_novo: solicitacao.modelo ?? null,
      metadata: {
        voucher_id: solicitacao.voucher.id,
        codigo_voucher: solicitacao.voucher.codigo_voucher,
        retorno_para: statusNovo,
        brinde_id: solicitacao.brinde_id ?? null,
        genero: solicitacao.genero ?? null,
        categoria_infantil: solicitacao.categoria_infantil,
        subgrupo_campanha: solicitacao.subgrupo_campanha ?? null,
      },
    });

    await queryRunner.commitTransaction();

    const solicitacaoAtualizada = await carregarSolicitacaoDetalhe(id);
    return { status: 200, body: { data: solicitacaoAtualizada } };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof CustomError) throw error;
    throw new CustomError("Erro ao aprovar troca de solicitação", 500);
  } finally {
    await queryRunner.release();
  }
};

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

    const statusAnterior = solicitacao.status;
    solicitacao.status = StatusSolicitacaoBrinde.REJEITADO;
    solicitacao.updated_by = usuario_id;
    solicitacao.updated_at = new Date();
    await queryRunner.manager.save(SolicitacaoBrinde, solicitacao);
    await registrarHistorico(queryRunner.manager, {
      solicitacao,
      status_anterior: statusAnterior,
      status_novo: solicitacao.status,
      acao: AcaoSolicitacaoHistorico.REJEICAO,
      usuario_matricula: usuario_id,
      marca_nova: solicitacao.marca ?? null,
      modelo_novo: solicitacao.modelo ?? null,
      metadata: {
        brinde_id: solicitacao.brinde_id ?? null,
      },
    });

    await queryRunner.commitTransaction();
    return { status: 200, body: { data: solicitacao } };
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
  motivo: string,
  usuarioCancelamento?: number
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
      StatusSolicitacaoBrinde.AGUARDANDO_SEPARACAO,
      StatusSolicitacaoBrinde.APROVADO,
    ];

    if (!statusPermitidos.includes(solicitacao.status)) {
      throw new CustomError("Solicitação não pode ser cancelada no status atual", 400);
    }

    const statusAnterior = solicitacao.status;
    const updatedBy = usuarioCancelamento ?? solicitacao.updated_by ?? solicitacao.usuario_criador;
    solicitacao.status = StatusSolicitacaoBrinde.CANCELADO;
    solicitacao.updated_by = updatedBy;
    solicitacao.updated_at = new Date();
    await queryRunner.manager.save(SolicitacaoBrinde, solicitacao);

    if (solicitacao.voucher) {
      solicitacao.voucher.ativo = false;
      solicitacao.voucher.status = StatusSVouncher.CANCELADO;
      await queryRunner.manager.save(VoucherSolicitacao, solicitacao.voucher);
    }

    await registrarHistorico(queryRunner.manager, {
      solicitacao,
      status_anterior: statusAnterior,
      status_novo: solicitacao.status,
      acao: AcaoSolicitacaoHistorico.CANCELAMENTO,
      usuario_matricula: updatedBy,
      marca_nova: solicitacao.marca ?? null,
      modelo_novo: solicitacao.modelo ?? null,
      metadata: {
        motivo,
        brinde_id: solicitacao.brinde_id ?? null,
      },
    });

    await queryRunner.commitTransaction();
    return { status: 200, body: { data: solicitacao } };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof CustomError) throw error;
    throw new CustomError("Erro ao cancelar solicitação", 500);
  } finally {
    await queryRunner.release();
  }
};

export const invalidarVoucherSolicitacao = async (
  id: string,
  motivo: string,
  usuarioInvalidacao: number,
  access: InvalidarVoucherAccess
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

    verificarPermissaoInvalidacaoVoucher(access, solicitacao.tipo_requisicao);

    if (solicitacao.status !== StatusSolicitacaoBrinde.APROVADO) {
      throw new CustomError("Voucher só pode ser invalidado para solicitação aprovada", 400);
    }

    if (!solicitacao.voucher) {
      throw new CustomError("Solicitação sem voucher vinculado", 409);
    }

    if (!solicitacao.voucher.ativo || solicitacao.voucher.status !== StatusSVouncher.PENDENTE) {
      throw new CustomError("Voucher não está pendente e ativo para invalidação", 409);
    }

    const statusAnterior = solicitacao.status;
    const now = new Date();

    solicitacao.status = StatusSolicitacaoBrinde.INVALIDADO;
    solicitacao.updated_by = usuarioInvalidacao;
    solicitacao.updated_at = now;

    solicitacao.voucher.status = StatusSVouncher.INVALIDADO;
    solicitacao.voucher.ativo = false;
    solicitacao.voucher.updated_at = now;

    await queryRunner.manager.save(VoucherSolicitacao, solicitacao.voucher);
    await queryRunner.manager.save(SolicitacaoBrinde, solicitacao);

    await registrarHistorico(queryRunner.manager, {
      solicitacao,
      status_anterior: statusAnterior,
      status_novo: solicitacao.status,
      acao: AcaoSolicitacaoHistorico.INVALIDACAO_VOUCHER,
      usuario_matricula: usuarioInvalidacao,
      marca_nova: solicitacao.marca ?? null,
      modelo_novo: solicitacao.modelo ?? null,
      metadata: {
        motivo,
        voucher_id: solicitacao.voucher.id,
        codigo_voucher: solicitacao.voucher.codigo_voucher,
        brinde_id: solicitacao.brinde_id ?? null,
      },
    });

    await queryRunner.commitTransaction();

    const solicitacaoAtualizada = await carregarSolicitacaoDetalhe(id);
    return { status: 200, body: { data: solicitacaoAtualizada } };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof CustomError) throw error;
    throw new CustomError("Erro ao invalidar voucher", 500);
  } finally {
    await queryRunner.release();
  }
};

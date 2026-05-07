import { AppDataSource } from "../config/db";
import {
  GeneroSolicitacao,
  SolicitacaoBrinde,
  StatusSolicitacaoBrinde,
  SubgrupoCampanha,
  TipoRequisicao,
} from "../models/Solicitacao";
import { User } from "../models/User";
import { StatusSVouncher, VoucherSolicitacao } from "../models/VoucherSolicitacao";
import {
  DashboardExportQueryInput,
  DashboardRecentActivityQueryInput,
} from "../schemas/dashboard.schema";
import { ServiceResult } from "../types/service";
import {
  DashboardAnalyticsDTO,
  DashboardDailyEvolutionDTO,
  DashboardExportSolicitacoesDTO,
  DashboardRecentActivityDTO,
  DashboardSummaryDTO,
} from "../types/dashboard";

const solicitacaoRepository = AppDataSource.getRepository(SolicitacaoBrinde);
const voucherRepository = AppDataSource.getRepository(VoucherSolicitacao);

const toUtcMonthStart = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0));

const toUtcNextMonthStart = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1, 0, 0, 0, 0));

const toUtcDayStart = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));

const addUtcDays = (date: Date, days: number): Date =>
  new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

const toCount = (value: string | number): number => Number(value);
const toDateOnlyUtc = (date: string): Date => new Date(`${date}T00:00:00.000Z`);

const buildDailySeries = (
  rows: Array<{ date: string; count: string | number }>,
  days: number
): DashboardDailyEvolutionDTO[] => {
  const todayUtc = toUtcDayStart(new Date());
  const startUtc = addUtcDays(todayUtc, -(days - 1));

  const map = new Map<string, number>();
  rows.forEach((row) => map.set(row.date, toCount(row.count)));

  const output: DashboardDailyEvolutionDTO[] = [];
  for (let i = 0; i < days; i++) {
    const date = addUtcDays(startUtc, i);
    const key = date.toISOString().slice(0, 10);
    output.push({
      date: key,
      count: map.get(key) ?? 0,
    });
  }

  return output;
};

export const getDashboardSummary = async (): Promise<ServiceResult<DashboardSummaryDTO>> => {
  const now = new Date();
  const monthStartUtc = toUtcMonthStart(now);
  const nextMonthStartUtc = toUtcNextMonthStart(now);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [pendingApprovals, activeVouchers, totalDeliveredMonth, totalLast30, rejectedLast30] =
    await Promise.all([
      solicitacaoRepository.count({
        where: { status: StatusSolicitacaoBrinde.PENDENTE_APROVACAO },
      }),
      voucherRepository.count({
        where: {
          status: StatusSVouncher.PENDENTE,
          ativo: true,
        },
      }),
      solicitacaoRepository
        .createQueryBuilder("s")
        .where("s.entregue = :entregue", { entregue: true })
        .andWhere("s.data_entregue >= :monthStart", { monthStart: monthStartUtc })
        .andWhere("s.data_entregue < :nextMonthStart", { nextMonthStart: nextMonthStartUtc })
        .getCount(),
      solicitacaoRepository
        .createQueryBuilder("s")
        .where("s.created_at >= :thirtyDaysAgo", { thirtyDaysAgo })
        .getCount(),
      solicitacaoRepository
        .createQueryBuilder("s")
        .where("s.created_at >= :thirtyDaysAgo", { thirtyDaysAgo })
        .andWhere("s.status = :status", { status: StatusSolicitacaoBrinde.REJEITADO })
        .getCount(),
    ]);

  const rejectedRatio =
    totalLast30 > 0 ? Number(((rejectedLast30 / totalLast30) * 100).toFixed(2)) : 0;

  return {
    status: 200,
    body: {
      pending_approvals: pendingApprovals,
      active_vouchers: activeVouchers,
      total_delivered_month: totalDeliveredMonth,
      rejected_ratio: rejectedRatio,
    },
  };
};

export const getDashboardAnalytics = async (): Promise<ServiceResult<DashboardAnalyticsDTO>> => {
  const endUtcExclusive = addUtcDays(toUtcDayStart(new Date()), 1);
  const startUtc14Days = addUtcDays(endUtcExclusive, -14);

  const [statusRows, typeRows, sectorRows, dailyRows] = await Promise.all([
    solicitacaoRepository
      .createQueryBuilder("s")
      .select("s.status", "status")
      .addSelect("COUNT(*)", "count")
      .groupBy("s.status")
      .orderBy("count", "DESC")
      .getRawMany<{ status: StatusSolicitacaoBrinde; count: string }>(),
    solicitacaoRepository
      .createQueryBuilder("s")
      .select("s.tipo_requisicao", "tipo_requisicao")
      .addSelect("COUNT(*)", "count")
      .groupBy("s.tipo_requisicao")
      .orderBy("count", "DESC")
      .getRawMany<{ tipo_requisicao: string; count: string }>(),
    solicitacaoRepository
      .createQueryBuilder("s")
      .select("s.setor", "setor")
      .addSelect("COUNT(*)", "count")
      .where("s.setor IS NOT NULL")
      .andWhere("TRIM(s.setor) <> ''")
      .groupBy("s.setor")
      .orderBy("count", "DESC")
      .limit(5)
      .getRawMany<{ setor: string; count: string }>(),
    solicitacaoRepository
      .createQueryBuilder("s")
      .select("TO_CHAR(DATE_TRUNC('day', s.created_at), 'YYYY-MM-DD')", "date")
      .addSelect("COUNT(*)", "count")
      .where("s.created_at >= :startDate", { startDate: startUtc14Days })
      .andWhere("s.created_at < :endDate", { endDate: endUtcExclusive })
      .groupBy("DATE_TRUNC('day', s.created_at)")
      .orderBy("DATE_TRUNC('day', s.created_at)", "ASC")
      .getRawMany<{ date: string; count: string }>(),
  ]);

  return {
    status: 200,
    body: {
      requests_by_status: statusRows.map((row) => ({
        status: row.status,
        count: toCount(row.count),
      })),
      requests_by_type: typeRows.map((row) => ({
        tipo_requisicao: row.tipo_requisicao as TipoRequisicao,
        count: toCount(row.count),
      })),
      top_sectors_demand: sectorRows.map((row) => ({
        setor: row.setor,
        count: toCount(row.count),
      })),
      daily_evolution: buildDailySeries(dailyRows, 14),
    },
  };
};

export const getDashboardRecentActivity = async (
  query: DashboardRecentActivityQueryInput
): Promise<ServiceResult<DashboardRecentActivityDTO>> => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const skip = (page - 1) * limit;

  const queryBuilder = solicitacaoRepository
    .createQueryBuilder("s")
    .leftJoinAndSelect("s.voucher", "v")
    .leftJoin(User, "u", "u.matricula = s.matricula")
    .addSelect("u.nome", "user_nome")
    .orderBy("s.created_at", "DESC");

  const total = await queryBuilder.clone().getCount();
  const { entities, raw } = await queryBuilder.skip(skip).take(limit).getRawAndEntities();

  const data = entities.map((solicitacao, index) => {
    const rawRow = raw[index] as { user_nome?: string | null };
    const nomeSolicitacao = solicitacao.nome?.trim();
    const nomeUsuario = rawRow?.user_nome?.trim();

    return {
      id: solicitacao.id,
      solicitante_nome: nomeSolicitacao || nomeUsuario || null,
      matricula: solicitacao.matricula,
      setor: solicitacao.setor,
      gerente: solicitacao.gerente,
      tipo_requisicao: solicitacao.tipo_requisicao,
      subgrupo_campanha: solicitacao.subgrupo_campanha ?? null,
      genero: solicitacao.genero ?? null,
      categoria_infantil: solicitacao.categoria_infantil,
      marca: solicitacao.marca ?? null,
      modelo: solicitacao.modelo ?? null,
      status: solicitacao.status,
      entregue: solicitacao.entregue ?? null,
      created_at: solicitacao.created_at,
      voucher: solicitacao.voucher
        ? {
            id: solicitacao.voucher.id,
            codigo_voucher: solicitacao.voucher.codigo_voucher,
            status: solicitacao.voucher.status,
            ativo: solicitacao.voucher.ativo,
            data_resgate: solicitacao.voucher.data_resgate ?? null,
          }
        : null,
    };
  });

  return {
    status: 200,
    body: {
      data,
      total,
      page,
      limit,
      last_page: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

export const getDashboardExportSolicitacoes = async (
  query: DashboardExportQueryInput
): Promise<ServiceResult<DashboardExportSolicitacoesDTO>> => {
  const startUtc = toDateOnlyUtc(query.data_inicial);
  const endUtcExclusive = addUtcDays(toDateOnlyUtc(query.data_final), 1);

  const rows = await solicitacaoRepository
    .createQueryBuilder("s")
    .leftJoin("s.voucher", "v")
    .leftJoin(User, "u_colaborador", "u_colaborador.matricula = s.matricula")
    .leftJoin(User, "u_criador", "u_criador.matricula = s.usuario_criador")
    .leftJoin(User, "u_aprovador", "u_aprovador.matricula = s.gerente_aprovacao")
    .select("s.id", "id")
    .addSelect("NULLIF(TRIM(u_criador.nome), '')", "solicitante_nome")
    .addSelect("s.usuario_criador", "usuario_criador_matricula")
    .addSelect("NULLIF(TRIM(u_criador.nome), '')", "usuario_criador_nome")
    .addSelect("COALESCE(NULLIF(TRIM(s.nome), ''), NULLIF(TRIM(u_colaborador.nome), ''))", "colaborador_nome")
    .addSelect("s.matricula", "colaborador_matricula")
    .addSelect("s.gerente_aprovacao", "gerente_aprovacao_matricula")
    .addSelect("NULLIF(TRIM(u_aprovador.nome), '')", "gerente_aprovacao_nome")
    .addSelect("s.data_aprovado", "data_aprovado")
    .addSelect("s.setor", "setor")
    .addSelect("s.gerente", "gerente")
    .addSelect("s.tipo_requisicao", "tipo_requisicao")
    .addSelect("s.subgrupo_campanha", "subgrupo_campanha")
    .addSelect("s.genero", "genero")
    .addSelect("s.categoria_infantil", "categoria_infantil")
    .addSelect("s.marca", "marca")
    .addSelect("s.modelo", "modelo")
    .addSelect("s.num_calce", "num_calce")
    .addSelect("s.status", "status")
    .addSelect("s.entregue", "entregue")
    .addSelect("s.created_at", "created_at")
    .addSelect("s.data_entregue", "data_entregue")
    .addSelect("v.status", "voucher_status")
    .addSelect("v.ativo", "voucher_ativo")
    .where("s.created_at >= :startUtc", { startUtc })
    .andWhere("s.created_at < :endUtcExclusive", { endUtcExclusive })
    .orderBy("s.created_at", "DESC")
    .getRawMany<{
      id: string;
      solicitante_nome: string | null;
      usuario_criador_matricula: string | number | null;
      usuario_criador_nome: string | null;
      colaborador_nome: string | null;
      colaborador_matricula: string | number;
      gerente_aprovacao_matricula: string | number | null;
      gerente_aprovacao_nome: string | null;
      data_aprovado: Date | null;
      setor: string;
      gerente: string;
      tipo_requisicao: TipoRequisicao;
      subgrupo_campanha: SubgrupoCampanha | null;
      genero: GeneroSolicitacao | null;
      categoria_infantil: boolean;
      marca: string | null;
      modelo: string | null;
      num_calce: string | number;
      status: StatusSolicitacaoBrinde;
      entregue: boolean | null;
      created_at: Date;
      data_entregue: Date | null;
      voucher_status: StatusSVouncher | null;
      voucher_ativo: boolean | null;
    }>();

  return {
    status: 200,
    body: {
      data: rows.map((row) => ({
        id: row.id,
        solicitante_nome: row.solicitante_nome || null,
        usuario_criador_matricula: row.usuario_criador_matricula
          ? Number(row.usuario_criador_matricula)
          : null,
        usuario_criador_nome: row.usuario_criador_nome || null,
        colaborador_nome: row.colaborador_nome || null,
        colaborador_matricula: Number(row.colaborador_matricula),
        gerente_aprovacao_matricula: row.gerente_aprovacao_matricula
          ? Number(row.gerente_aprovacao_matricula)
          : null,
        gerente_aprovacao_nome: row.gerente_aprovacao_nome || null,
        data_aprovado: row.data_aprovado ?? null,
        setor: row.setor,
        gerente: row.gerente,
        tipo_requisicao: row.tipo_requisicao,
        subgrupo_campanha: row.subgrupo_campanha,
        genero: row.genero,
        categoria_infantil: row.categoria_infantil,
        marca: row.marca,
        modelo: row.modelo,
        num_calce: Number(row.num_calce),
        status: row.status,
        entregue: row.entregue,
        created_at: row.created_at,
        data_entregue: row.data_entregue,
        voucher_status: row.voucher_status,
        voucher_ativo: row.voucher_ativo,
      })),
      total: rows.length,
      period: {
        data_inicial: query.data_inicial,
        data_final: query.data_final,
      },
    },
  };
};

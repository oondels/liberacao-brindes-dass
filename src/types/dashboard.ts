import { GeneroSolicitacao, StatusSolicitacaoBrinde, SubgrupoCampanha, TipoRequisicao } from "../models/Solicitacao";
import { StatusSVouncher } from "../models/VoucherSolicitacao";

export interface DashboardSummaryDTO {
  pending_approvals: number;
  active_vouchers: number;
  total_delivered_month: number;
  rejected_ratio: number;
}

export interface DashboardCountByStatusDTO {
  status: StatusSolicitacaoBrinde;
  count: number;
}

export interface DashboardCountByTypeDTO {
  tipo_requisicao: TipoRequisicao;
  count: number;
}

export interface DashboardTopSectorDTO {
  setor: string;
  count: number;
}

export interface DashboardDailyEvolutionDTO {
  date: string;
  count: number;
}

export interface DashboardAnalyticsDTO {
  requests_by_status: DashboardCountByStatusDTO[];
  requests_by_type: DashboardCountByTypeDTO[];
  top_sectors_demand: DashboardTopSectorDTO[];
  daily_evolution: DashboardDailyEvolutionDTO[];
}

export interface DashboardRecentActivityItemDTO {
  id: string;
  solicitante_nome: string | null;
  matricula: number;
  setor: string;
  gerente: string;
  tipo_requisicao: TipoRequisicao;
  subgrupo_campanha: SubgrupoCampanha | null;
  genero: GeneroSolicitacao | null;
  marca: string | null;
  modelo: string | null;
  status: StatusSolicitacaoBrinde;
  entregue: boolean | null;
  created_at: Date;
  voucher: {
    id: string;
    codigo_voucher: string;
    status: StatusSVouncher;
    ativo: boolean;
    data_resgate: Date | null;
  } | null;
}

export interface DashboardRecentActivityDTO {
  data: DashboardRecentActivityItemDTO[];
  total: number;
  page: number;
  limit: number;
  last_page: number;
}

export interface DashboardExportSolicitacaoItemDTO {
  id: string;
  solicitante_nome: string | null;
  usuario_criador_matricula: number | null;
  usuario_criador_nome: string | null;
  colaborador_nome: string | null;
  colaborador_matricula: number;
  gerente_aprovacao_matricula: number | null;
  gerente_aprovacao_nome: string | null;
  data_aprovado: Date | null;
  setor: string;
  gerente: string;
  tipo_requisicao: TipoRequisicao;
  subgrupo_campanha: SubgrupoCampanha | null;
  genero: GeneroSolicitacao | null;
  marca: string | null;
  modelo: string | null;
  num_calce: number;
  status: StatusSolicitacaoBrinde;
  entregue: boolean | null;
  created_at: Date;
  data_entregue: Date | null;
  voucher_status: StatusSVouncher | null;
  voucher_ativo: boolean | null;
}

export interface DashboardExportSolicitacoesDTO {
  data: DashboardExportSolicitacaoItemDTO[];
  total: number;
  period: {
    data_inicial: string;
    data_final: string;
  };
}

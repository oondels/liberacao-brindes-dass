import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { SolicitacaoBrinde, StatusSolicitacaoBrinde } from "./Solicitacao";

export enum AcaoSolicitacaoHistorico {
  CRIACAO = "criacao",
  APROVACAO = "aprovacao",
  SOLICITACAO_TROCA = "solicitacao_troca",
  APROVACAO_TROCA = "aprovacao_troca",
  REJEICAO = "rejeicao",
  ENCAMINHADA_SEPARACAO = "encaminhada_separacao",
  SEPARACAO_CONFIRMADA = "separacao_confirmada",
  CANCELAMENTO = "cancelamento",
  RETIRADA = "retirada",
}

@Entity({ name: "solicitacao_historico", schema: "liberacao_brinde" })
@Index("IDX_solicitacao_historico_solicitacao_id", ["solicitacao_id"])
@Index("IDX_solicitacao_historico_created_at", ["created_at"])
export class SolicitacaoHistorico {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  solicitacao_id!: string;

  @ManyToOne(() => SolicitacaoBrinde, (solicitacao) => solicitacao.historico, { nullable: false })
  @JoinColumn({ name: "solicitacao_id" })
  solicitacao!: SolicitacaoBrinde;

  @Column({
    type: "enum",
    enum: StatusSolicitacaoBrinde,
    enumName: "status_solicitacao_brinde_enum",
    nullable: true,
  })
  status_anterior?: StatusSolicitacaoBrinde | null;

  @Column({
    type: "enum",
    enum: StatusSolicitacaoBrinde,
    enumName: "status_solicitacao_brinde_enum",
  })
  status_novo!: StatusSolicitacaoBrinde;

  @Column({ type: "varchar", length: 50 })
  acao!: AcaoSolicitacaoHistorico;

  @Column({ type: "int8" })
  usuario_matricula!: number;

  @Column({ type: "varchar", length: 40, nullable: true })
  marca_anterior?: string | null;

  @Column({ type: "varchar", length: 60, nullable: true })
  modelo_anterior?: string | null;

  @Column({ type: "varchar", length: 40, nullable: true })
  marca_nova?: string | null;

  @Column({ type: "varchar", length: 60, nullable: true })
  modelo_novo?: string | null;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, unknown> | null;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;
}

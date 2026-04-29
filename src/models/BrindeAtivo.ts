import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { GeneroSolicitacao, SolicitacaoBrinde, SubgrupoCampanha, TipoRequisicao } from "./Solicitacao";

@Entity({ name: "brindes_ativos", schema: "liberacao_brinde" })
@Index("IDX_brindes_ativos_ativo", ["ativo"])
@Index("IDX_brindes_ativos_tipo_requisicao", ["tipo_requisicao"])
export class BrindeAtivo {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  nome!: string;

  @Column({
    type: "enum",
    enum: TipoRequisicao,
    enumName: "tipo_requisicao_enum",
  })
  tipo_requisicao!: TipoRequisicao;

  @Column({
    type: "enum",
    enum: SubgrupoCampanha,
    enumName: "campanha_subgrupo_enum",
    nullable: true,
  })
  subgrupo_campanha?: SubgrupoCampanha | null;

  @Column({ type: "varchar", length: 40, nullable: true })
  marca?: string | null;

  @Column({ type: "varchar", length: 60, nullable: true })
  modelo?: string | null;

  @Column({
    type: "enum",
    enum: GeneroSolicitacao,
    enumName: "genero_solicitacao_enum",
    nullable: true,
  })
  genero?: GeneroSolicitacao | null;

  @Column({ type: "int2", nullable: true })
  num_calce?: number | null;

  @Column({ type: "bool", default: true })
  ativo!: boolean;

  @Column({ type: "int8", nullable: true })
  created_by?: number | null;

  @Column({ type: "int8", nullable: true })
  updated_by?: number | null;

  @OneToMany(() => SolicitacaoBrinde, (solicitacao) => solicitacao.brinde)
  solicitacoes?: SolicitacaoBrinde[];

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;
}

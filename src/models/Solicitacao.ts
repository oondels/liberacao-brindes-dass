import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Check,
  Index,
  OneToOne
} from 'typeorm';
import { VoucherSolicitacao } from './VoucherSolicitacao';

export enum TipoRequisicao {
  TESTE_CALCE = 'teste_calce',
  BRINDE_INTERNO = 'brinde_interno',
  PENS_EAJA = 'pense_aja',
  CAMPANHA = 'campanha',
  FALTA_ZERO = 'falta_zero'
}

export enum SubgrupoCampanha {
  BRIGADA_INCENDIO = 'brigada_incendio',
  EFICIENCIA = 'eficiencia',
  HORA_EXTRA = 'hora_extra'
}

export enum StatusSolicitacaoBrinde {
  PENDENTE_APROVACAO = 'pendente_aprovacao',
  APROVADO = 'aprovado',
  REJEITADO = 'rejeitado',
  RETIRADO= 'retirado',
  CANCELADO= 'cancelado'
}
@Entity({ name: 'solicitacoes', schema: 'liberacao_brinde' })
@Check(`"num_calce" >= 10 AND "num_calce" <= 60`)
export class SolicitacaoBrinde {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  nome!: string;

  @Column({ type: 'int8' })
  matricula!: number;

  @Column({ type: 'int8', nullable: true })
  rfid?: number;

  @Column({ type: 'int8', nullable: true })
  codbarras?: number;

  @Column({ type: 'varchar', length: 255 })
  setor!: string;

  @Column({ type: 'varchar', length: 255 })
  gerente!: string;

  @Column({
    type: 'enum',
    enum: TipoRequisicao,
    enumName: 'tipo_requisicao_enum',
    default: TipoRequisicao.BRINDE_INTERNO
  })
  tipo_requisicao!: TipoRequisicao;

  @Column({
    type: 'enum',
    enum: SubgrupoCampanha,
    enumName: 'campanha_subgrupo_enum',
    nullable: true
  })
  subgrupo_campanha?: SubgrupoCampanha;

  @OneToOne(() => VoucherSolicitacao, (voucher) => voucher.solicitacao)
  voucher?: VoucherSolicitacao;

  @Column({ type: 'int8' })
  usuario_criador!: number;

  @Column({ type: 'varchar', length: 40, nullable: true })
  marca?: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  modelo?: string;

  @Column({ type: 'int2' })
  num_calce!: number;

  @Column({ type: 'bool', default: false, nullable: true })
  entregue?: boolean;

  @Column({ type: 'int8', nullable: true })
  entregue_por?: number;

  @Column({ type: 'timestamp', nullable: true })
  data_entregue?: Date;

  @Column({ type: 'int8', nullable: true })
  gerente_aprovacao?: number;

  @Column({ type: 'timestamp', nullable: true })
  data_aprovado?: Date;

  @Column({
    type: 'enum',
    enum: StatusSolicitacaoBrinde,
    enumName: 'status_solicitacao_brinde_enum',
    default: StatusSolicitacaoBrinde.PENDENTE_APROVACAO,
  })
  status!: StatusSolicitacaoBrinde;

  @Column({ type: 'int8', nullable: true })
  updated_by?: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;
}

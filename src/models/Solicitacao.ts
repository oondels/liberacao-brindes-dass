import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Check,
  Index,
} from 'typeorm';

export enum TipoRequisicao {
  TESTE_CALCE = 'teste_calce',
  PRODUCAO = 'producao',
  SOBRA= 'sobra'
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
    default: TipoRequisicao.PRODUCAO
  })
  tipo_requisicao!: TipoRequisicao;

  @Index({ unique: true })
  @Column({ type: 'uuid', nullable: true })
  codigo_unico?: string;

  @Column({ type: 'timestamp', nullable: true })
  data_codigo_usado?: Date;

  @Column({ type: 'int8' })
  usuario_criador!: number;

  @Column({ type: 'varchar', length: 40 })
  marca!: string;

  @Column({ type: 'varchar', length: 60 })
  modelo!: string;

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
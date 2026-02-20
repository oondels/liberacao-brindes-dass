import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Check,
} from 'typeorm';

export enum TipoRequisicao {
  TESTE_CALCE = 'teste_calce',
  PRODUCAO = 'producao',
  SOBRA = 'sobra',
  PENS_EAJA = 'pense_aja',
  CAMPANHA = 'campanha',
  FALTA_ZERO = 'falta_zero' 
}

@Entity({ name: 'user_aprovacao', schema: 'liberacao_brinde' })
export class UserAprovacao {
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

  @Column({
    type: 'enum',
    enum: TipoRequisicao,
    enumName: 'tipo_requisicao_enum',
    array: true,
    default: [TipoRequisicao.PRODUCAO]
  })
  tipo_requisicao!: TipoRequisicao[];

  @Column({ type: 'int8', nullable: true })
  updated_by?: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;
}
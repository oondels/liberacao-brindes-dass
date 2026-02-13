import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn
} from 'typeorm';
import { SolicitacaoBrinde } from './Solicitacao';

export enum StatusSVouncher {
  PENDENTE = 'pendente',
  RESGATADO = 'resgatado',
  CANCELADO = 'cancelado'
}
@Entity({ name: 'vounchers', schema: 'liberacao_brinde' })
export class VoucherSolicitacao {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => SolicitacaoBrinde, (solicitacao) => solicitacao.voucher)
  @JoinColumn({ name: 'solicitacao_id' })
  solicitacao!: SolicitacaoBrinde;

  @Column({ type: 'varchar', length: 20, unique: true })
  codigo_voucher!: string;

  @Column({ type: 'enum', enum: StatusSVouncher, enumName: 'status_vouncher_solicitacao', default: StatusSVouncher.PENDENTE })
  status!: StatusSVouncher;

  @Column({ type: 'boolean', default: true})
  ativo!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  data_resgate?: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;
}
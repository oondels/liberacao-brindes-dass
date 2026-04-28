import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TipoRequisicao } from './Solicitacao';

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
    nullable: true,
  })
  tipo_requisicao?: TipoRequisicao[] | null;

  @Column({ type: 'boolean', default: false })
  pode_aprovar_troca!: boolean;

  @Column({ type: 'int8', nullable: true })
  updated_by?: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;
}

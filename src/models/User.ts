// src/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  Unique
} from 'typeorm';

@Unique('matricula_unique', ['matricula'])
@Entity({ name: 'usuarios', schema: 'autenticacao' })
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @CreateDateColumn({ name: 'createdat', type: 'timestamptz', nullable: true })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updatedat', type: 'timestamptz', nullable: true })
  updatedAt!: Date;

  @PrimaryColumn({ name: 'codigo_barras', type: 'bigint' })
  codigoBarras!: string;

  @PrimaryColumn({ type: 'bigint' })
  matricula!: string;

  @Column({ type: 'varchar', nullable: true })
  nome!: string;

  @Column({ name: 'usuario', type: 'varchar', nullable: true })
  usuario!: string;

  @Column({ type: 'varchar', nullable: true })
  senha!: string;

  @Column({ type: 'varchar', nullable: true })
  funcao!: string;

  @Column({ type: 'varchar', nullable: true })
  setor!: string;

  @Column({ name: 'teste_calce', type: 'integer', default: 0, nullable: true })
  testeCalce!: number;

  @Column({ name: 'pense_aja', type: 'integer', default: 0, nullable: true })
  penseAja!: number;

  @Column({ type: 'integer', default: 0, nullable: true })
  season!: number;

  @Column({ type: 'integer', default: 0, nullable: true })
  ambulatorio!: number;

  @Column({ type: 'integer', default: 0, nullable: true })
  limpeza!: number;

  @Column({ type: 'integer', nullable: true })
  telas!: number;

  @Column({ type: 'varchar', nullable: true })
  unidade!: string;

  @Column({ type: 'varchar', nullable: true })
  nivel!: string;

  @Column({ name: 'pe_confirmado', type: 'integer', nullable: true })
  peConfirmado!: number;

  @Column({ type: 'bigint', nullable: true })
  rfid!: string;
}

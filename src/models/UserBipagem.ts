import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { TipoRequisicao } from "./Solicitacao";

@Entity({ name: "user_bipagem", schema: "liberacao_brinde" })
@Index("IDX_user_bipagem_matricula_unique", ["matricula"], { unique: true })
export class UserBipagem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  nome!: string;

  @Column({ type: "int8" })
  matricula!: number;

  @Column({ type: "int8", nullable: true })
  rfid?: number;

  @Column({ type: "int8", nullable: true })
  codbarras?: number;

  @Column({
    type: "enum",
    enum: TipoRequisicao,
    enumName: "tipo_requisicao_enum",
    array: true,
  })
  tipo_requisicao!: TipoRequisicao[];

  @Column({ type: "int8", nullable: true })
  created_by?: number;

  @Column({ type: "int8", nullable: true })
  updated_by?: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;
}

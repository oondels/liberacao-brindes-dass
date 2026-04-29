import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { TipoRequisicao } from "./Solicitacao";
import { User } from "./User";

@Entity({ name: "user_criacao_solicitacao", schema: "liberacao_brinde" })
@Index("IDX_user_criacao_solicitacao_matricula_unique", ["matricula"], { unique: true })
export class UserCriacaoSolicitacao {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "int8" })
  matricula!: number;

  @Column({ type: "varchar", length: 255 })
  nome!: string;

  @Column({ type: "int8", nullable: true })
  rfid?: number;

  @Column({ type: "int8", nullable: true })
  codbarras?: number;

  @Column({ type: "int8" })
  created_by!: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "created_by", referencedColumnName: "matricula" })
  created_by_user!: User;

  @Column({ type: "int8", nullable: true })
  updated_by?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "updated_by", referencedColumnName: "matricula" })
  updated_by_user?: User;

  @Column({
    type: "enum",
    enum: TipoRequisicao,
    enumName: "tipo_requisicao_enum",
    array: true,
    default: [TipoRequisicao.BRINDE_INTERNO],
  })
  tipo_requisicao!: TipoRequisicao[];

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;
}

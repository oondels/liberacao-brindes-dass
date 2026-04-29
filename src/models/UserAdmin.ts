import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { TipoRequisicao } from "./Solicitacao";
import { User } from "./User";

@Entity({ name: "user_admin", schema: "liberacao_brinde" })
@Index("IDX_user_admin_matricula_unique", ["matricula"], { unique: true })
export class UserAdmin {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "int8" })
  matricula!: number;

  @Column({ type: "varchar", length: 255 })
  nome!: string;

  @Column({
    type: "enum",
    enum: TipoRequisicao,
    enumName: "tipo_requisicao_enum",
    array: true,
    nullable: true
  })
  tipo_requisicao!: TipoRequisicao[];

  @Column({ type: "int8", name: "created_by_matricula" })
  created_by_matricula!: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "created_by_matricula", referencedColumnName: "matricula" })
  created_by_user!: User;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;
}

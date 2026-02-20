import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn
} from "typeorm";
import { User } from "./User";

@Entity({ schema: 'autenticacao', name: 'emails' })
export class NotificationEmail {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @OneToOne(() => User, user => user.email)
  @JoinColumn({
    name: "matricula",                // Nome da coluna nesta tabela
    referencedColumnName: "matricula" // Nome da coluna em User
  })
  userEmail!: User

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'boolean', default: false, nullable: true })
  confirmed?: boolean;

  @Column({ name: 'unidade_dass', type: 'varchar', length: 10, nullable: true })
  unidadeDass?: string;

  @Column({ name: 'authorized_notifications_apps', type: 'jsonb', nullable: true })
  authorizedNotificationsApps?: string[];
}
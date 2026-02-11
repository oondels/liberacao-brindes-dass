import path from "path";
import { DataSource } from "typeorm";
import { config } from "./dotenv";
import { SolicitacaoBrinde } from "../models/Solicitacao";
import { VoucherSolicitacao } from "../models/VoucherSolicitacao";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: config.database.host,
  port: config.database.port,
  username: config.database.user,
  password: config.database.password,
  database: config.database.name,
  synchronize: false,
  logging: false,
  entities: [SolicitacaoBrinde, VoucherSolicitacao],
  subscribers: [],
  migrations: [path.join(__dirname, '../migrations/*.{ts,js}')],
  migrationsTableName: "liberacao_brinde",
})
import { MigrationInterface, QueryRunner } from "typeorm";

export class SeparacaoEstoque1773000000000 implements MigrationInterface {
    name = 'SeparacaoEstoque1773000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" RENAME TO "status_solicitacao_brinde_enum_old"`);
        await queryRunner.query(`CREATE TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" AS ENUM('pendente_aprovacao', 'aguardando_separacao', 'aprovado', 'rejeitado', 'retirado', 'cancelado')`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "status" TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" USING "status"::"text"::"liberacao_brinde"."status_solicitacao_brinde_enum"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "status" SET DEFAULT 'pendente_aprovacao'`);
        await queryRunner.query(`DROP TYPE "liberacao_brinde"."status_solicitacao_brinde_enum_old"`);

        await queryRunner.query(`CREATE TABLE "liberacao_brinde"."user_separacao" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nome" character varying(255) NOT NULL, "matricula" bigint NOT NULL, "rfid" bigint, "codbarras" bigint, "tipo_requisicao" "liberacao_brinde"."tipo_requisicao_enum" array NOT NULL, "created_by" bigint, "updated_by" bigint, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5705d5dc9c0a8623d2642b3be00" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_user_separacao_matricula_unique" ON "liberacao_brinde"."user_separacao" ("matricula") `);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_separacao" ADD CONSTRAINT "FK_user_separacao_created_by" FOREIGN KEY ("created_by") REFERENCES "autenticacao"."usuarios"("matricula") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_separacao" ADD CONSTRAINT "FK_user_separacao_updated_by" FOREIGN KEY ("updated_by") REFERENCES "autenticacao"."usuarios"("matricula") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await queryRunner.query(`CREATE TABLE "liberacao_brinde"."solicitacao_historico" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "solicitacao_id" uuid NOT NULL, "status_anterior" "liberacao_brinde"."status_solicitacao_brinde_enum", "status_novo" "liberacao_brinde"."status_solicitacao_brinde_enum" NOT NULL, "acao" character varying(50) NOT NULL, "usuario_matricula" bigint NOT NULL, "marca_anterior" character varying(40), "modelo_anterior" character varying(60), "marca_nova" character varying(40), "modelo_novo" character varying(60), "metadata" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_481799717b2f9d96760f01f985c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_solicitacao_historico_solicitacao_id" ON "liberacao_brinde"."solicitacao_historico" ("solicitacao_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_solicitacao_historico_created_at" ON "liberacao_brinde"."solicitacao_historico" ("created_at") `);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacao_historico" ADD CONSTRAINT "FK_solicitacao_historico_solicitacao" FOREIGN KEY ("solicitacao_id") REFERENCES "liberacao_brinde"."solicitacoes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacao_historico" DROP CONSTRAINT "FK_solicitacao_historico_solicitacao"`);
        await queryRunner.query(`DROP INDEX "liberacao_brinde"."IDX_solicitacao_historico_created_at"`);
        await queryRunner.query(`DROP INDEX "liberacao_brinde"."IDX_solicitacao_historico_solicitacao_id"`);
        await queryRunner.query(`DROP TABLE "liberacao_brinde"."solicitacao_historico"`);

        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_separacao" DROP CONSTRAINT "FK_user_separacao_updated_by"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_separacao" DROP CONSTRAINT "FK_user_separacao_created_by"`);
        await queryRunner.query(`DROP INDEX "liberacao_brinde"."IDX_user_separacao_matricula_unique"`);
        await queryRunner.query(`DROP TABLE "liberacao_brinde"."user_separacao"`);

        await queryRunner.query(`ALTER TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" RENAME TO "status_solicitacao_brinde_enum_new"`);
        await queryRunner.query(`CREATE TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" AS ENUM('pendente_aprovacao', 'aprovado', 'rejeitado', 'retirado', 'cancelado')`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "status" TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" USING CASE WHEN "status"::text = 'aguardando_separacao' THEN 'pendente_aprovacao' ELSE "status"::text END::"liberacao_brinde"."status_solicitacao_brinde_enum"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "status" SET DEFAULT 'pendente_aprovacao'`);
        await queryRunner.query(`DROP TYPE "liberacao_brinde"."status_solicitacao_brinde_enum_new"`);
    }
}

import { MigrationInterface, QueryRunner } from "typeorm";

export class SeparacaoEstoque1777378194763 implements MigrationInterface {
    name = 'SeparacaoEstoque1777378194763'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "liberacao_brinde"."user_separacao" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "nome" character varying(255) NOT NULL, "matricula" bigint NOT NULL, "rfid" bigint, "codbarras" bigint, "tipo_requisicao" "liberacao_brinde"."tipo_requisicao_enum" array NOT NULL, "created_by" bigint, "updated_by" bigint, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ded78724926923899f61d21eb20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_user_separacao_matricula_unique" ON "liberacao_brinde"."user_separacao" ("matricula") `);
        await queryRunner.query(`ALTER TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" RENAME TO "status_solicitacao_brinde_enum_old"`);
        await queryRunner.query(`CREATE TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" AS ENUM('pendente_aprovacao', 'aguardando_separacao', 'aprovado', 'rejeitado', 'retirado', 'cancelado')`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "status" TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" USING "status"::"text"::"liberacao_brinde"."status_solicitacao_brinde_enum"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "status" SET DEFAULT 'pendente_aprovacao'`);
        await queryRunner.query(`DROP TYPE "liberacao_brinde"."status_solicitacao_brinde_enum_old"`);
        await queryRunner.query(`CREATE TABLE "liberacao_brinde"."solicitacao_historico" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "solicitacao_id" uuid NOT NULL, "status_anterior" "liberacao_brinde"."status_solicitacao_brinde_enum", "status_novo" "liberacao_brinde"."status_solicitacao_brinde_enum" NOT NULL, "acao" character varying(50) NOT NULL, "usuario_matricula" bigint NOT NULL, "marca_anterior" character varying(40), "modelo_anterior" character varying(60), "marca_nova" character varying(40), "modelo_novo" character varying(60), "metadata" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7f046be26e458745536d05a90b9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_solicitacao_historico_created_at" ON "liberacao_brinde"."solicitacao_historico" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_solicitacao_historico_solicitacao_id" ON "liberacao_brinde"."solicitacao_historico" ("solicitacao_id") `);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacao_historico" ADD CONSTRAINT "FK_2c78f0d6ab18f22f52104af5ebe" FOREIGN KEY ("solicitacao_id") REFERENCES "liberacao_brinde"."solicitacoes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "liberacao_brinde"."IDX_user_separacao_matricula_unique"`);
        await queryRunner.query(`DROP TABLE "liberacao_brinde"."user_separacao"`);
        await queryRunner.query(`DROP TABLE "liberacao_brinde"."solicitacao_historico"`);
        await queryRunner.query(`CREATE TYPE "liberacao_brinde"."status_solicitacao_brinde_enum_old" AS ENUM('pendente_aprovacao', 'aprovado', 'rejeitado', 'retirado', 'cancelado')`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "status" TYPE "liberacao_brinde"."status_solicitacao_brinde_enum_old" USING "status"::"text"::"liberacao_brinde"."status_solicitacao_brinde_enum_old"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "status" SET DEFAULT 'pendente_aprovacao'`);
        await queryRunner.query(`DROP TYPE "liberacao_brinde"."status_solicitacao_brinde_enum"`);
        await queryRunner.query(`ALTER TYPE "liberacao_brinde"."status_solicitacao_brinde_enum_old" RENAME TO "status_solicitacao_brinde_enum"`);
        await queryRunner.query(`DROP INDEX "liberacao_brinde"."IDX_solicitacao_historico_solicitacao_id"`);
        await queryRunner.query(`DROP INDEX "liberacao_brinde"."IDX_solicitacao_historico_created_at"`);
    }

}

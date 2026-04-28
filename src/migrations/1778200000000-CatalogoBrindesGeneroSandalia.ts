import { MigrationInterface, QueryRunner } from "typeorm";

export class CatalogoBrindesGeneroSandalia1778200000000 implements MigrationInterface {
    name = 'CatalogoBrindesGeneroSandalia1778200000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "liberacao_brinde"."tipo_requisicao_enum" RENAME TO "tipo_requisicao_enum_old"`);
        await queryRunner.query(`CREATE TYPE "liberacao_brinde"."tipo_requisicao_enum" AS ENUM('teste_calce', 'brinde_interno', 'pense_aja', 'campanha', 'falta_zero', 'sandalia')`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum" USING "tipo_requisicao"::text::"liberacao_brinde"."tipo_requisicao_enum"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" SET DEFAULT 'brinde_interno'`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum"[] USING "tipo_requisicao"::text[]::"liberacao_brinde"."tipo_requisicao_enum"[]`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" SET DEFAULT '{brinde_interno}'`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_criacao_solicitacao" ALTER COLUMN "tipo_requisicao" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_criacao_solicitacao" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum"[] USING "tipo_requisicao"::text[]::"liberacao_brinde"."tipo_requisicao_enum"[]`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_criacao_solicitacao" ALTER COLUMN "tipo_requisicao" SET DEFAULT '{brinde_interno}'`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_separacao" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum"[] USING "tipo_requisicao"::text[]::"liberacao_brinde"."tipo_requisicao_enum"[]`);
        await queryRunner.query(`DROP TYPE "liberacao_brinde"."tipo_requisicao_enum_old"`);

        await queryRunner.query(`ALTER TYPE "liberacao_brinde"."campanha_subgrupo_enum" RENAME TO "campanha_subgrupo_enum_old"`);
        await queryRunner.query(`CREATE TYPE "liberacao_brinde"."campanha_subgrupo_enum" AS ENUM('brigada_incendio', 'eficiencia', 'hora_extra', 'brinde_5s')`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "subgrupo_campanha" TYPE "liberacao_brinde"."campanha_subgrupo_enum" USING "subgrupo_campanha"::text::"liberacao_brinde"."campanha_subgrupo_enum"`);
        await queryRunner.query(`DROP TYPE "liberacao_brinde"."campanha_subgrupo_enum_old"`);

        await queryRunner.query(`CREATE TYPE "liberacao_brinde"."genero_solicitacao_enum" AS ENUM('masculino', 'feminino')`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ADD COLUMN "genero" "liberacao_brinde"."genero_solicitacao_enum"`);

        await queryRunner.query(`CREATE TABLE "liberacao_brinde"."brindes_ativos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nome" character varying(255) NOT NULL, "tipo_requisicao" "liberacao_brinde"."tipo_requisicao_enum" NOT NULL, "subgrupo_campanha" "liberacao_brinde"."campanha_subgrupo_enum", "marca" character varying(40), "modelo" character varying(60), "genero" "liberacao_brinde"."genero_solicitacao_enum", "num_calce" smallint, "ativo" boolean NOT NULL DEFAULT true, "created_by" bigint, "updated_by" bigint, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_57f2a5b07ad7a159a5d1c97c9ce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_brindes_ativos_ativo" ON "liberacao_brinde"."brindes_ativos" ("ativo") `);
        await queryRunner.query(`CREATE INDEX "IDX_brindes_ativos_tipo_requisicao" ON "liberacao_brinde"."brindes_ativos" ("tipo_requisicao") `);

        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ADD COLUMN "brinde_id" uuid`);
        await queryRunner.query(`CREATE INDEX "IDX_solicitacoes_brinde_id" ON "liberacao_brinde"."solicitacoes" ("brinde_id") `);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ADD CONSTRAINT "FK_solicitacoes_brinde_id" FOREIGN KEY ("brinde_id") REFERENCES "liberacao_brinde"."brindes_ativos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" DROP CONSTRAINT "FK_solicitacoes_brinde_id"`);
        await queryRunner.query(`DROP INDEX "liberacao_brinde"."IDX_solicitacoes_brinde_id"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" DROP COLUMN "brinde_id"`);
        await queryRunner.query(`DROP INDEX "liberacao_brinde"."IDX_brindes_ativos_tipo_requisicao"`);
        await queryRunner.query(`DROP INDEX "liberacao_brinde"."IDX_brindes_ativos_ativo"`);
        await queryRunner.query(`DROP TABLE "liberacao_brinde"."brindes_ativos"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" DROP COLUMN "genero"`);
        await queryRunner.query(`DROP TYPE "liberacao_brinde"."genero_solicitacao_enum"`);

        await queryRunner.query(`ALTER TYPE "liberacao_brinde"."campanha_subgrupo_enum" RENAME TO "campanha_subgrupo_enum_new"`);
        await queryRunner.query(`CREATE TYPE "liberacao_brinde"."campanha_subgrupo_enum" AS ENUM('brigada_incendio', 'eficiencia', 'hora_extra')`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "subgrupo_campanha" TYPE "liberacao_brinde"."campanha_subgrupo_enum" USING CASE WHEN "subgrupo_campanha"::text = 'brinde_5s' THEN NULL ELSE "subgrupo_campanha"::text END::"liberacao_brinde"."campanha_subgrupo_enum"`);
        await queryRunner.query(`DROP TYPE "liberacao_brinde"."campanha_subgrupo_enum_new"`);

        await queryRunner.query(`ALTER TYPE "liberacao_brinde"."tipo_requisicao_enum" RENAME TO "tipo_requisicao_enum_new"`);
        await queryRunner.query(`CREATE TYPE "liberacao_brinde"."tipo_requisicao_enum" AS ENUM('teste_calce', 'brinde_interno', 'pense_aja', 'campanha', 'falta_zero')`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum" USING CASE WHEN "tipo_requisicao"::text = 'sandalia' THEN 'brinde_interno' ELSE "tipo_requisicao"::text END::"liberacao_brinde"."tipo_requisicao_enum"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" SET DEFAULT 'brinde_interno'`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum"[] USING ARRAY(SELECT CASE WHEN e::text = 'sandalia' THEN 'brinde_interno' ELSE e::text END::"liberacao_brinde"."tipo_requisicao_enum" FROM unnest("tipo_requisicao") AS e)`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" SET DEFAULT '{brinde_interno}'`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_criacao_solicitacao" ALTER COLUMN "tipo_requisicao" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_criacao_solicitacao" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum"[] USING ARRAY(SELECT CASE WHEN e::text = 'sandalia' THEN 'brinde_interno' ELSE e::text END::"liberacao_brinde"."tipo_requisicao_enum" FROM unnest("tipo_requisicao") AS e)`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_criacao_solicitacao" ALTER COLUMN "tipo_requisicao" SET DEFAULT '{brinde_interno}'`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_separacao" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum"[] USING ARRAY(SELECT CASE WHEN e::text = 'sandalia' THEN 'brinde_interno' ELSE e::text END::"liberacao_brinde"."tipo_requisicao_enum" FROM unnest("tipo_requisicao") AS e)`);
        await queryRunner.query(`DROP TYPE "liberacao_brinde"."tipo_requisicao_enum_new"`);
    }
}

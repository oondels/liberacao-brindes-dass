import { MigrationInterface, QueryRunner } from "typeorm";

export class AtualizaTipoReqCampanha1772021828759 implements MigrationInterface {
    name = 'AtualizaTipoReqCampanha1772021828759'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "liberacao_brinde"."campanha_subgrupo_enum" AS ENUM('brigada_incendio', 'eficiencia', 'hora_extra')`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ADD COLUMN "subgrupo_campanha" "liberacao_brinde"."campanha_subgrupo_enum"`);

        await queryRunner.query(`UPDATE "liberacao_brinde"."solicitacoes" SET "subgrupo_campanha" = 'brigada_incendio' WHERE "tipo_requisicao" = 'brigada_incendio'`);

        await queryRunner.query(`ALTER TYPE "liberacao_brinde"."tipo_requisicao_enum" RENAME TO "tipo_requisicao_enum_old"`);
        await queryRunner.query(
            `CREATE TYPE "liberacao_brinde"."tipo_requisicao_enum" AS ENUM('teste_calce', 'brinde_interno', 'pense_aja', 'campanha', 'falta_zero')`
        );

        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" DROP DEFAULT`);
        await queryRunner.query(
            `ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum" USING (CASE WHEN "tipo_requisicao"::text IN ('producao', 'sobra') THEN 'brinde_interno' WHEN "tipo_requisicao"::text = 'brigada_incendio' THEN 'campanha' ELSE "tipo_requisicao"::text END)::"liberacao_brinde"."tipo_requisicao_enum"`
        );
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" SET DEFAULT 'brinde_interno'`);

        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ADD COLUMN "tipo_requisicao_tmp" text[]`);
        await queryRunner.query(
            `UPDATE "liberacao_brinde"."user_aprovacao" SET "tipo_requisicao_tmp" = ARRAY(SELECT CASE WHEN e::text IN ('producao', 'sobra') THEN 'brinde_interno' WHEN e::text = 'brigada_incendio' THEN 'campanha' ELSE e::text END FROM unnest("tipo_requisicao") AS e)`
        );
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" DROP DEFAULT`);
        await queryRunner.query(
            `ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum"[] USING "tipo_requisicao_tmp"::"liberacao_brinde"."tipo_requisicao_enum"[]`
        );
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" SET DEFAULT '{brinde_interno}'`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" DROP COLUMN "tipo_requisicao_tmp"`);

        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_criacao_solicitacao" ADD COLUMN "tipo_requisicao_tmp" text[]`);
        await queryRunner.query(
            `UPDATE "liberacao_brinde"."user_criacao_solicitacao" SET "tipo_requisicao_tmp" = ARRAY(SELECT CASE WHEN e::text IN ('producao', 'sobra') THEN 'brinde_interno' WHEN e::text = 'brigada_incendio' THEN 'campanha' ELSE e::text END FROM unnest("tipo_requisicao") AS e)`
        );
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_criacao_solicitacao" ALTER COLUMN "tipo_requisicao" DROP DEFAULT`);
        await queryRunner.query(
            `ALTER TABLE "liberacao_brinde"."user_criacao_solicitacao" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum"[] USING "tipo_requisicao_tmp"::"liberacao_brinde"."tipo_requisicao_enum"[]`
        );
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_criacao_solicitacao" ALTER COLUMN "tipo_requisicao" SET DEFAULT '{brinde_interno}'`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_criacao_solicitacao" DROP COLUMN "tipo_requisicao_tmp"`);

        await queryRunner.query(`DROP TYPE "liberacao_brinde"."tipo_requisicao_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "liberacao_brinde"."tipo_requisicao_enum" RENAME TO "tipo_requisicao_enum_new"`);
        await queryRunner.query(
            `CREATE TYPE "liberacao_brinde"."tipo_requisicao_enum" AS ENUM('teste_calce', 'producao', 'sobra', 'pense_aja', 'campanha', 'falta_zero', 'brigada_incendio')`
        );

        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" DROP DEFAULT`);
        await queryRunner.query(
            `ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum" USING (CASE WHEN "tipo_requisicao"::text = 'brinde_interno' THEN 'producao' WHEN "tipo_requisicao"::text = 'campanha' AND "subgrupo_campanha" = 'brigada_incendio' THEN 'brigada_incendio' ELSE "tipo_requisicao"::text END)::"liberacao_brinde"."tipo_requisicao_enum"`
        );
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" SET DEFAULT 'producao'`);

        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ADD COLUMN "tipo_requisicao_tmp" text[]`);
        await queryRunner.query(
            `UPDATE "liberacao_brinde"."user_aprovacao" SET "tipo_requisicao_tmp" = ARRAY(SELECT CASE WHEN e::text = 'brinde_interno' THEN 'producao' ELSE e::text END FROM unnest("tipo_requisicao") AS e)`
        );
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" DROP DEFAULT`);
        await queryRunner.query(
            `ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum"[] USING "tipo_requisicao_tmp"::"liberacao_brinde"."tipo_requisicao_enum"[]`
        );
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" SET DEFAULT '{producao}'`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" DROP COLUMN "tipo_requisicao_tmp"`);

        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_criacao_solicitacao" ADD COLUMN "tipo_requisicao_tmp" text[]`);
        await queryRunner.query(
            `UPDATE "liberacao_brinde"."user_criacao_solicitacao" SET "tipo_requisicao_tmp" = ARRAY(SELECT CASE WHEN e::text = 'brinde_interno' THEN 'producao' ELSE e::text END FROM unnest("tipo_requisicao") AS e)`
        );
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_criacao_solicitacao" ALTER COLUMN "tipo_requisicao" DROP DEFAULT`);
        await queryRunner.query(
            `ALTER TABLE "liberacao_brinde"."user_criacao_solicitacao" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum"[] USING "tipo_requisicao_tmp"::"liberacao_brinde"."tipo_requisicao_enum"[]`
        );
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_criacao_solicitacao" ALTER COLUMN "tipo_requisicao" SET DEFAULT '{producao}'`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_criacao_solicitacao" DROP COLUMN "tipo_requisicao_tmp"`);

        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" DROP COLUMN "subgrupo_campanha"`);
        await queryRunner.query(`DROP TYPE "liberacao_brinde"."campanha_subgrupo_enum"`);
        await queryRunner.query(`DROP TYPE "liberacao_brinde"."tipo_requisicao_enum_new"`);
    }
}

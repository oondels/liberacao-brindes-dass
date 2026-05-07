import { MigrationInterface, QueryRunner } from "typeorm";

export class DoacaoCategoriaInfantil1778300000000 implements MigrationInterface {
    name = 'DoacaoCategoriaInfantil1778300000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "liberacao_brinde"."tipo_requisicao_enum" RENAME TO "tipo_requisicao_enum_old"`);
        await queryRunner.query(`CREATE TYPE "liberacao_brinde"."tipo_requisicao_enum" AS ENUM('teste_calce', 'brinde_interno', 'pense_aja', 'campanha', 'falta_zero', 'sandalia', 'doacao')`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum" USING "tipo_requisicao"::text::"liberacao_brinde"."tipo_requisicao_enum"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" SET DEFAULT 'brinde_interno'`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."brindes_ativos" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum" USING "tipo_requisicao"::text::"liberacao_brinde"."tipo_requisicao_enum"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum"[] USING "tipo_requisicao"::text[]::"liberacao_brinde"."tipo_requisicao_enum"[]`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" SET DEFAULT '{brinde_interno}'`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_criacao_solicitacao" ALTER COLUMN "tipo_requisicao" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_criacao_solicitacao" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum"[] USING "tipo_requisicao"::text[]::"liberacao_brinde"."tipo_requisicao_enum"[]`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_criacao_solicitacao" ALTER COLUMN "tipo_requisicao" SET DEFAULT '{brinde_interno}'`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_separacao" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum"[] USING "tipo_requisicao"::text[]::"liberacao_brinde"."tipo_requisicao_enum"[]`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_bipagem" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum"[] USING "tipo_requisicao"::text[]::"liberacao_brinde"."tipo_requisicao_enum"[]`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_admin" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum"[] USING "tipo_requisicao"::text[]::"liberacao_brinde"."tipo_requisicao_enum"[]`);
        await queryRunner.query(`DROP TYPE "liberacao_brinde"."tipo_requisicao_enum_old"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ADD "categoria_infantil" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" DROP COLUMN "categoria_infantil"`);
        await queryRunner.query(`ALTER TYPE "liberacao_brinde"."tipo_requisicao_enum" RENAME TO "tipo_requisicao_enum_new"`);
        await queryRunner.query(`CREATE TYPE "liberacao_brinde"."tipo_requisicao_enum" AS ENUM('teste_calce', 'brinde_interno', 'pense_aja', 'campanha', 'falta_zero', 'sandalia')`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum" USING CASE WHEN "tipo_requisicao"::text = 'doacao' THEN 'brinde_interno' ELSE "tipo_requisicao"::text END::"liberacao_brinde"."tipo_requisicao_enum"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" SET DEFAULT 'brinde_interno'`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."brindes_ativos" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum" USING CASE WHEN "tipo_requisicao"::text = 'doacao' THEN 'brinde_interno' ELSE "tipo_requisicao"::text END::"liberacao_brinde"."tipo_requisicao_enum"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum"[] USING CASE WHEN "tipo_requisicao" IS NULL THEN NULL ELSE ARRAY(SELECT CASE WHEN e::text = 'doacao' THEN 'brinde_interno' ELSE e::text END::"liberacao_brinde"."tipo_requisicao_enum" FROM unnest("tipo_requisicao") AS e) END`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" SET DEFAULT '{brinde_interno}'`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_criacao_solicitacao" ALTER COLUMN "tipo_requisicao" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_criacao_solicitacao" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum"[] USING ARRAY(SELECT CASE WHEN e::text = 'doacao' THEN 'brinde_interno' ELSE e::text END::"liberacao_brinde"."tipo_requisicao_enum" FROM unnest("tipo_requisicao") AS e)`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_criacao_solicitacao" ALTER COLUMN "tipo_requisicao" SET DEFAULT '{brinde_interno}'`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_separacao" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum"[] USING ARRAY(SELECT CASE WHEN e::text = 'doacao' THEN 'brinde_interno' ELSE e::text END::"liberacao_brinde"."tipo_requisicao_enum" FROM unnest("tipo_requisicao") AS e)`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_bipagem" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum"[] USING ARRAY(SELECT CASE WHEN e::text = 'doacao' THEN 'brinde_interno' ELSE e::text END::"liberacao_brinde"."tipo_requisicao_enum" FROM unnest("tipo_requisicao") AS e)`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_admin" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum"[] USING CASE WHEN "tipo_requisicao" IS NULL THEN NULL ELSE ARRAY(SELECT CASE WHEN e::text = 'doacao' THEN 'brinde_interno' ELSE e::text END::"liberacao_brinde"."tipo_requisicao_enum" FROM unnest("tipo_requisicao") AS e) END`);
        await queryRunner.query(`DROP TYPE "liberacao_brinde"."tipo_requisicao_enum_new"`);
    }
}

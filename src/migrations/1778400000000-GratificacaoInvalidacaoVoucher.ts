import { MigrationInterface, QueryRunner } from "typeorm";

export class GratificacaoInvalidacaoVoucher1778400000000 implements MigrationInterface {
    name = 'GratificacaoInvalidacaoVoucher1778400000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "liberacao_brinde"."tipo_requisicao_enum" RENAME TO "tipo_requisicao_enum_old"`);
        await queryRunner.query(`CREATE TYPE "liberacao_brinde"."tipo_requisicao_enum" AS ENUM('teste_calce', 'gratificacao', 'brinde_interno', 'pense_aja', 'campanha', 'falta_zero', 'sandalia', 'doacao')`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum" USING "tipo_requisicao"::text::"liberacao_brinde"."tipo_requisicao_enum"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" SET DEFAULT 'brinde_interno'`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."brindes_ativos" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum" USING "tipo_requisicao"::text::"liberacao_brinde"."tipo_requisicao_enum"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum"[] USING CASE WHEN "tipo_requisicao" IS NULL THEN NULL ELSE "tipo_requisicao"::text[]::"liberacao_brinde"."tipo_requisicao_enum"[] END`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" SET DEFAULT '{brinde_interno}'`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_criacao_solicitacao" ALTER COLUMN "tipo_requisicao" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_criacao_solicitacao" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum"[] USING "tipo_requisicao"::text[]::"liberacao_brinde"."tipo_requisicao_enum"[]`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_criacao_solicitacao" ALTER COLUMN "tipo_requisicao" SET DEFAULT '{brinde_interno}'`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_separacao" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum"[] USING "tipo_requisicao"::text[]::"liberacao_brinde"."tipo_requisicao_enum"[]`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_bipagem" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum"[] USING "tipo_requisicao"::text[]::"liberacao_brinde"."tipo_requisicao_enum"[]`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_admin" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum"[] USING CASE WHEN "tipo_requisicao" IS NULL THEN NULL ELSE "tipo_requisicao"::text[]::"liberacao_brinde"."tipo_requisicao_enum"[] END`);
        await queryRunner.query(`DROP TYPE "liberacao_brinde"."tipo_requisicao_enum_old"`);

        await queryRunner.query(`ALTER TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" RENAME TO "status_solicitacao_brinde_enum_old"`);
        await queryRunner.query(`CREATE TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" AS ENUM('pendente_aprovacao', 'aguardando_separacao', 'aguardando_troca', 'aprovado', 'rejeitado', 'retirado', 'cancelado', 'invalidado')`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "status" TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" USING "status"::text::"liberacao_brinde"."status_solicitacao_brinde_enum"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "status" SET DEFAULT 'pendente_aprovacao'`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacao_historico" ALTER COLUMN "status_anterior" TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" USING "status_anterior"::text::"liberacao_brinde"."status_solicitacao_brinde_enum"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacao_historico" ALTER COLUMN "status_novo" TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" USING "status_novo"::text::"liberacao_brinde"."status_solicitacao_brinde_enum"`);
        await queryRunner.query(`DROP TYPE "liberacao_brinde"."status_solicitacao_brinde_enum_old"`);

        await queryRunner.query(`ALTER TYPE "liberacao_brinde"."status_vouncher_solicitacao" RENAME TO "status_vouncher_solicitacao_old"`);
        await queryRunner.query(`CREATE TYPE "liberacao_brinde"."status_vouncher_solicitacao" AS ENUM('pendente', 'resgatado', 'cancelado', 'invalidado')`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."vounchers" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."vounchers" ALTER COLUMN "status" TYPE "liberacao_brinde"."status_vouncher_solicitacao" USING "status"::text::"liberacao_brinde"."status_vouncher_solicitacao"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."vounchers" ALTER COLUMN "status" SET DEFAULT 'pendente'`);
        await queryRunner.query(`DROP TYPE "liberacao_brinde"."status_vouncher_solicitacao_old"`);

        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ADD "bonificacao_user_liberacao" bigint`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" DROP COLUMN "bonificacao_user_liberacao"`);

        await queryRunner.query(`ALTER TYPE "liberacao_brinde"."status_vouncher_solicitacao" RENAME TO "status_vouncher_solicitacao_new"`);
        await queryRunner.query(`CREATE TYPE "liberacao_brinde"."status_vouncher_solicitacao" AS ENUM('pendente', 'resgatado', 'cancelado')`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."vounchers" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."vounchers" ALTER COLUMN "status" TYPE "liberacao_brinde"."status_vouncher_solicitacao" USING CASE WHEN "status"::text = 'invalidado' THEN 'cancelado' ELSE "status"::text END::"liberacao_brinde"."status_vouncher_solicitacao"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."vounchers" ALTER COLUMN "status" SET DEFAULT 'pendente'`);
        await queryRunner.query(`DROP TYPE "liberacao_brinde"."status_vouncher_solicitacao_new"`);

        await queryRunner.query(`ALTER TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" RENAME TO "status_solicitacao_brinde_enum_new"`);
        await queryRunner.query(`CREATE TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" AS ENUM('pendente_aprovacao', 'aguardando_separacao', 'aguardando_troca', 'aprovado', 'rejeitado', 'retirado', 'cancelado')`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "status" TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" USING CASE WHEN "status"::text = 'invalidado' THEN 'cancelado' ELSE "status"::text END::"liberacao_brinde"."status_solicitacao_brinde_enum"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "status" SET DEFAULT 'pendente_aprovacao'`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacao_historico" ALTER COLUMN "status_anterior" TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" USING CASE WHEN "status_anterior"::text = 'invalidado' THEN 'cancelado' ELSE "status_anterior"::text END::"liberacao_brinde"."status_solicitacao_brinde_enum"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacao_historico" ALTER COLUMN "status_novo" TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" USING CASE WHEN "status_novo"::text = 'invalidado' THEN 'cancelado' ELSE "status_novo"::text END::"liberacao_brinde"."status_solicitacao_brinde_enum"`);
        await queryRunner.query(`DROP TYPE "liberacao_brinde"."status_solicitacao_brinde_enum_new"`);

        await queryRunner.query(`ALTER TYPE "liberacao_brinde"."tipo_requisicao_enum" RENAME TO "tipo_requisicao_enum_new"`);
        await queryRunner.query(`CREATE TYPE "liberacao_brinde"."tipo_requisicao_enum" AS ENUM('teste_calce', 'brinde_interno', 'pense_aja', 'campanha', 'falta_zero', 'sandalia', 'doacao')`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum" USING CASE WHEN "tipo_requisicao"::text = 'gratificacao' THEN 'teste_calce' ELSE "tipo_requisicao"::text END::"liberacao_brinde"."tipo_requisicao_enum"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" SET DEFAULT 'brinde_interno'`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."brindes_ativos" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum" USING CASE WHEN "tipo_requisicao"::text = 'gratificacao' THEN 'teste_calce' ELSE "tipo_requisicao"::text END::"liberacao_brinde"."tipo_requisicao_enum"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum"[] USING CASE WHEN "tipo_requisicao" IS NULL THEN NULL ELSE ARRAY(SELECT CASE WHEN e::text = 'gratificacao' THEN 'teste_calce' ELSE e::text END::"liberacao_brinde"."tipo_requisicao_enum" FROM unnest("tipo_requisicao") AS e) END`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" SET DEFAULT '{brinde_interno}'`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_criacao_solicitacao" ALTER COLUMN "tipo_requisicao" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_criacao_solicitacao" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum"[] USING ARRAY(SELECT CASE WHEN e::text = 'gratificacao' THEN 'teste_calce' ELSE e::text END::"liberacao_brinde"."tipo_requisicao_enum" FROM unnest("tipo_requisicao") AS e)`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_criacao_solicitacao" ALTER COLUMN "tipo_requisicao" SET DEFAULT '{brinde_interno}'`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_separacao" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum"[] USING ARRAY(SELECT CASE WHEN e::text = 'gratificacao' THEN 'teste_calce' ELSE e::text END::"liberacao_brinde"."tipo_requisicao_enum" FROM unnest("tipo_requisicao") AS e)`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_bipagem" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum"[] USING ARRAY(SELECT CASE WHEN e::text = 'gratificacao' THEN 'teste_calce' ELSE e::text END::"liberacao_brinde"."tipo_requisicao_enum" FROM unnest("tipo_requisicao") AS e)`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_admin" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum"[] USING CASE WHEN "tipo_requisicao" IS NULL THEN NULL ELSE ARRAY(SELECT CASE WHEN e::text = 'gratificacao' THEN 'teste_calce' ELSE e::text END::"liberacao_brinde"."tipo_requisicao_enum" FROM unnest("tipo_requisicao") AS e) END`);
        await queryRunner.query(`DROP TYPE "liberacao_brinde"."tipo_requisicao_enum_new"`);
    }
}

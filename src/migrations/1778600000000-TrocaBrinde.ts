import { MigrationInterface, QueryRunner } from "typeorm";

export class TrocaBrinde1778600000000 implements MigrationInterface {
    name = 'TrocaBrinde1778600000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" RENAME TO "status_solicitacao_brinde_enum_old"`);
        await queryRunner.query(`CREATE TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" AS ENUM('pendente_aprovacao', 'aguardando_separacao', 'aguardando_troca', 'aprovado', 'rejeitado', 'retirado', 'cancelado')`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "status" TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" USING "status"::text::"liberacao_brinde"."status_solicitacao_brinde_enum"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "status" SET DEFAULT 'pendente_aprovacao'`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacao_historico" ALTER COLUMN "status_anterior" TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" USING "status_anterior"::text::"liberacao_brinde"."status_solicitacao_brinde_enum"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacao_historico" ALTER COLUMN "status_novo" TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" USING "status_novo"::text::"liberacao_brinde"."status_solicitacao_brinde_enum"`);
        await queryRunner.query(`DROP TYPE "liberacao_brinde"."status_solicitacao_brinde_enum_old"`);

        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ADD COLUMN "pode_aprovar_troca" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE "liberacao_brinde"."solicitacoes" SET "status" = 'retirado' WHERE "status" = 'aguardando_troca'`);
        await queryRunner.query(`UPDATE "liberacao_brinde"."solicitacao_historico" SET "status_anterior" = 'retirado' WHERE "status_anterior"::text = 'aguardando_troca'`);
        await queryRunner.query(`UPDATE "liberacao_brinde"."solicitacao_historico" SET "status_novo" = 'retirado' WHERE "status_novo"::text = 'aguardando_troca'`);

        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" SET DEFAULT '{brinde_interno}'`);
        await queryRunner.query(`UPDATE "liberacao_brinde"."user_aprovacao" SET "tipo_requisicao" = '{brinde_interno}' WHERE "tipo_requisicao" IS NULL`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" DROP COLUMN "pode_aprovar_troca"`);

        await queryRunner.query(`ALTER TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" RENAME TO "status_solicitacao_brinde_enum_new"`);
        await queryRunner.query(`CREATE TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" AS ENUM('pendente_aprovacao', 'aguardando_separacao', 'aprovado', 'rejeitado', 'retirado', 'cancelado')`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "status" TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" USING "status"::text::"liberacao_brinde"."status_solicitacao_brinde_enum"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "status" SET DEFAULT 'pendente_aprovacao'`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacao_historico" ALTER COLUMN "status_anterior" TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" USING "status_anterior"::text::"liberacao_brinde"."status_solicitacao_brinde_enum"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacao_historico" ALTER COLUMN "status_novo" TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" USING "status_novo"::text::"liberacao_brinde"."status_solicitacao_brinde_enum"`);
        await queryRunner.query(`DROP TYPE "liberacao_brinde"."status_solicitacao_brinde_enum_new"`);
    }
}

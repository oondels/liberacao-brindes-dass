import { MigrationInterface, QueryRunner } from "typeorm";

export class FirstMigration1770808789619 implements MigrationInterface {
    name = 'FirstMigration1770808789619'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" DROP CONSTRAINT "solicitacoes_num_calce_check"`);
        await queryRunner.query(`ALTER TYPE "liberacao_brinde"."tipo_requisicao_enum" RENAME TO "tipo_requisicao_enum_old"`);
        await queryRunner.query(`CREATE TYPE "liberacao_brinde"."tipo_requisicao_enum" AS ENUM('teste_calce', 'producao', 'sobra')`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum" USING "tipo_requisicao"::"text"::"liberacao_brinde"."tipo_requisicao_enum"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" SET DEFAULT 'producao'`);
        await queryRunner.query(`DROP TYPE "liberacao_brinde"."tipo_requisicao_enum_old"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" SET DEFAULT 'producao'`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" DROP CONSTRAINT "solicitacoes_codigo_unico_key"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "gerente_aprovacao" DROP NOT NULL`);
        await queryRunner.query(`ALTER TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" RENAME TO "status_solicitacao_brinde_enum_old"`);
        await queryRunner.query(`CREATE TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" AS ENUM('pendente_aprovacao', 'aprovado', 'rejeitado', 'retirado', 'cancelado')`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "status" TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" USING "status"::"text"::"liberacao_brinde"."status_solicitacao_brinde_enum"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "status" SET DEFAULT 'pendente_aprovacao'`);
        await queryRunner.query(`DROP TYPE "liberacao_brinde"."status_solicitacao_brinde_enum_old"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_17199233c8ad3418d360d0f42e" ON "liberacao_brinde"."solicitacoes" ("codigo_unico") `);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ADD CONSTRAINT "CHK_16837153477e84dcfd526beea3" CHECK ("num_calce" >= 10 AND "num_calce" <= 60)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" DROP CONSTRAINT "CHK_16837153477e84dcfd526beea3"`);
        await queryRunner.query(`DROP INDEX "liberacao_brinde"."IDX_17199233c8ad3418d360d0f42e"`);
        await queryRunner.query(`CREATE TYPE "liberacao_brinde"."status_solicitacao_brinde_enum_old" AS ENUM('PENDENTE_APROVACAO', 'APROVADO', 'REJEITADO', 'RETIRADO', 'CANCELADO')`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "status" TYPE "liberacao_brinde"."status_solicitacao_brinde_enum_old" USING "status"::"text"::"liberacao_brinde"."status_solicitacao_brinde_enum_old"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "status" SET DEFAULT 'PENDENTE_APROVACAO'`);
        await queryRunner.query(`DROP TYPE "liberacao_brinde"."status_solicitacao_brinde_enum"`);
        await queryRunner.query(`ALTER TYPE "liberacao_brinde"."status_solicitacao_brinde_enum_old" RENAME TO "status_solicitacao_brinde_enum"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "gerente_aprovacao" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ADD CONSTRAINT "solicitacoes_codigo_unico_key" UNIQUE ("codigo_unico")`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" DROP DEFAULT`);
        await queryRunner.query(`CREATE TYPE "liberacao_brinde"."tipo_requisicao_enum_old" AS ENUM('TESTE_CALCE', 'PRODUCAO', 'SOBRA')`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum_old" USING "tipo_requisicao"::"text"::"liberacao_brinde"."tipo_requisicao_enum_old"`);
        await queryRunner.query(`DROP TYPE "liberacao_brinde"."tipo_requisicao_enum"`);
        await queryRunner.query(`ALTER TYPE "liberacao_brinde"."tipo_requisicao_enum_old" RENAME TO "tipo_requisicao_enum"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ADD CONSTRAINT "solicitacoes_num_calce_check" CHECK (((num_calce >= 10) AND (num_calce <= 60)))`);
    }

}

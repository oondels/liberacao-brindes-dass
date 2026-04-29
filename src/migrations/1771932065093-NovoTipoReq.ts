import { MigrationInterface, QueryRunner } from "typeorm";

export class NovoTipoReq1771932065093 implements MigrationInterface {
    name = 'NovoTipoReq1771932065093'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "liberacao_brinde"."tipo_requisicao_enum" RENAME TO "tipo_requisicao_enum_old"`);
        await queryRunner.query(`CREATE TYPE "liberacao_brinde"."tipo_requisicao_enum" AS ENUM('teste_calce', 'producao', 'sobra', 'pense_aja', 'campanha', 'falta_zero', 'brigada_incendio')`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum" USING "tipo_requisicao"::"text"::"liberacao_brinde"."tipo_requisicao_enum"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" SET DEFAULT 'producao'`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum"[] USING "tipo_requisicao"::"text"::"liberacao_brinde"."tipo_requisicao_enum"[]`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" SET DEFAULT '{producao}'`);
        await queryRunner.query(`DROP TYPE "liberacao_brinde"."tipo_requisicao_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "liberacao_brinde"."tipo_requisicao_enum" RENAME TO "tipo_requisicao_enum_old"`);
        await queryRunner.query(`CREATE TYPE "liberacao_brinde"."tipo_requisicao_enum" AS ENUM('teste_calce', 'producao', 'sobra', 'pense_aja', 'campanha', 'falta_zero')`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum"[] USING "tipo_requisicao"::"text"::"liberacao_brinde"."tipo_requisicao_enum"[]`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_aprovacao" ALTER COLUMN "tipo_requisicao" SET DEFAULT '{producao}'`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" TYPE "liberacao_brinde"."tipo_requisicao_enum" USING "tipo_requisicao"::"text"::"liberacao_brinde"."tipo_requisicao_enum"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "tipo_requisicao" SET DEFAULT 'producao'`);
        await queryRunner.query(`DROP TYPE "liberacao_brinde"."tipo_requisicao_enum_old"`);
    }

}

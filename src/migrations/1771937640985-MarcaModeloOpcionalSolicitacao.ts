import { MigrationInterface, QueryRunner } from "typeorm";

export class MarcaModeloOpcionalSolicitacao1771937640985 implements MigrationInterface {
    name = 'MarcaModeloOpcionalSolicitacao1771937640985'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "marca" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "modelo" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "modelo" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "marca" SET NOT NULL`);
    }

}

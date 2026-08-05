import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVoucherBaixado1785932536866 implements MigrationInterface {
    name = 'AddVoucherBaixado1785932536866'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ADD "voucher_baixado" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" DROP COLUMN "voucher_baixado"`);
    }

}

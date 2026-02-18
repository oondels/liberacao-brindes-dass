import { MigrationInterface, QueryRunner } from "typeorm";

export class CodigoVoucher1771419597377 implements MigrationInterface {
    name = 'CodigoVoucher1771419597377'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."vounchers" ADD "codigo_voucher" character varying(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."vounchers" ADD CONSTRAINT "UQ_a743d9069c5a890e1f2650dd7ad" UNIQUE ("codigo_voucher")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."vounchers" DROP CONSTRAINT "UQ_a743d9069c5a890e1f2650dd7ad"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."vounchers" DROP COLUMN "codigo_voucher"`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class VoucherTable1770814836296 implements MigrationInterface {
    name = 'VoucherTable1770814836296'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "liberacao_brinde"."IDX_17199233c8ad3418d360d0f42e"`);
        await queryRunner.query(`CREATE TYPE "liberacao_brinde"."status_vouncher_solicitacao" AS ENUM('pendente', 'resgatado', 'cancelado')`);
        await queryRunner.query(`CREATE TABLE "liberacao_brinde"."vounchers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "liberacao_brinde"."status_vouncher_solicitacao" NOT NULL DEFAULT 'pendente', "ativo" boolean NOT NULL DEFAULT true, "data_resgate" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "solicitacao_id" uuid, CONSTRAINT "REL_3c4e396d0d14b4c979679795af" UNIQUE ("solicitacao_id"), CONSTRAINT "PK_4f754040c6193d78a54e37abd36" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" DROP COLUMN "codigo_unico"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" DROP COLUMN "data_codigo_usado"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "entregue" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."vounchers" ADD CONSTRAINT "FK_3c4e396d0d14b4c979679795af2" FOREIGN KEY ("solicitacao_id") REFERENCES "liberacao_brinde"."solicitacoes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."vounchers" DROP CONSTRAINT "FK_3c4e396d0d14b4c979679795af2"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ALTER COLUMN "entregue" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ADD "data_codigo_usado" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ADD "codigo_unico" uuid`);
        await queryRunner.query(`DROP TABLE "liberacao_brinde"."vounchers"`);
        await queryRunner.query(`DROP TYPE "liberacao_brinde"."status_vouncher_solicitacao"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_17199233c8ad3418d360d0f42e" ON "liberacao_brinde"."solicitacoes" ("codigo_unico") `);
    }

}

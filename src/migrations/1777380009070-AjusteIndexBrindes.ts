import { MigrationInterface, QueryRunner } from "typeorm";

export class Teste1777380009070 implements MigrationInterface {
    name = 'Teste1777380009070'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" DROP CONSTRAINT "FK_solicitacoes_brinde_id"`);
        await queryRunner.query(`DROP INDEX "liberacao_brinde"."IDX_solicitacoes_brinde_id"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ADD CONSTRAINT "FK_7b73d86d33e2cc8a288f2d01e54" FOREIGN KEY ("brinde_id") REFERENCES "liberacao_brinde"."brindes_ativos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" DROP CONSTRAINT "FK_7b73d86d33e2cc8a288f2d01e54"`);
        await queryRunner.query(`CREATE INDEX "IDX_solicitacoes_brinde_id" ON "liberacao_brinde"."solicitacoes" ("brinde_id") `);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ADD CONSTRAINT "FK_solicitacoes_brinde_id" FOREIGN KEY ("brinde_id") REFERENCES "liberacao_brinde"."brindes_ativos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

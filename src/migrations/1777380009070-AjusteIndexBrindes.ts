import { MigrationInterface, QueryRunner } from "typeorm";

export class Teste1777380009070 implements MigrationInterface {
    name = 'Teste1777380009070'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const tables = await queryRunner.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'liberacao_brinde'
              AND table_name IN ('solicitacoes', 'brindes_ativos')
        `);

        const hasSolicitacoes = tables.some((table: { table_name: string }) => table.table_name === 'solicitacoes');
        const hasBrindesAtivos = tables.some((table: { table_name: string }) => table.table_name === 'brindes_ativos');

        if (!hasSolicitacoes || !hasBrindesAtivos) {
            return;
        }

        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" ADD CONSTRAINT "FK_7b73d86d33e2cc8a288f2d01e54" FOREIGN KEY ("brinde_id") REFERENCES "liberacao_brinde"."brindes_ativos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const constraint = await queryRunner.query(`
            SELECT 1
            FROM information_schema.table_constraints
            WHERE constraint_schema = 'liberacao_brinde'
              AND table_name = 'solicitacoes'
              AND constraint_name = 'FK_7b73d86d33e2cc8a288f2d01e54'
        `);

        if (!constraint.length) {
            return;
        }

        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."solicitacoes" DROP CONSTRAINT "FK_7b73d86d33e2cc8a288f2d01e54"`);
    }

}

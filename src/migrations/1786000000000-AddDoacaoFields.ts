import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDoacaoFields1786000000000 implements MigrationInterface {
  name = 'AddDoacaoFields1786000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "liberacao_brinde"."solicitacoes" ADD COLUMN IF NOT EXISTS "subgrupo_doacao" varchar(50)`
    );
    await queryRunner.query(
      `ALTER TABLE "liberacao_brinde"."solicitacoes" ADD COLUMN IF NOT EXISTS "subgrupo_doacao_outros" varchar(100)`
    );
    await queryRunner.query(
      `ALTER TABLE "liberacao_brinde"."solicitacoes" ADD COLUMN IF NOT EXISTS "beneficiario_doacao" varchar(150)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "liberacao_brinde"."solicitacoes" DROP COLUMN IF EXISTS "beneficiario_doacao"`
    );
    await queryRunner.query(
      `ALTER TABLE "liberacao_brinde"."solicitacoes" DROP COLUMN IF EXISTS "subgrupo_doacao_outros"`
    );
    await queryRunner.query(
      `ALTER TABLE "liberacao_brinde"."solicitacoes" DROP COLUMN IF EXISTS "subgrupo_doacao"`
    );
  }
}

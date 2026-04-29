import { MigrationInterface, QueryRunner } from "typeorm";

export class UserBipagem1777381378961 implements MigrationInterface {
    name = 'UserBipagem1777381378961'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "liberacao_brinde"."user_bipagem" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "nome" character varying(255) NOT NULL, "matricula" bigint NOT NULL, "rfid" bigint, "codbarras" bigint, "tipo_requisicao" "liberacao_brinde"."tipo_requisicao_enum" array NOT NULL, "created_by" bigint, "updated_by" bigint, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b53b41dd9b864dfcc1e5f9cfede" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_user_bipagem_matricula_unique" ON "liberacao_brinde"."user_bipagem" ("matricula") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "liberacao_brinde"."IDX_user_bipagem_matricula_unique"`);
        await queryRunner.query(`DROP TABLE "liberacao_brinde"."user_bipagem"`);
    }

}

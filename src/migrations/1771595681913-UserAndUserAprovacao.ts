import { MigrationInterface, QueryRunner } from "typeorm";

export class UserAndUserAprovacao1771595681913 implements MigrationInterface {
    name = 'UserAndUserAprovacao1771595681913'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "liberacao_brinde"."user_aprovacao" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nome" character varying(255) NOT NULL, "matricula" bigint NOT NULL, "rfid" bigint, "codbarras" bigint, "tipo_requisicao" "liberacao_brinde"."tipo_requisicao_enum" array NOT NULL DEFAULT '{producao}', "updated_by" bigint, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8d9a0bc165427d3b6ca34fa2186" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "liberacao_brinde"."user_aprovacao"`);
    }

}

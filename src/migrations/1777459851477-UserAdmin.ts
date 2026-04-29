import { MigrationInterface, QueryRunner } from "typeorm";

export class UserAdmin1777459851477 implements MigrationInterface {
    name = 'UserAdmin1777459851477'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "liberacao_brinde"."user_admin" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "matricula" bigint NOT NULL, "nome" character varying(255) NOT NULL, "tipo_requisicao" "liberacao_brinde"."tipo_requisicao_enum" array, "created_by_matricula" bigint NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c143511e72fac735b8006051e55" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_user_admin_matricula_unique" ON "liberacao_brinde"."user_admin" ("matricula") `);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_admin" ADD CONSTRAINT "FK_7265277a871db220d26d34035df" FOREIGN KEY ("created_by_matricula") REFERENCES "autenticacao"."usuarios"("matricula") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_admin" DROP CONSTRAINT "FK_7265277a871db220d26d34035df"`);
        await queryRunner.query(`DROP INDEX "liberacao_brinde"."IDX_user_admin_matricula_unique"`);
        await queryRunner.query(`DROP TABLE "liberacao_brinde"."user_admin"`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class UserCriacaoSolicitacao1771933705752 implements MigrationInterface {
    name = 'UserCriacaoSolicitacao1771933705752'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "liberacao_brinde"."user_criacao_solicitacao" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "matricula" bigint NOT NULL, "nome" character varying(255) NOT NULL, "rfid" bigint, "codbarras" bigint, "created_by" bigint NOT NULL, "updated_by" bigint, "tipo_requisicao" "liberacao_brinde"."tipo_requisicao_enum" array NOT NULL DEFAULT '{producao}', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_dd3e1c7a16588ab37b9780d5338" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_user_criacao_solicitacao_matricula_unique" ON "liberacao_brinde"."user_criacao_solicitacao" ("matricula") `);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_criacao_solicitacao" ADD CONSTRAINT "FK_c10e77466419cfb9f54de57f453" FOREIGN KEY ("created_by") REFERENCES "autenticacao"."usuarios"("matricula") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_criacao_solicitacao" ADD CONSTRAINT "FK_e970b3deb526eec9f2ec9d212f0" FOREIGN KEY ("updated_by") REFERENCES "autenticacao"."usuarios"("matricula") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_criacao_solicitacao" DROP CONSTRAINT "FK_e970b3deb526eec9f2ec9d212f0"`);
        await queryRunner.query(`ALTER TABLE "liberacao_brinde"."user_criacao_solicitacao" DROP CONSTRAINT "FK_c10e77466419cfb9f54de57f453"`);
        await queryRunner.query(`DROP INDEX "liberacao_brinde"."IDX_user_criacao_solicitacao_matricula_unique"`);
        await queryRunner.query(`DROP TABLE "liberacao_brinde"."user_criacao_solicitacao"`);
    }

}

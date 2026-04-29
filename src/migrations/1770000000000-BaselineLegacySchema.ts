import { MigrationInterface, QueryRunner } from "typeorm";

export class BaselineLegacySchema1770000000000 implements MigrationInterface {
    name = 'BaselineLegacySchema1770000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const result = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_schema = 'liberacao_brinde'
                  AND table_name = 'solicitacoes'
            ) AS "exists"
        `);

        if (result[0]?.exists) {
            return;
        }

        await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "liberacao_brinde"`);
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_type t
                    JOIN pg_namespace n ON n.oid = t.typnamespace
                    WHERE t.typname = 'tipo_requisicao_enum'
                      AND n.nspname = 'liberacao_brinde'
                ) THEN
                    CREATE TYPE "liberacao_brinde"."tipo_requisicao_enum" AS ENUM('TESTE_CALCE', 'PRODUCAO', 'SOBRA');
                END IF;
            END
            $$;
        `);
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_type t
                    JOIN pg_namespace n ON n.oid = t.typnamespace
                    WHERE t.typname = 'status_solicitacao_brinde_enum'
                      AND n.nspname = 'liberacao_brinde'
                ) THEN
                    CREATE TYPE "liberacao_brinde"."status_solicitacao_brinde_enum" AS ENUM('PENDENTE_APROVACAO', 'APROVADO', 'REJEITADO', 'RETIRADO', 'CANCELADO');
                END IF;
            END
            $$;
        `);
        await queryRunner.query(`
            CREATE TABLE "liberacao_brinde"."solicitacoes" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "nome" character varying(255) NOT NULL,
                "matricula" bigint NOT NULL,
                "rfid" bigint,
                "codbarras" bigint,
                "setor" character varying(255) NOT NULL,
                "gerente" character varying(255) NOT NULL,
                "tipo_requisicao" "liberacao_brinde"."tipo_requisicao_enum" NOT NULL DEFAULT 'PRODUCAO',
                "usuario_criador" bigint NOT NULL,
                "marca" character varying(40) NOT NULL,
                "modelo" character varying(60) NOT NULL,
                "num_calce" smallint NOT NULL,
                "entregue" boolean NOT NULL DEFAULT false,
                "entregue_por" bigint,
                "data_entregue" TIMESTAMP,
                "gerente_aprovacao" bigint NOT NULL,
                "data_aprovado" TIMESTAMP,
                "status" "liberacao_brinde"."status_solicitacao_brinde_enum" NOT NULL DEFAULT 'PENDENTE_APROVACAO',
                "codigo_unico" uuid,
                "data_codigo_usado" TIMESTAMP,
                "updated_by" bigint,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_6d5064d09350d0c8f8fbc3cf34b" PRIMARY KEY ("id"),
                CONSTRAINT "solicitacoes_codigo_unico_key" UNIQUE ("codigo_unico"),
                CONSTRAINT "solicitacoes_num_calce_check" CHECK (((num_calce >= 10) AND (num_calce <= 60)))
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const result = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_schema = 'liberacao_brinde'
                  AND table_name = 'solicitacoes'
            ) AS "exists"
        `);

        if (!result[0]?.exists) {
            return;
        }

        await queryRunner.query(`DROP TABLE "liberacao_brinde"."solicitacoes"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "liberacao_brinde"."status_solicitacao_brinde_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "liberacao_brinde"."tipo_requisicao_enum"`);
    }
}

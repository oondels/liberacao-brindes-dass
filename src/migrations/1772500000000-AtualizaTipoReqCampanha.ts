import { MigrationInterface, QueryRunner } from "typeorm";

export class AtualizaTipoReqCampanha1772500000000 implements MigrationInterface {
    name = 'AtualizaTipoReqCampanha1772500000000'

    public async up(_queryRunner: QueryRunner): Promise<void> {
        // Migration superseded by 1772021828759. Intencionalmente vazio.
    }

    public async down(_queryRunner: QueryRunner): Promise<void> {
        // Migration superseded by 1772021828759. Intencionalmente vazio.
    }
}

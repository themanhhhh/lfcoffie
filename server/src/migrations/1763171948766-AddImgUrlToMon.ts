import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImgUrlToMon1763171948766 implements MigrationInterface {
    name = 'AddImgUrlToMon1763171948766'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mon" ADD "imgUrl" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mon" DROP COLUMN "imgUrl"`);
    }

}

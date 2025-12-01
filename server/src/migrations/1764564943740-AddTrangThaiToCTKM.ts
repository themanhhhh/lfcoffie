import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTrangThaiToCTKM1764564943740 implements MigrationInterface {
    name = 'AddTrangThaiToCTKM1764564943740'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ctkm" ADD "TrangThai" character varying(20) NOT NULL DEFAULT 'hoạt động'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ctkm" DROP COLUMN "TrangThai"`);
    }

}

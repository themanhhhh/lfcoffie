import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLoaiDonHangToDonHang1764700000000 implements MigrationInterface {
    name = 'AddLoaiDonHangToDonHang1764700000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add LoaiDonHang column with default value "tại quán"
        await queryRunner.query(`ALTER TABLE "donhang" ADD "LoaiDonHang" character varying(50) DEFAULT 'tại quán'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "donhang" DROP COLUMN "LoaiDonHang"`);
    }
}

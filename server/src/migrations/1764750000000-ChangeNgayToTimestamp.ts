import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeNgayToTimestamp1764750000000 implements MigrationInterface {
    name = 'ChangeNgayToTimestamp1764750000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Change column type from date to timestamp
        await queryRunner.query(`ALTER TABLE "donhang" ALTER COLUMN "Ngay" TYPE TIMESTAMP USING "Ngay"::timestamp`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert back to date
        await queryRunner.query(`ALTER TABLE "donhang" ALTER COLUMN "Ngay" TYPE DATE USING "Ngay"::date`);
    }
}

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMaComboToDSMonTrongCombo1764489062739 implements MigrationInterface {
    name = 'AddMaComboToDSMonTrongCombo1764489062739'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Thêm cột MaCombo vào bảng dsmontrongcombo
        await queryRunner.query(`ALTER TABLE "dsmontrongcombo" ADD "MaCombo" character varying(10)`);
        
        // Thêm foreign key constraint nếu bảng combo đã tồn tại
        // await queryRunner.query(`ALTER TABLE "dsmontrongcombo" ADD CONSTRAINT "FK_dsmontrongcombo_combo" FOREIGN KEY ("MaCombo") REFERENCES "combo"("MaCombo") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa foreign key constraint nếu có
        // await queryRunner.query(`ALTER TABLE "dsmontrongcombo" DROP CONSTRAINT IF EXISTS "FK_dsmontrongcombo_combo"`);
        
        // Xóa cột MaCombo
        await queryRunner.query(`ALTER TABLE "dsmontrongcombo" DROP COLUMN "MaCombo"`);
    }

}


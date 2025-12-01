"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMaComboToDSMonTrongCombo1764489062739 = void 0;
class AddMaComboToDSMonTrongCombo1764489062739 {
    constructor() {
        this.name = 'AddMaComboToDSMonTrongCombo1764489062739';
    }
    async up(queryRunner) {
        // Thêm cột MaCombo vào bảng dsmontrongcombo
        await queryRunner.query(`ALTER TABLE "dsmontrongcombo" ADD "MaCombo" character varying(10)`);
        // Thêm foreign key constraint nếu bảng combo đã tồn tại
        // await queryRunner.query(`ALTER TABLE "dsmontrongcombo" ADD CONSTRAINT "FK_dsmontrongcombo_combo" FOREIGN KEY ("MaCombo") REFERENCES "combo"("MaCombo") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        // Xóa foreign key constraint nếu có
        // await queryRunner.query(`ALTER TABLE "dsmontrongcombo" DROP CONSTRAINT IF EXISTS "FK_dsmontrongcombo_combo"`);
        // Xóa cột MaCombo
        await queryRunner.query(`ALTER TABLE "dsmontrongcombo" DROP COLUMN "MaCombo"`);
    }
}
exports.AddMaComboToDSMonTrongCombo1764489062739 = AddMaComboToDSMonTrongCombo1764489062739;

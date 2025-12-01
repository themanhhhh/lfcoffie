"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddTrangThaiToCTKM1764564943740 = void 0;
class AddTrangThaiToCTKM1764564943740 {
    constructor() {
        this.name = 'AddTrangThaiToCTKM1764564943740';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "ctkm" ADD "TrangThai" character varying(20) NOT NULL DEFAULT 'hoạt động'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "ctkm" DROP COLUMN "TrangThai"`);
    }
}
exports.AddTrangThaiToCTKM1764564943740 = AddTrangThaiToCTKM1764564943740;

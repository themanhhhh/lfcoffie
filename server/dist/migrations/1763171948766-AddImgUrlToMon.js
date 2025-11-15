"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddImgUrlToMon1763171948766 = void 0;
class AddImgUrlToMon1763171948766 {
    constructor() {
        this.name = 'AddImgUrlToMon1763171948766';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "mon" ADD "imgUrl" character varying(255)`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "mon" DROP COLUMN "imgUrl"`);
    }
}
exports.AddImgUrlToMon1763171948766 = AddImgUrlToMon1763171948766;

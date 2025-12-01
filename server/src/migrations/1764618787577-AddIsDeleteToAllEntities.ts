import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsDeleteToAllEntities1764618787577 implements MigrationInterface {
    name = 'AddIsDeleteToAllEntities1764618787577'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "giamhoadon" ADD "isDelete" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "tuychon" ADD "isDelete" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "tuychondonhang" ADD "isDelete" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "chitietdonhang" ADD "isDelete" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "combo" ADD "isDelete" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "dsmontrongcombo" ADD "isDelete" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "mon" ADD "isDelete" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "giammon" ADD "isDelete" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "ctkm" ADD "isDelete" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "donhang" ADD "isDelete" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "nghiepvu" ADD "isDelete" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "thuchi" ADD "isDelete" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "phienlamviec" ADD "isDelete" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "calam" ADD "isDelete" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "nhanvien" ADD "isDelete" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "theban" ADD "isDelete" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "theban" DROP COLUMN "isDelete"`);
        await queryRunner.query(`ALTER TABLE "nhanvien" DROP COLUMN "isDelete"`);
        await queryRunner.query(`ALTER TABLE "calam" DROP COLUMN "isDelete"`);
        await queryRunner.query(`ALTER TABLE "phienlamviec" DROP COLUMN "isDelete"`);
        await queryRunner.query(`ALTER TABLE "thuchi" DROP COLUMN "isDelete"`);
        await queryRunner.query(`ALTER TABLE "nghiepvu" DROP COLUMN "isDelete"`);
        await queryRunner.query(`ALTER TABLE "donhang" DROP COLUMN "isDelete"`);
        await queryRunner.query(`ALTER TABLE "ctkm" DROP COLUMN "isDelete"`);
        await queryRunner.query(`ALTER TABLE "giammon" DROP COLUMN "isDelete"`);
        await queryRunner.query(`ALTER TABLE "mon" DROP COLUMN "isDelete"`);
        await queryRunner.query(`ALTER TABLE "dsmontrongcombo" DROP COLUMN "isDelete"`);
        await queryRunner.query(`ALTER TABLE "combo" DROP COLUMN "isDelete"`);
        await queryRunner.query(`ALTER TABLE "chitietdonhang" DROP COLUMN "isDelete"`);
        await queryRunner.query(`ALTER TABLE "tuychondonhang" DROP COLUMN "isDelete"`);
        await queryRunner.query(`ALTER TABLE "tuychon" DROP COLUMN "isDelete"`);
        await queryRunner.query(`ALTER TABLE "giamhoadon" DROP COLUMN "isDelete"`);
    }

}

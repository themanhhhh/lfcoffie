import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateThuChiForeignKeys1764553052950 implements MigrationInterface {
    name = 'UpdateThuChiForeignKeys1764553052950'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "combo" DROP CONSTRAINT "FK_6193f4f7a2236f789295a3d0fb4"`);
        await queryRunner.query(`ALTER TABLE "combo" DROP COLUMN "MaDSMonCombo"`);
        await queryRunner.query(`ALTER TABLE "dsmontrongcombo" ADD CONSTRAINT "FK_1a50496c882efe66828b6247951" FOREIGN KEY ("MaCombo") REFERENCES "combo"("MaCombo") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dsmontrongcombo" DROP CONSTRAINT "FK_1a50496c882efe66828b6247951"`);
        await queryRunner.query(`ALTER TABLE "combo" ADD "MaDSMonCombo" character varying(10)`);
        await queryRunner.query(`ALTER TABLE "combo" ADD CONSTRAINT "FK_6193f4f7a2236f789295a3d0fb4" FOREIGN KEY ("MaDSMonCombo") REFERENCES "dsmontrongcombo"("MaDSMonCombo") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

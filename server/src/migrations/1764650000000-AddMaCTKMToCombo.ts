import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMaCTKMToCombo1764650000000 implements MigrationInterface {
    name = 'AddMaCTKMToCombo1764650000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add MaCTKM column
        await queryRunner.query(`ALTER TABLE "combo" ADD "MaCTKM" character varying(10)`);

        // Add foreign key constraint
        await queryRunner.query(`ALTER TABLE "combo" ADD CONSTRAINT "FK_combo_ctkm" FOREIGN KEY ("MaCTKM") REFERENCES "ctkm"("MaCTKM") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "combo" DROP CONSTRAINT "FK_combo_ctkm"`);
        await queryRunner.query(`ALTER TABLE "combo" DROP COLUMN "MaCTKM"`);
    }
}

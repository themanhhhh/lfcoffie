import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateThuChiTable1764568155047 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Kiểm tra xem bảng đã tồn tại chưa
        const table = await queryRunner.getTable("thuchi");
        
        if (!table) {
            // Tạo bảng thuchi nếu chưa tồn tại
            await queryRunner.query(`
                CREATE TABLE "thuchi" (
                    "MaGiaoDich" character varying(10) NOT NULL,
                    "MaPhienLamViec" character varying(10),
                    "MaNghiepVu" character varying(10),
                    "ThoiGian" TIMESTAMP NOT NULL,
                    "PhuongThucThanhToan" character varying(50) NOT NULL,
                    "GhiChu" text,
                    "SoTien" integer NOT NULL,
                    CONSTRAINT "PK_thuchi_MaGiaoDich" PRIMARY KEY ("MaGiaoDich")
                )
            `);
            
            // Tạo foreign keys nếu các bảng tham chiếu đã tồn tại
            const phienLamViecTable = await queryRunner.getTable("phienlamviec");
            const nghiepVuTable = await queryRunner.getTable("nghiepvu");
            
            if (phienLamViecTable) {
                await queryRunner.query(`
                    ALTER TABLE "thuchi" 
                    ADD CONSTRAINT "FK_thuchi_phienlamviec" 
                    FOREIGN KEY ("MaPhienLamViec") 
                    REFERENCES "phienlamviec"("MaPhienLamViec") 
                    ON DELETE SET NULL 
                    ON UPDATE NO ACTION
                `);
            }
            
            if (nghiepVuTable) {
                await queryRunner.query(`
                    ALTER TABLE "thuchi" 
                    ADD CONSTRAINT "FK_thuchi_nghiepvu" 
                    FOREIGN KEY ("MaNghiepVu") 
                    REFERENCES "nghiepvu"("MaNghiepVu") 
                    ON DELETE SET NULL 
                    ON UPDATE NO ACTION
                `);
            }
        } else {
            // Nếu bảng đã tồn tại, đảm bảo các cột cần thiết có mặt
            const columns = table.columns.map(col => col.name);
            
            // Thêm cột MaPhienLamViec nếu chưa có
            if (!columns.includes("MaPhienLamViec")) {
                await queryRunner.query(`ALTER TABLE "thuchi" ADD "MaPhienLamViec" character varying(10)`);
            }
            
            // Thêm cột MaNghiepVu nếu chưa có
            if (!columns.includes("MaNghiepVu")) {
                await queryRunner.query(`ALTER TABLE "thuchi" ADD "MaNghiepVu" character varying(10)`);
            }
            
            // Thêm foreign keys nếu chưa có
            const phienLamViecTable = await queryRunner.getTable("phienlamviec");
            const nghiepVuTable = await queryRunner.getTable("nghiepvu");
            
            const foreignKeys = table.foreignKeys;
            const hasPhienLamViecFK = foreignKeys.some(fk => 
                fk.columnNames.includes("MaPhienLamViec")
            );
            const hasNghiepVuFK = foreignKeys.some(fk => 
                fk.columnNames.includes("MaNghiepVu")
            );
            
            if (phienLamViecTable && !hasPhienLamViecFK) {
                await queryRunner.query(`
                    ALTER TABLE "thuchi" 
                    ADD CONSTRAINT "FK_thuchi_phienlamviec" 
                    FOREIGN KEY ("MaPhienLamViec") 
                    REFERENCES "phienlamviec"("MaPhienLamViec") 
                    ON DELETE SET NULL 
                    ON UPDATE NO ACTION
                `);
            }
            
            if (nghiepVuTable && !hasNghiepVuFK) {
                await queryRunner.query(`
                    ALTER TABLE "thuchi" 
                    ADD CONSTRAINT "FK_thuchi_nghiepvu" 
                    FOREIGN KEY ("MaNghiepVu") 
                    REFERENCES "nghiepvu"("MaNghiepVu") 
                    ON DELETE SET NULL 
                    ON UPDATE NO ACTION
                `);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa foreign keys trước
        await queryRunner.query(`ALTER TABLE "thuchi" DROP CONSTRAINT IF EXISTS "FK_thuchi_nghiepvu"`);
        await queryRunner.query(`ALTER TABLE "thuchi" DROP CONSTRAINT IF EXISTS "FK_thuchi_phienlamviec"`);
        
        // Xóa bảng (chỉ khi cần rollback hoàn toàn)
        // await queryRunner.query(`DROP TABLE IF EXISTS "thuchi"`);
    }

}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddStockFieldsToNguyenLieu1760989600000 = void 0;
/**
 * Migration: Thêm các trường quản lý tồn kho vào bảng nguyenlieu
 *
 * Mục đích:
 * - Thêm trường tonKho: Số lượng tồn kho hiện tại
 * - Thêm trường dinhMucToiThieu: Định mức tối thiểu cần duy trì
 * - Thêm trường tieuThuTrungBinh: Mức tiêu thụ trung bình mỗi ngày
 *
 * Điều kiện tiên quyết:
 * - Bảng nguyenlieu đã tồn tại
 *
 * Tác động:
 * - Thêm 3 cột mới vào bảng nguyenlieu
 * - Tất cả các bản ghi hiện có sẽ có giá trị mặc định là 0
 * - Có thể rollback bằng migration:revert
 */
class AddStockFieldsToNguyenLieu1760989600000 {
    async up(queryRunner) {
        console.log('⏳ Bắt đầu migration: Thêm fields tồn kho vào nguyenlieu...');
        // Thêm cột tonKho (Tồn kho hiện tại)
        await queryRunner.query(`
            ALTER TABLE "nguyenlieu" 
            ADD COLUMN IF NOT EXISTS "tonKho" integer DEFAULT 0
        `);
        console.log('✅ Đã thêm cột tonKho');
        // Thêm cột dinhMucToiThieu (Định mức tối thiểu)
        await queryRunner.query(`
            ALTER TABLE "nguyenlieu" 
            ADD COLUMN IF NOT EXISTS "dinhMucToiThieu" integer DEFAULT 0
        `);
        console.log('✅ Đã thêm cột dinhMucToiThieu');
        // Thêm cột tieuThuTrungBinh (Tiêu thụ trung bình/ngày)
        await queryRunner.query(`
            ALTER TABLE "nguyenlieu" 
            ADD COLUMN IF NOT EXISTS "tieuThuTrungBinh" real DEFAULT 0
        `);
        console.log('✅ Đã thêm cột tieuThuTrungBinh');
        // Tạo index để tìm kiếm nguyên liệu sắp hết hàng nhanh hơn
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_nguyenlieu_tonkho_low" 
            ON "nguyenlieu" ("tonKho", "dinhMucToiThieu")
            WHERE "tonKho" < "dinhMucToiThieu"
        `);
        console.log('✅ Đã tạo index cho tìm kiếm nguyên liệu sắp hết');
        console.log('🎉 Migration hoàn tất thành công!');
    }
    async down(queryRunner) {
        console.log('⏳ Bắt đầu rollback: Xóa fields tồn kho khỏi nguyenlieu...');
        // Xóa index
        await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_nguyenlieu_tonkho_low"
        `);
        console.log('✅ Đã xóa index');
        // Xóa các cột theo thứ tự ngược lại
        await queryRunner.query(`
            ALTER TABLE "nguyenlieu" DROP COLUMN IF EXISTS "tieuThuTrungBinh"
        `);
        console.log('✅ Đã xóa cột tieuThuTrungBinh');
        await queryRunner.query(`
            ALTER TABLE "nguyenlieu" DROP COLUMN IF EXISTS "dinhMucToiThieu"
        `);
        console.log('✅ Đã xóa cột dinhMucToiThieu');
        await queryRunner.query(`
            ALTER TABLE "nguyenlieu" DROP COLUMN IF EXISTS "tonKho"
        `);
        console.log('✅ Đã xóa cột tonKho');
        console.log('🔙 Rollback hoàn tất thành công!');
    }
}
exports.AddStockFieldsToNguyenLieu1760989600000 = AddStockFieldsToNguyenLieu1760989600000;

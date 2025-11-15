"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropOldTables1763149295970 = void 0;
/**
 * Migration: Xóa các bảng cũ không còn sử dụng trong ERD mới
 *
 * Các bảng sẽ bị xóa:
 * - loaimon: Đã thay bằng trường LoaiMon (string) trong bảng mon
 * - nhomthucdon: Đã thay bằng trường NhomMon (string) trong bảng mon
 * - size: Không còn sử dụng
 * - khuyenmai: Đã thay bằng ctkm
 * - nguyenlieu: Không còn sử dụng trong ERD mới
 * - phieunhap, chitietphieunhap: Không còn sử dụng
 * - phieuxuat, chitietphieuxuat: Không còn sử dụng
 * - phieuthu, chitietphieuthu: Không còn sử dụng
 * - phieuchi, chitietphieuchi: Không còn sử dụng
 * - hoadon: Đã thay bằng donhang (bảng hoadon cũ có thể còn tồn tại)
 * - chitiethoadon: Đã thay bằng chitietdonhang (bảng chitiethoadon cũ có thể còn tồn tại)
 */
class DropOldTables1763149295970 {
    constructor() {
        this.name = 'DropOldTables1763149295970';
    }
    async up(queryRunner) {
        console.log('⏳ Bắt đầu migration: Xóa các bảng cũ không còn sử dụng...');
        // Xóa các bảng chi tiết trước (có foreign keys)
        await queryRunner.query(`DROP TABLE IF EXISTS "chitietphieuchi" CASCADE`);
        console.log('✅ Đã xóa bảng chitietphieuchi');
        await queryRunner.query(`DROP TABLE IF EXISTS "chitietphieuthu" CASCADE`);
        console.log('✅ Đã xóa bảng chitietphieuthu');
        await queryRunner.query(`DROP TABLE IF EXISTS "chitietphieuxuat" CASCADE`);
        console.log('✅ Đã xóa bảng chitietphieuxuat');
        await queryRunner.query(`DROP TABLE IF EXISTS "chitietphieunhap" CASCADE`);
        console.log('✅ Đã xóa bảng chitietphieunhap');
        await queryRunner.query(`DROP TABLE IF EXISTS "chitiethoadon" CASCADE`);
        console.log('✅ Đã xóa bảng chitiethoadon (cũ)');
        // Xóa các bảng chính
        await queryRunner.query(`DROP TABLE IF EXISTS "phieuchi" CASCADE`);
        console.log('✅ Đã xóa bảng phieuchi');
        await queryRunner.query(`DROP TABLE IF EXISTS "phieuthu" CASCADE`);
        console.log('✅ Đã xóa bảng phieuthu');
        await queryRunner.query(`DROP TABLE IF EXISTS "phieuxuat" CASCADE`);
        console.log('✅ Đã xóa bảng phieuxuat');
        await queryRunner.query(`DROP TABLE IF EXISTS "phieunhap" CASCADE`);
        console.log('✅ Đã xóa bảng phieunhap');
        await queryRunner.query(`DROP TABLE IF EXISTS "hoadon" CASCADE`);
        console.log('✅ Đã xóa bảng hoadon (cũ)');
        await queryRunner.query(`DROP TABLE IF EXISTS "nguyenlieu" CASCADE`);
        console.log('✅ Đã xóa bảng nguyenlieu');
        await queryRunner.query(`DROP TABLE IF EXISTS "khuyenmai" CASCADE`);
        console.log('✅ Đã xóa bảng khuyenmai');
        await queryRunner.query(`DROP TABLE IF EXISTS "size" CASCADE`);
        console.log('✅ Đã xóa bảng size');
        await queryRunner.query(`DROP TABLE IF EXISTS "nhomthucdon" CASCADE`);
        console.log('✅ Đã xóa bảng nhomthucdon');
        await queryRunner.query(`DROP TABLE IF EXISTS "loaimon" CASCADE`);
        console.log('✅ Đã xóa bảng loaimon');
        console.log('🎉 Migration hoàn tất thành công!');
    }
    async down(queryRunner) {
        console.log('⏳ Bắt đầu rollback: Khôi phục các bảng cũ...');
        console.log('⚠️  Lưu ý: Rollback này chỉ tạo lại cấu trúc bảng, không khôi phục dữ liệu');
        // Khôi phục các bảng theo thứ tự ngược lại
        // (Chỉ tạo lại cấu trúc cơ bản, không có dữ liệu)
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "loaimon" (
                "maLoaiMon" character varying(10) NOT NULL,
                "tenLoaiMon" character varying(50) NOT NULL,
                CONSTRAINT "PK_loaimon" PRIMARY KEY ("maLoaiMon")
            )
        `);
        console.log('✅ Đã khôi phục bảng loaimon');
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "nhomthucdon" (
                "maNhomThucDon" character varying(10) NOT NULL,
                "tenNhomThucDon" character varying(50) NOT NULL,
                CONSTRAINT "PK_nhomthucdon" PRIMARY KEY ("maNhomThucDon")
            )
        `);
        console.log('✅ Đã khôi phục bảng nhomthucdon');
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "size" (
                "maSize" character varying(10) NOT NULL,
                "tenSize" character varying(20) NOT NULL,
                CONSTRAINT "PK_size" PRIMARY KEY ("maSize")
            )
        `);
        console.log('✅ Đã khôi phục bảng size');
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "khuyenmai" (
                "maKM" character varying(10) NOT NULL,
                "tenKM" character varying(100) NOT NULL,
                CONSTRAINT "PK_khuyenmai" PRIMARY KEY ("maKM")
            )
        `);
        console.log('✅ Đã khôi phục bảng khuyenmai');
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "nguyenlieu" (
                "maNL" character varying(10) NOT NULL,
                "tenNL" character varying(50) NOT NULL,
                CONSTRAINT "PK_nguyenlieu" PRIMARY KEY ("maNL")
            )
        `);
        console.log('✅ Đã khôi phục bảng nguyenlieu');
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "phieunhap" (
                "maPN" character varying(10) NOT NULL,
                "ngay" date NOT NULL,
                CONSTRAINT "PK_phieunhap" PRIMARY KEY ("maPN")
            )
        `);
        console.log('✅ Đã khôi phục bảng phieunhap');
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "chitietphieunhap" (
                "maCTPN" character varying(10) NOT NULL,
                CONSTRAINT "PK_chitietphieunhap" PRIMARY KEY ("maCTPN")
            )
        `);
        console.log('✅ Đã khôi phục bảng chitietphieunhap');
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "phieuxuat" (
                "maPX" character varying(10) NOT NULL,
                "ngay" date NOT NULL,
                CONSTRAINT "PK_phieuxuat" PRIMARY KEY ("maPX")
            )
        `);
        console.log('✅ Đã khôi phục bảng phieuxuat');
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "chitietphieuxuat" (
                "maCTPX" character varying(10) NOT NULL,
                CONSTRAINT "PK_chitietphieuxuat" PRIMARY KEY ("maCTPX")
            )
        `);
        console.log('✅ Đã khôi phục bảng chitietphieuxuat');
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "phieuthu" (
                "maPT" character varying(10) NOT NULL,
                "ngay" date NOT NULL,
                CONSTRAINT "PK_phieuthu" PRIMARY KEY ("maPT")
            )
        `);
        console.log('✅ Đã khôi phục bảng phieuthu');
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "chitietphieuthu" (
                "maCTPT" character varying(10) NOT NULL,
                CONSTRAINT "PK_chitietphieuthu" PRIMARY KEY ("maCTPT")
            )
        `);
        console.log('✅ Đã khôi phục bảng chitietphieuthu');
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "phieuchi" (
                "maPC" character varying(10) NOT NULL,
                "ngay" date NOT NULL,
                CONSTRAINT "PK_phieuchi" PRIMARY KEY ("maPC")
            )
        `);
        console.log('✅ Đã khôi phục bảng phieuchi');
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "chitietphieuchi" (
                "maCTPC" character varying(10) NOT NULL,
                CONSTRAINT "PK_chitietphieuchi" PRIMARY KEY ("maCTPC")
            )
        `);
        console.log('✅ Đã khôi phục bảng chitietphieuchi');
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "hoadon" (
                "maHD" character varying(10) NOT NULL,
                "ngay" date NOT NULL,
                CONSTRAINT "PK_hoadon" PRIMARY KEY ("maHD")
            )
        `);
        console.log('✅ Đã khôi phục bảng hoadon');
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "chitiethoadon" (
                "maCTHD" character varying(10) NOT NULL,
                CONSTRAINT "PK_chitiethoadon" PRIMARY KEY ("maCTHD")
            )
        `);
        console.log('✅ Đã khôi phục bảng chitiethoadon');
        console.log('🔙 Rollback hoàn tất thành công!');
    }
}
exports.DropOldTables1763149295970 = DropOldTables1763149295970;

import { MigrationInterface, QueryRunner } from "typeorm";
import bcrypt from "bcryptjs";

/**
 * Migration: Tạo user admin và ca làm mẫu
 * 
 * Tạo:
 * - Ca làm mẫu (CL001)
 * - User admin (NV001) với:
 *   - Tài khoản: admin
 *   - Mật khẩu: admin123 (sẽ được hash)
 *   - Chức vụ: Quản lý
 */
export class SeedAdminUser1763149500000 implements MigrationInterface {
    name = 'SeedAdminUser1763149500000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Bắt đầu migration: Tạo user admin và ca làm mẫu...');
        
        // Hash password cho admin
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        // Tạo ca làm mẫu nếu chưa có
        const caLamExists = await queryRunner.query(`
            SELECT COUNT(*) FROM "calam" WHERE "MaCaLam" = 'CL001'
        `);
        
        if (parseInt(caLamExists[0].count) === 0) {
            await queryRunner.query(`
                INSERT INTO "calam" ("MaCaLam", "TenCaLam", "ThoiGianBatDau", "ThoiGianKetThuc")
                VALUES ('CL001', 'Ca sáng', '07:00:00', '12:00:00')
                ON CONFLICT DO NOTHING
            `);
            console.log('✅ Đã tạo ca làm CL001');
        } else {
            console.log('ℹ️  Ca làm CL001 đã tồn tại');
        }
        
        // Kiểm tra xem admin user đã tồn tại chưa (theo TaiKhoan hoặc MaNhanVien)
        const adminByTaiKhoan = await queryRunner.query(`
            SELECT COUNT(*) as count FROM "nhanvien" WHERE "TaiKhoan" = 'admin'
        `);
        
        const adminByMaNV = await queryRunner.query(`
            SELECT COUNT(*) as count FROM "nhanvien" WHERE "MaNhanVien" = 'NV001'
        `);
        
        if (parseInt(adminByTaiKhoan[0].count) === 0 && parseInt(adminByMaNV[0].count) === 0) {
            // Tạo admin user mới
            await queryRunner.query(`
                INSERT INTO "nhanvien" (
                    "MaNhanVien", 
                    "TenNhanVien", 
                    "ChucVu", 
                    "GioiTinh", 
                    "NgaySinh", 
                    "TaiKhoan", 
                    "MatKhau", 
                    "TrangThai",
                    "MaCaLam"
                )
                VALUES (
                    'NV001',
                    'Administrator',
                    'Quản lý',
                    'Nam',
                    '1990-01-01',
                    'admin',
                    $1,
                    'hoạt động',
                    'CL001'
                )
            `, [hashedPassword]);
            console.log('✅ Đã tạo user admin');
            console.log('   - Tài khoản: admin');
            console.log('   - Mật khẩu: admin123');
        } else {
            console.log('ℹ️  User admin đã tồn tại, cập nhật thông tin...');
            // Update thông tin cho admin nếu đã tồn tại
            await queryRunner.query(`
                UPDATE "nhanvien" 
                SET "MatKhau" = $1, 
                    "TrangThai" = 'hoạt động',
                    "ChucVu" = 'Quản lý',
                    "TenNhanVien" = 'Administrator',
                    "GioiTinh" = 'Nam',
                    "NgaySinh" = '1990-01-01',
                    "MaCaLam" = 'CL001'
                WHERE "TaiKhoan" = 'admin' OR "MaNhanVien" = 'NV001'
            `, [hashedPassword]);
            console.log('✅ Đã cập nhật thông tin cho admin');
            console.log('   - Tài khoản: admin');
            console.log('   - Mật khẩu: admin123 (đã được cập nhật)');
        }
        
        console.log('🎉 Migration hoàn tất thành công!');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('⏳ Bắt đầu rollback: Xóa user admin...');
        
        await queryRunner.query(`
            DELETE FROM "nhanvien" WHERE "TaiKhoan" = 'admin'
        `);
        console.log('✅ Đã xóa user admin');
        
        // Optionally remove ca làm (chỉ nếu không có nhân viên nào khác dùng)
        const caLamInUse = await queryRunner.query(`
            SELECT COUNT(*) FROM "nhanvien" WHERE "MaCaLam" = 'CL001'
        `);
        
        if (parseInt(caLamInUse[0].count) === 0) {
            await queryRunner.query(`
                DELETE FROM "calam" WHERE "MaCaLam" = 'CL001'
            `);
            console.log('✅ Đã xóa ca làm CL001');
        } else {
            console.log('ℹ️  Ca làm CL001 vẫn đang được sử dụng, không xóa');
        }
        
        console.log('🔙 Rollback hoàn tất thành công!');
    }

}


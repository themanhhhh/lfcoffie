# 📚 Hướng dẫn sử dụng TypeORM Migrations

## 🎯 Giới thiệu

TypeORM Migrations giúp bạn quản lý các thay đổi database schema một cách có kiểm soát, an toàn và có thể rollback.

## ⚙️ Cấu hình

### 1. Data Source đã được cấu hình
```typescript
// src/database/data-source.ts
{
  synchronize: false, // ĐÃ TẮT - dùng migrations thay thế
  migrations: ["src/migrations/**/*.ts"],
  migrationsTableName: "migrations_history"
}
```

### 2. Scripts đã được thêm vào package.json
```json
{
  "migration:generate": "Tạo migration từ thay đổi entities",
  "migration:create": "Tạo migration trống",
  "migration:run": "Chạy tất cả migrations chưa chạy",
  "migration:revert": "Rollback migration gần nhất",
  "migration:show": "Hiển thị trạng thái migrations"
}
```

## 🚀 Workflow sử dụng Migrations

### Bước 1: Thay đổi Entity

Ví dụ: Thêm fields tồn kho vào NguyenLieu

```typescript
// src/entities/NguyenLieu.ts
@Entity({ name: "nguyenlieu" })
export class NguyenLieu {
  @PrimaryColumn({ type: "varchar", length: 10 })
  maNL!: string;

  @Column({ type: "varchar", length: 50 })
  tenNL!: string;

  @Column({ type: "varchar", length: 10 })
  donViTinh!: string;

  // ✨ THÊM MỚI
  @Column({ type: "int", default: 0, nullable: true })
  tonKho?: number; // Tồn kho hiện tại

  @Column({ type: "int", default: 0, nullable: true })
  dinhMucToiThieu?: number; // Định mức tối thiểu

  @Column({ type: "float", default: 0, nullable: true })
  tieuThuTrungBinh?: number; // Tiêu thụ trung bình/ngày
}
```

### Bước 2: Tạo Migration

#### Option A: Tự động generate (Khuyến nghị)
```bash
cd server
npm run migration:generate src/migrations/AddStockFieldsToNguyenLieu
```

TypeORM sẽ tự động phát hiện thay đổi và tạo migration.

#### Option B: Tạo migration trống
```bash
cd server
npm run migration:create src/migrations/AddStockFieldsToNguyenLieu
```

Sau đó tự viết SQL trong file migration.

### Bước 3: Kiểm tra Migration

Mở file migration vừa tạo trong `src/migrations/` và xem lại:

```typescript
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStockFieldsToNguyenLieu1760989503709 implements MigrationInterface {
    
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Thêm cột tonKho
        await queryRunner.query(`
            ALTER TABLE "nguyenlieu" 
            ADD COLUMN "tonKho" integer DEFAULT 0
        `);
        
        // Thêm cột dinhMucToiThieu
        await queryRunner.query(`
            ALTER TABLE "nguyenlieu" 
            ADD COLUMN "dinhMucToiThieu" integer DEFAULT 0
        `);
        
        // Thêm cột tieuThuTrungBinh
        await queryRunner.query(`
            ALTER TABLE "nguyenlieu" 
            ADD COLUMN "tieuThuTrungBinh" real DEFAULT 0
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Rollback: Xóa các cột đã thêm
        await queryRunner.query(`ALTER TABLE "nguyenlieu" DROP COLUMN "tieuThuTrungBinh"`);
        await queryRunner.query(`ALTER TABLE "nguyenlieu" DROP COLUMN "dinhMucToiThieu"`);
        await queryRunner.query(`ALTER TABLE "nguyenlieu" DROP COLUMN "tonKho"`);
    }
}
```

### Bước 4: Chạy Migration

```bash
cd server
npm run migration:run
```

Output:
```
query: SELECT * FROM "migrations_history" "migrations_history" ORDER BY "id" DESC
query: ALTER TABLE "nguyenlieu" ADD COLUMN "tonKho" integer DEFAULT 0
query: ALTER TABLE "nguyenlieu" ADD COLUMN "dinhMucToiThieu" integer DEFAULT 0
query: ALTER TABLE "nguyenlieu" ADD COLUMN "tieuThuTrungBinh" real DEFAULT 0
query: INSERT INTO "migrations_history"("timestamp", "name") VALUES ($1, $2)
Migration AddStockFieldsToNguyenLieu1760989503709 has been executed successfully.
```

### Bước 5: Verify

Kiểm tra database xem các thay đổi đã được áp dụng:

```bash
npm run migration:show
```

Output:
```
[X] AddStockFieldsToNguyenLieu1760989503709  (✓ đã chạy)
```

## 🔄 Rollback Migration

Nếu cần hoàn tác migration gần nhất:

```bash
cd server
npm run migration:revert
```

Lệnh này sẽ chạy phương thức `down()` của migration gần nhất.

## 📋 Các lệnh Migration thường dùng

| Lệnh | Mô tả | Khi nào dùng |
|------|-------|--------------|
| `migration:generate` | Tự động tạo migration từ entity changes | Sau khi thay đổi entities |
| `migration:create` | Tạo migration trống | Khi cần viết SQL custom |
| `migration:run` | Chạy tất cả pending migrations | Deploy, update database |
| `migration:revert` | Rollback migration gần nhất | Khi cần hoàn tác thay đổi |
| `migration:show` | Xem trạng thái migrations | Kiểm tra xem migration nào đã chạy |

## ⚠️ Best Practices

### 1. Luôn test migration trước khi deploy
```bash
# Test trên local database
npm run migration:run

# Verify
npm run migration:show

# Test rollback
npm run migration:revert

# Re-run
npm run migration:run
```

### 2. Đặt tên migration có ý nghĩa
```
✅ Good:
- AddEmailToNhanVien
- CreateKhachHangTable
- AddIndexToHoaDon
- RemoveOldColumnsFromMon

❌ Bad:
- Migration1
- Update
- FixBug
```

### 3. Mỗi migration nên làm 1 việc
```
✅ Good:
- Migration 1: Add email field
- Migration 2: Add index on email

❌ Bad:
- Migration 1: Add email, modify password, delete old columns, create new table
```

### 4. Luôn viết down() method
Đảm bảo có thể rollback nếu cần.

### 5. Backup database trước khi run migration quan trọng
```bash
pg_dump -U postgres -d lofi > backup_before_migration.sql
```

## 🎓 Ví dụ thực tế

### Ví dụ 1: Thêm cột mới
```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "nhanvien" 
        ADD COLUMN "email" varchar(100) UNIQUE
    `);
}

public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "nhanvien" DROP COLUMN "email"
    `);
}
```

### Ví dụ 2: Tạo bảng mới
```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "khachhang" (
            "maKH" varchar(10) PRIMARY KEY,
            "tenKH" varchar(100) NOT NULL,
            "sdt" varchar(15),
            "diemTichLuy" integer DEFAULT 0
        )
    `);
}

public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "khachhang"`);
}
```

### Ví dụ 3: Thêm index
```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE INDEX "IDX_hoadon_ngay" ON "hoadon" ("ngay")
    `);
}

public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP INDEX "IDX_hoadon_ngay"
    `);
}
```

### Ví dụ 4: Migrate data
```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
    // Thêm cột mới
    await queryRunner.query(`
        ALTER TABLE "mon" 
        ADD COLUMN "moTa" text
    `);
    
    // Migrate dữ liệu từ cột cũ
    await queryRunner.query(`
        UPDATE "mon" 
        SET "moTa" = 'Đang cập nhật' 
        WHERE "moTa" IS NULL
    `);
}

public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "mon" DROP COLUMN "moTa"
    `);
}
```

## 🚨 Troubleshooting

### Lỗi: "synchronize: true is enabled"
**Giải pháp:** Đã tắt trong data-source.ts, restart server.

### Lỗi: "No changes in database schema were found"
**Nguyên nhân:** Database đã đồng bộ với entities.
**Giải pháp:** Sử dụng `migration:create` để tạo migration trống.

### Lỗi: Migration failed
**Giải pháp:** 
1. Check lỗi SQL
2. Rollback: `npm run migration:revert`
3. Fix migration file
4. Re-run: `npm run migration:run`

## 📝 Checklist trước khi deploy

- [ ] Test migration trên local
- [ ] Test rollback migration
- [ ] Review SQL queries trong migration
- [ ] Backup production database
- [ ] Thông báo downtime (nếu cần)
- [ ] Run migration trên staging trước
- [ ] Monitor logs sau khi deploy

## 🎯 Next Steps

1. **Thêm fields tồn kho vào NguyenLieu**
   ```bash
   # Modify entity
   # Generate migration
   npm run migration:generate src/migrations/AddStockFieldsToNguyenLieu
   # Run migration
   npm run migration:run
   ```

2. **Tạo bảng KhachHang (nếu cần)**
   ```bash
   npm run migration:create src/migrations/CreateKhachHangTable
   # Edit migration file
   npm run migration:run
   ```

3. **Thêm indexes cho performance**
   ```bash
   npm run migration:create src/migrations/AddPerformanceIndexes
   # Edit migration file
   npm run migration:run
   ```

## 📚 Tài liệu tham khảo

- [TypeORM Migrations Official Docs](https://typeorm.io/migrations)
- [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)
- [Migration Best Practices](https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate/advanced-migrate-scenarios)


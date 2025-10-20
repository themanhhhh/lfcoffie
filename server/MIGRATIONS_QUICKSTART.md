# 🚀 Quick Start - TypeORM Migrations

## ⚡ TL;DR - Các lệnh cơ bản

```bash
cd server

# Xem trạng thái migrations
npm run migration:show

# Chạy tất cả migrations chưa chạy
npm run migration:run

# Rollback migration gần nhất
npm run migration:revert

# Tạo migration mới từ thay đổi entities
npm run migration:generate src/migrations/TenMigration

# Tạo migration trống
npm run migration:create src/migrations/TenMigration
```

## 📝 Setup đã hoàn tất

✅ Đã tắt `synchronize: false` trong data-source.ts
✅ Đã cấu hình migrations path
✅ Đã thêm migration scripts vào package.json
✅ Đã tạo thư mục `src/migrations/`
✅ Đã tạo migration ví dụ

## 🎯 Sử dụng ngay

### 1️⃣ Kiểm tra trạng thái hiện tại

```bash
cd server
npm run migration:show
```

**Output kỳ vọng:**
```
[X] InitialSchema1760989503709
[ ] AddStockFieldsToNguyenLieu1760989600000  (pending)
```

### 2️⃣ Chạy migration mẫu (Thêm tồn kho vào nguyên liệu)

Migration này sẽ thêm 3 cột mới vào bảng `nguyenlieu`:
- `tonKho`: Tồn kho hiện tại
- `dinhMucToiThieu`: Định mức tối thiểu
- `tieuThuTrungBinh`: Tiêu thụ trung bình/ngày

```bash
cd server
npm run migration:run
```

**Output:**
```
⏳ Bắt đầu migration: Thêm fields tồn kho vào nguyenlieu...
✅ Đã thêm cột tonKho
✅ Đã thêm cột dinhMucToiThieu
✅ Đã thêm cột tieuThuTrungBinh
✅ Đã tạo index cho tìm kiếm nguyên liệu sắp hết
🎉 Migration hoàn tất thành công!
```

### 3️⃣ Verify migration đã chạy

```bash
npm run migration:show
```

**Output:**
```
[X] InitialSchema1760989503709
[X] AddStockFieldsToNguyenLieu1760989600000  ✓
```

### 4️⃣ (Optional) Test rollback

```bash
npm run migration:revert
```

**Output:**
```
⏳ Bắt đầu rollback: Xóa fields tồn kho khỏi nguyenlieu...
✅ Đã xóa index
✅ Đã xóa cột tieuThuTrungBinh
✅ Đã xóa cột dinhMucToiThieu
✅ Đã xóa cột tonKho
🔙 Rollback hoàn tất thành công!
```

### 5️⃣ Re-run migration

```bash
npm run migration:run
```

## 🔄 Workflow khi thay đổi Database

### Scenario 1: Thêm cột mới vào Entity

1. **Thay đổi Entity**
   ```typescript
   // src/entities/NhanVien.ts
   @Column({ type: "varchar", length: 100, nullable: true })
   email?: string;
   ```

2. **Tạo Migration**
   ```bash
   npm run migration:generate src/migrations/AddEmailToNhanVien
   ```

3. **Chạy Migration**
   ```bash
   npm run migration:run
   ```

### Scenario 2: Tạo bảng mới

1. **Tạo Entity mới**
   ```typescript
   // src/entities/KhachHang.ts
   @Entity()
   export class KhachHang {
     @PrimaryColumn()
     maKH!: string;
     
     @Column()
     tenKH!: string;
   }
   ```

2. **Thêm vào data-source.ts**
   ```typescript
   entities: [..., KhachHang]
   ```

3. **Generate Migration**
   ```bash
   npm run migration:generate src/migrations/CreateKhachHangTable
   ```

4. **Run Migration**
   ```bash
   npm run migration:run
   ```

### Scenario 3: Thay đổi phức tạp (Custom SQL)

1. **Tạo Migration trống**
   ```bash
   npm run migration:create src/migrations/ComplexDatabaseChanges
   ```

2. **Edit migration file** và thêm SQL custom

3. **Run Migration**
   ```bash
   npm run migration:run
   ```

## ⚠️ Quan trọng

### ❌ KHÔNG BAO GIỜ
- ❌ KHÔNG chỉnh sửa migration đã chạy (đã có [X] trong migration:show)
- ❌ KHÔNG xóa migration đã chạy
- ❌ KHÔNG bật lại `synchronize: true` khi dùng migrations
- ❌ KHÔNG commit code mà chưa test migration trên local

### ✅ LUÔN LUÔN
- ✅ LUÔN test migration trên local trước
- ✅ LUÔN viết phương thức `down()` để có thể rollback
- ✅ LUÔN backup database trước khi run migration quan trọng
- ✅ LUÔN review SQL trong migration trước khi chạy
- ✅ LUÔN commit migration files cùng với code changes

## 🐛 Troubleshooting

### Lỗi: Cannot find module 'src/migrations/...'
**Fix:** Đảm bảo đang ở thư mục `server/` khi chạy lệnh npm

### Lỗi: No pending migrations
**Nghĩa là:** Tất cả migrations đã được chạy rồi ✅

### Lỗi: Migration failed with error
1. Xem chi tiết lỗi trong console
2. Fix SQL trong migration file
3. Rollback: `npm run migration:revert`
4. Re-run: `npm run migration:run`

### Server không start
- Check xem có migration pending không: `npm run migration:show`
- Chạy migrations: `npm run migration:run`
- Restart server

## 📚 Đọc thêm

Xem file `MIGRATIONS_GUIDE.md` để có hướng dẫn chi tiết, ví dụ và best practices.

## 🎯 Next Steps

1. ✅ Chạy migration mẫu (nếu chưa): `npm run migration:run`
2. ✅ Cập nhật Entity NguyenLieu với các fields mới
3. ✅ Cập nhật Controllers để sử dụng fields tồn kho
4. ✅ Cập nhật Frontend để hiển thị thông tin tồn kho

---

**Chúc bạn code vui vẻ! 🚀**


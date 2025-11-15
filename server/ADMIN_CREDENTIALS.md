# 🔐 Thông tin đăng nhập Admin

## 👤 User Admin mặc định

Sau khi chạy migration `SeedAdminUser1763149500000`, hệ thống sẽ có user admin với thông tin sau:

### Thông tin đăng nhập:
- **Tài khoản**: `admin`
- **Mật khẩu**: `admin123`
- **Mã nhân viên**: `NV001`
- **Tên**: `Administrator`
- **Chức vụ**: `Quản lý`
- **Trạng thái**: `hoạt động`
- **Ca làm**: `CL001` (Ca sáng)

### Cách đăng nhập:

**API Endpoint:**
```
POST http://localhost:4000/api/auth/login
```

**Request Body:**
```json
{
  "taiKhoan": "admin",
  "matKhau": "admin123"
}
```

**Response:**
```json
{
  "message": "Đăng nhập thành công",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "MaNhanVien": "NV001",
    "TenNhanVien": "Administrator",
    "ChucVu": "Quản lý",
    "GioiTinh": "Nam",
    "NgaySinh": "1990-01-01",
    "TaiKhoan": "admin",
    "TrangThai": "hoạt động",
    "caLam": {
      "MaCaLam": "CL001",
      "TenCaLam": "Ca sáng",
      "ThoiGianBatDau": "07:00:00",
      "ThoiGianKetThuc": "12:00:00"
    }
  }
}
```

## 🔄 Reset mật khẩu admin

Nếu cần reset mật khẩu admin, có thể:

1. **Chạy lại migration** (sẽ cập nhật mật khẩu về `admin123`):
   ```bash
   npm run migration:revert
   npm run migration:run
   ```

2. **Hoặc update trực tiếp qua API** (cần token):
   ```
   PUT /api/nhanvien/NV001
   Body: { "MatKhau": "matkhau_moi" }
   ```

## ⚠️ Lưu ý bảo mật

- **Đổi mật khẩu ngay** sau khi deploy lên production
- Không commit mật khẩu vào git
- Sử dụng environment variables cho JWT_SECRET
- Mật khẩu được hash bằng bcrypt với salt rounds = 10


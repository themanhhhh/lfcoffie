# 📮 Hướng dẫn sử dụng Postman Collection

## 🚀 Cài đặt

1. Mở Postman
2. Click **Import** ở góc trên bên trái
3. Chọn file `postman_collection.json` trong thư mục `server/`
4. Collection sẽ được import vào Postman

## ⚙️ Cấu hình Variables

Collection đã có sẵn 2 biến môi trường:

- **`base_url`**: URL của server (mặc định: `http://localhost:4000`)
- **`token`**: JWT token để xác thực (sẽ được set tự động sau khi login)

### Cách set token tự động:

1. Mở request **Login** trong folder **Auth**
2. Vào tab **Tests**
3. Thêm script sau để tự động lưu token:

```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
    console.log("Token đã được lưu:", jsonData.token);
}
```

Hoặc nếu dùng Collection Variables:

```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.collectionVariables.set("token", jsonData.token);
    console.log("Token đã được lưu:", jsonData.token);
}
```

## 📋 Các API Endpoints

### 🔐 Auth
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/verify` - Xác thực token
- `POST /api/auth/logout` - Đăng xuất

### 👥 Nhân viên
- `GET /api/nhanvien` - Lấy tất cả nhân viên
- `GET /api/nhanvien/:id` - Lấy nhân viên theo ID
- `POST /api/nhanvien` - Tạo nhân viên mới
- `PUT /api/nhanvien/:id` - Cập nhật nhân viên
- `DELETE /api/nhanvien/:id` - Xóa nhân viên

### ⏰ Ca làm
- `GET /api/calam` - Lấy tất cả ca làm
- `GET /api/calam/:id` - Lấy ca làm theo ID
- `POST /api/calam` - Tạo ca làm mới
- `PUT /api/calam/:id` - Cập nhật ca làm
- `DELETE /api/calam/:id` - Xóa ca làm

### 📝 Phiên làm việc
- `GET /api/phienlamviec` - Lấy tất cả phiên làm việc
- `GET /api/phienlamviec/:id` - Lấy phiên làm việc theo ID
- `POST /api/phienlamviec/open-shift` - Mở ca làm việc
- `POST /api/phienlamviec/close-shift` - Đóng ca làm việc
- `POST /api/phienlamviec` - Tạo phiên làm việc mới
- `PUT /api/phienlamviec/:id` - Cập nhật phiên làm việc
- `DELETE /api/phienlamviec/:id` - Xóa phiên làm việc

### 🍽️ Món
- `GET /api/mon` - Lấy tất cả món
- `GET /api/mon/:id` - Lấy món theo ID
- `POST /api/mon` - Tạo món mới
- `PUT /api/mon/:id` - Cập nhật món
- `DELETE /api/mon/:id` - Xóa món

### 🧾 Đơn hàng (Hóa đơn)
- `GET /api/hoadon` - Lấy tất cả đơn hàng
- `GET /api/hoadon/:id` - Lấy đơn hàng theo ID
- `POST /api/hoadon` - Tạo đơn hàng mới
- `PUT /api/hoadon/:id` - Cập nhật đơn hàng
- `DELETE /api/hoadon/:id` - Xóa đơn hàng

### 📦 Chi tiết đơn hàng
- `GET /api/chitiethoadon` - Lấy tất cả chi tiết đơn hàng
- `GET /api/chitiethoadon/:id` - Lấy chi tiết đơn hàng theo ID
- `POST /api/chitiethoadon` - Tạo chi tiết đơn hàng mới
- `PUT /api/chitiethoadon/:id` - Cập nhật chi tiết đơn hàng
- `DELETE /api/chitiethoadon/:id` - Xóa chi tiết đơn hàng

### 🪑 số thẻ bàn
- `GET /api/theban` - Lấy tất cả số thẻ bàn
- `GET /api/theban/:id` - Lấy số thẻ bàn theo ID
- `POST /api/theban` - Tạo số thẻ bàn mới
- `PUT /api/theban/:id` - Cập nhật số thẻ bàn
- `DELETE /api/theban/:id` - Xóa số thẻ bàn

### 🎁 CTKM (Chương trình khuyến mãi)
- `GET /api/ctkm` - Lấy tất cả CTKM
- `GET /api/ctkm/:id` - Lấy CTKM theo ID
- `POST /api/ctkm` - Tạo CTKM mới
- `PUT /api/ctkm/:id` - Cập nhật CTKM
- `DELETE /api/ctkm/:id` - Xóa CTKM

### 💰 Giảm hóa đơn
- `GET /api/giamhoadon` - Lấy tất cả giảm hóa đơn
- `GET /api/giamhoadon/active` - Lấy các rule đang hoạt động
- `GET /api/giamhoadon/:id` - Lấy giảm hóa đơn theo ID
- `POST /api/giamhoadon` - Tạo giảm hóa đơn mới
- `PUT /api/giamhoadon/:id` - Cập nhật giảm hóa đơn
- `DELETE /api/giamhoadon/:id` - Xóa giảm hóa đơn

### 🍕 Giảm món
- `GET /api/giammon` - Lấy tất cả giảm món
- `GET /api/giammon/mon/:maMon/active` - Lấy các rule đang hoạt động cho món
- `GET /api/giammon/:id` - Lấy giảm món theo ID
- `POST /api/giammon` - Tạo giảm món mới
- `PUT /api/giammon/:id` - Cập nhật giảm món
- `DELETE /api/giammon/:id` - Xóa giảm món

### 🎯 Combo
- `GET /api/combo` - Lấy tất cả combo
- `GET /api/combo/active` - Lấy các combo đang hoạt động
- `GET /api/combo/:id` - Lấy combo theo ID
- `POST /api/combo` - Tạo combo mới
- `PUT /api/combo/:id` - Cập nhật combo
- `DELETE /api/combo/:id` - Xóa combo

### 💵 Thu chi
- `GET /api/thuchi` - Lấy tất cả thu chi
- `GET /api/thuchi/:id` - Lấy thu chi theo ID
- `POST /api/thuchi` - Tạo thu chi mới
- `PUT /api/thuchi/:id` - Cập nhật thu chi
- `DELETE /api/thuchi/:id` - Xóa thu chi

### 📊 Nghiệp vụ
- `GET /api/nghiepvu` - Lấy tất cả nghiệp vụ
- `GET /api/nghiepvu/:id` - Lấy nghiệp vụ theo ID
- `POST /api/nghiepvu` - Tạo nghiệp vụ mới
- `PUT /api/nghiepvu/:id` - Cập nhật nghiệp vụ
- `DELETE /api/nghiepvu/:id` - Xóa nghiệp vụ

### ⚙️ Tùy chọn
- `GET /api/tuychon` - Lấy tất cả tùy chọn
- `GET /api/tuychon/:id` - Lấy tùy chọn theo ID
- `POST /api/tuychon` - Tạo tùy chọn mới
- `PUT /api/tuychon/:id` - Cập nhật tùy chọn
- `DELETE /api/tuychon/:id` - Xóa tùy chọn

### 📈 Thống kê
- `GET /api/thongke/overview` - Tổng quan thống kê
- `GET /api/thongke/top-products?limit=10` - Top sản phẩm bán chạy
- `GET /api/thongke/revenue-by-channel` - Doanh thu theo kênh
- `GET /api/thongke/revenue-by-month?year=2025` - Doanh thu theo tháng
- `GET /api/thongke/shift-closing/:maPhienLamViec` - Báo cáo đóng ca

## 🔑 Authentication

Hầu hết các API đều yêu cầu authentication token. Token được lấy từ endpoint `/api/auth/login` và cần được thêm vào header:

```
Authorization: Bearer <token>
```

## 📝 Ví dụ Request Body

### Login
```json
{
  "taiKhoan": "admin",
  "matKhau": "admin123"
}
```

**Thông tin đăng nhập mặc định:**
- Tài khoản: `admin`
- Mật khẩu: `admin123`
- Chức vụ: Quản lý

### Create Nhân viên
```json
{
  "MaNhanVien": "NV001",
  "TenNhanVien": "Nguyễn Văn A",
  "ChucVu": "Nhân viên",
  "GioiTinh": "Nam",
  "NgaySinh": "1990-01-01",
  "TaiKhoan": "nva",
  "MatKhau": "123456",
  "SoDienThoai": "0123456789",
  "Email": "nva@example.com",
  "TrangThai": "hoạt động",
  "MaCaLam": "CL001"
}
```

### Create Món
```json
{
  "MaMon": "M001",
  "TenMon": "Cà phê đen",
  "LoaiMon": "cafe",
  "NhomMon": "đồ uống",
  "DonGia": 25000,
  "DonViTinh": "ly",
  "TrangThai": "hoạt động"
}
```

### Create Đơn hàng
```json
{
  "MaDonHang": "DH001",
  "Ngay": "2025-01-21",
  "PhuongThucThanhToan": "Tiền mặt",
  "MaPhienLamViec": "PLV001",
  "MaCTKM": "CTKM001"
}
```

## 🧪 Test Flow

1. **Health Check**: Kiểm tra server đang chạy
   ```
   GET /health
   ```

2. **Login**: Đăng nhập để lấy token
   ```
   POST /api/auth/login
   ```

3. **Verify Token**: Xác thực token (optional)
   ```
   GET /api/auth/verify
   ```

4. **Test các API khác**: Sử dụng token trong header để gọi các API khác

## 💡 Tips

- Tất cả các request đều có sẵn example body trong Postman
- Có thể thay đổi giá trị variables (`:id`, `:maMon`, etc.) trực tiếp trong URL
- Collection được tổ chức theo từng module để dễ tìm kiếm
- Các request đặc biệt (như `open-shift`, `active`) được đặt riêng trong folder tương ứng


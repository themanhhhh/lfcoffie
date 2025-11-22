# 📮 Postman Collection cho Lofi Cafe API

## 🚀 Quick Start

### 1. Import Collection và Environment

1. Mở Postman
2. Click **Import** (góc trên bên trái)
3. Import 2 files:
   - `postman_collection.json` - Collection chứa tất cả API requests
   - `postman_environment.json` - Environment với variables

### 2. Set Environment

1. Chọn environment **"Lofi Cafe - Local"** ở góc trên bên phải
2. Kiểm tra `base_url` = `http://localhost:4000`

### 3. Auto-save Token sau Login

1. Mở request **Auth > Login**
2. Vào tab **Tests**
3. Thêm script này:

```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
    console.log("✅ Token đã được lưu:", jsonData.token);
}
```

### 4. Test API

1. **Health Check**: `GET /health` (không cần auth)
2. **Login**: `POST /api/auth/login` với body:
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
3. Token sẽ tự động được lưu vào environment
4. Các request khác sẽ tự động dùng token này

## 📁 Cấu trúc Collection

- **Auth** - Đăng nhập, xác thực
- **Nhân viên** - CRUD nhân viên
- **Ca làm** - CRUD ca làm việc
- **Phiên làm việc** - Quản lý phiên làm việc (có open-shift, close-shift)
- **Món** - CRUD món ăn/đồ uống
- **Đơn hàng** - CRUD đơn hàng
- **Chi tiết đơn hàng** - CRUD chi tiết đơn hàng
- **số thẻ bàn** - CRUD số thẻ bàn
- **CTKM** - CRUD chương trình khuyến mãi
- **Giảm hóa đơn** - CRUD + Get active rules
- **Giảm món** - CRUD + Get active rules for mon
- **Combo** - CRUD + Get active combos
- **Thu chi** - CRUD thu chi
- **Nghiệp vụ** - CRUD nghiệp vụ
- **Tùy chọn** - CRUD tùy chọn
- **Thống kê** - Các API thống kê
- **Health Check** - Kiểm tra server

## 🔑 Variables

- `{{base_url}}` - URL server (mặc định: http://localhost:4000)
- `{{token}}` - JWT token (tự động lưu sau login)

## 📝 Lưu ý

- Tất cả API (trừ `/health` và `/api/auth/login`) đều cần token trong header
- Token format: `Authorization: Bearer {{token}}`
- Các request đã có sẵn example body, chỉ cần chỉnh sửa giá trị
- Có thể thay đổi `:id`, `:maMon` trực tiếp trong URL

## 🐛 Troubleshooting

- **401 Unauthorized**: Kiểm tra token đã được set chưa, hoặc token đã hết hạn
- **404 Not Found**: Kiểm tra `base_url` và route path
- **500 Server Error**: Kiểm tra server đang chạy và database đã kết nối


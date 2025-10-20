# Xu-chi Backend (TypeScript) – Express + TypeORM + PostgreSQL

Backend mẫu CRUD cơ bản cho 3 entity: **Nhân viên, Hóa đơn, Món**.

## ✅ Yêu cầu
- Node.js >= 18
- PostgreSQL chạy `localhost:5432`, user `postgres`, pass `123456`
- Database: `xuchi_db` (tạo sẵn hoặc để TypeORM tự tạo nếu user có quyền)

## 🚀 Cài đặt & chạy dev
```bash
npm install
npm run dev
```

Server mặc định: `http://localhost:4000`

## 🌐 Endpoint
- Health check: `GET /health`

### Nhân viên
- `GET    /api/nhanvien`
- `GET    /api/nhanvien/:id`
- `POST   /api/nhanvien`      (body JSON theo entity)
- `PUT    /api/nhanvien/:id`
- `DELETE /api/nhanvien/:id`

### Hóa đơn
- `GET    /api/hoadon`
- `GET    /api/hoadon/:id`
- `POST   /api/hoadon`        (body: { maHD, ngay, phuongThucThanhToan, maNV })
- `PUT    /api/hoadon/:id`
- `DELETE /api/hoadon/:id`

### Món
- `GET    /api/mon`
- `GET    /api/mon/:id`
- `POST   /api/mon`
- `PUT    /api/mon/:id`
- `DELETE /api/mon/:id`

## 🧩 Ghi chú
- `synchronize: true` đang bật cho môi trường phát triển – KHÔNG nên bật ở production.
- Bạn có thể mở rộng thêm entity/route theo mô hình dữ liệu trong đề án.

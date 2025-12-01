# 📖 HƯỚNG DẪN XEM DỮ LIỆU BÁO CÁO KINH DOANH

## 🚀 BƯỚC 1: KHỞI ĐỘNG SERVER VÀ CLIENT

### 1.1. Khởi động Backend Server (Terminal 1)
```bash
cd server
npm run dev
```
Server sẽ chạy tại: **http://localhost:4000**

### 1.2. Khởi động Frontend Client (Terminal 2)
```bash
cd client
npm run dev
```
Client sẽ chạy tại: **http://localhost:3000**

---

## 🔐 BƯỚC 2: ĐĂNG NHẬP

1. Mở trình duyệt và truy cập: **http://localhost:3000**
2. Đăng nhập với tài khoản Admin:
   - **Tài khoản:** `admin`
   - **Mật khẩu:** `admin123`

---

## 📊 BƯỚC 3: XEM BÁO CÁO KẾT QUẢ KINH DOANH

### 3.1. Truy cập trang báo cáo
1. Sau khi đăng nhập, vào menu **Admin**
2. Chọn **"Báo cáo chốt ca"** hoặc truy cập trực tiếp: **http://localhost:3000/admin/shift-closing**

### 3.2. Sử dụng bộ lọc
Trang báo cáo có các bộ lọc:
- **Từ ngày:** Chọn ngày bắt đầu
- **Đến ngày:** Chọn ngày kết thúc
- **Ca làm:** Chọn ca làm việc cụ thể (tùy chọn)
- Nhấn nút **"Tạo"** để tạo báo cáo

### 3.3. Xem dữ liệu báo cáo
Báo cáo sẽ hiển thị:

#### I. DOANH THU (1+2)
- **1. Doanh thu bán hàng:** Tổng doanh thu từ các đơn hàng
- **2. Doanh thu khác:** Doanh thu từ các nghiệp vụ thu (dịch vụ, bán đồ lưu niệm, phụ thu...)
- **Tổng doanh thu:** Tổng của 2 khoản trên

#### II. CHI PHÍ
Các khoản mục chi phí sẽ **TỰ ĐỘNG** hiển thị dựa trên dữ liệu trong database:
- **1. Chi phí nguyên vật liệu** (nếu có)
- **2. Chi phí nhân sự** (nếu có)
- **3. Chi phí cố định** (mặt bằng, điện nước, khấu hao máy móc,...) (nếu có)
- **4. Chi phí marketing** (nếu có)
- **5. Chi phí khác** (vệ sinh, văn phòng phẩm, bảo trì,...) (nếu có)
- Các khoản mục khác sẽ được đánh số tự động

#### III. LỢI NHUẬN
- **Lợi nhuận = Tổng doanh thu - Tổng chi phí**

### 3.4. Xuất file Excel
- Nhấn nút **"Xuất file"** để tải báo cáo dưới dạng file Excel (.xlsx)
- File sẽ có tên: `BaoCaoKetQuaKinhDoanh_[từ ngày]_[đến ngày].xlsx`

---

## 💰 BƯỚC 4: XEM DỮ LIỆU THU CHI

### 4.1. Xem lịch sử thu chi (Staff)
1. Đăng nhập với tài khoản nhân viên hoặc admin
2. Vào menu **Staff** → **"Thu chi"** hoặc truy cập: **http://localhost:3000/staff/cashflow**
3. Xem bảng **"Lịch sử thu chi"** với các thông tin:
   - Thời gian
   - Loại (Thu/Chi)
   - Nghiệp vụ
   - Số tiền
   - Phương thức thanh toán
   - Ghi chú

### 4.2. Xem các nghiệp vụ có sẵn
Khi tạo phiếu thu/chi, bạn sẽ thấy dropdown **"Nghiệp vụ"** với các tùy chọn:

**Nghiệp vụ Thu:**
- Thu tiền bán hàng
- Thu tiền khác
- Thu tiền dịch vụ
- Thu tiền bán đồ lưu niệm
- Thu phụ thu

**Nghiệp vụ Chi:**
- Chi phí nguyên vật liệu
- Nguyên vật liệu
- Chi mua cà phê
- Chi mua sữa
- Chi mua trà
- Chi phí nhân sự
- Nhân sự
- Chi tiền lương nhân viên
- Chi thưởng nhân viên
- Chi phí cố định
- Cố định
- Chi tiền điện nước
- Chi tiền thuê mặt bằng
- Chi khấu hao máy móc
- Chi phí marketing
- Marketing
- Chi quảng cáo Facebook
- Chi quảng cáo Google
- Chi in tờ rơi
- Chi phí khác
- Khác
- Chi vệ sinh
- Chi văn phòng phẩm
- Chi bảo trì

---

## 📈 BƯỚC 5: XEM THỐNG KÊ TỔNG QUAN

### 5.1. Trang thống kê Admin
1. Truy cập: **http://localhost:3000/admin/statistic**
2. Xem các thống kê:
   - Tổng quan tuần này
   - So sánh với hôm qua
   - Doanh thu 7 ngày gần nhất
   - Top món bán chạy

---

## 🔍 BƯỚC 6: KIỂM TRA DỮ LIỆU TRONG DATABASE

### 6.1. Kiểm tra nghiệp vụ
Truy cập API: **http://localhost:4000/api/nghiepvu**
- Sẽ thấy danh sách 29 nghiệp vụ đã được tạo

### 6.2. Kiểm tra giao dịch thu chi
Truy cập API: **http://localhost:4000/api/thuchi**
- Sẽ thấy danh sách 23 giao dịch thu chi đã được tạo

### 6.3. Kiểm tra báo cáo kinh doanh
Truy cập API: **http://localhost:4000/api/thongke/business-report?startDate=2024-01-01&endDate=2024-12-31**
- Thay đổi `startDate` và `endDate` theo ngày bạn muốn xem
- Sẽ thấy JSON với cấu trúc:
```json
{
  "doanhThu": {
    "banHang": 0,
    "khac": 0,
    "tong": 0
  },
  "chiPhi": {
    "byCategory": {
      "Chi phí nguyên vật liệu": 0,
      "Chi phí nhân sự": 0,
      ...
    },
    "tong": 0
  },
  "loiNhuan": 0
}
```

---

## 💡 LƯU Ý QUAN TRỌNG

1. **Dữ liệu mẫu:** Dữ liệu đã được seed vào database với:
   - 29 nghiệp vụ (thu và chi)
   - 23 giao dịch thu chi
   - Phân bổ trong 3 ngày (hôm nay, hôm qua, 2 ngày trước)

2. **Tự động nhóm:** Báo cáo sẽ **TỰ ĐỘNG** nhóm các chi phí theo tên nghiệp vụ. Ví dụ:
   - "Chi phí nguyên vật liệu" và "Nguyên vật liệu" → nhóm vào "1. Chi phí nguyên vật liệu"
   - "Chi phí nhân sự" và "Nhân sự" → nhóm vào "2. Chi phí nhân sự"

3. **Sắp xếp:** Các khoản mục chi phí được sắp xếp theo thứ tự ưu tiên:
   - Nguyên vật liệu
   - Nhân sự
   - Cố định
   - Marketing
   - Khác
   - Các khoản mục khác (sắp xếp theo tên)

4. **Thời gian:** Nếu không thấy dữ liệu, hãy kiểm tra:
   - Ngày trong bộ lọc có khớp với ngày của dữ liệu seed không
   - Dữ liệu seed được tạo với ngày hiện tại, hôm qua và 2 ngày trước

---

## 🆘 XỬ LÝ SỰ CỐ

### Không thấy dữ liệu trong báo cáo?
1. Kiểm tra server backend có đang chạy không (http://localhost:4000)
2. Kiểm tra ngày trong bộ lọc có đúng không
3. Thử chọn khoảng thời gian rộng hơn (ví dụ: 1 tuần trước đến hôm nay)

### Lỗi khi đăng nhập?
- Đảm bảo đã chạy `npm run seed` để tạo tài khoản admin
- Tài khoản: `admin` / Mật khẩu: `admin123`

### Lỗi kết nối database?
- Kiểm tra PostgreSQL có đang chạy không
- Kiểm tra file `.env` trong thư mục `server` có cấu hình đúng không

---

## ✅ KẾT QUẢ MONG ĐỢI

Sau khi làm theo hướng dẫn, bạn sẽ thấy:
- ✅ Báo cáo kinh doanh với đầy đủ các khoản mục chi phí
- ✅ Dữ liệu được tự động nhóm và sắp xếp
- ✅ Có thể xuất file Excel
- ✅ Có thể xem lịch sử thu chi chi tiết
- ✅ Có thể tạo phiếu thu/chi mới với nhiều loại nghiệp vụ



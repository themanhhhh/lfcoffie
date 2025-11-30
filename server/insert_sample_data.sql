-- ============================================
-- FILE SQL: THÊM DỮ LIỆU MẪU CHO TÙY CHỌN VÀ KHUYẾN MÃI
-- Chạy file này trên pgAdmin để thêm dữ liệu mẫu
-- ============================================

-- ============================================
-- 1. THÊM DỮ LIỆU TÙY CHỌN (TuyChon)
-- ============================================

-- Xóa dữ liệu cũ nếu có (tùy chọn)
-- DELETE FROM tuychon;

-- Thêm các tùy chọn SIZE
INSERT INTO tuychon ("MaTuyChon", "LoaiTuyChon", "TenTuyChon", "GiaCongThem") VALUES
('TC001', 'size', 'S', 0),
('TC002', 'size', 'M', 5000),
('TC003', 'size', 'L', 10000),
('TC004', 'size', 'XL', 15000)
ON CONFLICT ("MaTuyChon") DO NOTHING;

-- Thêm các tùy chọn SUGAR (Đường)
INSERT INTO tuychon ("MaTuyChon", "LoaiTuyChon", "TenTuyChon", "GiaCongThem") VALUES
('TC005', 'sugar', 'Không đường (0%)', 0),
('TC006', 'sugar', 'Ít đường (50%)', 0),
('TC007', 'sugar', 'Bình thường (100%)', 0),
('TC008', 'sugar', 'Nhiều đường (150%)', 0)
ON CONFLICT ("MaTuyChon") DO NOTHING;

-- Thêm các tùy chọn ICE (Đá)
INSERT INTO tuychon ("MaTuyChon", "LoaiTuyChon", "TenTuyChon", "GiaCongThem") VALUES
('TC009', 'ice', 'Không đá', 0),
('TC010', 'ice', 'Ít đá', 0),
('TC011', 'ice', 'Bình thường', 0),
('TC012', 'ice', 'Nhiều đá', 0)
ON CONFLICT ("MaTuyChon") DO NOTHING;

-- Thêm các tùy chọn TOPPING
INSERT INTO tuychon ("MaTuyChon", "LoaiTuyChon", "TenTuyChon", "GiaCongThem") VALUES
('TC013', 'topping', 'Trân châu đen', 10000),
('TC014', 'topping', 'Trân châu trắng', 10000),
('TC015', 'topping', 'Thạch dừa', 8000),
('TC016', 'topping', 'Thạch rau câu', 8000),
('TC017', 'topping', 'Pudding', 12000),
('TC018', 'topping', 'Kem cheese', 15000),
('TC019', 'topping', 'Kem whipping', 15000),
('TC020', 'topping', 'Sốt caramel', 5000),
('TC021', 'topping', 'Sốt chocolate', 5000),
('TC022', 'topping', 'Đậu đỏ', 10000),
('TC023', 'topping', 'Matcha powder', 10000),
('TC024', 'topping', 'Cacao powder', 10000)
ON CONFLICT ("MaTuyChon") DO NOTHING;

-- ============================================
-- 2. THÊM DỮ LIỆU CHƯƠNG TRÌNH KHUYẾN MÃI (CTKM)
-- ============================================

-- Xóa dữ liệu cũ nếu có (tùy chọn)
-- DELETE FROM giamhoadon;
-- DELETE FROM ctkm;

-- Thêm các chương trình khuyến mãi
INSERT INTO ctkm ("MaCTKM", "TenCTKM", "LoaiCTKM") VALUES
('CTKM001', 'Giảm giá hóa đơn 10%', 'giamhoadon'),
('CTKM002', 'Giảm giá hóa đơn 20%', 'giamhoadon'),
('CTKM003', 'Giảm 50.000đ cho hóa đơn từ 200.000đ', 'giamhoadon'),
('CTKM004', 'Giảm 100.000đ cho hóa đơn từ 500.000đ', 'giamhoadon'),
('CTKM005', 'Giảm giá cuối tuần 15%', 'giamhoadon'),
('CTKM006', 'Giảm giá buổi sáng 10%', 'giamhoadon')
ON CONFLICT ("MaCTKM") DO NOTHING;

-- ============================================
-- 3. THÊM DỮ LIỆU QUY TẮC GIẢM GIÁ HÓA ĐƠN (GiamHoaDon)
-- ============================================

-- Quy tắc 1: Giảm 10% cho mọi hóa đơn (không điều kiện)
INSERT INTO giamhoadon (
    "MaGHD", 
    "MaCTKM", 
    "GiaTriTu", 
    "SoTienGiam", 
    "LoaiGiam", 
    "NgayBatDau", 
    "NgayKetThuc", 
    "Thu", 
    "GioBatDau", 
    "GioKetThuc", 
    "TrangThai"
) VALUES (
    'GHD001',
    'CTKM001',
    NULL, -- Không có giá trị tối thiểu
    10, -- Giảm 10%
    'Phần trăm',
    CURRENT_DATE, -- Bắt đầu từ hôm nay
    CURRENT_DATE + INTERVAL '1 year', -- Kết thúc sau 1 năm
    NULL, -- Áp dụng mọi ngày
    NULL, -- Áp dụng mọi giờ
    NULL,
    'hoạt động'
)
ON CONFLICT ("MaGHD") DO NOTHING;

-- Quy tắc 2: Giảm 20% cho hóa đơn từ 300.000đ
INSERT INTO giamhoadon (
    "MaGHD", 
    "MaCTKM", 
    "GiaTriTu", 
    "SoTienGiam", 
    "LoaiGiam", 
    "NgayBatDau", 
    "NgayKetThuc", 
    "Thu", 
    "GioBatDau", 
    "GioKetThuc", 
    "TrangThai"
) VALUES (
    'GHD002',
    'CTKM002',
    300000, -- Từ 300.000đ
    20, -- Giảm 20%
    'Phần trăm',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 year',
    NULL,
    NULL,
    NULL,
    'hoạt động'
)
ON CONFLICT ("MaGHD") DO NOTHING;

-- Quy tắc 3: Giảm 50.000đ cho hóa đơn từ 200.000đ
INSERT INTO giamhoadon (
    "MaGHD", 
    "MaCTKM", 
    "GiaTriTu", 
    "SoTienGiam", 
    "LoaiGiam", 
    "NgayBatDau", 
    "NgayKetThuc", 
    "Thu", 
    "GioBatDau", 
    "GioKetThuc", 
    "TrangThai"
) VALUES (
    'GHD003',
    'CTKM003',
    200000, -- Từ 200.000đ
    50000, -- Giảm 50.000đ
    'VND',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 year',
    NULL,
    NULL,
    NULL,
    'hoạt động'
)
ON CONFLICT ("MaGHD") DO NOTHING;

-- Quy tắc 4: Giảm 100.000đ cho hóa đơn từ 500.000đ
INSERT INTO giamhoadon (
    "MaGHD", 
    "MaCTKM", 
    "GiaTriTu", 
    "SoTienGiam", 
    "LoaiGiam", 
    "NgayBatDau", 
    "NgayKetThuc", 
    "Thu", 
    "GioBatDau", 
    "GioKetThuc", 
    "TrangThai"
) VALUES (
    'GHD004',
    'CTKM004',
    500000, -- Từ 500.000đ
    100000, -- Giảm 100.000đ
    'VND',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 year',
    NULL,
    NULL,
    NULL,
    'hoạt động'
)
ON CONFLICT ("MaGHD") DO NOTHING;

-- Quy tắc 5: Giảm 15% vào cuối tuần (Thứ 7 và Chủ nhật)
INSERT INTO giamhoadon (
    "MaGHD", 
    "MaCTKM", 
    "GiaTriTu", 
    "SoTienGiam", 
    "LoaiGiam", 
    "NgayBatDau", 
    "NgayKetThuc", 
    "Thu", 
    "GioBatDau", 
    "GioKetThuc", 
    "TrangThai"
) VALUES (
    'GHD005',
    'CTKM005',
    NULL,
    15, -- Giảm 15%
    'Phần trăm',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 year',
    'Thứ 7', -- Chỉ áp dụng thứ 7
    NULL,
    NULL,
    'hoạt động'
),
(
    'GHD006',
    'CTKM005',
    NULL,
    15,
    'Phần trăm',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 year',
    'Chủ nhật', -- Chỉ áp dụng chủ nhật
    NULL,
    NULL,
    'hoạt động'
)
ON CONFLICT ("MaGHD") DO NOTHING;

-- Quy tắc 6: Giảm 10% vào buổi sáng (7:00 - 11:00)
INSERT INTO giamhoadon (
    "MaGHD", 
    "MaCTKM", 
    "GiaTriTu", 
    "SoTienGiam", 
    "LoaiGiam", 
    "NgayBatDau", 
    "NgayKetThuc", 
    "Thu", 
    "GioBatDau", 
    "GioKetThuc", 
    "TrangThai"
) VALUES (
    'GHD007',
    'CTKM006',
    NULL,
    10, -- Giảm 10%
    'Phần trăm',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 year',
    NULL, -- Áp dụng mọi ngày
    '07:00:00', -- Từ 7:00
    '11:00:00', -- Đến 11:00
    'hoạt động'
)
ON CONFLICT ("MaGHD") DO NOTHING;

-- ============================================
-- KIỂM TRA DỮ LIỆU ĐÃ THÊM
-- ============================================

-- Xem tất cả tùy chọn
SELECT * FROM tuychon ORDER BY "LoaiTuyChon", "MaTuyChon";

-- Xem tất cả chương trình khuyến mãi
SELECT * FROM ctkm ORDER BY "MaCTKM";

-- Xem tất cả quy tắc giảm giá hóa đơn
SELECT 
    ghd."MaGHD",
    ctkm."TenCTKM",
    ghd."GiaTriTu",
    ghd."SoTienGiam",
    ghd."LoaiGiam",
    ghd."NgayBatDau",
    ghd."NgayKetThuc",
    ghd."Thu",
    ghd."GioBatDau",
    ghd."GioKetThuc",
    ghd."TrangThai"
FROM giamhoadon ghd
LEFT JOIN ctkm ON ghd."MaCTKM" = ctkm."MaCTKM"
ORDER BY ghd."MaGHD";


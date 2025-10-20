-- ============================================================================
-- SAMPLE DATA FOR LOFICAFE DATABASE
-- ============================================================================
-- Mô tả: Dữ liệu mẫu cho hệ thống quản lý quán cà phê LofiCafe
-- Bao gồm: Nhân viên, Menu, Nguyên liệu, Hóa đơn, Phiếu nhập/xuất, Thu/Chi
-- 
-- Cách sử dụng:
--   psql -U postgres -d lofi -f server/database/sample-data.sql
--
-- Hoặc từ psql shell:
--   \i server/database/sample-data.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- BƯỚC 1: XÓA DỮ LIỆU CŨ (Nếu cần)
-- ============================================================================
-- Uncomment dòng dưới nếu muốn reset toàn bộ dữ liệu
/*
TRUNCATE TABLE
  chitiethoadon,
  chitietphieuchi,
  chitietphieuthu,
  chitietphieuxuat,
  chitietphieunhap,
  phieuchi,
  phieuthu,
  phieuxuat,
  phieunhap,
  hoadon,
  mon,
  khuyenmai,
  nguyenlieu,
  nhanvien,
  theban,
  size,
  loaimon,
  nhomthucdon
RESTART IDENTITY CASCADE;
*/

-- ============================================================================
-- BƯỚC 2: DỮ LIỆU CƠ BẢN - NHÓM THỰC ĐƠN
-- ============================================================================
INSERT INTO nhomthucdon ("maNhomThucDon", "tenNhomThucDon") VALUES
  ('NTD01', 'Đồ uống'),
  ('NTD02', 'Bánh ngọt'),
  ('NTD03', 'Món ăn nhẹ')
ON CONFLICT ("maNhomThucDon") DO NOTHING;

-- ============================================================================
-- BƯỚC 3: DỮ LIỆU CƠ BẢN - LOẠI MÓN
-- ============================================================================
INSERT INTO loaimon ("maLoaiMon", "tenLoaiMon") VALUES
  ('LM01', 'Cà phê'),
  ('LM02', 'Trà'),
  ('LM03', 'Sinh tố'),
  ('LM04', 'Nước ép'),
  ('LM05', 'Bánh'),
  ('LM06', 'Đồ ăn vặt')
ON CONFLICT ("maLoaiMon") DO NOTHING;

-- ============================================================================
-- BƯỚC 4: DỮ LIỆU CƠ BẢN - SIZE
-- ============================================================================
INSERT INTO size ("maSize", "tenSize", "giaCongThem") VALUES
  ('S', 'Size S', 0),
  ('M', 'Size M', 5000),
  ('L', 'Size L', 10000)
ON CONFLICT ("maSize") DO NOTHING;

-- ============================================================================
-- BƯỚC 5: DỮ LIỆU CƠ BẢN - BÀN
-- ============================================================================
INSERT INTO theban ("maTheBan", "tenTheBan", "trangThai") VALUES
  ('TB01', 'Bàn 1', TRUE),
  ('TB02', 'Bàn 2', TRUE),
  ('TB03', 'Bàn 3', FALSE),
  ('TB04', 'Bàn 4', TRUE),
  ('TB05', 'Bàn 5', FALSE),
  ('TB06', 'Bàn 6', TRUE),
  ('TB07', 'Bàn 7', TRUE),
  ('TB08', 'Bàn 8', TRUE),
  ('TB09', 'Bàn VIP 1', TRUE),
  ('TB10', 'Bàn VIP 2', TRUE)
ON CONFLICT ("maTheBan") DO NOTHING;

-- ============================================================================
-- BƯỚC 6: NHÂN VIÊN (Mật khẩu: password123)
-- ============================================================================
INSERT INTO nhanvien (
  "maNV", "tenNV", "chucVu", "gioiTinh", "ngaySinh", "caLam",
  "taiKhoan", "matKhau", "soDienThoai", "email", "diaChi", "trangThai"
) VALUES
  -- Quản lý
  ('NV001', 'Trần Minh Quân', 'Quản lý', 'Nam', '1990-04-12', 'Full-time',
   'quanly', '$2b$10$8Zx5mZqH5YvJQxYx5YvJQ.YvJQxYx5YvJQxYx5YvJQxYx5YvJQxYu', '0901234567',
   'quan.tm@loficafe.vn', '123 Nguyễn Văn Linh, Q7, TP.HCM', 'hoat dong'),
  
  -- Thu ngân
  ('NV002', 'Lê Thị Hoa', 'Thu ngân', 'Nữ', '1995-08-21', 'Ca sáng',
   'hoa.lt', '$2b$10$8Zx5mZqH5YvJQxYx5YvJQ.YvJQxYx5YvJQxYx5YvJQxYx5YvJQxYu', '0902345678',
   'hoa.lt@loficafe.vn', '45 Lê Văn Việt, Q9, TP.HCM', 'hoat dong'),
   
  ('NV003', 'Nguyễn Văn An', 'Thu ngân', 'Nam', '1998-03-15', 'Ca chiều',
   'an.nv', '$2b$10$8Zx5mZqH5YvJQxYx5YvJQ.YvJQxYx5YvJQxYx5YvJQxYx5YvJQxYu', '0903456789',
   'an.nv@loficafe.vn', '78 Võ Văn Ngân, Thủ Đức, TP.HCM', 'hoat dong'),
  
  -- Pha chế
  ('NV004', 'Phạm Thị Mai', 'Pha chế', 'Nữ', '1997-11-08', 'Ca sáng',
   'mai.pt', '$2b$10$8Zx5mZqH5YvJQxYx5YvJQ.YvJQxYx5YvJQxYx5YvJQxYx5YvJQxYu', '0904567890',
   'mai.pt@loficafe.vn', '234 Hoàng Diệu, Q4, TP.HCM', 'hoat dong'),
   
  ('NV005', 'Trương Quốc Huy', 'Pha chế', 'Nam', '1996-06-20', 'Ca chiều',
   'huy.tq', '$2b$10$8Zx5mZqH5YvJQxYx5YvJQ.YvJQxYx5YvJQxYx5YvJQxYx5YvJQxYu', '0905678901',
   'huy.tq@loficafe.vn', '567 Phan Văn Trị, Gò Vấp, TP.HCM', 'hoat dong'),
  
  -- Phục vụ
  ('NV006', 'Đỗ Hải Yến', 'Phục vụ', 'Nữ', '1999-02-14', 'Ca sáng',
   'yen.dh', '$2b$10$8Zx5mZqH5YvJQxYx5YvJQ.YvJQxYx5YvJQxYx5YvJQxYx5YvJQxYu', '0906789012',
   'yen.dh@loficafe.vn', '890 Lý Thường Kiệt, Q10, TP.HCM', 'hoat dong'),
   
  ('NV007', 'Võ Minh Tâm', 'Phục vụ', 'Nam', '2000-09-30', 'Ca chiều',
   'tam.vm', '$2b$10$8Zx5mZqH5YvJQxYx5YvJQ.YvJQxYx5YvJQxYx5YvJQxYx5YvJQxYu', '0907890123',
   'tam.vm@loficafe.vn', '123 Lê Lợi, Q1, TP.HCM', 'hoat dong')
ON CONFLICT ("maNV") DO NOTHING;

-- ============================================================================
-- BƯỚC 7: KHUYẾN MÃI
-- ============================================================================
INSERT INTO khuyenmai (
  "maKM", "tenKM", "loaiKM", "giaTriGiam", "soTienToiThieu", "giamToiDa",
  "soLuongSuDung", "moTa", "ngayBatDau", "ngayKetThuc"
) VALUES
  ('KM001', 'Giảm 10% cho khách quen', 'percentage', 10, 100000, 50000,
   500, 'Áp dụng cho khách hàng thanh toán qua thẻ thành viên', 
   '2025-01-01 00:00:00', '2025-12-31 23:59:59'),
   
  ('KM002', 'Voucher 30k - Cuối tuần', 'fixed', 30000, 150000, NULL,
   200, 'Áp dụng thứ 7, chủ nhật và các ngày lễ', 
   '2025-10-01 00:00:00', '2025-11-30 23:59:59'),
   
  ('KM003', 'Happy Hour - Giảm 20%', 'percentage', 20, 50000, 100000,
   1000, 'Áp dụng từ 14h-16h các ngày trong tuần', 
   '2025-10-15 00:00:00', '2025-12-15 23:59:59'),
   
  ('KM004', 'Combo tiết kiệm - Giảm 15k', 'fixed', 15000, 80000, NULL,
   300, 'Áp dụng khi mua từ 2 món trở lên', 
   '2025-10-20 00:00:00', '2025-11-20 23:59:59')
ON CONFLICT ("maKM") DO NOTHING;

-- ============================================================================
-- BƯỚC 8: NGUYÊN LIỆU (Bao gồm tồn kho)
-- ============================================================================
INSERT INTO nguyenlieu ("maNL", "tenNL", "donViTinh", "tonKho", "dinhMucToiThieu", "tieuThuTrungBinh") VALUES
  -- Nguyên liệu chính
  ('NL001', 'Hạt cà phê Arabica', 'kg', 45, 30, 2.5),
  ('NL002', 'Hạt cà phê Robusta', 'kg', 38, 25, 2.0),
  ('NL003', 'Sữa tươi nguyên chất', 'lít', 120, 80, 8.0),
  ('NL004', 'Sữa đặc có đường', 'lon', 45, 30, 3.5),
  ('NL005', 'Bột cacao nguyên chất', 'kg', 15, 10, 1.2),
  
  -- Trà và nguyên liệu pha chế
  ('NL006', 'Trà oolong cao cấp', 'kg', 8, 5, 0.8),
  ('NL007', 'Trà đen Ceylon', 'kg', 12, 8, 1.0),
  ('NL008', 'Trà xanh matcha', 'kg', 5, 3, 0.5),
  ('NL009', 'Siro vanilla', 'chai', 18, 12, 1.5),
  ('NL010', 'Siro caramel', 'chai', 22, 15, 1.8),
  
  -- Trái cây tươi
  ('NL011', 'Dâu tây Đà Lạt', 'kg', 10, 5, 1.5),
  ('NL012', 'Đào tươi', 'kg', 8, 5, 1.2),
  ('NL013', 'Cam tươi', 'kg', 25, 15, 3.0),
  ('NL014', 'Chanh tươi', 'kg', 18, 10, 2.0),
  ('NL015', 'Bơ', 'trái', 30, 20, 2.5),
  
  -- Đồ khô và phụ liệu
  ('NL016', 'Đường trắng', 'kg', 50, 30, 4.0),
  ('NL017', 'Đường nâu', 'kg', 25, 15, 2.0),
  ('NL018', 'Đá viên', 'bao', 100, 60, 10.0),
  ('NL019', 'Kem whipping', 'hộp', 20, 12, 2.0),
  ('NL020', 'Bột pudding', 'kg', 8, 5, 0.8),
  
  -- Nguyên liệu bánh
  ('NL021', 'Bột mì đa dụng', 'kg', 40, 25, 3.0),
  ('NL022', 'Bơ lạt', 'kg', 15, 10, 1.5),
  ('NL023', 'Trứng gà', 'vỉ', 50, 30, 4.0),
  ('NL024', 'Phô mai cream', 'kg', 12, 8, 1.0),
  ('NL025', 'Socola đen', 'thanh', 25, 15, 2.0),
  
  -- Topping và trang trí
  ('NL026', 'Thạch dừa', 'hộp', 30, 20, 2.5),
  ('NL027', 'Trân châu đen', 'kg', 10, 6, 1.0),
  ('NL028', 'Hạt sen tươi', 'kg', 5, 3, 0.5),
  ('NL029', 'Rau câu', 'gói', 15, 10, 1.2),
  ('NL030', 'Bột rắc topping', 'hộp', 20, 12, 1.5)
ON CONFLICT ("maNL") DO NOTHING;

-- ============================================================================
-- BƯỚC 9: MENU - CÀ PHÊ
-- ============================================================================
INSERT INTO mon ("maMon", "tenMon", "donGia", "donViTinh", "maLoaiMon", "maNhomThucDon") VALUES
  ('MON001', 'Cà phê sữa đá', 35000, 'ly', 'LM01', 'NTD01'),
  ('MON002', 'Cà phê đen đá', 30000, 'ly', 'LM01', 'NTD01'),
  ('MON003', 'Bạc xỉu', 38000, 'ly', 'LM01', 'NTD01'),
  ('MON004', 'Americano', 40000, 'ly', 'LM01', 'NTD01'),
  ('MON005', 'Cappuccino', 45000, 'ly', 'LM01', 'NTD01'),
  ('MON006', 'Latte', 45000, 'ly', 'LM01', 'NTD01'),
  ('MON007', 'Caramel Macchiato', 52000, 'ly', 'LM01', 'NTD01'),
  ('MON008', 'Mocha', 50000, 'ly', 'LM01', 'NTD01')
ON CONFLICT ("maMon") DO NOTHING;

-- ============================================================================
-- BƯỚC 10: MENU - TRÀ & ĐỒ UỐNG KHÁC
-- ============================================================================
INSERT INTO mon ("maMon", "tenMon", "donGia", "donViTinh", "maLoaiMon", "maNhomThucDon") VALUES
  ('MON009', 'Trà đào cam sả', 45000, 'ly', 'LM02', 'NTD01'),
  ('MON010', 'Trà sữa trân châu đường đen', 48000, 'ly', 'LM02', 'NTD01'),
  ('MON011', 'Matcha latte', 52000, 'ly', 'LM02', 'NTD01'),
  ('MON012', 'Trà oolong kem cheese', 55000, 'ly', 'LM02', 'NTD01'),
  ('MON013', 'Sinh tố bơ', 45000, 'ly', 'LM03', 'NTD01'),
  ('MON014', 'Sinh tố dâu', 48000, 'ly', 'LM03', 'NTD01'),
  ('MON015', 'Nước ép cam tươi', 42000, 'ly', 'LM04', 'NTD01'),
  ('MON016', 'Chanh dây mật ong', 40000, 'ly', 'LM04', 'NTD01')
ON CONFLICT ("maMon") DO NOTHING;

-- ============================================================================
-- BƯỚC 11: MENU - BÁNH & ĐỒ ĂN
-- ============================================================================
INSERT INTO mon ("maMon", "tenMon", "donGia", "donViTinh", "maLoaiMon", "maNhomThucDon") VALUES
  ('MON017', 'Bánh tiramisu', 55000, 'miếng', 'LM05', 'NTD02'),
  ('MON018', 'Bánh red velvet', 52000, 'miếng', 'LM05', 'NTD02'),
  ('MON019', 'Bánh cheesecake chanh dây', 58000, 'miếng', 'LM05', 'NTD02'),
  ('MON020', 'Bánh brownie socola', 45000, 'miếng', 'LM05', 'NTD02'),
  ('MON021', 'Croissant bơ', 38000, 'cái', 'LM05', 'NTD02'),
  ('MON022', 'Sandwich gà', 42000, 'cái', 'LM06', 'NTD03'),
  ('MON023', 'Khoai tây chiên', 35000, 'phần', 'LM06', 'NTD03'),
  ('MON024', 'Pudding flan', 32000, 'cái', 'LM05', 'NTD02')
ON CONFLICT ("maMon") DO NOTHING;

-- ============================================================================
-- BƯỚC 12: PHIẾU NHẬP KHO
-- ============================================================================
INSERT INTO phieunhap ("maPN", "maNV", "ngayNhapKho", "nguoiGiao", "tenNCC") VALUES
  ('PN001', 'NV001', '2025-10-01 08:30:00', 'Nguyễn Văn Tú', 'Công ty Cà phê Trung Nguyên'),
  ('PN002', 'NV001', '2025-10-03 09:15:00', 'Trần Thị Lan', 'Vinamilk - Chi nhánh HCM'),
  ('PN003', 'NV001', '2025-10-05 14:20:00', 'Phạm Minh Đức', 'Fresh Fruit Co. Ltd'),
  ('PN004', 'NV001', '2025-10-08 10:45:00', 'Lê Hoàng Nam', 'Cty TNHH Nguyên liệu F&B'),
  ('PN005', 'NV001', '2025-10-12 08:00:00', 'Võ Thị Hà', 'Nhà phân phối Monin Việt Nam'),
  ('PN006', 'NV001', '2025-10-15 13:30:00', 'Đặng Quốc Anh', 'Công ty Bánh kẹo Kinh Đô'),
  ('PN007', 'NV001', '2025-10-18 09:00:00', 'Nguyễn Thị Mai', 'Cty Trái cây sạch Dalat Hasfarm')
ON CONFLICT ("maPN") DO NOTHING;

-- ============================================================================
-- BƯỚC 13: CHI TIẾT PHIẾU NHẬP
-- ============================================================================
INSERT INTO chitietphieunhap ("maCTPN", "maPN", "maNL", "soLuong", "hanSuDung", "donGia") VALUES
  -- PN001: Nhập cà phê
  ('CTPN001', 'PN001', 'NL001', 50, '2026-06-30', 280000),
  ('CTPN002', 'PN001', 'NL002', 40, '2026-06-30', 220000),
  
  -- PN002: Nhập sữa
  ('CTPN003', 'PN002', 'NL003', 100, '2025-11-15', 32000),
  ('CTPN004', 'PN002', 'NL004', 60, '2026-03-20', 28000),
  ('CTPN005', 'PN002', 'NL019', 30, '2025-12-10', 45000),
  
  -- PN003: Nhập trái cây
  ('CTPN006', 'PN003', 'NL011', 15, '2025-10-10', 180000),
  ('CTPN007', 'PN003', 'NL012', 12, '2025-10-12', 150000),
  ('CTPN008', 'PN003', 'NL013', 30, '2025-10-15', 35000),
  ('CTPN009', 'PN003', 'NL014', 25, '2025-10-18', 25000),
  ('CTPN010', 'PN003', 'NL015', 40, '2025-10-20', 28000),
  
  -- PN004: Nhập trà và phụ liệu
  ('CTPN011', 'PN004', 'NL006', 10, '2026-08-30', 350000),
  ('CTPN012', 'PN004', 'NL007', 15, '2026-08-30', 280000),
  ('CTPN013', 'PN004', 'NL008', 8, '2026-05-31', 450000),
  ('CTPN014', 'PN004', 'NL016', 60, '2027-01-30', 18000),
  ('CTPN015', 'PN004', 'NL018', 120, '2026-12-31', 25000),
  
  -- PN005: Nhập siro và topping
  ('CTPN016', 'PN005', 'NL009', 20, '2026-09-30', 85000),
  ('CTPN017', 'PN005', 'NL010', 25, '2026-09-30', 85000),
  ('CTPN018', 'PN005', 'NL026', 35, '2026-06-30', 42000),
  ('CTPN019', 'PN005', 'NL027', 15, '2026-12-31', 95000),
  
  -- PN006: Nhập nguyên liệu bánh
  ('CTPN020', 'PN006', 'NL021', 50, '2026-07-30', 22000),
  ('CTPN021', 'PN006', 'NL022', 20, '2026-04-30', 180000),
  ('CTPN022', 'PN006', 'NL023', 60, '2025-11-15', 35000),
  ('CTPN023', 'PN006', 'NL024', 15, '2026-02-28', 220000),
  ('CTPN024', 'PN006', 'NL025', 30, '2026-10-31', 75000),
  
  -- PN007: Nhập bổ sung trái cây
  ('CTPN025', 'PN007', 'NL013', 35, '2025-10-25', 38000),
  ('CTPN026', 'PN007', 'NL014', 30, '2025-10-28', 27000)
ON CONFLICT ("maCTPN") DO NOTHING;

-- ============================================================================
-- BƯỚC 14: HÓA ĐƠN MẪU (Tháng 10/2025)
-- ============================================================================
INSERT INTO hoadon ("maHD", "maNV", "maTheBan", "maKM", "ngay", "phuongThucThanhToan") VALUES
  -- Tuần 1
  ('HD001', 'NV002', 'TB01', NULL, '2025-10-01 08:30:00', 'Tiền mặt'),
  ('HD002', 'NV002', 'TB02', 'KM001', '2025-10-01 09:15:00', 'Chuyển khoản'),
  ('HD003', 'NV003', 'TB03', NULL, '2025-10-01 14:20:00', 'Tiền mặt'),
  ('HD004', 'NV003', NULL, 'KM002', '2025-10-01 15:45:00', 'Momo'),
  ('HD005', 'NV002', 'TB04', NULL, '2025-10-02 10:30:00', 'Tiền mặt'),
  
  -- Tuần 2
  ('HD006', 'NV002', 'TB05', 'KM003', '2025-10-08 09:00:00', 'ZaloPay'),
  ('HD007', 'NV003', 'TB06', NULL, '2025-10-08 14:30:00', 'Tiền mặt'),
  ('HD008', 'NV003', NULL, 'KM001', '2025-10-09 16:00:00', 'Chuyển khoản'),
  ('HD009', 'NV002', 'TB07', NULL, '2025-10-10 11:20:00', 'Tiền mặt'),
  ('HD010', 'NV003', 'TB08', 'KM004', '2025-10-10 15:45:00', 'VNPay'),
  
  -- Tuần 3
  ('HD011', 'NV002', 'TB09', NULL, '2025-10-15 10:00:00', 'Tiền mặt'),
  ('HD012', 'NV003', 'TB10', 'KM002', '2025-10-15 14:15:00', 'Chuyển khoản'),
  ('HD013', 'NV002', 'TB01', NULL, '2025-10-16 08:45:00', 'Tiền mặt'),
  ('HD014', 'NV003', NULL, 'KM003', '2025-10-16 15:30:00', 'Momo'),
  ('HD015', 'NV002', 'TB02', NULL, '2025-10-17 09:30:00', 'Tiền mặt'),
  
  -- Tuần 4 (gần đây nhất)
  ('HD016', 'NV003', 'TB03', 'KM001', '2025-10-20 10:15:00', 'ZaloPay'),
  ('HD017', 'NV002', 'TB04', NULL, '2025-10-20 14:00:00', 'Tiền mặt'),
  ('HD018', 'NV003', NULL, 'KM004', '2025-10-20 16:20:00', 'Chuyển khoản'),
  ('HD019', 'NV002', 'TB05', NULL, '2025-10-21 11:00:00', 'Tiền mặt'),
  ('HD020', 'NV003', 'TB06', 'KM002', '2025-10-21 15:45:00', 'VNPay')
ON CONFLICT ("maHD") DO NOTHING;

-- ============================================================================
-- BƯỚC 15: CHI TIẾT HÓA ĐƠN
-- ============================================================================
INSERT INTO chitiethoadon ("maCTHD", "maHD", "maMon", "maSize", "soLuong", "donGia", "ghiChu") VALUES
  -- HD001
  ('CTHD001', 'HD001', 'MON001', 'M', 2, 35000, 'Ít đường'),
  ('CTHD002', 'HD001', 'MON017', 'S', 1, 55000, NULL),
  
  -- HD002
  ('CTHD003', 'HD002', 'MON005', 'L', 1, 45000, NULL),
  ('CTHD004', 'HD002', 'MON019', 'S', 2, 58000, NULL),
  ('CTHD005', 'HD002', 'MON021', 'S', 2, 38000, NULL),
  
  -- HD003
  ('CTHD006', 'HD003', 'MON009', 'M', 3, 45000, 'Ít đá'),
  ('CTHD007', 'HD003', 'MON023', 'S', 1, 35000, 'Thêm sốt'),
  
  -- HD004
  ('CTHD008', 'HD004', 'MON002', 'M', 1, 30000, NULL),
  ('CTHD009', 'HD004', 'MON020', 'S', 1, 45000, NULL),
  
  -- HD005
  ('CTHD010', 'HD005', 'MON006', 'M', 2, 45000, 'Nóng'),
  ('CTHD011', 'HD005', 'MON018', 'S', 1, 52000, NULL),
  
  -- HD006
  ('CTHD012', 'HD006', 'MON010', 'L', 2, 48000, 'Nhiều trân châu'),
  ('CTHD013', 'HD006', 'MON022', 'S', 1, 42000, NULL),
  
  -- HD007
  ('CTHD014', 'HD007', 'MON003', 'M', 1, 38000, NULL),
  ('CTHD015', 'HD007', 'MON013', 'L', 2, 45000, NULL),
  
  -- HD008
  ('CTHD016', 'HD008', 'MON007', 'M', 2, 52000, NULL),
  ('CTHD017', 'HD008', 'MON017', 'S', 2, 55000, NULL),
  
  -- HD009
  ('CTHD018', 'HD009', 'MON011', 'M', 1, 52000, NULL),
  ('CTHD019', 'HD009', 'MON024', 'S', 3, 32000, NULL),
  
  -- HD010
  ('CTHD020', 'HD010', 'MON012', 'L', 2, 55000, 'Ít ngọt'),
  ('CTHD021', 'HD010', 'MON019', 'S', 1, 58000, NULL),
  
  -- HD011
  ('CTHD022', 'HD011', 'MON004', 'M', 2, 40000, NULL),
  ('CTHD023', 'HD011', 'MON020', 'S', 2, 45000, NULL),
  
  -- HD012
  ('CTHD024', 'HD012', 'MON009', 'L', 3, 45000, NULL),
  ('CTHD025', 'HD012', 'MON021', 'S', 2, 38000, NULL),
  
  -- HD013
  ('CTHD026', 'HD013', 'MON001', 'M', 2, 35000, NULL),
  ('CTHD027', 'HD013', 'MON022', 'S', 1, 42000, NULL),
  
  -- HD014
  ('CTHD028', 'HD014', 'MON014', 'M', 2, 48000, NULL),
  ('CTHD029', 'HD014', 'MON018', 'S', 1, 52000, NULL),
  
  -- HD015
  ('CTHD030', 'HD015', 'MON005', 'L', 1, 45000, NULL),
  ('CTHD031', 'HD015', 'MON017', 'S', 2, 55000, NULL),
  
  -- HD016
  ('CTHD032', 'HD016', 'MON010', 'M', 2, 48000, NULL),
  ('CTHD033', 'HD016', 'MON023', 'S', 2, 35000, NULL),
  
  -- HD017
  ('CTHD034', 'HD017', 'MON006', 'M', 1, 45000, NULL),
  ('CTHD035', 'HD017', 'MON019', 'S', 1, 58000, NULL),
  
  -- HD018
  ('CTHD036', 'HD018', 'MON007', 'L', 2, 52000, NULL),
  ('CTHD037', 'HD018', 'MON020', 'S', 1, 45000, NULL),
  
  -- HD019
  ('CTHD038', 'HD019', 'MON015', 'M', 3, 42000, NULL),
  ('CTHD039', 'HD019', 'MON024', 'S', 2, 32000, NULL),
  
  -- HD020
  ('CTHD040', 'HD020', 'MON012', 'M', 2, 55000, NULL),
  ('CTHD041', 'HD020', 'MON021', 'S', 2, 38000, NULL)
ON CONFLICT ("maCTHD") DO NOTHING;

-- ============================================================================
-- BƯỚC 16: PHIẾU THU
-- ============================================================================
INSERT INTO phieuthu ("maPT", "maNV", "ngay") VALUES
  ('PT001', 'NV002', '2025-10-01 18:00:00'),
  ('PT002', 'NV003', '2025-10-02 18:00:00'),
  ('PT003', 'NV002', '2025-10-08 18:00:00'),
  ('PT004', 'NV003', '2025-10-10 18:00:00'),
  ('PT005', 'NV002', '2025-10-15 18:00:00'),
  ('PT006', 'NV003', '2025-10-17 18:00:00'),
  ('PT007', 'NV002', '2025-10-20 18:00:00'),
  ('PT008', 'NV003', '2025-10-21 18:00:00')
ON CONFLICT ("maPT") DO NOTHING;

-- ============================================================================
-- BƯỚC 17: CHI TIẾT PHIẾU THU
-- ============================================================================
INSERT INTO chitietphieuthu ("maCTPT", "maPT", "nguonThu", "soTien", "hinhThuc") VALUES
  ('CTPT001', 'PT001', 'Doanh thu bán hàng', 2850000, 'Tiền mặt'),
  ('CTPT002', 'PT001', 'Thanh toán online', 1520000, 'Chuyển khoản'),
  ('CTPT003', 'PT002', 'Doanh thu bán hàng', 3200000, 'Tiền mặt'),
  ('CTPT004', 'PT003', 'Doanh thu bán hàng', 2950000, 'Tiền mặt'),
  ('CTPT005', 'PT003', 'Thanh toán ví điện tử', 1680000, 'ZaloPay'),
  ('CTPT006', 'PT004', 'Doanh thu bán hàng', 3450000, 'Tiền mặt'),
  ('CTPT007', 'PT004', 'Thanh toán online', 1890000, 'VNPay'),
  ('CTPT008', 'PT005', 'Doanh thu bán hàng', 4200000, 'Tiền mặt'),
  ('CTPT009', 'PT006', 'Doanh thu bán hàng', 3850000, 'Tiền mặt'),
  ('CTPT010', 'PT006', 'Thanh toán ví điện tử', 2100000, 'Momo'),
  ('CTPT011', 'PT007', 'Doanh thu bán hàng', 4500000, 'Tiền mặt'),
  ('CTPT012', 'PT007', 'Thanh toán online', 2300000, 'Chuyển khoản'),
  ('CTPT013', 'PT008', 'Doanh thu bán hàng', 3900000, 'Tiền mặt'),
  ('CTPT014', 'PT008', 'Thanh toán ví điện tử', 1950000, 'VNPay')
ON CONFLICT ("maCTPT") DO NOTHING;

-- ============================================================================
-- BƯỚC 18: PHIẾU CHI
-- ============================================================================
INSERT INTO phieuchi ("maPC", "maNV", "ngay") VALUES
  ('PC001', 'NV001', '2025-10-01 16:00:00'),
  ('PC002', 'NV001', '2025-10-03 16:00:00'),
  ('PC003', 'NV001', '2025-10-05 16:00:00'),
  ('PC004', 'NV001', '2025-10-08 16:00:00'),
  ('PC005', 'NV001', '2025-10-12 16:00:00'),
  ('PC006', 'NV001', '2025-10-15 16:00:00'),
  ('PC007', 'NV001', '2025-10-18 16:00:00'),
  ('PC008', 'NV001', '2025-10-20 16:00:00')
ON CONFLICT ("maPC") DO NOTHING;

-- ============================================================================
-- BƯỚC 19: CHI TIẾT PHIẾU CHI
-- ============================================================================
INSERT INTO chitietphieuchi ("maCTPC", "maPC", "loaiChiPhi", "tenKhoanChi", "soTien", "hinhThuc") VALUES
  ('CTPC001', 'PC001', 'Nguyên liệu', 'Nhập cà phê - PN001', 20000000, 'Chuyển khoản'),
  ('CTPC002', 'PC002', 'Nguyên liệu', 'Nhập sữa - PN002', 8500000, 'Tiền mặt'),
  ('CTPC003', 'PC003', 'Nguyên liệu', 'Nhập trái cây - PN003', 3250000, 'Tiền mặt'),
  ('CTPC004', 'PC004', 'Nguyên liệu', 'Nhập trà và phụ liệu - PN004', 12800000, 'Chuyển khoản'),
  ('CTPC005', 'PC005', 'Nguyên liệu', 'Nhập siro và topping - PN005', 4500000, 'Tiền mặt'),
  ('CTPC006', 'PC006', 'Nguyên liệu', 'Nhập NL bánh - PN006', 9200000, 'Chuyển khoản'),
  ('CTPC007', 'PC007', 'Nguyên liệu', 'Nhập trái cây - PN007', 2400000, 'Tiền mặt'),
  ('CTPC008', 'PC008', 'Điện nước', 'Tiền điện tháng 10', 3500000, 'Chuyển khoản'),
  ('CTPC009', 'PC008', 'Điện nước', 'Tiền nước tháng 10', 850000, 'Tiền mặt'),
  ('CTPC010', 'PC001', 'Vận hành', 'Sửa chữa máy pha cà phê', 1200000, 'Tiền mặt'),
  ('CTPC011', 'PC003', 'Marketing', 'In tờ rơi khuyến mãi', 800000, 'Tiền mặt'),
  ('CTPC012', 'PC005', 'Vận hành', 'Vệ sinh máy lạnh định kỳ', 650000, 'Tiền mặt'),
  ('CTPC013', 'PC006', 'Lương', 'Tạm ứng lương tháng 10', 15000000, 'Chuyển khoản'),
  ('CTPC014', 'PC008', 'Vận hành', 'Mua thiết bị văn phòng', 2300000, 'Chuyển khoản')
ON CONFLICT ("maCTPC") DO NOTHING;

-- ============================================================================
-- BƯỚC 20: PHIẾU XUẤT (Sử dụng nguyên liệu)
-- ============================================================================
INSERT INTO phieuxuat ("maPX", "maNV", "ngayXuatKho", "lyDoXuatKho") VALUES
  ('PX001', 'NV004', '2025-10-02 08:00:00', 'Xuất kho phục vụ sản xuất ngày 02/10'),
  ('PX002', 'NV005', '2025-10-09 08:00:00', 'Xuất kho phục vụ sản xuất ngày 09/10'),
  ('PX003', 'NV004', '2025-10-16 08:00:00', 'Xuất kho phục vụ sản xuất ngày 16/10'),
  ('PX004', 'NV005', '2025-10-21 08:00:00', 'Xuất kho phục vụ sản xuất ngày 21/10')
ON CONFLICT ("maPX") DO NOTHING;

-- ============================================================================
-- BƯỚC 21: CHI TIẾT PHIẾU XUẤT
-- ============================================================================
INSERT INTO chitietphieuxuat ("maCTPX", "maPX", "maNL", "soLuong") VALUES
  -- PX001
  ('CTPX001', 'PX001', 'NL001', 5),
  ('CTPX002', 'PX001', 'NL002', 4),
  ('CTPX003', 'PX001', 'NL003', 20),
  ('CTPX004', 'PX001', 'NL016', 8),
  
  -- PX002
  ('CTPX005', 'PX002', 'NL001', 6),
  ('CTPX006', 'PX002', 'NL003', 18),
  ('CTPX007', 'PX002', 'NL006', 2),
  ('CTPX008', 'PX002', 'NL013', 5),
  
  -- PX003
  ('CTPX009', 'PX003', 'NL001', 5),
  ('CTPX010', 'PX003', 'NL002', 3),
  ('CTPX011', 'PX003', 'NL003', 22),
  ('CTPX012', 'PX003', 'NL011', 3),
  
  -- PX004
  ('CTPX013', 'PX004', 'NL001', 7),
  ('CTPX014', 'PX004', 'NL003', 25),
  ('CTPX015', 'PX004', 'NL007', 2),
  ('CTPX016', 'PX004', 'NL014', 4)
ON CONFLICT ("maCTPX") DO NOTHING;

COMMIT;

-- ============================================================================
-- KẾT THÚC IMPORT DỮ LIỆU
-- ============================================================================
-- Thống kê sau khi import:
SELECT 
  'Nhóm thực đơn' as bang, COUNT(*) as so_luong FROM nhomthucdon
UNION ALL
SELECT 'Loại món', COUNT(*) FROM loaimon
UNION ALL
SELECT 'Size', COUNT(*) FROM size
UNION ALL
SELECT 'Bàn', COUNT(*) FROM theban
UNION ALL
SELECT 'Nhân viên', COUNT(*) FROM nhanvien
UNION ALL
SELECT 'Khuyến mãi', COUNT(*) FROM khuyenmai
UNION ALL
SELECT 'Nguyên liệu', COUNT(*) FROM nguyenlieu
UNION ALL
SELECT 'Món ăn', COUNT(*) FROM mon
UNION ALL
SELECT 'Phiếu nhập', COUNT(*) FROM phieunhap
UNION ALL
SELECT 'CT Phiếu nhập', COUNT(*) FROM chitietphieunhap
UNION ALL
SELECT 'Hóa đơn', COUNT(*) FROM hoadon
UNION ALL
SELECT 'CT Hóa đơn', COUNT(*) FROM chitiethoadon
UNION ALL
SELECT 'Phiếu thu', COUNT(*) FROM phieuthu
UNION ALL
SELECT 'CT Phiếu thu', COUNT(*) FROM chitietphieuthu
UNION ALL
SELECT 'Phiếu chi', COUNT(*) FROM phieuchi
UNION ALL
SELECT 'CT Phiếu chi', COUNT(*) FROM chitietphieuchi
UNION ALL
SELECT 'Phiếu xuất', COUNT(*) FROM phieuxuat
UNION ALL
SELECT 'CT Phiếu xuất', COUNT(*) FROM chitietphieuxuat;

-- ============================================================================
-- HOÀN TẤT! Dữ liệu mẫu đã được import thành công.
-- ============================================================================

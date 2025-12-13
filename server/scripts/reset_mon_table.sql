-- Script: Reset bảng Mon với dữ liệu khớp ảnh local
-- Chạy script này trong PostgreSQL để xóa và tạo lại dữ liệu menu

-- 1. Xóa các bản ghi liên quan trước (để tránh lỗi foreign key)
DELETE FROM "chitietdonhang";
DELETE FROM "dsmontrongcombo";
DELETE FROM "giammon";

-- 2. Xóa tất cả món
DELETE FROM "mon";

-- 3. Tạo lại dữ liệu món khớp với ảnh local
-- Lưu ý: imgUrl để NULL vì sẽ dùng ảnh local từ client

-- ============================================================================
-- CÀ PHÊ
-- ============================================================================
INSERT INTO "mon" ("MaMon", "TenMon", "LoaiMon", "NhomMon", "DonGia", "DonViTinh", "TrangThai", "imgUrl") VALUES
('M001', 'Cà Phê Đen', 'cà phê', 'đồ uống', 25000, 'ly', 'hoạt động', NULL),
('M002', 'Cà Phê Nâu', 'cà phê', 'đồ uống', 30000, 'ly', 'hoạt động', NULL),
('M003', 'Cà Phê Muối', 'cà phê', 'đồ uống', 35000, 'ly', 'hoạt động', NULL),
('M004', 'Americano', 'cà phê', 'đồ uống', 40000, 'ly', 'hoạt động', NULL),
('M005', 'Americano Mơ', 'cà phê', 'đồ uống', 45000, 'ly', 'hoạt động', NULL),
('M006', 'Cold Brew Bưởi Hồng', 'cà phê', 'đồ uống', 50000, 'ly', 'hoạt động', NULL),
('M007', 'Đen 250ml', 'cà phê', 'đồ uống', 35000, 'chai', 'hoạt động', NULL),
('M008', 'Nâu 250ml', 'cà phê', 'đồ uống', 40000, 'chai', 'hoạt động', NULL),
('M009', 'Dreamy 250ml', 'cà phê', 'đồ uống', 45000, 'chai', 'hoạt động', NULL);

-- ============================================================================
-- MATCHA
-- ============================================================================
INSERT INTO "mon" ("MaMon", "TenMon", "LoaiMon", "NhomMon", "DonGia", "DonViTinh", "TrangThai", "imgUrl") VALUES
('M010', 'Matcha Latte', 'matcha', 'đồ uống', 50000, 'ly', 'hoạt động', NULL),
('M011', 'Matcha Coco', 'matcha', 'đồ uống', 55000, 'ly', 'hoạt động', NULL),
('M012', 'Matcha Xoài', 'matcha', 'đồ uống', 55000, 'ly', 'hoạt động', NULL);

-- ============================================================================
-- Ô LONG / TRÀ
-- ============================================================================
INSERT INTO "mon" ("MaMon", "TenMon", "LoaiMon", "NhomMon", "DonGia", "DonViTinh", "TrangThai", "imgUrl") VALUES
('M013', 'Ô Long Sữa', 'ô long', 'đồ uống', 45000, 'ly', 'hoạt động', NULL),
('M014', 'Ô Long Đào', 'ô long', 'đồ uống', 45000, 'ly', 'hoạt động', NULL),
('M015', 'Ô Long Xoài', 'ô long', 'đồ uống', 45000, 'ly', 'hoạt động', NULL),
('M016', 'Ô Long Machiato', 'ô long', 'đồ uống', 50000, 'ly', 'hoạt động', NULL),
('M017', 'Ô Long Matcha', 'ô long', 'đồ uống', 50000, 'ly', 'hoạt động', NULL),
('M018', 'Ô Long Nhài Vải', 'ô long', 'đồ uống', 50000, 'ly', 'hoạt động', NULL),
('M019', 'Ô Long Nhiệt Đới', 'ô long', 'đồ uống', 50000, 'ly', 'hoạt động', NULL),
('M020', 'Ô Long Sữa Dừa', 'ô long', 'đồ uống', 55000, 'ly', 'hoạt động', NULL),
('M021', 'Ô Long Sữa Nhài', 'ô long', 'đồ uống', 55000, 'ly', 'hoạt động', NULL);

-- ============================================================================
-- ĐỒ XAY / SMOOTHIE
-- ============================================================================
INSERT INTO "mon" ("MaMon", "TenMon", "LoaiMon", "NhomMon", "DonGia", "DonViTinh", "TrangThai", "imgUrl") VALUES
('M022', 'Bơ Dừa', 'sinh tố', 'đồ uống', 55000, 'ly', 'hoạt động', NULL),
('M023', 'Nhãn Dừa Đá Xay', 'sinh tố', 'đồ uống', 55000, 'ly', 'hoạt động', NULL);

-- ============================================================================
-- ĐỒ ĂN
-- ============================================================================
INSERT INTO "mon" ("MaMon", "TenMon", "LoaiMon", "NhomMon", "DonGia", "DonViTinh", "TrangThai", "imgUrl") VALUES
('M024', 'Croissant', 'bánh', 'đồ ăn', 35000, 'cái', 'hoạt động', NULL),
('M025', 'Tiramisu', 'bánh', 'đồ ăn', 45000, 'cái', 'hoạt động', NULL),
('M026', 'Indomie', 'mì', 'đồ ăn', 30000, 'tô', 'hoạt động', NULL),
('M027', 'Khô Gà', 'snacks', 'đồ ăn', 25000, 'phần', 'hoạt động', NULL),
('M028', 'Châng', 'snacks', 'đồ ăn', 20000, 'phần', 'hoạt động', NULL);

-- ============================================================================
-- KIỂM TRA KẾT QUẢ
-- ============================================================================
SELECT "MaMon", "TenMon", "LoaiMon", "NhomMon", "DonGia" FROM "mon" ORDER BY "MaMon";

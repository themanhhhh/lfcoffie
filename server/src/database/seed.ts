import { AppDataSource } from './data-source'
import bcrypt from 'bcryptjs'
import { CaLam } from '../entities/CaLam'
import { NhanVien } from '../entities/NhanVien'
import { Mon } from '../entities/Mon'
import { CTKM } from '../entities/CTKM'
import { PhienLamViec } from '../entities/PhienLamViec'
import { DonHang } from '../entities/HoaDon'
import { ChiTietDonHang } from '../entities/ChiTietHoaDon'
import { ThuChi } from '../entities/ThuChi'
import { NghiepVu } from '../entities/NghiepVu'

async function seed() {
  try {
    console.log('🔄 Đang kết nối database...')
    await AppDataSource.initialize()
    console.log('✅ Đã kết nối database thành công!')

    const caLamRepo = AppDataSource.getRepository(CaLam)
    const nhanVienRepo = AppDataSource.getRepository(NhanVien)
    const monRepo = AppDataSource.getRepository(Mon)
    const ctkmRepo = AppDataSource.getRepository(CTKM)
    const phienLamViecRepo = AppDataSource.getRepository(PhienLamViec)
    const donHangRepo = AppDataSource.getRepository(DonHang)
    const chiTietDonHangRepo = AppDataSource.getRepository(ChiTietDonHang)
    const thuChiRepo = AppDataSource.getRepository(ThuChi)
    const nghiepVuRepo = AppDataSource.getRepository(NghiepVu)

    // ============================================================================
    // 1. TẠO CA LÀM VIỆC
    // ============================================================================
    console.log('\n📅 Đang tạo ca làm việc...')
    const caLamData = [
      { MaCaLam: 'CL001', TenCaLam: 'Ca sáng', ThoiGianBatDau: '07:00:00', ThoiGianKetThuc: '12:00:00' },
      { MaCaLam: 'CL002', TenCaLam: 'Ca chiều', ThoiGianBatDau: '12:00:00', ThoiGianKetThuc: '18:00:00' },
      { MaCaLam: 'CL003', TenCaLam: 'Ca tối', ThoiGianBatDau: '18:00:00', ThoiGianKetThuc: '22:00:00' },
      { MaCaLam: 'CL004', TenCaLam: 'Ca full-time', ThoiGianBatDau: '07:00:00', ThoiGianKetThuc: '22:00:00' }
    ]

    for (const ca of caLamData) {
      const existing = await caLamRepo.findOne({ where: { MaCaLam: ca.MaCaLam } })
      if (!existing) {
        await caLamRepo.save(caLamRepo.create(ca))
        console.log(`  ✅ Đã tạo ca: ${ca.TenCaLam}`)
      } else {
        console.log(`  ℹ️  Ca ${ca.TenCaLam} đã tồn tại`)
      }
    }

    // ============================================================================
    // 2. TẠO NHÂN VIÊN
    // ============================================================================
    console.log('\n👥 Đang tạo nhân viên...')
    const hashedPassword = await bcrypt.hash('admin123', 10)
    const defaultPassword = await bcrypt.hash('123456', 10)

    const caLam1 = await caLamRepo.findOne({ where: { MaCaLam: 'CL001' } })
    const caLam4 = await caLamRepo.findOne({ where: { MaCaLam: 'CL004' } })

    const nhanVienData = [
      {
        MaNhanVien: 'NV001',
        TenNhanVien: 'Admin Quản lý',
        ChucVu: 'Quản lý',
        GioiTinh: 'Nam',
        NgaySinh: new Date('1990-01-15'),
        TaiKhoan: 'admin',
        MatKhau: hashedPassword,
        SoDienThoai: '0901234567',
        TrangThai: 'hoạt động',
        caLam: caLam4!
      },
      {
        MaNhanVien: 'NV002',
        TenNhanVien: 'Lê Thị Hoa',
        ChucVu: 'Thu ngân',
        GioiTinh: 'Nữ',
        NgaySinh: new Date('1995-05-20'),
        TaiKhoan: 'hoa.lt',
        MatKhau: defaultPassword,
        SoDienThoai: '0902345678',
        TrangThai: 'hoạt động',
        caLam: caLam1!
      },
      {
        MaNhanVien: 'NV003',
        TenNhanVien: 'Nguyễn Văn An',
        ChucVu: 'Thu ngân',
        GioiTinh: 'Nam',
        NgaySinh: new Date('1998-08-10'),
        TaiKhoan: 'an.nv',
        MatKhau: defaultPassword,
        SoDienThoai: '0903456789',
        TrangThai: 'hoạt động',
        caLam: caLam1!
      },
      {
        MaNhanVien: 'NV004',
        TenNhanVien: 'Phạm Thị Mai',
        ChucVu: 'Pha chế',
        GioiTinh: 'Nữ',
        NgaySinh: new Date('1997-03-15'),
        TaiKhoan: 'mai.pt',
        MatKhau: defaultPassword,
        SoDienThoai: '0904567890',
        TrangThai: 'hoạt động',
        caLam: caLam1!
      },
      {
        MaNhanVien: 'NV005',
        TenNhanVien: 'Trương Quốc Huy',
        ChucVu: 'Pha chế',
        GioiTinh: 'Nam',
        NgaySinh: new Date('1996-11-25'),
        TaiKhoan: 'huy.tq',
        MatKhau: defaultPassword,
        SoDienThoai: '0905678901',
        TrangThai: 'hoạt động',
        caLam: caLam1!
      }
    ]

    for (const nv of nhanVienData) {
      const existing = await nhanVienRepo.findOne({ where: { MaNhanVien: nv.MaNhanVien } })
      if (!existing) {
        await nhanVienRepo.save(nhanVienRepo.create(nv))
        console.log(`  ✅ Đã tạo nhân viên: ${nv.TenNhanVien} (${nv.ChucVu})`)
      } else {
        console.log(`  ℹ️  Nhân viên ${nv.TenNhanVien} đã tồn tại`)
      }
    }

    // ============================================================================
    // 3. TẠO MENU (MÓN)
    // ============================================================================
    console.log('\n🍽️  Đang tạo menu...')
    const monData = [
      // Cà phê
      { MaMon: 'M001', TenMon: 'Cà phê đen', LoaiMon: 'cà phê', NhomMon: 'đồ uống', DonGia: 25000, DonViTinh: 'ly', TrangThai: 'hoạt động', imgUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400' },
      { MaMon: 'M002', TenMon: 'Cà phê sữa', LoaiMon: 'cà phê', NhomMon: 'đồ uống', DonGia: 30000, DonViTinh: 'ly', TrangThai: 'hoạt động', imgUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400' },
      { MaMon: 'M003', TenMon: 'Cà phê bạc xỉu', LoaiMon: 'cà phê', NhomMon: 'đồ uống', DonGia: 35000, DonViTinh: 'ly', TrangThai: 'hoạt động', imgUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400' },
      { MaMon: 'M004', TenMon: 'Espresso', LoaiMon: 'cà phê', NhomMon: 'đồ uống', DonGia: 40000, DonViTinh: 'ly', TrangThai: 'hoạt động', imgUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400' },
      { MaMon: 'M005', TenMon: 'Cappuccino', LoaiMon: 'cà phê', NhomMon: 'đồ uống', DonGia: 45000, DonViTinh: 'ly', TrangThai: 'hoạt động', imgUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400' },
      { MaMon: 'M006', TenMon: 'Latte', LoaiMon: 'cà phê', NhomMon: 'đồ uống', DonGia: 50000, DonViTinh: 'ly', TrangThai: 'hoạt động', imgUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400' },
      
      // Trà
      { MaMon: 'M007', TenMon: 'Trà đen', LoaiMon: 'trà', NhomMon: 'đồ uống', DonGia: 25000, DonViTinh: 'ly', TrangThai: 'hoạt động', imgUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400' },
      { MaMon: 'M008', TenMon: 'Trà xanh', LoaiMon: 'trà', NhomMon: 'đồ uống', DonGia: 25000, DonViTinh: 'ly', TrangThai: 'hoạt động', imgUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400' },
      { MaMon: 'M009', TenMon: 'Trà sữa', LoaiMon: 'trà', NhomMon: 'đồ uống', DonGia: 35000, DonViTinh: 'ly', TrangThai: 'hoạt động', imgUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400' },
      { MaMon: 'M010', TenMon: 'Trà đào', LoaiMon: 'trà', NhomMon: 'đồ uống', DonGia: 40000, DonViTinh: 'ly', TrangThai: 'hoạt động', imgUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400' },
      { MaMon: 'M011', TenMon: 'Trà chanh', LoaiMon: 'trà', NhomMon: 'đồ uống', DonGia: 30000, DonViTinh: 'ly', TrangThai: 'hoạt động', imgUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400' },
      
      // Sinh tố & Nước ép
      { MaMon: 'M012', TenMon: 'Sinh tố dâu', LoaiMon: 'sinh tố', NhomMon: 'đồ uống', DonGia: 45000, DonViTinh: 'ly', TrangThai: 'hoạt động', imgUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400' },
      { MaMon: 'M013', TenMon: 'Sinh tố xoài', LoaiMon: 'sinh tố', NhomMon: 'đồ uống', DonGia: 45000, DonViTinh: 'ly', TrangThai: 'hoạt động', imgUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400' },
      { MaMon: 'M014', TenMon: 'Nước ép cam', LoaiMon: 'nước ép', NhomMon: 'đồ uống', DonGia: 40000, DonViTinh: 'ly', TrangThai: 'hoạt động', imgUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400' },
      { MaMon: 'M015', TenMon: 'Nước ép táo', LoaiMon: 'nước ép', NhomMon: 'đồ uống', DonGia: 40000, DonViTinh: 'ly', TrangThai: 'hoạt động', imgUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400' },
      
      // Bánh
      { MaMon: 'M016', TenMon: 'Bánh croissant', LoaiMon: 'bánh', NhomMon: 'đồ ăn', DonGia: 35000, DonViTinh: 'cái', TrangThai: 'hoạt động', imgUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400' },
      { MaMon: 'M017', TenMon: 'Bánh mì sandwich', LoaiMon: 'bánh', NhomMon: 'đồ ăn', DonGia: 40000, DonViTinh: 'cái', TrangThai: 'hoạt động', imgUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' },
      { MaMon: 'M018', TenMon: 'Bánh ngọt', LoaiMon: 'bánh', NhomMon: 'đồ ăn', DonGia: 45000, DonViTinh: 'cái', TrangThai: 'hoạt động', imgUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400' },
      { MaMon: 'M019', TenMon: 'Bánh kem', LoaiMon: 'bánh', NhomMon: 'đồ ăn', DonGia: 50000, DonViTinh: 'cái', TrangThai: 'hoạt động', imgUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400' },
      
      // Đồ ăn vặt
      { MaMon: 'M020', TenMon: 'Khoai tây chiên', LoaiMon: 'snacks', NhomMon: 'đồ ăn', DonGia: 35000, DonViTinh: 'phần', TrangThai: 'hoạt động', imgUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400' },
      { MaMon: 'M021', TenMon: 'Bánh quy', LoaiMon: 'snacks', NhomMon: 'đồ ăn', DonGia: 25000, DonViTinh: 'gói', TrangThai: 'hoạt động', imgUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400' }
    ]

    for (const mon of monData) {
      const existing = await monRepo.findOne({ where: { MaMon: mon.MaMon } })
      if (!existing) {
        await monRepo.save(monRepo.create(mon))
        console.log(`  ✅ Đã tạo món: ${mon.TenMon}`)
      } else {
        console.log(`  ℹ️  Món ${mon.TenMon} đã tồn tại`)
      }
    }

    // ============================================================================
    // 4. TẠO CHƯƠNG TRÌNH KHUYẾN MÃI (CTKM)
    // ============================================================================
    console.log('\n🎫 Đang tạo chương trình khuyến mãi...')
    const ctkmData = [
      { MaCTKM: 'KM001', TenCTKM: 'Giảm 10% cho đơn hàng trên 200k', LoaiCTKM: 'giamhoadon' },
      { MaCTKM: 'KM002', TenCTKM: 'Giảm 20% cho đơn hàng trên 500k', LoaiCTKM: 'giamhoadon' },
      { MaCTKM: 'KM003', TenCTKM: 'Giảm 15% cho cà phê', LoaiCTKM: 'giammon' },
      { MaCTKM: 'KM004', TenCTKM: 'Mua 2 tặng 1 cho trà sữa', LoaiCTKM: 'combo' },
      { MaCTKM: 'KM005', TenCTKM: 'Giảm 5k cho sinh tố', LoaiCTKM: 'giammon' }
    ]

    for (const ctkm of ctkmData) {
      const existing = await ctkmRepo.findOne({ where: { MaCTKM: ctkm.MaCTKM } })
      if (!existing) {
        await ctkmRepo.save(ctkmRepo.create(ctkm))
        console.log(`  ✅ Đã tạo CTKM: ${ctkm.TenCTKM}`)
      } else {
        console.log(`  ℹ️  CTKM ${ctkm.TenCTKM} đã tồn tại`)
      }
    }

    // ============================================================================
    // 5. TẠO NGHIỆP VỤ (CHO THU CHI)
    // ============================================================================
    console.log('\n💰 Đang tạo nghiệp vụ...')
    const nghiepVuData = [
      // Nghiệp vụ thu
      { MaNghiepVu: 'NV001', TenNghiepVu: 'Thu tiền bán hàng', LoaiGiaoDich: 'thu' },
      { MaNghiepVu: 'NV005', TenNghiepVu: 'Thu tiền khác', LoaiGiaoDich: 'thu' },
      { MaNghiepVu: 'NV006', TenNghiepVu: 'Thu tiền dịch vụ', LoaiGiaoDich: 'thu' },
      { MaNghiepVu: 'NV007', TenNghiepVu: 'Thu tiền bán đồ lưu niệm', LoaiGiaoDich: 'thu' },
      { MaNghiepVu: 'NV008', TenNghiepVu: 'Thu phụ thu', LoaiGiaoDich: 'thu' },
      
      // Nghiệp vụ chi - Chi phí nguyên vật liệu
      { MaNghiepVu: 'NV002', TenNghiepVu: 'Chi phí nguyên vật liệu', LoaiGiaoDich: 'chi' },
      { MaNghiepVu: 'NV009', TenNghiepVu: 'Nguyên vật liệu', LoaiGiaoDich: 'chi' },
      { MaNghiepVu: 'NV010', TenNghiepVu: 'Chi mua cà phê', LoaiGiaoDich: 'chi' },
      { MaNghiepVu: 'NV011', TenNghiepVu: 'Chi mua sữa', LoaiGiaoDich: 'chi' },
      { MaNghiepVu: 'NV012', TenNghiepVu: 'Chi mua trà', LoaiGiaoDich: 'chi' },
      
      // Nghiệp vụ chi - Chi phí nhân sự
      { MaNghiepVu: 'NV003', TenNghiepVu: 'Chi phí nhân sự', LoaiGiaoDich: 'chi' },
      { MaNghiepVu: 'NV013', TenNghiepVu: 'Nhân sự', LoaiGiaoDich: 'chi' },
      { MaNghiepVu: 'NV014', TenNghiepVu: 'Chi tiền lương nhân viên', LoaiGiaoDich: 'chi' },
      { MaNghiepVu: 'NV015', TenNghiepVu: 'Chi thưởng nhân viên', LoaiGiaoDich: 'chi' },
      
      // Nghiệp vụ chi - Chi phí cố định
      { MaNghiepVu: 'NV004', TenNghiepVu: 'Chi phí cố định', LoaiGiaoDich: 'chi' },
      { MaNghiepVu: 'NV016', TenNghiepVu: 'Cố định', LoaiGiaoDich: 'chi' },
      { MaNghiepVu: 'NV017', TenNghiepVu: 'Chi tiền điện nước', LoaiGiaoDich: 'chi' },
      { MaNghiepVu: 'NV018', TenNghiepVu: 'Chi tiền thuê mặt bằng', LoaiGiaoDich: 'chi' },
      { MaNghiepVu: 'NV019', TenNghiepVu: 'Chi khấu hao máy móc', LoaiGiaoDich: 'chi' },
      
      // Nghiệp vụ chi - Chi phí marketing
      { MaNghiepVu: 'NV020', TenNghiepVu: 'Chi phí marketing', LoaiGiaoDich: 'chi' },
      { MaNghiepVu: 'NV021', TenNghiepVu: 'Marketing', LoaiGiaoDich: 'chi' },
      { MaNghiepVu: 'NV022', TenNghiepVu: 'Chi quảng cáo Facebook', LoaiGiaoDich: 'chi' },
      { MaNghiepVu: 'NV023', TenNghiepVu: 'Chi quảng cáo Google', LoaiGiaoDich: 'chi' },
      { MaNghiepVu: 'NV024', TenNghiepVu: 'Chi in tờ rơi', LoaiGiaoDich: 'chi' },
      
      // Nghiệp vụ chi - Chi phí khác
      { MaNghiepVu: 'NV025', TenNghiepVu: 'Chi phí khác', LoaiGiaoDich: 'chi' },
      { MaNghiepVu: 'NV026', TenNghiepVu: 'Khác', LoaiGiaoDich: 'chi' },
      { MaNghiepVu: 'NV027', TenNghiepVu: 'Chi vệ sinh', LoaiGiaoDich: 'chi' },
      { MaNghiepVu: 'NV028', TenNghiepVu: 'Chi văn phòng phẩm', LoaiGiaoDich: 'chi' },
      { MaNghiepVu: 'NV029', TenNghiepVu: 'Chi bảo trì', LoaiGiaoDich: 'chi' }
    ]

    for (const nv of nghiepVuData) {
      const existing = await nghiepVuRepo.findOne({ where: { MaNghiepVu: nv.MaNghiepVu } })
      if (!existing) {
        await nghiepVuRepo.save(nghiepVuRepo.create(nv))
        console.log(`  ✅ Đã tạo nghiệp vụ: ${nv.TenNghiepVu}`)
      } else {
        console.log(`  ℹ️  Nghiệp vụ ${nv.TenNghiepVu} đã tồn tại`)
      }
    }

    // ============================================================================
    // 6. TẠO PHIÊN LÀM VIỆC
    // ============================================================================
    console.log('\n📋 Đang tạo phiên làm việc...')
    const nhanVien1 = await nhanVienRepo.findOne({ where: { MaNhanVien: 'NV001' } })
    const nhanVien2 = await nhanVienRepo.findOne({ where: { MaNhanVien: 'NV002' } })

    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const twoDaysAgo = new Date(today)
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

    const phienLamViecData = [
      {
        MaPhienLamViec: 'PLV001',
        Ngay: today,
        ThoiGianMo: '07:00:00',
        ThoiGianDong: '22:00:00',
        TrangThai: 'đóng',
        caLam: caLam4!,
        nhanVien: nhanVien1!
      },
      {
        MaPhienLamViec: 'PLV002',
        Ngay: yesterday,
        ThoiGianMo: '07:00:00',
        ThoiGianDong: '22:00:00',
        TrangThai: 'đóng',
        caLam: caLam4!,
        nhanVien: nhanVien1!
      },
      {
        MaPhienLamViec: 'PLV003',
        Ngay: twoDaysAgo,
        ThoiGianMo: '07:00:00',
        ThoiGianDong: '18:00:00',
        TrangThai: 'đóng',
        caLam: caLam1!,
        nhanVien: nhanVien2!
      }
    ]

    for (const plv of phienLamViecData) {
      const existing = await phienLamViecRepo.findOne({ where: { MaPhienLamViec: plv.MaPhienLamViec } })
      if (!existing) {
        await phienLamViecRepo.save(phienLamViecRepo.create(plv))
        console.log(`  ✅ Đã tạo phiên làm việc: ${plv.MaPhienLamViec}`)
      } else {
        console.log(`  ℹ️  Phiên làm việc ${plv.MaPhienLamViec} đã tồn tại`)
      }
    }

    // ============================================================================
    // 7. TẠO ĐƠN HÀNG VÀ CHI TIẾT ĐƠN HÀNG
    // ============================================================================
    console.log('\n🛒 Đang tạo đơn hàng...')
    const plv1 = await phienLamViecRepo.findOne({ where: { MaPhienLamViec: 'PLV001' } })
    const plv2 = await phienLamViecRepo.findOne({ where: { MaPhienLamViec: 'PLV002' } })
    const plv3 = await phienLamViecRepo.findOne({ where: { MaPhienLamViec: 'PLV003' } })
    const ctkm1 = await ctkmRepo.findOne({ where: { MaCTKM: 'KM001' } })

    const mon1 = await monRepo.findOne({ where: { MaMon: 'M001' } })
    const mon2 = await monRepo.findOne({ where: { MaMon: 'M002' } })
    const mon3 = await monRepo.findOne({ where: { MaMon: 'M005' } })
    const mon4 = await monRepo.findOne({ where: { MaMon: 'M009' } })
    const mon5 = await monRepo.findOne({ where: { MaMon: 'M016' } })

    const donHangData = [
      {
        MaDonHang: 'DH001',
        Ngay: today,
        PhuongThucThanhToan: 'Tiền mặt',
        phienLamViec: plv1!,
        ctkm: ctkm1
      },
      {
        MaDonHang: 'DH002',
        Ngay: today,
        PhuongThucThanhToan: 'Chuyển khoản',
        phienLamViec: plv1!,
        ctkm: null
      },
      {
        MaDonHang: 'DH003',
        Ngay: yesterday,
        PhuongThucThanhToan: 'Tiền mặt',
        phienLamViec: plv2!,
        ctkm: null
      },
      {
        MaDonHang: 'DH004',
        Ngay: yesterday,
        PhuongThucThanhToan: 'Chuyển khoản',
        phienLamViec: plv2!,
        ctkm: ctkm1
      },
      {
        MaDonHang: 'DH005',
        Ngay: twoDaysAgo,
        PhuongThucThanhToan: 'Tiền mặt',
        phienLamViec: plv3!,
        ctkm: null
      }
    ]

    for (const dh of donHangData) {
      const existing = await donHangRepo.findOne({ where: { MaDonHang: dh.MaDonHang } })
      if (!existing) {
        await donHangRepo.save(donHangRepo.create(dh))
        console.log(`  ✅ Đã tạo đơn hàng: ${dh.MaDonHang}`)
      } else {
        console.log(`  ℹ️  Đơn hàng ${dh.MaDonHang} đã tồn tại`)
      }
    }

    // Tạo chi tiết đơn hàng
    console.log('\n📝 Đang tạo chi tiết đơn hàng...')
    const dh1 = await donHangRepo.findOne({ where: { MaDonHang: 'DH001' } })
    const dh2 = await donHangRepo.findOne({ where: { MaDonHang: 'DH002' } })
    const dh3 = await donHangRepo.findOne({ where: { MaDonHang: 'DH003' } })
    const dh4 = await donHangRepo.findOne({ where: { MaDonHang: 'DH004' } })
    const dh5 = await donHangRepo.findOne({ where: { MaDonHang: 'DH005' } })

    const chiTietDonHangData = [
      { MaCTDH: 'CTDH001', donHang: dh1!, mon: mon1!, DonGia: 25000, SoLuong: 2 },
      { MaCTDH: 'CTDH002', donHang: dh1!, mon: mon2!, DonGia: 30000, SoLuong: 1 },
      { MaCTDH: 'CTDH003', donHang: dh2!, mon: mon3!, DonGia: 45000, SoLuong: 2 },
      { MaCTDH: 'CTDH004', donHang: dh2!, mon: mon5!, DonGia: 35000, SoLuong: 1 },
      { MaCTDH: 'CTDH005', donHang: dh3!, mon: mon4!, DonGia: 35000, SoLuong: 3 },
      { MaCTDH: 'CTDH006', donHang: dh3!, mon: mon1!, DonGia: 25000, SoLuong: 1 },
      { MaCTDH: 'CTDH007', donHang: dh4!, mon: mon2!, DonGia: 30000, SoLuong: 2 },
      { MaCTDH: 'CTDH008', donHang: dh4!, mon: mon3!, DonGia: 45000, SoLuong: 1 },
      { MaCTDH: 'CTDH009', donHang: dh5!, mon: mon1!, DonGia: 25000, SoLuong: 4 },
      { MaCTDH: 'CTDH010', donHang: dh5!, mon: mon4!, DonGia: 35000, SoLuong: 2 }
    ]

    for (const ctdh of chiTietDonHangData) {
      const existing = await chiTietDonHangRepo.findOne({ where: { MaCTDH: ctdh.MaCTDH } })
      if (!existing) {
        await chiTietDonHangRepo.save(chiTietDonHangRepo.create(ctdh))
        console.log(`  ✅ Đã tạo chi tiết đơn hàng: ${ctdh.MaCTDH}`)
      } else {
        console.log(`  ℹ️  Chi tiết đơn hàng ${ctdh.MaCTDH} đã tồn tại`)
      }
    }

    // ============================================================================
    // 8. TẠO THU CHI
    // ============================================================================
    console.log('\n💵 Đang tạo giao dịch thu chi...')
    const nv1 = await nghiepVuRepo.findOne({ where: { MaNghiepVu: 'NV001' } }) // Thu tiền bán hàng
    const nv2 = await nghiepVuRepo.findOne({ where: { MaNghiepVu: 'NV002' } }) // Chi phí nguyên vật liệu
    const nv3 = await nghiepVuRepo.findOne({ where: { MaNghiepVu: 'NV003' } }) // Chi phí nhân sự
    const nv4 = await nghiepVuRepo.findOne({ where: { MaNghiepVu: 'NV004' } }) // Chi phí cố định
    const nv5 = await nghiepVuRepo.findOne({ where: { MaNghiepVu: 'NV005' } }) // Thu tiền khác
    const nv6 = await nghiepVuRepo.findOne({ where: { MaNghiepVu: 'NV006' } }) // Thu tiền dịch vụ
    const nv7 = await nghiepVuRepo.findOne({ where: { MaNghiepVu: 'NV007' } }) // Thu tiền bán đồ lưu niệm
    const nv9 = await nghiepVuRepo.findOne({ where: { MaNghiepVu: 'NV009' } }) // Nguyên vật liệu
    const nv13 = await nghiepVuRepo.findOne({ where: { MaNghiepVu: 'NV013' } }) // Nhân sự
    const nv16 = await nghiepVuRepo.findOne({ where: { MaNghiepVu: 'NV016' } }) // Cố định
    const nv20 = await nghiepVuRepo.findOne({ where: { MaNghiepVu: 'NV020' } }) // Chi phí marketing
    const nv21 = await nghiepVuRepo.findOne({ where: { MaNghiepVu: 'NV021' } }) // Marketing
    const nv25 = await nghiepVuRepo.findOne({ where: { MaNghiepVu: 'NV025' } }) // Chi phí khác
    const nv26 = await nghiepVuRepo.findOne({ where: { MaNghiepVu: 'NV026' } }) // Khác

    const thuChiData = [
      // Hôm nay - Thu
      {
        MaGiaoDich: 'TC001',
        ThoiGian: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 30, 0),
        SoTien: 150000,
        PhuongThucThanhToan: 'Tiền mặt',
        GhiChu: 'Thu tiền bán hàng buổi sáng',
        phienLamViec: plv1!,
        nghiepVu: nv1!
      },
      {
        MaGiaoDich: 'TC006',
        ThoiGian: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0, 0),
        SoTien: 50000,
        PhuongThucThanhToan: 'Tiền mặt',
        GhiChu: 'Thu tiền dịch vụ',
        phienLamViec: plv1!,
        nghiepVu: nv6!
      },
      {
        MaGiaoDich: 'TC007',
        ThoiGian: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0),
        SoTien: 30000,
        PhuongThucThanhToan: 'Chuyển khoản',
        GhiChu: 'Thu tiền bán đồ lưu niệm',
        phienLamViec: plv1!,
        nghiepVu: nv7!
      },
      {
        MaGiaoDich: 'TC008',
        ThoiGian: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0, 0),
        SoTien: 20000,
        PhuongThucThanhToan: 'Tiền mặt',
        GhiChu: 'Thu phụ thu',
        phienLamViec: plv1!,
        nghiepVu: nv5!
      },
      
      // Hôm nay - Chi
      {
        MaGiaoDich: 'TC002',
        ThoiGian: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0, 0),
        SoTien: 500000,
        PhuongThucThanhToan: 'Chuyển khoản',
        GhiChu: 'Chi mua nguyên liệu',
        phienLamViec: plv1!,
        nghiepVu: nv2!
      },
      {
        MaGiaoDich: 'TC009',
        ThoiGian: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0, 0),
        SoTien: 300000,
        PhuongThucThanhToan: 'Chuyển khoản',
        GhiChu: 'Chi mua cà phê',
        phienLamViec: plv1!,
        nghiepVu: nv9!
      },
      {
        MaGiaoDich: 'TC010',
        ThoiGian: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0, 0),
        SoTien: 1500000,
        PhuongThucThanhToan: 'Chuyển khoản',
        GhiChu: 'Chi tiền lương nhân viên',
        phienLamViec: plv1!,
        nghiepVu: nv3!
      },
      {
        MaGiaoDich: 'TC011',
        ThoiGian: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0, 0),
        SoTien: 500000,
        PhuongThucThanhToan: 'Chuyển khoản',
        GhiChu: 'Chi tiền thuê mặt bằng',
        phienLamViec: plv1!,
        nghiepVu: nv4!
      },
      {
        MaGiaoDich: 'TC012',
        ThoiGian: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0, 0),
        SoTien: 200000,
        PhuongThucThanhToan: 'Tiền mặt',
        GhiChu: 'Chi quảng cáo Facebook',
        phienLamViec: plv1!,
        nghiepVu: nv20!
      },
      {
        MaGiaoDich: 'TC013',
        ThoiGian: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 19, 0, 0),
        SoTien: 100000,
        PhuongThucThanhToan: 'Tiền mặt',
        GhiChu: 'Chi vệ sinh',
        phienLamViec: plv1!,
        nghiepVu: nv25!
      },
      
      // Hôm qua - Thu
      {
        MaGiaoDich: 'TC004',
        ThoiGian: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 11, 0, 0),
        SoTien: 250000,
        PhuongThucThanhToan: 'Tiền mặt',
        GhiChu: 'Thu tiền bán hàng',
        phienLamViec: plv2!,
        nghiepVu: nv1!
      },
      {
        MaGiaoDich: 'TC014',
        ThoiGian: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 12, 0, 0),
        SoTien: 40000,
        PhuongThucThanhToan: 'Tiền mặt',
        GhiChu: 'Thu tiền dịch vụ',
        phienLamViec: plv2!,
        nghiepVu: nv6!
      },
      
      // Hôm qua - Chi
      {
        MaGiaoDich: 'TC003',
        ThoiGian: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 16, 0, 0),
        SoTien: 2000000,
        PhuongThucThanhToan: 'Chuyển khoản',
        GhiChu: 'Chi tiền lương nhân viên',
        phienLamViec: plv2!,
        nghiepVu: nv3!
      },
      {
        MaGiaoDich: 'TC015',
        ThoiGian: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 17, 0, 0),
        SoTien: 400000,
        PhuongThucThanhToan: 'Chuyển khoản',
        GhiChu: 'Chi mua nguyên liệu',
        phienLamViec: plv2!,
        nghiepVu: nv2!
      },
      {
        MaGiaoDich: 'TC016',
        ThoiGian: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 18, 0, 0),
        SoTien: 300000,
        PhuongThucThanhToan: 'Tiền mặt',
        GhiChu: 'Chi tiền điện nước',
        phienLamViec: plv2!,
        nghiepVu: nv4!
      },
      {
        MaGiaoDich: 'TC017',
        ThoiGian: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 19, 0, 0),
        SoTien: 150000,
        PhuongThucThanhToan: 'Chuyển khoản',
        GhiChu: 'Chi quảng cáo Google',
        phienLamViec: plv2!,
        nghiepVu: nv21!
      },
      {
        MaGiaoDich: 'TC018',
        ThoiGian: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 20, 0, 0),
        SoTien: 80000,
        PhuongThucThanhToan: 'Tiền mặt',
        GhiChu: 'Chi văn phòng phẩm',
        phienLamViec: plv2!,
        nghiepVu: nv26!
      },
      
      // 2 ngày trước - Thu
      {
        MaGiaoDich: 'TC019',
        ThoiGian: new Date(twoDaysAgo.getFullYear(), twoDaysAgo.getMonth(), twoDaysAgo.getDate(), 10, 0, 0),
        SoTien: 180000,
        PhuongThucThanhToan: 'Tiền mặt',
        GhiChu: 'Thu tiền bán hàng',
        phienLamViec: plv3!,
        nghiepVu: nv1!
      },
      
      // 2 ngày trước - Chi
      {
        MaGiaoDich: 'TC005',
        ThoiGian: new Date(twoDaysAgo.getFullYear(), twoDaysAgo.getMonth(), twoDaysAgo.getDate(), 15, 30, 0),
        SoTien: 300000,
        PhuongThucThanhToan: 'Tiền mặt',
        GhiChu: 'Chi tiền điện nước',
        phienLamViec: plv3!,
        nghiepVu: nv4!
      },
      {
        MaGiaoDich: 'TC020',
        ThoiGian: new Date(twoDaysAgo.getFullYear(), twoDaysAgo.getMonth(), twoDaysAgo.getDate(), 16, 0, 0),
        SoTien: 600000,
        PhuongThucThanhToan: 'Chuyển khoản',
        GhiChu: 'Chi mua nguyên liệu',
        phienLamViec: plv3!,
        nghiepVu: nv2!
      },
      {
        MaGiaoDich: 'TC021',
        ThoiGian: new Date(twoDaysAgo.getFullYear(), twoDaysAgo.getMonth(), twoDaysAgo.getDate(), 17, 0, 0),
        SoTien: 1200000,
        PhuongThucThanhToan: 'Chuyển khoản',
        GhiChu: 'Chi tiền lương nhân viên',
        phienLamViec: plv3!,
        nghiepVu: nv13!
      },
      {
        MaGiaoDich: 'TC022',
        ThoiGian: new Date(twoDaysAgo.getFullYear(), twoDaysAgo.getMonth(), twoDaysAgo.getDate(), 18, 0, 0),
        SoTien: 100000,
        PhuongThucThanhToan: 'Tiền mặt',
        GhiChu: 'Chi in tờ rơi',
        phienLamViec: plv3!,
        nghiepVu: nv20!
      },
      {
        MaGiaoDich: 'TC023',
        ThoiGian: new Date(twoDaysAgo.getFullYear(), twoDaysAgo.getMonth(), twoDaysAgo.getDate(), 19, 0, 0),
        SoTien: 50000,
        PhuongThucThanhToan: 'Tiền mặt',
        GhiChu: 'Chi bảo trì',
        phienLamViec: plv3!,
        nghiepVu: nv25!
      }
    ]

    for (const tc of thuChiData) {
      const existing = await thuChiRepo.findOne({ where: { MaGiaoDich: tc.MaGiaoDich } })
      if (!existing) {
        await thuChiRepo.save(thuChiRepo.create(tc))
        console.log(`  ✅ Đã tạo giao dịch: ${tc.MaGiaoDich} - ${tc.SoTien.toLocaleString('vi-VN')} đ`)
      } else {
        console.log(`  ℹ️  Giao dịch ${tc.MaGiaoDich} đã tồn tại`)
      }
    }

    console.log('\n✅ Hoàn thành seed dữ liệu!')
    console.log('\n📊 Tóm tắt:')
    console.log(`  - Ca làm việc: ${caLamData.length}`)
    console.log(`  - Nhân viên: ${nhanVienData.length}`)
    console.log(`  - Món ăn: ${monData.length}`)
    console.log(`  - CTKM: ${ctkmData.length}`)
    console.log(`  - Nghiệp vụ: ${nghiepVuData.length}`)
    console.log(`  - Phiên làm việc: ${phienLamViecData.length}`)
    console.log(`  - Đơn hàng: ${donHangData.length}`)
    console.log(`  - Chi tiết đơn hàng: ${chiTietDonHangData.length}`)
    console.log(`  - Giao dịch thu chi: ${thuChiData.length}`)
    console.log('\n🔑 Thông tin đăng nhập:')
    console.log('  - Admin: admin / admin123')
    console.log('  - Nhân viên khác: [taiKhoan] / 123456')

  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error)
    throw error
  } finally {
    await AppDataSource.destroy()
    console.log('\n🔌 Đã đóng kết nối database')
  }
}

// Chạy seed
seed().catch(console.error)


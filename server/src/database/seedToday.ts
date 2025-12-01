import { AppDataSource } from './data-source'
import { PhienLamViec } from '../entities/PhienLamViec'
import { DonHang } from '../entities/HoaDon'
import { ChiTietDonHang } from '../entities/ChiTietHoaDon'
import { ThuChi } from '../entities/ThuChi'
import { NghiepVu } from '../entities/NghiepVu'
import { Mon } from '../entities/Mon'
import { NhanVien } from '../entities/NhanVien'
import { CaLam } from '../entities/CaLam'

async function seedToday() {
  try {
    console.log('🔄 Đang kết nối database...')
    await AppDataSource.initialize()
    console.log('✅ Đã kết nối database thành công!')

    const phienLamViecRepo = AppDataSource.getRepository(PhienLamViec)
    const donHangRepo = AppDataSource.getRepository(DonHang)
    const chiTietDonHangRepo = AppDataSource.getRepository(ChiTietDonHang)
    const thuChiRepo = AppDataSource.getRepository(ThuChi)
    const nghiepVuRepo = AppDataSource.getRepository(NghiepVu)
    const monRepo = AppDataSource.getRepository(Mon)
    const nhanVienRepo = AppDataSource.getRepository(NhanVien)

    // Lấy ngày hôm nay
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]
    console.log(`\n📅 Đang thêm dữ liệu cho ngày: ${todayStr}`)

    // Tìm hoặc tạo phiên làm việc cho ngày hôm nay
    console.log('\n📋 Đang tìm/tạo phiên làm việc cho ngày hôm nay...')
    
    // Tìm phiên làm việc đang mở hoặc đã đóng cho ngày hôm nay
    let phienLamViec = await phienLamViecRepo.findOne({
      where: {
        Ngay: today
      } as any,
      relations: ['nhanVien', 'caLam']
    })

    // Nếu không có, tạo mới
    if (!phienLamViec) {
      const nhanVien = await nhanVienRepo.findOne({ where: { MaNhanVien: 'NV001' } })
      const caLamRepo = AppDataSource.getRepository(CaLam)
      const caLam = await caLamRepo.findOne({ where: { MaCaLam: 'CL004' } })
      
      if (!nhanVien || !caLam) {
        console.log('❌ Không tìm thấy nhân viên hoặc ca làm việc. Vui lòng chạy seed.ts trước.')
        return
      }

      // Tạo mã phiên làm việc mới
      const count = await phienLamViecRepo.count()
      const maPhienLamViec = `PLV${String(count + 1).padStart(7, '0')}`

      phienLamViec = phienLamViecRepo.create({
        MaPhienLamViec: maPhienLamViec,
        Ngay: today,
        ThoiGianMo: '07:00:00',
        ThoiGianDong: null,
        TrangThai: 'mở',
        caLam: caLam,
        nhanVien: nhanVien
      })
      await phienLamViecRepo.save(phienLamViec)
      console.log(`  ✅ Đã tạo phiên làm việc: ${maPhienLamViec}`)
    } else {
      console.log(`  ℹ️  Đã tìm thấy phiên làm việc: ${phienLamViec.MaPhienLamViec}`)
    }

    // Tạo đơn hàng cho ngày hôm nay
    console.log('\n🛒 Đang tạo đơn hàng cho ngày hôm nay...')
    const mon1 = await monRepo.findOne({ where: { MaMon: 'M001' } })
    const mon2 = await monRepo.findOne({ where: { MaMon: 'M002' } })
    const mon3 = await monRepo.findOne({ where: { MaMon: 'M005' } })
    const mon4 = await monRepo.findOne({ where: { MaMon: 'M009' } })
    const mon5 = await monRepo.findOne({ where: { MaMon: 'M016' } })

    if (!mon1 || !mon2 || !mon3 || !mon4 || !mon5) {
      console.log('❌ Không tìm thấy món. Vui lòng chạy seed.ts trước.')
      return
    }

    // Tạo mã đơn hàng ngắn hơn (chỉ dùng 2 số cuối của năm và số thứ tự)
    const yearShort = String(today.getFullYear()).slice(-2)
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    
    // Tạo các đơn hàng mới
    const donHangToday = [
      {
        MaDonHang: `DH${yearShort}${month}${day}01`,
        Ngay: today,
        PhuongThucThanhToan: 'Tiền mặt',
        phienLamViec: phienLamViec!,
        ctkm: null
      },
      {
        MaDonHang: `DH${yearShort}${month}${day}02`,
        Ngay: today,
        PhuongThucThanhToan: 'Chuyển khoản',
        phienLamViec: phienLamViec!,
        ctkm: null
      },
      {
        MaDonHang: `DH${yearShort}${month}${day}03`,
        Ngay: today,
        PhuongThucThanhToan: 'Tiền mặt',
        phienLamViec: phienLamViec!,
        ctkm: null
      }
    ]

    const savedDonHangs = []
    for (const dh of donHangToday) {
      const existing = await donHangRepo.findOne({ where: { MaDonHang: dh.MaDonHang } })
      if (!existing) {
        const saved = await donHangRepo.save(donHangRepo.create(dh))
        savedDonHangs.push(saved)
        console.log(`  ✅ Đã tạo đơn hàng: ${dh.MaDonHang}`)
      } else {
        savedDonHangs.push(existing)
        console.log(`  ℹ️  Đơn hàng ${dh.MaDonHang} đã tồn tại`)
      }
    }

    // Tạo chi tiết đơn hàng
    console.log('\n📝 Đang tạo chi tiết đơn hàng...')
    const chiTietDonHangToday = [
      { MaCTDH: `CT${yearShort}${month}${day}01`, donHang: savedDonHangs[0]!, mon: mon1!, DonGia: 25000, SoLuong: 2 },
      { MaCTDH: `CT${yearShort}${month}${day}02`, donHang: savedDonHangs[0]!, mon: mon2!, DonGia: 30000, SoLuong: 1 },
      { MaCTDH: `CT${yearShort}${month}${day}03`, donHang: savedDonHangs[1]!, mon: mon3!, DonGia: 45000, SoLuong: 2 },
      { MaCTDH: `CT${yearShort}${month}${day}04`, donHang: savedDonHangs[1]!, mon: mon5!, DonGia: 35000, SoLuong: 1 },
      { MaCTDH: `CT${yearShort}${month}${day}05`, donHang: savedDonHangs[2]!, mon: mon4!, DonGia: 35000, SoLuong: 3 },
      { MaCTDH: `CT${yearShort}${month}${day}06`, donHang: savedDonHangs[2]!, mon: mon1!, DonGia: 25000, SoLuong: 1 }
    ]

    for (const ctdh of chiTietDonHangToday) {
      const existing = await chiTietDonHangRepo.findOne({ where: { MaCTDH: ctdh.MaCTDH } })
      if (!existing) {
        await chiTietDonHangRepo.save(chiTietDonHangRepo.create(ctdh))
        console.log(`  ✅ Đã tạo chi tiết đơn hàng: ${ctdh.MaCTDH}`)
      } else {
        console.log(`  ℹ️  Chi tiết đơn hàng ${ctdh.MaCTDH} đã tồn tại`)
      }
    }

    // Tạo giao dịch thu chi cho ngày hôm nay
    console.log('\n💵 Đang tạo giao dịch thu chi cho ngày hôm nay...')
    const nv1 = await nghiepVuRepo.findOne({ where: { MaNghiepVu: 'NV001' } }) // Thu tiền bán hàng
    const nv2 = await nghiepVuRepo.findOne({ where: { MaNghiepVu: 'NV002' } }) // Chi phí nguyên vật liệu
    const nv3 = await nghiepVuRepo.findOne({ where: { MaNghiepVu: 'NV003' } }) // Chi phí nhân sự
    const nv4 = await nghiepVuRepo.findOne({ where: { MaNghiepVu: 'NV004' } }) // Chi phí cố định
    const nv6 = await nghiepVuRepo.findOne({ where: { MaNghiepVu: 'NV006' } }) // Thu tiền dịch vụ
    const nv9 = await nghiepVuRepo.findOne({ where: { MaNghiepVu: 'NV009' } }) // Nguyên vật liệu
    const nv20 = await nghiepVuRepo.findOne({ where: { MaNghiepVu: 'NV020' } }) // Chi phí marketing
    const nv25 = await nghiepVuRepo.findOne({ where: { MaNghiepVu: 'NV025' } }) // Chi phí khác

    if (!nv1 || !nv2 || !nv3 || !nv4) {
      console.log('❌ Không tìm thấy nghiệp vụ. Vui lòng chạy seed.ts trước.')
      return
    }

    const thuChiToday = [
      // Thu
      {
        MaGiaoDich: `TC${yearShort}${month}${day}01`,
        ThoiGian: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 30, 0),
        SoTien: 250000,
        PhuongThucThanhToan: 'Tiền mặt',
        GhiChu: 'Thu tiền bán hàng buổi sáng',
        phienLamViec: phienLamViec!,
        nghiepVu: nv1!
      },
      {
        MaGiaoDich: `TC${yearShort}${month}${day}02`,
        ThoiGian: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0, 0),
        SoTien: 50000,
        PhuongThucThanhToan: 'Tiền mặt',
        GhiChu: 'Thu tiền dịch vụ',
        phienLamViec: phienLamViec!,
        nghiepVu: nv6!
      },
      {
        MaGiaoDich: `TC${yearShort}${month}${day}03`,
        ThoiGian: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0),
        SoTien: 30000,
        PhuongThucThanhToan: 'Chuyển khoản',
        GhiChu: 'Thu tiền bán đồ lưu niệm',
        phienLamViec: phienLamViec!,
        nghiepVu: nv6!
      },
      // Chi
      {
        MaGiaoDich: `TC${yearShort}${month}${day}04`,
        ThoiGian: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0, 0),
        SoTien: 500000,
        PhuongThucThanhToan: 'Chuyển khoản',
        GhiChu: 'Chi mua nguyên liệu',
        phienLamViec: phienLamViec!,
        nghiepVu: nv2!
      },
      {
        MaGiaoDich: `TC${yearShort}${month}${day}05`,
        ThoiGian: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0, 0),
        SoTien: 300000,
        PhuongThucThanhToan: 'Chuyển khoản',
        GhiChu: 'Chi mua cà phê',
        phienLamViec: phienLamViec!,
        nghiepVu: nv9!
      },
      {
        MaGiaoDich: `TC${yearShort}${month}${day}06`,
        ThoiGian: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0, 0),
        SoTien: 1500000,
        PhuongThucThanhToan: 'Chuyển khoản',
        GhiChu: 'Chi tiền lương nhân viên',
        phienLamViec: phienLamViec!,
        nghiepVu: nv3!
      },
      {
        MaGiaoDich: `TC${yearShort}${month}${day}07`,
        ThoiGian: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0, 0),
        SoTien: 500000,
        PhuongThucThanhToan: 'Chuyển khoản',
        GhiChu: 'Chi tiền thuê mặt bằng',
        phienLamViec: phienLamViec!,
        nghiepVu: nv4!
      },
      {
        MaGiaoDich: `TC${yearShort}${month}${day}08`,
        ThoiGian: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0, 0),
        SoTien: 200000,
        PhuongThucThanhToan: 'Tiền mặt',
        GhiChu: 'Chi quảng cáo Facebook',
        phienLamViec: phienLamViec!,
        nghiepVu: nv20!
      },
      {
        MaGiaoDich: `TC${yearShort}${month}${day}09`,
        ThoiGian: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 19, 0, 0),
        SoTien: 100000,
        PhuongThucThanhToan: 'Tiền mặt',
        GhiChu: 'Chi vệ sinh',
        phienLamViec: phienLamViec!,
        nghiepVu: nv25!
      }
    ]

    for (const tc of thuChiToday) {
      const existing = await thuChiRepo.findOne({ where: { MaGiaoDich: tc.MaGiaoDich } })
      if (!existing) {
        await thuChiRepo.save(thuChiRepo.create(tc))
        console.log(`  ✅ Đã tạo giao dịch: ${tc.MaGiaoDich} - ${tc.SoTien.toLocaleString('vi-VN')} đ`)
      } else {
        console.log(`  ℹ️  Giao dịch ${tc.MaGiaoDich} đã tồn tại`)
      }
    }

    console.log(`\n✅ Hoàn thành thêm dữ liệu cho ngày ${todayStr}!`)
    console.log(`\n📊 Tóm tắt:`)
    console.log(`  - Phiên làm việc: ${phienLamViec!.MaPhienLamViec}`)
    console.log(`  - Đơn hàng: ${savedDonHangs.length}`)
    console.log(`  - Chi tiết đơn hàng: ${chiTietDonHangToday.length}`)
    console.log(`  - Giao dịch thu chi: ${thuChiToday.length}`)
    console.log(`\n💡 Bây giờ bạn có thể xem báo cáo với maPhienLamViec=${phienLamViec!.MaPhienLamViec}`)

  } catch (error) {
    console.error('❌ Lỗi khi thêm dữ liệu:', error)
    throw error
  } finally {
    await AppDataSource.destroy()
    console.log('\n🔌 Đã đóng kết nối database')
  }
}

// Chạy seed
seedToday().catch(console.error)


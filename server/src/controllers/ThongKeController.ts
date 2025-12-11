import { Request, Response } from "express";
import { AppDataSource } from "../database/data-source";
import { DonHang } from "../entities/HoaDon";
import { ChiTietDonHang } from "../entities/ChiTietHoaDon";
import { Mon } from "../entities/Mon";
import { ThuChi } from "../entities/ThuChi";
import { NghiepVu } from "../entities/NghiepVu";
import { PhienLamViec } from "../entities/PhienLamViec";
import { GiamMon } from "../entities/GiamMon";
import { GiamHoaDon } from "../entities/GiamHoaDon";
import { Between } from "typeorm";

export class ThongKeController {
  private donHangRepo = AppDataSource.getRepository(DonHang);
  private chiTietDHRepo = AppDataSource.getRepository(ChiTietDonHang);
  private monRepo = AppDataSource.getRepository(Mon);
  private thuChiRepo = AppDataSource.getRepository(ThuChi);
  private nghiepVuRepo = AppDataSource.getRepository(NghiepVu);
  private phienLamViecRepo = AppDataSource.getRepository(PhienLamViec);

  // Helper function to format date as YYYY-MM-DD in local timezone
  private formatDateLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Lấy báo cáo doanh thu theo ngày với filter
  async getRevenueByDay(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      // Nếu không có ngày, trả về 7 ngày gần nhất
      let start: Date;
      let end: Date;

      if (startDate && endDate) {
        start = new Date(startDate as string);
        end = new Date(endDate as string);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
      } else {
        // Mặc định: 7 ngày gần nhất
        end = new Date();
        end.setHours(23, 59, 59, 999);
        start = new Date(end);
        start.setDate(start.getDate() - 6);
        start.setHours(0, 0, 0, 0);
      }

      // Lấy tất cả đơn hàng trong khoảng thời gian
      const orders = await this.donHangRepo.find({
        where: {
          Ngay: Between(start, end),
          isDelete: false
        },
        relations: ['chiTietDonHangs']
      });

      // Nhóm theo ngày
      const dailyStats: Record<string, { revenue: number; orderCount: number; date: string }> = {};

      // Khởi tạo tất cả ngày trong khoảng
      const currentDate = new Date(start);
      while (currentDate <= end) {
        const dateStr = this.formatDateLocal(currentDate);
        dailyStats[dateStr] = {
          revenue: 0,
          orderCount: 0,
          date: dateStr
        };
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Tính toán cho từng đơn hàng
      orders.forEach(dh => {
        const orderDate = dh.Ngay instanceof Date ? dh.Ngay : new Date(dh.Ngay);
        const dateStr = this.formatDateLocal(orderDate);
        if (dailyStats[dateStr]) {
          const dhTotal = dh.chiTietDonHangs?.reduce((s, ct) => s + (ct.SoLuong * ct.DonGia), 0) || 0;
          dailyStats[dateStr].revenue += dhTotal;
          dailyStats[dateStr].orderCount += 1;
        }
      });

      // Chuyển đổi thành array và sắp xếp theo ngày
      const dailyData = Object.values(dailyStats).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Tính tổng
      const totalRevenue = dailyData.reduce((sum, day) => sum + day.revenue, 0);
      const totalOrders = dailyData.reduce((sum, day) => sum + day.orderCount, 0);
      const daysCount = dailyData.length;
      const averageRevenue = daysCount > 0 ? totalRevenue / daysCount : 0;

      return res.json({
        period: {
          startDate: this.formatDateLocal(start),
          endDate: this.formatDateLocal(end),
          days: daysCount
        },
        summary: {
          totalRevenue,
          totalOrders,
          averageRevenue: Math.round(averageRevenue),
          averageOrdersPerDay: daysCount > 0 ? Math.round(totalOrders / daysCount) : 0
        },
        dailyData
      });
    } catch (e: any) {
      return res.status(500).json({ message: "Lỗi báo cáo doanh thu theo ngày", error: e.message });
    }
  }

  // Lấy tổng quan thống kê
  async getOverview(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(new Date().getDate() - 7));
      const end = endDate ? new Date(endDate as string) : new Date();
      
      // Đảm bảo start là đầu ngày và end là cuối ngày
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      // Tính doanh thu từ đơn hàng (DonHang + ChiTietDonHang)
      const donHangs = await this.donHangRepo.find({
        where: {
          Ngay: Between(start, end),
          isDelete: false
        },
        relations: ['chiTietDonHangs']
      });

      const invoiceCount = donHangs.length;

      // Tính tổng doanh thu từ các đơn hàng
      let totalRevenue = 0;
      for (const donHang of donHangs) {
        if (donHang.chiTietDonHangs) {
          const donHangTotal = donHang.chiTietDonHangs.reduce((sum, ctdh) => {
            return sum + (ctdh.DonGia * ctdh.SoLuong);
          }, 0);
          totalRevenue += donHangTotal;
        }
      }

      // Tổng chi phí từ ThuChi với LoaiGiaoDich = 'chi'
      const chiChis = await this.thuChiRepo.find({
        where: {
          ThoiGian: Between(start, end),
          nghiepVu: {
            LoaiGiaoDich: 'chi'
          }
        },
        relations: ['nghiepVu']
      });

      const totalExpense = chiChis.reduce((sum, tc) => sum + tc.SoTien, 0);

      // Cộng thêm doanh thu từ ThuChi (nếu có các khoản thu khác ngoài đơn hàng)
      const thuChis = await this.thuChiRepo.find({
        where: {
          ThoiGian: Between(start, end),
          nghiepVu: {
            LoaiGiaoDich: 'thu'
          }
        },
        relations: ['nghiepVu']
      });

      const thuChiRevenue = thuChis.reduce((sum, tc) => sum + tc.SoTien, 0);
      totalRevenue += thuChiRevenue;

      // Lợi nhuận gộp
      const grossProfit = totalRevenue - totalExpense;

      return res.json({
        totalRevenue,
        totalExpense,
        grossProfit,
        invoiceCount,
        period: { start, end }
      });
    } catch (e: any) {
      return res.status(500).json({ message: "Lỗi thống kê tổng quan", error: e.message });
    }
  }

  // Top món bán chạy
  async getTopProducts(req: Request, res: Response) {
    try {
      const { limit = 10, startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(new Date().getDate() - 30));
      const end = endDate ? new Date(endDate as string) : new Date();

      const result = await this.chiTietDHRepo
        .createQueryBuilder("ctdh")
        .leftJoin("ctdh.donHang", "dh")
        .leftJoin("ctdh.mon", "mon")
        .select("mon.MaMon", "maMon")
        .addSelect("mon.TenMon", "tenMon")
        .addSelect("SUM(ctdh.SoLuong)", "soLuong")
        .addSelect("SUM(ctdh.SoLuong * ctdh.DonGia)", "doanhThu")
        .where("dh.Ngay BETWEEN :start AND :end", { start, end })
        .groupBy("mon.MaMon")
        .addGroupBy("mon.TenMon")
        .orderBy("doanhThu", "DESC")
        .limit(Number(limit))
        .getRawMany();

      return res.json(result);
    } catch (e: any) {
      return res.status(500).json({ message: "Lỗi thống kê sản phẩm", error: e.message });
    }
  }

  // Doanh thu theo kênh (giả định dựa trên theBan)
  async getRevenueByChannel(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(new Date().getDate() - 7));
      const end = endDate ? new Date(endDate as string) : new Date();

      const donHangs = await this.donHangRepo.find({
        where: {
          Ngay: Between(start, end),
          isDelete: false
        },
        relations: ['chiTietDonHangs']
      });

      let taiQuan = 0;
      let mangDi = 0;
      let giaoHang = 0;

      donHangs.forEach(dh => {
        const total = dh.chiTietDonHangs?.reduce((s, ct) => s + (ct.SoLuong * ct.DonGia), 0) || 0;
        
        // Phân loại theo LoaiDonHang
        const loaiDonHang = dh.LoaiDonHang || 'tại quán';
        if (loaiDonHang.includes('tại quán') || loaiDonHang.includes('tại chỗ')) {
          taiQuan += total;
        } else if (loaiDonHang.includes('giao hàng')) {
          giaoHang += total;
        } else {
          mangDi += total;
        }
      });

      return res.json([
        { label: 'Tại quán', value: taiQuan },
        { label: 'Mang đi', value: mangDi },
        { label: 'Giao hàng', value: giaoHang }
      ]);
    } catch (e: any) {
      return res.status(500).json({ message: "Lỗi thống kê kênh", error: e.message });
    }
  }

  // Doanh thu theo tháng
  async getRevenueByMonth(req: Request, res: Response) {
    try {
      const { year = new Date().getFullYear() } = req.query;

      const result = await this.donHangRepo
        .createQueryBuilder("dh")
        .leftJoin("dh.chiTietDonHangs", "ctdh")
        .select("EXTRACT(MONTH FROM dh.Ngay)", "month")
        .addSelect("SUM(ctdh.SoLuong * ctdh.DonGia)", "revenue")
        .where("EXTRACT(YEAR FROM dh.Ngay) = :year", { year })
        .groupBy("month")
        .orderBy("month", "ASC")
        .getRawMany();

      return res.json(result);
    } catch (e: any) {
      return res.status(500).json({ message: "Lỗi thống kê theo tháng", error: e.message });
    }
  }

  // Báo cáo chốt ca
  async getShiftClosingReport(req: Request, res: Response) {
    try {
      const { maPhienLamViec } = req.params;
      const phienLamViec = await this.phienLamViecRepo.findOne({
        where: { MaPhienLamViec: maPhienLamViec } as any,
        relations: [
          'caLam', 
          'nhanVien', 
          'donHangs', 
          'donHangs.chiTietDonHangs', 
          'donHangs.chiTietDonHangs.mon',
          'donHangs.ctkm',
          'thuChis', 
          'thuChis.nghiepVu'
        ]
      });

      if (!phienLamViec) {
        return res.status(404).json({ message: "Không tìm thấy phiên làm việc" });
      }

      const giamMonRepo = AppDataSource.getRepository(GiamMon);
      const giamHoaDonRepo = AppDataSource.getRepository(GiamHoaDon);

      // Lấy tất cả GiamMon và GiamHoaDon đang active
      const allGiamMons = await giamMonRepo.find({
        where: { TrangThai: 'hoạt động' } as any,
        relations: ['mon', 'ctkm']
      });

      const allGiamHoaDons = await giamHoaDonRepo.find({
        where: { TrangThai: 'hoạt động' } as any,
        relations: ['ctkm']
      });

      // Tính tổng doanh thu gốc (chưa trừ discount) từ đơn hàng
      let totalRevenue = 0;
      let totalGiamGiaMon = 0; // Tổng giảm giá món
      let totalChietKhau = 0; // Tổng chiết khấu (từ GiamHoaDon)
      let totalVoucherDiscount = 0; // Tổng giảm từ voucher (nếu có)

      // Nhóm món theo NhomMon
      const monByNhom: Record<string, { ten: string; soLuong: number; doanhThu: number }> = {};

      // Nhóm theo CTKM
      const ctkmStats: Record<string, { ten: string; soHoaDon: number; doanhThu: number }> = {};

      // Phương thức thanh toán
      const paymentMethods: Record<string, { soHoaDon: number; doanhThu: number }> = {};

      // Nguồn đơn hàng (dine-in vs takeaway - cần thêm field này vào DonHang nếu chưa có)
      const orderSources: Record<string, { ten: string; soHoaDon: number; doanhThu: number }> = {};

      phienLamViec.donHangs?.forEach((dh) => {
        // Tính doanh thu gốc của đơn hàng
        const dhSubtotal = dh.chiTietDonHangs?.reduce((s, ct) => {
          const itemTotal = ct.SoLuong * ct.DonGia;
          
          // Tính giảm giá món (GiamMon) - tìm trong allGiamMons
          if (ct.mon) {
            const applicableGiamMons = allGiamMons.filter(gm => 
              gm.mon?.MaMon === ct.mon?.MaMon &&
              gm.TrangThai === 'hoạt động'
            );
            
            applicableGiamMons.forEach((gm) => {
              const orderDate = new Date(dh.Ngay);
              if (orderDate >= new Date(gm.NgayBatDau) && orderDate <= new Date(gm.NgayKetThuc)) {
                let discount = 0;
                if (gm.LoaiGiam === 'Phần trăm') {
                  discount = itemTotal * (gm.SoTienGiam / 100);
                } else {
                  discount = gm.SoTienGiam * ct.SoLuong;
                }
                totalGiamGiaMon += discount;
              }
            });
          }

          // Nhóm món theo NhomMon
          if (ct.mon) {
            const nhom = ct.mon.NhomMon || 'Khác';
            if (!monByNhom[nhom]) {
              monByNhom[nhom] = { ten: nhom, soLuong: 0, doanhThu: 0 };
            }
            monByNhom[nhom].soLuong += ct.SoLuong;
            monByNhom[nhom].doanhThu += itemTotal;
          }

          return s + itemTotal;
        }, 0) || 0;

        totalRevenue += dhSubtotal;

        // Tính chiết khấu từ GiamHoaDon (CTKM) - tìm trong allGiamHoaDons
        if (dh.ctkm) {
          const applicableGiamHoaDons = allGiamHoaDons.filter(ghd => 
            ghd.ctkm?.MaCTKM === dh.ctkm?.MaCTKM &&
            ghd.TrangThai === 'hoạt động'
          );
          
          applicableGiamHoaDons.forEach((ghd) => {
            const orderDate = new Date(dh.Ngay);
            if (orderDate >= new Date(ghd.NgayBatDau) && orderDate <= new Date(ghd.NgayKetThuc)) {
              // Kiểm tra điều kiện GiaTriTu
              if (!ghd.GiaTriTu || dhSubtotal >= ghd.GiaTriTu) {
                let discount = 0;
                if (ghd.LoaiGiam === 'Phần trăm') {
                  discount = dhSubtotal * (ghd.SoTienGiam / 100);
                } else {
                  discount = ghd.SoTienGiam;
                }
                totalChietKhau += discount;
              }
            }
          });

          // Thống kê CTKM
          const ctkmName = dh.ctkm.TenCTKM || 'Khuyến mãi';
          if (!ctkmStats[ctkmName]) {
            ctkmStats[ctkmName] = { ten: ctkmName, soHoaDon: 0, doanhThu: 0 };
          }
          ctkmStats[ctkmName].soHoaDon += 1;
          ctkmStats[ctkmName].doanhThu += dhSubtotal;
        }

        // Thống kê phương thức thanh toán
        const paymentMethod = dh.PhuongThucThanhToan || 'Khác';
        if (!paymentMethods[paymentMethod]) {
          paymentMethods[paymentMethod] = { soHoaDon: 0, doanhThu: 0 };
        }
        paymentMethods[paymentMethod].soHoaDon += 1;
        paymentMethods[paymentMethod].doanhThu += dhSubtotal;

        // Thống kê loại đơn hàng (tại quán, mang đi, giao hàng)
        const loaiDonHang = dh.LoaiDonHang || 'tại quán';
        if (!orderSources[loaiDonHang]) {
          orderSources[loaiDonHang] = { ten: loaiDonHang, soHoaDon: 0, doanhThu: 0 };
        }
        orderSources[loaiDonHang].soHoaDon += 1;
        orderSources[loaiDonHang].doanhThu += dhSubtotal;
      });

      // Tính tổng thu từ ThuChi
      const totalThu = phienLamViec.thuChis?.filter(tc => tc.nghiepVu?.LoaiGiaoDich === 'thu')
        .reduce((sum, tc) => sum + tc.SoTien, 0) || 0;

      // Tính tổng chi từ ThuChi
      const totalChi = phienLamViec.thuChis?.filter(tc => tc.nghiepVu?.LoaiGiaoDich === 'chi')
        .reduce((sum, tc) => sum + tc.SoTien, 0) || 0;

      // Số đơn hàng
      const orderCount = phienLamViec.donHangs?.length || 0;

      // Trung bình hóa đơn
      const averageOrder = orderCount > 0 ? totalRevenue / orderCount : 0;

      // Tiền trong két (số dư cuối = số dư đầu + thu - chi)
      // Số dư đầu có thể lấy từ phiên làm việc hoặc tính từ ThuChi đầu tiên
      const soDuDau = phienLamViec.thuChis?.find(tc => 
        tc.nghiepVu?.LoaiGiaoDich === 'thu' && 
        tc.nghiepVu?.TenNghiepVu?.toLowerCase().includes('đầu')
      )?.SoTien || 0;
      const tienTrongKet = soDuDau + totalThu - totalChi;

      // Giờ in: ưu tiên dùng ThoiGianDong nếu có, nếu không thì dùng thời gian hiện tại
      // Kết hợp Ngay và ThoiGianDong để tạo datetime đầy đủ
      let gioIn: string;
      if (phienLamViec.ThoiGianDong) {
        // Kết hợp Ngay và ThoiGianDong để tạo datetime ISO string
        const ngayDong = new Date(phienLamViec.Ngay);
        const [hours, minutes, seconds] = phienLamViec.ThoiGianDong.split(':');
        ngayDong.setHours(parseInt(hours || '0', 10), parseInt(minutes || '0', 10), parseInt(seconds || '0', 10), 0);
        gioIn = ngayDong.toISOString();
      } else {
        // Nếu chưa đóng ca, dùng thời gian hiện tại
        gioIn = new Date().toISOString();
      }

      return res.json({
        phienLamViec: {
          MaPhienLamViec: phienLamViec.MaPhienLamViec,
          Ngay: phienLamViec.Ngay,
          ThoiGianMo: phienLamViec.ThoiGianMo,
          ThoiGianDong: phienLamViec.ThoiGianDong,
          TrangThai: phienLamViec.TrangThai,
          caLam: phienLamViec.caLam,
          nhanVien: phienLamViec.nhanVien
        },
        tongKet: {
          totalRevenue,
          totalGiamGiaMon,
          totalChietKhau,
          totalVoucherDiscount,
          totalThu,
          totalChi,
          orderCount,
          averageOrder,
          profit: totalThu - totalChi,
          soDuDau,
          tienTrongKet,
          gioIn
        },
        monByNhom: Object.values(monByNhom),
        ctkmStats: Object.values(ctkmStats),
        paymentMethods: Object.entries(paymentMethods).map(([key, value]) => ({
          phuongThuc: key,
          ...value
        })),
        orderSources: Object.values(orderSources),
        donHangs: phienLamViec.donHangs,
        thuChis: phienLamViec.thuChis
      });
    } catch (e: any) {
      return res.status(500).json({ message: "Lỗi báo cáo chốt ca", error: e.message });
    }
  }

  // So sánh doanh thu với ngày hôm qua
  async compareRevenueWithYesterday(req: Request, res: Response) {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      
      const yesterdayEnd = new Date(yesterdayStart);
      yesterdayEnd.setHours(23, 59, 59, 999);

      // Doanh thu hôm nay từ đơn hàng
      const todayOrders = await this.donHangRepo.find({
        where: {
          Ngay: Between(todayStart, todayEnd),
          isDelete: false
        },
        relations: ['chiTietDonHangs']
      });

      const todayRevenue = todayOrders.reduce((sum, dh) => {
        const dhTotal = dh.chiTietDonHangs?.reduce((s, ct) => s + (ct.SoLuong * ct.DonGia), 0) || 0;
        return sum + dhTotal;
      }, 0);

      // Doanh thu hôm qua từ đơn hàng
      const yesterdayOrders = await this.donHangRepo.find({
        where: {
          Ngay: Between(yesterdayStart, yesterdayEnd),
          isDelete: false
        },
        relations: ['chiTietDonHangs']
      });

      const yesterdayRevenue = yesterdayOrders.reduce((sum, dh) => {
        const dhTotal = dh.chiTietDonHangs?.reduce((s, ct) => s + (ct.SoLuong * ct.DonGia), 0) || 0;
        return sum + dhTotal;
      }, 0);

      // Tính phần trăm thay đổi
      let percentChange = 0;
      if (yesterdayRevenue > 0) {
        percentChange = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
      } else if (todayRevenue > 0) {
        percentChange = 100; // Tăng 100% nếu hôm qua = 0
      }

      return res.json({
        today: {
          date: this.formatDateLocal(todayStart),
          revenue: todayRevenue,
          orderCount: todayOrders.length
        },
        yesterday: {
          date: this.formatDateLocal(yesterdayStart),
          revenue: yesterdayRevenue,
          orderCount: yesterdayOrders.length
        },
        comparison: {
          difference: todayRevenue - yesterdayRevenue,
          percentChange: Math.round(percentChange * 100) / 100,
          isIncrease: todayRevenue > yesterdayRevenue
        }
      });
    } catch (e: any) {
      return res.status(500).json({ message: "Lỗi so sánh doanh thu", error: e.message });
    }
  }

  // Báo cáo thống kê 7 ngày
  async get7DaysReport(req: Request, res: Response) {
    try {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      // Lấy tất cả đơn hàng trong 7 ngày
      const orders = await this.donHangRepo.find({
        where: {
          Ngay: Between(sevenDaysAgo, today),
          isDelete: false
        },
        relations: ['chiTietDonHangs']
      });

      // Nhóm theo ngày
      const dailyStats: Record<string, { revenue: number; orderCount: number; date: string }> = {};

      // Khởi tạo tất cả 7 ngày
      for (let i = 0; i < 7; i++) {
        const date = new Date(sevenDaysAgo);
        date.setDate(date.getDate() + i);
        const dateStr = this.formatDateLocal(date);
        dailyStats[dateStr] = {
          revenue: 0,
          orderCount: 0,
          date: dateStr
        };
      }

      // Tính toán cho từng đơn hàng
      orders.forEach(dh => {
        // Convert dh.Ngay to Date if it's not already, then format in local timezone
        const orderDate = dh.Ngay instanceof Date ? dh.Ngay : new Date(dh.Ngay);
        const dateStr = this.formatDateLocal(orderDate);
        if (dailyStats[dateStr]) {
          const dhTotal = dh.chiTietDonHangs?.reduce((s, ct) => s + (ct.SoLuong * ct.DonGia), 0) || 0;
          dailyStats[dateStr].revenue += dhTotal;
          dailyStats[dateStr].orderCount += 1;
        }
      });

      // Chuyển đổi thành array và sắp xếp theo ngày
      const dailyData = Object.values(dailyStats).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Tính tổng
      const totalRevenue = dailyData.reduce((sum, day) => sum + day.revenue, 0);
      const totalOrders = dailyData.reduce((sum, day) => sum + day.orderCount, 0);
      const averageRevenue = totalRevenue / 7;

      return res.json({
        period: {
          startDate: this.formatDateLocal(sevenDaysAgo),
          endDate: this.formatDateLocal(today),
          days: 7
        },
        summary: {
          totalRevenue,
          totalOrders,
          averageRevenue: Math.round(averageRevenue),
          averageOrdersPerDay: Math.round(totalOrders / 7)
        },
        dailyData
      });
    } catch (e: any) {
      return res.status(500).json({ message: "Lỗi báo cáo 7 ngày", error: e.message });
    }
  }

  // Top 10 món bán chạy nhất
  async getTop10Products(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(new Date().getDate() - 30));
      const end = endDate ? new Date(endDate as string) : new Date();

      const result = await this.chiTietDHRepo
        .createQueryBuilder("ctdh")
        .leftJoin("ctdh.donHang", "dh")
        .leftJoin("ctdh.mon", "mon")
        .select("mon.MaMon", "maMon")
        .addSelect("mon.TenMon", "tenMon")
        .addSelect("mon.LoaiMon", "loaiMon")
        .addSelect("mon.DonGia", "donGia")
        .addSelect("SUM(ctdh.SoLuong)", "soLuong")
        .addSelect("SUM(ctdh.SoLuong * ctdh.DonGia)", "doanhThu")
        .where("dh.Ngay BETWEEN :start AND :end", { start, end })
        .andWhere("dh.isDelete = :isDelete", { isDelete: false })
        .groupBy("mon.MaMon")
        .addGroupBy("mon.TenMon")
        .addGroupBy("mon.LoaiMon")
        .addGroupBy("mon.DonGia")
        .getRawMany();

      // Sort by soLuong descending and take top 10
      const sorted = result
        .map(item => ({
          maMon: item.maMon,
          tenMon: item.tenMon,
          loaiMon: item.loaiMon,
          donGia: parseFloat(item.donGia),
          soLuong: parseFloat(item.soLuong),
          doanhThu: parseFloat(item.doanhThu)
        }))
        .sort((a, b) => b.soLuong - a.soLuong)
        .slice(0, 10);

      return res.json(sorted.map((item, index) => ({
        rank: index + 1,
        ...item
      })));
    } catch (e: any) {
      return res.status(500).json({ message: "Lỗi thống kê top 10 món", error: e.message });
    }
  }

  // Top 5 category bán chạy nhất
  async getTop5Categories(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(new Date().getDate() - 30));
      const end = endDate ? new Date(endDate as string) : new Date();

      // Use raw query to avoid alias issues with PostgreSQL
      const result = await this.chiTietDHRepo.query(`
        SELECT 
          mon."LoaiMon" as "loaiMon",
          COUNT(DISTINCT mon."MaMon") as "soMon",
          SUM(ctdh."SoLuong") as "tongSoLuong",
          SUM(ctdh."SoLuong" * ctdh."DonGia") as "tongDoanhThu"
        FROM "chitietdonhang" ctdh
        LEFT JOIN "donhang" dh ON ctdh."MaDH" = dh."MaDonHang"
        LEFT JOIN "mon" mon ON ctdh."MaMon" = mon."MaMon"
        WHERE dh."Ngay" BETWEEN $1 AND $2
          AND dh."isDelete" = false
        GROUP BY mon."LoaiMon"
      `, [start, end]);

      interface CategoryStat {
        loaiMon: string;
        soMon: number;
        tongSoLuong: number;
        tongDoanhThu: number;
      }

      // Sort by tongDoanhThu descending and take top 5
      const sorted = result
        .map((item: any) => ({
          loaiMon: item.loaiMon || item.loaimon || '',
          soMon: parseFloat(String(item.soMon || item.somon || 0)),
          tongSoLuong: parseFloat(String(item.tongSoLuong || item.tongsoluong || 0)),
          tongDoanhThu: parseFloat(String(item.tongDoanhThu || item.tongdoanhthu || 0))
        }))
        .sort((a: CategoryStat, b: CategoryStat) => b.tongDoanhThu - a.tongDoanhThu)
        .slice(0, 5);

      return res.json(sorted.map((item: CategoryStat, index: number) => ({
        rank: index + 1,
        ...item
      })));
    } catch (e: any) {
      return res.status(500).json({ message: "Lỗi thống kê top 5 category", error: e.message });
    }
  }

  // Thống kê theo danh mục cụ thể
  async getCategoryStats(req: Request, res: Response) {
    try {
      const { loaiMon, startDate, endDate } = req.query;

      if (!loaiMon) {
        return res.status(400).json({ message: "Thiếu tham số loaiMon" });
      }

      const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(new Date().getDate() - 30));
      const end = endDate ? new Date(endDate as string) : new Date();

      // Use raw query to get statistics for specific category
      const result = await this.chiTietDHRepo.query(`
        SELECT 
          mon."LoaiMon" as "loaiMon",
          COUNT(DISTINCT mon."MaMon") as "soMon",
          SUM(ctdh."SoLuong") as "tongSoLuong",
          SUM(ctdh."SoLuong" * ctdh."DonGia") as "tongDoanhThu",
          COUNT(DISTINCT dh."MaDonHang") as "soDonHang"
        FROM "chitietdonhang" ctdh
        LEFT JOIN "donhang" dh ON ctdh."MaDH" = dh."MaDonHang"
        LEFT JOIN "mon" mon ON ctdh."MaMon" = mon."MaMon"
        WHERE mon."LoaiMon" = $1 AND dh."Ngay" BETWEEN $2 AND $3
          AND dh."isDelete" = false
        GROUP BY mon."LoaiMon"
      `, [loaiMon, start, end]);

      if (result.length === 0) {
        return res.json({
          loaiMon: loaiMon as string,
          soMon: 0,
          tongSoLuong: 0,
          tongDoanhThu: 0,
          soDonHang: 0
        });
      }

      const item = result[0];
      return res.json({
        loaiMon: item.loaiMon || item.loaimon || loaiMon,
        soMon: parseFloat(String(item.soMon || item.somon || 0)),
        tongSoLuong: parseFloat(String(item.tongSoLuong || item.tongsoluong || 0)),
        tongDoanhThu: parseFloat(String(item.tongDoanhThu || item.tongdoanhthu || 0)),
        soDonHang: parseFloat(String(item.soDonHang || item.sodonhang || 0))
      });
    } catch (e: any) {
      return res.status(500).json({ message: "Lỗi thống kê danh mục", error: e.message });
    }
  }

  // Báo cáo kết quả kinh doanh
  async getBusinessReport(req: Request, res: Response) {
    try {
      const { startDate, endDate, maPhienLamViec } = req.query;
      
      // Đảm bảo set đúng giờ cho start và end
      const start = startDate ? new Date(startDate as string) : new Date();
      start.setHours(0, 0, 0, 0);
      const end = endDate ? new Date(endDate as string) : new Date();
      end.setHours(23, 59, 59, 999);
      
      // Tính doanh thu bán hàng từ DonHang
      let donHangQuery = this.donHangRepo.createQueryBuilder('dh')
        .leftJoinAndSelect('dh.chiTietDonHangs', 'ctdh')
        .where('dh.Ngay BETWEEN :start AND :end', { start, end })
        .andWhere('dh.isDelete = :isDelete', { isDelete: false });
      
      if (maPhienLamViec) {
        donHangQuery = donHangQuery.andWhere('dh.MaPhienLamViec = :maPhienLamViec', { maPhienLamViec });
      }
      
      const donHangs = await donHangQuery.getMany();
      
      let doanhThuBanHang = 0;
      for (const donHang of donHangs) {
        if (donHang.chiTietDonHangs) {
          const donHangTotal = donHang.chiTietDonHangs.reduce((sum, ctdh) => {
            return sum + (ctdh.DonGia * ctdh.SoLuong);
          }, 0);
          doanhThuBanHang += donHangTotal;
        }
      }
      
      // Tính doanh thu khác từ ThuChi với LoaiGiaoDich = 'thu'
      let thuChiQuery = this.thuChiRepo.createQueryBuilder('tc')
        .leftJoinAndSelect('tc.nghiepVu', 'nv')
        .where('tc.ThoiGian BETWEEN :start AND :end', { start, end })
        .andWhere('nv.LoaiGiaoDich = :loai', { loai: 'thu' });
      
      if (maPhienLamViec) {
        thuChiQuery = thuChiQuery.andWhere('tc.MaPhienLamViec = :maPhienLamViec', { maPhienLamViec });
      }
      
      const thuChis = await thuChiQuery.getMany();
      const doanhThuKhac = thuChis.reduce((sum, tc) => sum + tc.SoTien, 0);
      
      // Tính chi phí từ ThuChi với LoaiGiaoDich = 'chi', nhóm theo NghiepVu
      // Lấy tất cả ThuChi trong khoảng thời gian, sau đó filter theo nghiepVu
      let chiPhiQuery = this.thuChiRepo.createQueryBuilder('tc')
        .leftJoinAndSelect('tc.nghiepVu', 'nv')
        .where('tc.ThoiGian BETWEEN :start AND :end', { start, end });
      
      if (maPhienLamViec) {
        chiPhiQuery = chiPhiQuery.andWhere('tc.MaPhienLamViec = :maPhienLamViec', { maPhienLamViec });
      }
      
      const allThuChi = await chiPhiQuery.getMany();
      
      // Debug log
      console.log('getBusinessReport - All ThuChi found:', allThuChi.length);
      console.log('getBusinessReport - Date range:', start, 'to', end);
      console.log('getBusinessReport - maPhienLamViec:', maPhienLamViec);
      
      // Lọc lại để chỉ lấy những cái có nghiepVu với LoaiGiaoDich = 'chi'
      const chiPhisFiltered = allThuChi.filter(tc => tc.nghiepVu?.LoaiGiaoDich === 'chi');
      
      console.log('getBusinessReport - ChiPhi filtered:', chiPhisFiltered.length);
      
      // Nhóm chi phí theo NghiepVu
      const chiPhiByCategory: Record<string, number> = {};
      chiPhisFiltered.forEach(cp => {
        const tenNghiepVu = cp.nghiepVu?.TenNghiepVu || 'Khác';
        chiPhiByCategory[tenNghiepVu] = (chiPhiByCategory[tenNghiepVu] || 0) + cp.SoTien;
      });
      
      // Tính tổng chi phí
      const tongChiPhi = chiPhisFiltered.reduce((sum, cp) => sum + cp.SoTien, 0);
      
      // Tính lợi nhuận
      const tongDoanhThu = doanhThuBanHang + doanhThuKhac;
      const loiNhuan = tongDoanhThu - tongChiPhi;
      
      return res.json({
        doanhThu: {
          banHang: doanhThuBanHang,
          khac: doanhThuKhac,
          tong: tongDoanhThu
        },
        chiPhi: {
          byCategory: chiPhiByCategory,
          tong: tongChiPhi
        },
        loiNhuan
      });
    } catch (e: any) {
      return res.status(500).json({ message: "Lỗi báo cáo kết quả kinh doanh", error: e.message });
    }
  }
}


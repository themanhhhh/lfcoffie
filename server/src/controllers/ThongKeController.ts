import { Request, Response } from "express";
import { AppDataSource } from "../database/data-source";
import { HoaDon } from "../entities/HoaDon";
import { ChiTietHoaDon } from "../entities/ChiTietHoaDon";
import { Mon } from "../entities/Mon";
import { PhieuChi } from "../entities/PhieuChi";
import { PhieuThu } from "../entities/PhieuThu";
import { ChiTietPhieuChi } from "../entities/ChiTietPhieuChi";
import { ChiTietPhieuThu } from "../entities/ChiTietPhieuThu";
import { Between } from "typeorm";

export class ThongKeController {
  private hoaDonRepo = AppDataSource.getRepository(HoaDon);
  private chiTietHDRepo = AppDataSource.getRepository(ChiTietHoaDon);
  private monRepo = AppDataSource.getRepository(Mon);
  private phieuChiRepo = AppDataSource.getRepository(PhieuChi);
  private phieuThuRepo = AppDataSource.getRepository(PhieuThu);
  private ctPhieuChiRepo = AppDataSource.getRepository(ChiTietPhieuChi);
  private ctPhieuThuRepo = AppDataSource.getRepository(ChiTietPhieuThu);

  // Lấy tổng quan thống kê
  async getOverview(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(new Date().getDate() - 7));
      const end = endDate ? new Date(endDate as string) : new Date();

      // Tổng doanh thu
      const hoaDons = await this.hoaDonRepo.find({
        where: {
          ngay: Between(start, end)
        },
        relations: ['chiTietHoaDons']
      });

      const totalRevenue = hoaDons.reduce((sum, hd) => {
        const hdTotal = hd.chiTietHoaDons?.reduce((s, ct) => s + (ct.soLuong * (ct.donGia || 0)), 0) || 0;
        return sum + hdTotal;
      }, 0);

      // Tổng chi phí
      const phieuChis = await this.phieuChiRepo.find({
        where: {
          ngay: Between(start, end)
        },
        relations: ['chiTietPhieuChis']
      });

      const totalExpense = phieuChis.reduce((sum, pc) => {
        const pcTotal = pc.chiTietPhieuChis?.reduce((s, ct) => s + ct.soTien, 0) || 0;
        return sum + pcTotal;
      }, 0);

      // Số hóa đơn
      const invoiceCount = hoaDons.length;

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

      const result = await this.chiTietHDRepo
        .createQueryBuilder("cthd")
        .leftJoin("cthd.hoaDon", "hd")
        .leftJoin("cthd.mon", "mon")
        .select("mon.maMon", "maMon")
        .addSelect("mon.tenMon", "tenMon")
        .addSelect("SUM(cthd.soLuong)", "soLuong")
        .addSelect("SUM(cthd.soLuong * cthd.donGia)", "doanhThu")
        .where("hd.ngay BETWEEN :start AND :end", { start, end })
        .groupBy("mon.maMon")
        .addGroupBy("mon.tenMon")
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

      const hoaDons = await this.hoaDonRepo.find({
        where: {
          ngay: Between(start, end)
        },
        relations: ['chiTietHoaDons', 'theBan']
      });

      let taiQuan = 0;
      let mangDi = 0;
      let giaoHang = 0;

      hoaDons.forEach(hd => {
        const total = hd.chiTietHoaDons?.reduce((s, ct) => s + (ct.soLuong * (ct.donGia || 0)), 0) || 0;
        
        if (hd.theBan) {
          taiQuan += total;
        } else {
          // Giả định: nếu không có bàn thì là mang đi/giao hàng
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

      const result = await this.hoaDonRepo
        .createQueryBuilder("hd")
        .leftJoin("hd.chiTietHoaDons", "cthd")
        .select("EXTRACT(MONTH FROM hd.ngay)", "month")
        .addSelect("SUM(cthd.soLuong * cthd.donGia)", "revenue")
        .where("EXTRACT(YEAR FROM hd.ngay) = :year", { year })
        .groupBy("month")
        .orderBy("month", "ASC")
        .getRawMany();

      return res.json(result);
    } catch (e: any) {
      return res.status(500).json({ message: "Lỗi thống kê theo tháng", error: e.message });
    }
  }
}


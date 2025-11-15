"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThongKeController = void 0;
const data_source_1 = require("../database/data-source");
const HoaDon_1 = require("../entities/HoaDon");
const ChiTietHoaDon_1 = require("../entities/ChiTietHoaDon");
const Mon_1 = require("../entities/Mon");
const ThuChi_1 = require("../entities/ThuChi");
const NghiepVu_1 = require("../entities/NghiepVu");
const PhienLamViec_1 = require("../entities/PhienLamViec");
const typeorm_1 = require("typeorm");
class ThongKeController {
    constructor() {
        this.donHangRepo = data_source_1.AppDataSource.getRepository(HoaDon_1.DonHang);
        this.chiTietDHRepo = data_source_1.AppDataSource.getRepository(ChiTietHoaDon_1.ChiTietDonHang);
        this.monRepo = data_source_1.AppDataSource.getRepository(Mon_1.Mon);
        this.thuChiRepo = data_source_1.AppDataSource.getRepository(ThuChi_1.ThuChi);
        this.nghiepVuRepo = data_source_1.AppDataSource.getRepository(NghiepVu_1.NghiepVu);
        this.phienLamViecRepo = data_source_1.AppDataSource.getRepository(PhienLamViec_1.PhienLamViec);
    }
    // Lấy tổng quan thống kê
    async getOverview(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 7));
            const end = endDate ? new Date(endDate) : new Date();
            // Tổng doanh thu từ ThuChi với LoaiGiaoDich = 'thu'
            const thuChis = await this.thuChiRepo.find({
                where: {
                    ThoiGian: (0, typeorm_1.Between)(start, end),
                    nghiepVu: {
                        LoaiGiaoDich: 'thu'
                    }
                },
                relations: ['nghiepVu']
            });
            const totalRevenue = thuChis.reduce((sum, tc) => sum + tc.SoTien, 0);
            // Tổng chi phí từ ThuChi với LoaiGiaoDich = 'chi'
            const chiChis = await this.thuChiRepo.find({
                where: {
                    ThoiGian: (0, typeorm_1.Between)(start, end),
                    nghiepVu: {
                        LoaiGiaoDich: 'chi'
                    }
                },
                relations: ['nghiepVu']
            });
            const totalExpense = chiChis.reduce((sum, tc) => sum + tc.SoTien, 0);
            // Số đơn hàng
            const donHangs = await this.donHangRepo.find({
                where: {
                    Ngay: (0, typeorm_1.Between)(start, end)
                }
            });
            const invoiceCount = donHangs.length;
            // Lợi nhuận gộp
            const grossProfit = totalRevenue - totalExpense;
            return res.json({
                totalRevenue,
                totalExpense,
                grossProfit,
                invoiceCount,
                period: { start, end }
            });
        }
        catch (e) {
            return res.status(500).json({ message: "Lỗi thống kê tổng quan", error: e.message });
        }
    }
    // Top món bán chạy
    async getTopProducts(req, res) {
        try {
            const { limit = 10, startDate, endDate } = req.query;
            const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
            const end = endDate ? new Date(endDate) : new Date();
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
        }
        catch (e) {
            return res.status(500).json({ message: "Lỗi thống kê sản phẩm", error: e.message });
        }
    }
    // Doanh thu theo kênh (giả định dựa trên theBan)
    async getRevenueByChannel(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 7));
            const end = endDate ? new Date(endDate) : new Date();
            const donHangs = await this.donHangRepo.find({
                where: {
                    Ngay: (0, typeorm_1.Between)(start, end)
                },
                relations: ['chiTietDonHangs']
            });
            let taiQuan = 0;
            let mangDi = 0;
            let giaoHang = 0;
            donHangs.forEach(dh => {
                const total = dh.chiTietDonHangs?.reduce((s, ct) => s + (ct.SoLuong * ct.DonGia), 0) || 0;
                // Phân loại theo phương thức thanh toán hoặc có thể thêm logic khác
                if (dh.PhuongThucThanhToan.includes('tại quán') || dh.PhuongThucThanhToan.includes('tại chỗ')) {
                    taiQuan += total;
                }
                else if (dh.PhuongThucThanhToan.includes('giao hàng')) {
                    giaoHang += total;
                }
                else {
                    mangDi += total;
                }
            });
            return res.json([
                { label: 'Tại quán', value: taiQuan },
                { label: 'Mang đi', value: mangDi },
                { label: 'Giao hàng', value: giaoHang }
            ]);
        }
        catch (e) {
            return res.status(500).json({ message: "Lỗi thống kê kênh", error: e.message });
        }
    }
    // Doanh thu theo tháng
    async getRevenueByMonth(req, res) {
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
        }
        catch (e) {
            return res.status(500).json({ message: "Lỗi thống kê theo tháng", error: e.message });
        }
    }
    // Báo cáo chốt ca
    async getShiftClosingReport(req, res) {
        try {
            const { maPhienLamViec } = req.params;
            const phienLamViec = await this.phienLamViecRepo.findOne({
                where: { MaPhienLamViec: maPhienLamViec },
                relations: ['caLam', 'nhanVien', 'donHangs', 'donHangs.chiTietDonHangs', 'donHangs.chiTietDonHangs.mon', 'thuChis', 'thuChis.nghiepVu']
            });
            if (!phienLamViec) {
                return res.status(404).json({ message: "Không tìm thấy phiên làm việc" });
            }
            // Tính tổng doanh thu từ đơn hàng
            const totalRevenue = phienLamViec.donHangs?.reduce((sum, dh) => {
                const dhTotal = dh.chiTietDonHangs?.reduce((s, ct) => s + (ct.SoLuong * ct.DonGia), 0) || 0;
                return sum + dhTotal;
            }, 0) || 0;
            // Tính tổng thu từ ThuChi
            const totalThu = phienLamViec.thuChis?.filter(tc => tc.nghiepVu?.LoaiGiaoDich === 'thu')
                .reduce((sum, tc) => sum + tc.SoTien, 0) || 0;
            // Tính tổng chi từ ThuChi
            const totalChi = phienLamViec.thuChis?.filter(tc => tc.nghiepVu?.LoaiGiaoDich === 'chi')
                .reduce((sum, tc) => sum + tc.SoTien, 0) || 0;
            // Số đơn hàng
            const orderCount = phienLamViec.donHangs?.length || 0;
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
                    totalThu,
                    totalChi,
                    orderCount,
                    profit: totalThu - totalChi
                },
                donHangs: phienLamViec.donHangs,
                thuChis: phienLamViec.thuChis
            });
        }
        catch (e) {
            return res.status(500).json({ message: "Lỗi báo cáo chốt ca", error: e.message });
        }
    }
    // So sánh doanh thu với ngày hôm qua
    async compareRevenueWithYesterday(req, res) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            // Doanh thu hôm nay từ đơn hàng
            const todayOrders = await this.donHangRepo.find({
                where: {
                    Ngay: (0, typeorm_1.Between)(today, tomorrow)
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
                    Ngay: (0, typeorm_1.Between)(yesterday, today)
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
            }
            else if (todayRevenue > 0) {
                percentChange = 100; // Tăng 100% nếu hôm qua = 0
            }
            return res.json({
                today: {
                    date: today.toISOString().split('T')[0],
                    revenue: todayRevenue,
                    orderCount: todayOrders.length
                },
                yesterday: {
                    date: yesterday.toISOString().split('T')[0],
                    revenue: yesterdayRevenue,
                    orderCount: yesterdayOrders.length
                },
                comparison: {
                    difference: todayRevenue - yesterdayRevenue,
                    percentChange: Math.round(percentChange * 100) / 100,
                    isIncrease: todayRevenue > yesterdayRevenue
                }
            });
        }
        catch (e) {
            return res.status(500).json({ message: "Lỗi so sánh doanh thu", error: e.message });
        }
    }
    // Báo cáo thống kê 7 ngày
    async get7DaysReport(req, res) {
        try {
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
            sevenDaysAgo.setHours(0, 0, 0, 0);
            // Lấy tất cả đơn hàng trong 7 ngày
            const orders = await this.donHangRepo.find({
                where: {
                    Ngay: (0, typeorm_1.Between)(sevenDaysAgo, today)
                },
                relations: ['chiTietDonHangs']
            });
            // Nhóm theo ngày
            const dailyStats = {};
            // Khởi tạo tất cả 7 ngày
            for (let i = 0; i < 7; i++) {
                const date = new Date(sevenDaysAgo);
                date.setDate(date.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                dailyStats[dateStr] = {
                    revenue: 0,
                    orderCount: 0,
                    date: dateStr
                };
            }
            // Tính toán cho từng đơn hàng
            orders.forEach(dh => {
                const dateStr = new Date(dh.Ngay).toISOString().split('T')[0];
                if (dailyStats[dateStr]) {
                    const dhTotal = dh.chiTietDonHangs?.reduce((s, ct) => s + (ct.SoLuong * ct.DonGia), 0) || 0;
                    dailyStats[dateStr].revenue += dhTotal;
                    dailyStats[dateStr].orderCount += 1;
                }
            });
            // Chuyển đổi thành array và sắp xếp theo ngày
            const dailyData = Object.values(dailyStats).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            // Tính tổng
            const totalRevenue = dailyData.reduce((sum, day) => sum + day.revenue, 0);
            const totalOrders = dailyData.reduce((sum, day) => sum + day.orderCount, 0);
            const averageRevenue = totalRevenue / 7;
            return res.json({
                period: {
                    startDate: sevenDaysAgo.toISOString().split('T')[0],
                    endDate: today.toISOString().split('T')[0],
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
        }
        catch (e) {
            return res.status(500).json({ message: "Lỗi báo cáo 7 ngày", error: e.message });
        }
    }
    // Top 10 món bán chạy nhất
    async getTop10Products(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
            const end = endDate ? new Date(endDate) : new Date();
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
        }
        catch (e) {
            return res.status(500).json({ message: "Lỗi thống kê top 10 món", error: e.message });
        }
    }
    // Top 5 category bán chạy nhất
    async getTop5Categories(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
            const end = endDate ? new Date(endDate) : new Date();
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
        GROUP BY mon."LoaiMon"
      `, [start, end]);
            // Sort by tongDoanhThu descending and take top 5
            const sorted = result
                .map((item) => ({
                loaiMon: item.loaiMon || item.loaimon || '',
                soMon: parseFloat(String(item.soMon || item.somon || 0)),
                tongSoLuong: parseFloat(String(item.tongSoLuong || item.tongsoluong || 0)),
                tongDoanhThu: parseFloat(String(item.tongDoanhThu || item.tongdoanhthu || 0))
            }))
                .sort((a, b) => b.tongDoanhThu - a.tongDoanhThu)
                .slice(0, 5);
            return res.json(sorted.map((item, index) => ({
                rank: index + 1,
                ...item
            })));
        }
        catch (e) {
            return res.status(500).json({ message: "Lỗi thống kê top 5 category", error: e.message });
        }
    }
}
exports.ThongKeController = ThongKeController;

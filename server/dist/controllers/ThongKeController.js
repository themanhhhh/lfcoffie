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
}
exports.ThongKeController = ThongKeController;

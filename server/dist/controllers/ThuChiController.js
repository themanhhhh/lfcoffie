"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThuChiController = void 0;
const data_source_1 = require("../database/data-source");
const ThuChi_1 = require("../entities/ThuChi");
const HoaDon_1 = require("../entities/HoaDon");
const typeorm_1 = require("typeorm");
class ThuChiController {
    constructor() {
        this.repository = data_source_1.AppDataSource.getRepository(ThuChi_1.ThuChi);
    }
    async getAll(req, res) {
        try {
            const { startDate, endDate, loaiGiaoDich } = req.query;
            let where = {};
            if (startDate && endDate) {
                // Set start date to beginning of day and end date to end of day
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.ThoiGian = (0, typeorm_1.Between)(start, end);
            }
            const list = await this.repository.find({
                where,
                relations: ['phienLamViec', 'nghiepVu', 'phienLamViec.nhanVien']
            });
            let filtered = list;
            if (loaiGiaoDich) {
                filtered = list.filter(item => item.nghiepVu?.LoaiGiaoDich === loaiGiaoDich);
            }
            return res.json(filtered);
        }
        catch (e) {
            return res.status(500).json({ message: "Lỗi lấy danh sách", error: e.message });
        }
    }
    async getOne(req, res) {
        try {
            const { id } = req.params;
            const item = await this.repository.findOne({
                where: { MaGiaoDich: id },
                relations: ['phienLamViec', 'nghiepVu']
            });
            if (!item)
                return res.status(404).json({ message: "Không tìm thấy" });
            return res.json(item);
        }
        catch (e) {
            return res.status(500).json({ message: "Lỗi lấy thông tin", error: e.message });
        }
    }
    async create(req, res) {
        try {
            // Parse ThoiGian từ string thành Date object để đảm bảo timezone đúng
            // TypeORM sẽ tự động xử lý timezone khi lưu vào database
            const thoiGian = req.body.ThoiGian ? new Date(req.body.ThoiGian) : new Date();
            // Tạo object với các field cần thiết
            const data = {
                MaGiaoDich: req.body.MaGiaoDich,
                ThoiGian: thoiGian,
                PhuongThucThanhToan: req.body.PhuongThucThanhToan,
                GhiChu: req.body.GhiChu || null,
                SoTien: req.body.SoTien,
                MaPhienLamViec: req.body.MaPhienLamViec || null,
                MaNghiepVu: req.body.MaNghiepVu || null
            };
            console.log('Creating ThuChi with data:', data);
            console.log('ThoiGian string:', req.body.ThoiGian);
            console.log('ThoiGian Date:', thoiGian);
            const obj = this.repository.create(data);
            const saved = await this.repository.save(obj);
            console.log('Saved ThuChi:', saved);
            return res.status(201).json(saved);
        }
        catch (e) {
            console.error('Error creating ThuChi:', e);
            return res.status(400).json({ message: "Tạo mới thất bại", error: e.message });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const existed = await this.repository.findOne({ where: { MaGiaoDich: id } });
            if (!existed)
                return res.status(404).json({ message: "Không tìm thấy" });
            Object.assign(existed, req.body);
            const saved = await this.repository.save(existed);
            return res.json(saved);
        }
        catch (e) {
            return res.status(400).json({ message: "Cập nhật thất bại", error: e.message });
        }
    }
    async remove(req, res) {
        try {
            const { id } = req.params;
            const existed = await this.repository.findOne({ where: { MaGiaoDich: id } });
            if (!existed)
                return res.status(404).json({ message: "Không tìm thấy" });
            await this.repository.remove(existed);
            return res.json({ message: "Đã xóa" });
        }
        catch (e) {
            return res.status(400).json({ message: "Xóa thất bại", error: e.message });
        }
    }
    // Lấy danh sách các phương thức thanh toán unique
    async getPaymentMethods(req, res) {
        try {
            const donHangRepo = data_source_1.AppDataSource.getRepository(HoaDon_1.DonHang);
            const thuChiRepo = data_source_1.AppDataSource.getRepository(ThuChi_1.ThuChi);
            // Lấy từ ThuChi
            const thuChiMethods = await thuChiRepo
                .createQueryBuilder('thuchi')
                .select('DISTINCT thuchi.PhuongThucThanhToan', 'PhuongThucThanhToan')
                .where('thuchi.PhuongThucThanhToan IS NOT NULL')
                .getRawMany();
            // Lấy từ DonHang
            const donHangMethods = await donHangRepo
                .createQueryBuilder('donhang')
                .select('DISTINCT donhang.PhuongThucThanhToan', 'PhuongThucThanhToan')
                .where('donhang.PhuongThucThanhToan IS NOT NULL')
                .getRawMany();
            // Kết hợp và loại bỏ trùng lặp
            const allMethods = new Set();
            thuChiMethods.forEach((item) => {
                if (item.PhuongThucThanhToan) {
                    allMethods.add(item.PhuongThucThanhToan);
                }
            });
            donHangMethods.forEach((item) => {
                if (item.PhuongThucThanhToan) {
                    allMethods.add(item.PhuongThucThanhToan);
                }
            });
            // Chuyển thành array và sắp xếp
            const methodsArray = Array.from(allMethods).sort();
            return res.json(methodsArray);
        }
        catch (e) {
            return res.status(500).json({ message: "Lỗi lấy danh sách phương thức thanh toán", error: e.message });
        }
    }
}
exports.ThuChiController = ThuChiController;

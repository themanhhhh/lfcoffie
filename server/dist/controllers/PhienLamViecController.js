"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhienLamViecController = void 0;
const data_source_1 = require("../database/data-source");
const PhienLamViec_1 = require("../entities/PhienLamViec");
const CaLam_1 = require("../entities/CaLam");
const NhanVien_1 = require("../entities/NhanVien");
const typeorm_1 = require("typeorm");
class PhienLamViecController {
    constructor() {
        this.repository = data_source_1.AppDataSource.getRepository(PhienLamViec_1.PhienLamViec);
        this.caLamRepo = data_source_1.AppDataSource.getRepository(CaLam_1.CaLam);
        this.nhanVienRepo = data_source_1.AppDataSource.getRepository(NhanVien_1.NhanVien);
    }
    async getAll(req, res) {
        try {
            const { startDate, endDate } = req.query;
            let where = {};
            if (startDate && endDate) {
                where.Ngay = (0, typeorm_1.Between)(new Date(startDate), new Date(endDate));
            }
            const list = await this.repository.find({
                where,
                relations: ['caLam', 'nhanVien']
            });
            return res.json(list);
        }
        catch (e) {
            return res.status(500).json({ message: "Lỗi lấy danh sách", error: e.message });
        }
    }
    async getOne(req, res) {
        try {
            const { id } = req.params;
            const item = await this.repository.findOne({
                where: { MaPhienLamViec: id },
                relations: ['caLam', 'nhanVien', 'donHangs', 'thuChis']
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
            const { MaPhienLamViec, MaCaLam, MaNhanVien, Ngay, TrangThai } = req.body;
            // Validate required fields
            if (!MaPhienLamViec || !MaCaLam || !MaNhanVien || !Ngay) {
                return res.status(400).json({
                    message: "Thiếu thông tin bắt buộc",
                    error: "Vui lòng cung cấp đầy đủ: MaPhienLamViec, MaCaLam, MaNhanVien, Ngay"
                });
            }
            // Check if MaPhienLamViec already exists
            const existing = await this.repository.findOne({
                where: { MaPhienLamViec }
            });
            if (existing) {
                return res.status(400).json({
                    message: "Mã phiên làm việc đã tồn tại",
                    error: `Phiên làm việc ${MaPhienLamViec} đã được tạo trước đó`
                });
            }
            // Validate MaCaLam exists
            const caLam = await this.caLamRepo.findOne({
                where: { MaCaLam }
            });
            if (!caLam) {
                return res.status(400).json({
                    message: "Ca làm việc không tồn tại",
                    error: `Không tìm thấy ca làm việc với mã: ${MaCaLam}`
                });
            }
            // Validate MaNhanVien exists
            const nhanVien = await this.nhanVienRepo.findOne({
                where: { MaNhanVien }
            });
            if (!nhanVien) {
                return res.status(400).json({
                    message: "Nhân viên không tồn tại",
                    error: `Không tìm thấy nhân viên với mã: ${MaNhanVien}`
                });
            }
            // Convert Ngay from string to Date if needed
            const ngayDate = Ngay instanceof Date ? Ngay : new Date(Ngay);
            if (isNaN(ngayDate.getTime())) {
                return res.status(400).json({
                    message: "Ngày không hợp lệ",
                    error: `Không thể chuyển đổi ngày: ${Ngay}`
                });
            }
            // Create the entity with proper foreign key references
            // TypeORM will handle the foreign keys when we set the relation objects
            const obj = this.repository.create({
                MaPhienLamViec,
                caLam: caLam,
                nhanVien: nhanVien,
                Ngay: ngayDate,
                TrangThai: TrangThai || "mở"
            });
            const saved = await this.repository.save(obj);
            return res.status(201).json(saved);
        }
        catch (e) {
            console.error("Error creating PhienLamViec:", e);
            return res.status(400).json({
                message: "Tạo mới thất bại",
                error: e.message,
                details: e.detail || e.code
            });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const existed = await this.repository.findOne({ where: { MaPhienLamViec: id } });
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
            const existed = await this.repository.findOne({ where: { MaPhienLamViec: id } });
            if (!existed)
                return res.status(404).json({ message: "Không tìm thấy" });
            await this.repository.remove(existed);
            return res.json({ message: "Đã xóa" });
        }
        catch (e) {
            return res.status(400).json({ message: "Xóa thất bại", error: e.message });
        }
    }
    // Mở ca
    async openShift(req, res) {
        try {
            const { maPhienLamViec } = req.body;
            const phienLamViec = await this.repository.findOne({
                where: { MaPhienLamViec: maPhienLamViec }
            });
            if (!phienLamViec)
                return res.status(404).json({ message: "Không tìm thấy phiên làm việc" });
            phienLamViec.ThoiGianMo = new Date().toTimeString().slice(0, 8);
            phienLamViec.TrangThai = "mở";
            const saved = await this.repository.save(phienLamViec);
            return res.json(saved);
        }
        catch (e) {
            return res.status(400).json({ message: "Mở ca thất bại", error: e.message });
        }
    }
    // Đóng ca
    async closeShift(req, res) {
        try {
            const { maPhienLamViec } = req.body;
            const phienLamViec = await this.repository.findOne({
                where: { MaPhienLamViec: maPhienLamViec }
            });
            if (!phienLamViec)
                return res.status(404).json({ message: "Không tìm thấy phiên làm việc" });
            phienLamViec.ThoiGianDong = new Date().toTimeString().slice(0, 8);
            phienLamViec.TrangThai = "đóng";
            const saved = await this.repository.save(phienLamViec);
            return res.json(saved);
        }
        catch (e) {
            return res.status(400).json({ message: "Đóng ca thất bại", error: e.message });
        }
    }
}
exports.PhienLamViecController = PhienLamViecController;

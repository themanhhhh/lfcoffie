"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhienLamViecController = void 0;
const data_source_1 = require("../database/data-source");
const PhienLamViec_1 = require("../entities/PhienLamViec");
const typeorm_1 = require("typeorm");
class PhienLamViecController {
    constructor() {
        this.repository = data_source_1.AppDataSource.getRepository(PhienLamViec_1.PhienLamViec);
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
            const obj = this.repository.create(req.body);
            const saved = await this.repository.save(obj);
            return res.status(201).json(saved);
        }
        catch (e) {
            return res.status(400).json({ message: "Tạo mới thất bại", error: e.message });
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

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThuChiController = void 0;
const data_source_1 = require("../database/data-source");
const ThuChi_1 = require("../entities/ThuChi");
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
                where.ThoiGian = (0, typeorm_1.Between)(new Date(startDate), new Date(endDate));
            }
            const list = await this.repository.find({
                where,
                relations: ['phienLamViec', 'nghiepVu']
            });
            let filtered = list;
            if (loaiGiaoDich) {
                filtered = list.filter(item => item.nghiepVu.LoaiGiaoDich === loaiGiaoDich);
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
}
exports.ThuChiController = ThuChiController;

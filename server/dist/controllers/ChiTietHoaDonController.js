"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChiTietHoaDonController = void 0;
const data_source_1 = require("../database/data-source");
const ChiTietHoaDon_1 = require("../entities/ChiTietHoaDon");
class ChiTietHoaDonController {
    constructor() {
        this.repository = data_source_1.AppDataSource.getRepository(ChiTietHoaDon_1.ChiTietHoaDon);
    }
    async getAll(req, res) {
        const list = await this.repository.find();
        return res.json(list);
    }
    async getOne(req, res) {
        const { id } = req.params;
        const item = await this.repository.findOne({ where: { MaCTDH: id } });
        if (!item)
            return res.status(404).json({ message: "Không tìm thấy" });
        return res.json(item);
    }
    async create(req, res) {
        try {
            // Frontend gửi các field: MaCTDH, MaDH, MaMon, DonGia, SoLuong
            // Trong entity, quan hệ được định nghĩa qua "donHang" và "mon",
            // nên cần map lại các field MaDH / MaMon vào quan hệ tương ứng.
            const { MaCTDH, MaDH, MaMon, DonGia, SoLuong } = req.body;
            const obj = this.repository.create({
                MaCTDH,
                DonGia,
                SoLuong,
                // Chỉ cần set khóa chính, TypeORM sẽ gán vào cột MaDH / MaMon
                donHang: MaDH ? { MaDonHang: MaDH } : undefined,
                mon: MaMon ? { MaMon } : undefined,
            });
            const saved = await this.repository.save(obj);
            return res.status(201).json(saved);
        }
        catch (e) {
            return res.status(400).json({ message: "Tạo mới thất bại", error: e.message });
        }
    }
    async update(req, res) {
        const { id } = req.params;
        const existed = await this.repository.findOne({ where: { MaCTDH: id } });
        if (!existed)
            return res.status(404).json({ message: "Không tìm thấy" });
        Object.assign(existed, req.body);
        const saved = await this.repository.save(existed);
        return res.json(saved);
    }
    async remove(req, res) {
        const { id } = req.params;
        const existed = await this.repository.findOne({ where: { MaCTDH: id } });
        if (!existed)
            return res.status(404).json({ message: "Không tìm thấy" });
        await this.repository.remove(existed);
        return res.json({ message: "Đã xóa" });
    }
}
exports.ChiTietHoaDonController = ChiTietHoaDonController;

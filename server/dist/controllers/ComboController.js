"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComboController = void 0;
const data_source_1 = require("../database/data-source");
const Combo_1 = require("../entities/Combo");
const typeorm_1 = require("typeorm");
class ComboController {
    constructor() {
        this.repository = data_source_1.AppDataSource.getRepository(Combo_1.Combo);
    }
    async getAll(req, res) {
        try {
            const list = await this.repository.find({
                relations: ['dsMonTrongCombo']
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
                where: { MaCombo: id },
                relations: ['dsMonTrongCombo']
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
            const existed = await this.repository.findOne({ where: { MaCombo: id } });
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
            const existed = await this.repository.findOne({ where: { MaCombo: id } });
            if (!existed)
                return res.status(404).json({ message: "Không tìm thấy" });
            await this.repository.remove(existed);
            return res.json({ message: "Đã xóa" });
        }
        catch (e) {
            return res.status(400).json({ message: "Xóa thất bại", error: e.message });
        }
    }
    // Lấy các combo đang áp dụng
    async getActiveCombos(req, res) {
        try {
            const now = new Date();
            const currentDay = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][now.getDay()];
            const currentTime = now.toTimeString().slice(0, 8);
            const combos = await this.repository.find({
                where: {
                    TrangThai: 'hoạt động',
                    NgayBatDau: (0, typeorm_1.Between)(new Date(0), now),
                    NgayKetThuc: (0, typeorm_1.Between)(now, new Date(9999, 11, 31))
                },
                relations: ['dsMonTrongCombo']
            });
            const activeCombos = combos.filter(combo => {
                if (combo.Thu && combo.Thu !== currentDay)
                    return false;
                if (combo.GioBatDau && combo.GioKetThuc) {
                    if (currentTime < combo.GioBatDau || currentTime > combo.GioKetThuc)
                        return false;
                }
                return true;
            });
            return res.json(activeCombos);
        }
        catch (e) {
            return res.status(500).json({ message: "Lỗi lấy combo", error: e.message });
        }
    }
}
exports.ComboController = ComboController;

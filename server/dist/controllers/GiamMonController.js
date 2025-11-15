"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GiamMonController = void 0;
const data_source_1 = require("../database/data-source");
const GiamMon_1 = require("../entities/GiamMon");
const typeorm_1 = require("typeorm");
class GiamMonController {
    constructor() {
        this.repository = data_source_1.AppDataSource.getRepository(GiamMon_1.GiamMon);
    }
    async getAll(req, res) {
        try {
            const list = await this.repository.find({
                relations: ['ctkm', 'mon']
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
                where: { MaGM: id },
                relations: ['ctkm', 'mon']
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
            const existed = await this.repository.findOne({ where: { MaGM: id } });
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
            const existed = await this.repository.findOne({ where: { MaGM: id } });
            if (!existed)
                return res.status(404).json({ message: "Không tìm thấy" });
            await this.repository.remove(existed);
            return res.json({ message: "Đã xóa" });
        }
        catch (e) {
            return res.status(400).json({ message: "Xóa thất bại", error: e.message });
        }
    }
    // Lấy các quy tắc giảm giá đang áp dụng cho món
    async getActiveRulesForMon(req, res) {
        try {
            const { maMon } = req.params;
            const now = new Date();
            const currentDay = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][now.getDay()];
            const currentTime = now.toTimeString().slice(0, 8);
            const allRules = await this.repository.find({
                where: {
                    TrangThai: 'hoạt động',
                    NgayBatDau: (0, typeorm_1.Between)(new Date(0), now),
                    NgayKetThuc: (0, typeorm_1.Between)(now, new Date(9999, 11, 31))
                },
                relations: ['ctkm', 'mon']
            });
            const rules = allRules.filter(rule => rule.mon?.MaMon === maMon);
            const activeRules = rules.filter(rule => {
                if (rule.Thu && rule.Thu !== currentDay)
                    return false;
                if (rule.GioBatDau && rule.GioKetThuc) {
                    if (currentTime < rule.GioBatDau || currentTime > rule.GioKetThuc)
                        return false;
                }
                return true;
            });
            return res.json(activeRules);
        }
        catch (e) {
            return res.status(500).json({ message: "Lỗi lấy quy tắc", error: e.message });
        }
    }
}
exports.GiamMonController = GiamMonController;

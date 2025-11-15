"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TheBanController = void 0;
const data_source_1 = require("../database/data-source");
const TheBan_1 = require("../entities/TheBan");
class TheBanController {
    constructor() {
        this.repository = data_source_1.AppDataSource.getRepository(TheBan_1.TheBan);
    }
    async getAll(req, res) {
        const list = await this.repository.find();
        return res.json(list);
    }
    async getOne(req, res) {
        const { id } = req.params;
        const item = await this.repository.findOne({ where: { MaTheBan: id } });
        if (!item)
            return res.status(404).json({ message: "Không tìm thấy" });
        return res.json(item);
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
        const { id } = req.params;
        const existed = await this.repository.findOne({ where: { MaTheBan: id } });
        if (!existed)
            return res.status(404).json({ message: "Không tìm thấy" });
        Object.assign(existed, req.body);
        const saved = await this.repository.save(existed);
        return res.json(saved);
    }
    async remove(req, res) {
        const { id } = req.params;
        const existed = await this.repository.findOne({ where: { MaTheBan: id } });
        if (!existed)
            return res.status(404).json({ message: "Không tìm thấy" });
        await this.repository.remove(existed);
        return res.json({ message: "Đã xóa" });
    }
}
exports.TheBanController = TheBanController;

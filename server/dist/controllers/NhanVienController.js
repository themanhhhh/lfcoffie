"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NhanVienController = void 0;
const data_source_1 = require("../database/data-source");
const NhanVien_1 = require("../entities/NhanVien");
const CaLam_1 = require("../entities/CaLam");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class NhanVienController {
    constructor() {
        this.repository = data_source_1.AppDataSource.getRepository(NhanVien_1.NhanVien);
        this.caLamRepository = data_source_1.AppDataSource.getRepository(CaLam_1.CaLam);
    }
    async getAll(req, res) {
        const list = await this.repository.find({ relations: ['caLam'] });
        return res.json(list);
    }
    async getOne(req, res) {
        const { id } = req.params;
        const item = await this.repository.findOne({
            where: { MaNhanVien: id },
            relations: ['caLam']
        });
        if (!item)
            return res.status(404).json({ message: "Không tìm thấy" });
        return res.json(item);
    }
    async create(req, res) {
        try {
            const { MaCaLam, ...nhanVienData } = req.body;
            // Load CaLam if MaCaLam is provided
            let caLam = null;
            if (MaCaLam) {
                caLam = await this.caLamRepository.findOne({ where: { MaCaLam } });
                if (!caLam) {
                    return res.status(400).json({ message: `Không tìm thấy ca làm với mã: ${MaCaLam}` });
                }
            }
            const obj = this.repository.create({
                ...nhanVienData,
                caLam: caLam || undefined
            });
            // Hash password if provided
            if (obj.MatKhau) {
                const saltRounds = 10;
                obj.MatKhau = await bcryptjs_1.default.hash(obj.MatKhau, saltRounds);
            }
            const saved = await this.repository.save(obj);
            // Reload with relations
            const savedWithRelations = await this.repository.findOne({
                where: { MaNhanVien: saved.MaNhanVien },
                relations: ['caLam']
            });
            return res.status(201).json(savedWithRelations);
        }
        catch (e) {
            return res.status(400).json({ message: "Tạo mới thất bại", error: e.message });
        }
    }
    async update(req, res) {
        const { id } = req.params;
        const existed = await this.repository.findOne({ where: { MaNhanVien: id } });
        if (!existed)
            return res.status(404).json({ message: "Không tìm thấy" });
        // Hash password if provided in update
        if (req.body.MatKhau) {
            const saltRounds = 10;
            req.body.MatKhau = await bcryptjs_1.default.hash(req.body.MatKhau, saltRounds);
        }
        Object.assign(existed, req.body);
        const saved = await this.repository.save(existed);
        return res.json(saved);
    }
    async remove(req, res) {
        const { id } = req.params;
        const existed = await this.repository.findOne({ where: { MaNhanVien: id } });
        if (!existed)
            return res.status(404).json({ message: "Không tìm thấy" });
        await this.repository.remove(existed);
        return res.json({ message: "Đã xóa" });
    }
}
exports.NhanVienController = NhanVienController;

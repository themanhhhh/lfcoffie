import { Request, Response } from "express";
import { AppDataSource } from "../database/data-source";
import { PhieuThu } from "../entities/PhieuThu";
import { ChiTietPhieuThu } from "../entities/ChiTietPhieuThu";
import { NhanVien } from "../entities/NhanVien";
import { Between } from "typeorm";
import { generatePhieuThuId, generateChiTietPhieuThuId } from "../utils/idGenerator";

export class PhieuThuController {
  private repository = AppDataSource.getRepository(PhieuThu);
  private chiTietRepo = AppDataSource.getRepository(ChiTietPhieuThu);
  private nhanVienRepo = AppDataSource.getRepository(NhanVien);

  async getAll(req: Request, res: Response) {
    const { startDate, endDate } = req.query;
    
    let whereCondition: any = {};
    if (startDate && endDate) {
      whereCondition.ngay = Between(new Date(startDate as string), new Date(endDate as string));
    }

    const list = await this.repository.find({
      where: whereCondition,
      relations: ['chiTietPhieuThus', 'nhanVien'],
      order: { ngay: 'DESC' }
    });
    return res.json(list);
  }

  async getOne(req: Request, res: Response) {
    const { id } = req.params;
    const item = await this.repository.findOne({ where: { maPT: id } } as any);
    if (!item) return res.status(404).json({ message: "Không tìm thấy" });
    return res.json(item);
  }

  async create(req: Request, res: Response) {
    try {
      const { maNV, soTien, lyDoThu } = req.body;

      if (!maNV || !soTien) {
        return res.status(400).json({ message: "Thiếu thông tin maNV hoặc soTien" });
      }

      // Tìm nhân viên
      const nhanVien = await this.nhanVienRepo.findOne({ where: { maNV } } as any);
      if (!nhanVien) {
        return res.status(404).json({ message: "Không tìm thấy nhân viên" });
      }

      // Tạo phiếu thu
      const maPT = generatePhieuThuId();
      const phieuThu = this.repository.create({
        maPT,
        ngay: new Date(),
        nhanVien
      });
      const savedPhieuThu = await this.repository.save(phieuThu);

      // Tạo chi tiết phiếu thu
      const maCTPT = generateChiTietPhieuThuId();
      const chiTiet = this.chiTietRepo.create({
        maCTPT,
        soTien: Number(soTien),
        phieuThu: savedPhieuThu
      });
      await this.chiTietRepo.save(chiTiet);

      return res.status(201).json(savedPhieuThu);
    } catch (e:any) {
      return res.status(400).json({ message: "Tạo mới thất bại", error: e.message });
    }
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const existed = await this.repository.findOne({ where: { maPT: id } } as any);
    if (!existed) return res.status(404).json({ message: "Không tìm thấy" });
    Object.assign(existed, req.body);
    const saved = await this.repository.save(existed);
    return res.json(saved);
  }

  async remove(req: Request, res: Response) {
    const { id } = req.params;
    const existed = await this.repository.findOne({ where: { maPT: id } } as any);
    if (!existed) return res.status(404).json({ message: "Không tìm thấy" });
    await this.repository.remove(existed);
    return res.json({ message: "Đã xóa" });
  }
}

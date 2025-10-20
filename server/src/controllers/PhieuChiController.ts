import { Request, Response } from "express";
import { AppDataSource } from "../database/data-source";
import { PhieuChi } from "../entities/PhieuChi";
import { ChiTietPhieuChi } from "../entities/ChiTietPhieuChi";
import { NhanVien } from "../entities/NhanVien";
import { Between } from "typeorm";
import { generatePhieuChiId, generateChiTietPhieuChiId } from "../utils/idGenerator";

export class PhieuChiController {
  private repository = AppDataSource.getRepository(PhieuChi);
  private chiTietRepo = AppDataSource.getRepository(ChiTietPhieuChi);
  private nhanVienRepo = AppDataSource.getRepository(NhanVien);

  async getAll(req: Request, res: Response) {
    const { startDate, endDate } = req.query;
    
    let whereCondition: any = {};
    if (startDate && endDate) {
      whereCondition.ngay = Between(new Date(startDate as string), new Date(endDate as string));
    }

    const list = await this.repository.find({
      where: whereCondition,
      relations: ['chiTietPhieuChis', 'nhanVien'],
      order: { ngay: 'DESC' }
    });
    return res.json(list);
  }

  async getOne(req: Request, res: Response) {
    const { id } = req.params;
    const item = await this.repository.findOne({ where: { maPC: id } } as any);
    if (!item) return res.status(404).json({ message: "Không tìm thấy" });
    return res.json(item);
  }

  async create(req: Request, res: Response) {
    try {
      const { maNV, soTien, loaiChiPhi, tenKhoanChi, hinhThuc } = req.body;

      if (!maNV || !soTien) {
        return res.status(400).json({ message: "Thiếu thông tin maNV hoặc soTien" });
      }

      // Tìm nhân viên
      const nhanVien = await this.nhanVienRepo.findOne({ where: { maNV } } as any);
      if (!nhanVien) {
        return res.status(404).json({ message: "Không tìm thấy nhân viên" });
      }

      // Tạo phiếu chi
      const maPC = generatePhieuChiId();
      const phieuChi = this.repository.create({
        maPC,
        ngay: new Date(),
        nhanVien
      });
      const savedPhieuChi = await this.repository.save(phieuChi);

      // Tạo chi tiết phiếu chi
      const maCTPC = generateChiTietPhieuChiId();
      const chiTiet = this.chiTietRepo.create({
        maCTPC,
        soTien: Number(soTien),
        loaiChiPhi: loaiChiPhi || 'Chi phí khác',
        tenKhoanChi: tenKhoanChi || '',
        hinhThuc: hinhThuc || 'Tiền mặt',
        phieuChi: savedPhieuChi
      });
      await this.chiTietRepo.save(chiTiet);

      return res.status(201).json(savedPhieuChi);
    } catch (e:any) {
      return res.status(400).json({ message: "Tạo mới thất bại", error: e.message });
    }
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const existed = await this.repository.findOne({ where: { maPC: id } } as any);
    if (!existed) return res.status(404).json({ message: "Không tìm thấy" });
    Object.assign(existed, req.body);
    const saved = await this.repository.save(existed);
    return res.json(saved);
  }

  async remove(req: Request, res: Response) {
    const { id } = req.params;
    const existed = await this.repository.findOne({ where: { maPC: id } } as any);
    if (!existed) return res.status(404).json({ message: "Không tìm thấy" });
    await this.repository.remove(existed);
    return res.json({ message: "Đã xóa" });
  }
}

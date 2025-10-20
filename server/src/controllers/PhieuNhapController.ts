import { Request, Response } from "express";
import { AppDataSource } from "../database/data-source";
import { PhieuNhap } from "../entities/PhieuNhap";
import { Between } from "typeorm";

export class PhieuNhapController {
  private repository = AppDataSource.getRepository(PhieuNhap);

  async getAll(req: Request, res: Response) {
    const { startDate, endDate } = req.query;
    
    let whereCondition: any = {};
    if (startDate && endDate) {
      whereCondition.ngayNhapKho = Between(new Date(startDate as string), new Date(endDate as string));
    }

    const list = await this.repository.find({
      where: whereCondition,
      relations: ['chiTietPhieuNhaps', 'chiTietPhieuNhaps.nguyenLieu', 'nhanVien'],
      order: { ngayNhapKho: 'DESC' }
    });
    return res.json(list);
  }

  async getOne(req: Request, res: Response) {
    const { id } = req.params;
    const item = await this.repository.findOne({ where: { maPN: id } } as any);
    if (!item) return res.status(404).json({ message: "Không tìm thấy" });
    return res.json(item);
  }

  async create(req: Request, res: Response) {
    try {
      const obj = this.repository.create(req.body as PhieuNhap);
      const saved = await this.repository.save(obj);
      return res.status(201).json(saved);
    } catch (e:any) {
      return res.status(400).json({ message: "Tạo mới thất bại", error: e.message });
    }
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const existed = await this.repository.findOne({ where: { maPN: id } } as any);
    if (!existed) return res.status(404).json({ message: "Không tìm thấy" });
    Object.assign(existed, req.body);
    const saved = await this.repository.save(existed);
    return res.json(saved);
  }

  async remove(req: Request, res: Response) {
    const { id } = req.params;
    const existed = await this.repository.findOne({ where: { maPN: id } } as any);
    if (!existed) return res.status(404).json({ message: "Không tìm thấy" });
    await this.repository.remove(existed);
    return res.json({ message: "Đã xóa" });
  }
}

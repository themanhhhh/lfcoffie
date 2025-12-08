import { Request, Response } from "express";
import { AppDataSource } from "../database/data-source";
import { HoaDon } from "../entities/HoaDon";

export class HoaDonController {
  private repository = AppDataSource.getRepository(HoaDon);

  async getAll(req: Request, res: Response) {
    const list = await this.repository.find({ 
      where: { isDelete: false },
      relations: ['phienLamViec', 'phienLamViec.caLam', 'phienLamViec.nhanVien']
    });
    return res.json(list);
  }

  async getOne(req: Request, res: Response) {
    const { id } = req.params;
    const item = await this.repository.findOne({ where: { MaDonHang: id, isDelete: false } } as any);
    if (!item) return res.status(404).json({ message: "Không tìm thấy" });
    return res.json(item);
  }

  async create(req: Request, res: Response) {
    try {
      const obj = this.repository.create(req.body as HoaDon);
      const saved = await this.repository.save(obj);
      return res.status(201).json(saved);
    } catch (e:any) {
      return res.status(400).json({ message: "Tạo mới thất bại", error: e.message });
    }
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const existed = await this.repository.findOne({ where: { MaDonHang: id, isDelete: false } } as any);
    if (!existed) return res.status(404).json({ message: "Không tìm thấy" });
    Object.assign(existed, req.body);
    const saved = await this.repository.save(existed);
    return res.json(saved);
  }

  async remove(req: Request, res: Response) {
    const { id } = req.params;
    const existed = await this.repository.findOne({ where: { MaDonHang: id, isDelete: false } } as any);
    if (!existed) return res.status(404).json({ message: "Không tìm thấy" });
    existed.isDelete = true;
    await this.repository.save(existed);
    return res.json({ message: "Đã xóa" });
  }
}

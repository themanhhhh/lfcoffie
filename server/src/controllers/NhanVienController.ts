import { Request, Response } from "express";
import { AppDataSource } from "../database/data-source";
import { NhanVien } from "../entities/NhanVien";
import bcrypt from "bcryptjs";

export class NhanVienController {
  private repository = AppDataSource.getRepository(NhanVien);

  async getAll(req: Request, res: Response) {
    const list = await this.repository.find();
    return res.json(list);
  }

  async getOne(req: Request, res: Response) {
    const { id } = req.params;
    const item = await this.repository.findOne({ where: { maNV: id } } as any);
    if (!item) return res.status(404).json({ message: "Không tìm thấy" });
    return res.json(item);
  }

  async create(req: Request, res: Response) {
    try {
      const obj = this.repository.create(req.body as NhanVien);
      
      // Hash password if provided
      if (obj.matKhau) {
        const saltRounds = 10;
        obj.matKhau = await bcrypt.hash(obj.matKhau, saltRounds);
      }
      
      const saved = await this.repository.save(obj);
      return res.status(201).json(saved);
    } catch (e:any) {
      return res.status(400).json({ message: "Tạo mới thất bại", error: e.message });
    }
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const existed = await this.repository.findOne({ where: { maNV: id } } as any);
    if (!existed) return res.status(404).json({ message: "Không tìm thấy" });
    
    // Hash password if provided in update
    if (req.body.matKhau) {
      const saltRounds = 10;
      req.body.matKhau = await bcrypt.hash(req.body.matKhau, saltRounds);
    }
    
    Object.assign(existed, req.body);
    const saved = await this.repository.save(existed);
    return res.json(saved);
  }

  async remove(req: Request, res: Response) {
    const { id } = req.params;
    const existed = await this.repository.findOne({ where: { maNV: id } } as any);
    if (!existed) return res.status(404).json({ message: "Không tìm thấy" });
    await this.repository.remove(existed);
    return res.json({ message: "Đã xóa" });
  }
}

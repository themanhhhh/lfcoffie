import { Request, Response } from "express";
import { AppDataSource } from "../database/data-source";
import { PhienLamViec } from "../entities/PhienLamViec";
import { Between } from "typeorm";

export class PhienLamViecController {
  private repository = AppDataSource.getRepository(PhienLamViec);

  async getAll(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      let where: any = {};
      
      if (startDate && endDate) {
        where.Ngay = Between(new Date(startDate as string), new Date(endDate as string));
      }
      
      const list = await this.repository.find({
        where,
        relations: ['caLam', 'nhanVien']
      });
      return res.json(list);
    } catch (e: any) {
      return res.status(500).json({ message: "Lỗi lấy danh sách", error: e.message });
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await this.repository.findOne({ 
        where: { MaPhienLamViec: id } as any,
        relations: ['caLam', 'nhanVien', 'donHangs', 'thuChis']
      });
      if (!item) return res.status(404).json({ message: "Không tìm thấy" });
      return res.json(item);
    } catch (e: any) {
      return res.status(500).json({ message: "Lỗi lấy thông tin", error: e.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const obj = this.repository.create(req.body as PhienLamViec);
      const saved = await this.repository.save(obj);
      return res.status(201).json(saved);
    } catch (e: any) {
      return res.status(400).json({ message: "Tạo mới thất bại", error: e.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existed = await this.repository.findOne({ where: { MaPhienLamViec: id } } as any);
      if (!existed) return res.status(404).json({ message: "Không tìm thấy" });
      Object.assign(existed, req.body);
      const saved = await this.repository.save(existed);
      return res.json(saved);
    } catch (e: any) {
      return res.status(400).json({ message: "Cập nhật thất bại", error: e.message });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existed = await this.repository.findOne({ where: { MaPhienLamViec: id } } as any);
      if (!existed) return res.status(404).json({ message: "Không tìm thấy" });
      await this.repository.remove(existed);
      return res.json({ message: "Đã xóa" });
    } catch (e: any) {
      return res.status(400).json({ message: "Xóa thất bại", error: e.message });
    }
  }

  // Mở ca
  async openShift(req: Request, res: Response) {
    try {
      const { maPhienLamViec } = req.body;
      const phienLamViec = await this.repository.findOne({ 
        where: { MaPhienLamViec: maPhienLamViec } as any 
      });
      if (!phienLamViec) return res.status(404).json({ message: "Không tìm thấy phiên làm việc" });
      
      phienLamViec.ThoiGianMo = new Date().toTimeString().slice(0, 8);
      phienLamViec.TrangThai = "mở";
      const saved = await this.repository.save(phienLamViec);
      return res.json(saved);
    } catch (e: any) {
      return res.status(400).json({ message: "Mở ca thất bại", error: e.message });
    }
  }

  // Đóng ca
  async closeShift(req: Request, res: Response) {
    try {
      const { maPhienLamViec } = req.body;
      const phienLamViec = await this.repository.findOne({ 
        where: { MaPhienLamViec: maPhienLamViec } as any 
      });
      if (!phienLamViec) return res.status(404).json({ message: "Không tìm thấy phiên làm việc" });
      
      phienLamViec.ThoiGianDong = new Date().toTimeString().slice(0, 8);
      phienLamViec.TrangThai = "đóng";
      const saved = await this.repository.save(phienLamViec);
      return res.json(saved);
    } catch (e: any) {
      return res.status(400).json({ message: "Đóng ca thất bại", error: e.message });
    }
  }
}


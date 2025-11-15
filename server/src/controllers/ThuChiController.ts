import { Request, Response } from "express";
import { AppDataSource } from "../database/data-source";
import { ThuChi } from "../entities/ThuChi";
import { Between } from "typeorm";

export class ThuChiController {
  private repository = AppDataSource.getRepository(ThuChi);

  async getAll(req: Request, res: Response) {
    try {
      const { startDate, endDate, loaiGiaoDich } = req.query;
      let where: any = {};
      
      if (startDate && endDate) {
        where.ThoiGian = Between(new Date(startDate as string), new Date(endDate as string));
      }
      
      const list = await this.repository.find({
        where,
        relations: ['phienLamViec', 'nghiepVu']
      });

      let filtered = list;
      if (loaiGiaoDich) {
        filtered = list.filter(item => item.nghiepVu.LoaiGiaoDich === loaiGiaoDich);
      }

      return res.json(filtered);
    } catch (e: any) {
      return res.status(500).json({ message: "Lỗi lấy danh sách", error: e.message });
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await this.repository.findOne({ 
        where: { MaGiaoDich: id } as any,
        relations: ['phienLamViec', 'nghiepVu']
      });
      if (!item) return res.status(404).json({ message: "Không tìm thấy" });
      return res.json(item);
    } catch (e: any) {
      return res.status(500).json({ message: "Lỗi lấy thông tin", error: e.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const obj = this.repository.create(req.body as ThuChi);
      const saved = await this.repository.save(obj);
      return res.status(201).json(saved);
    } catch (e: any) {
      return res.status(400).json({ message: "Tạo mới thất bại", error: e.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existed = await this.repository.findOne({ where: { MaGiaoDich: id } as any });
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
      const existed = await this.repository.findOne({ where: { MaGiaoDich: id } as any });
      if (!existed) return res.status(404).json({ message: "Không tìm thấy" });
      await this.repository.remove(existed);
      return res.json({ message: "Đã xóa" });
    } catch (e: any) {
      return res.status(400).json({ message: "Xóa thất bại", error: e.message });
    }
  }
}


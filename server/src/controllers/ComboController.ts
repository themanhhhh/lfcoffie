import { Request, Response } from "express";
import { AppDataSource } from "../database/data-source";
import { Combo } from "../entities/Combo";
import { Between } from "typeorm";

export class ComboController {
  private repository = AppDataSource.getRepository(Combo);

  async getAll(req: Request, res: Response) {
    try {
      const list = await this.repository.find({
        relations: ['dsMonTrongCombo']
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
        where: { MaCombo: id } as any,
        relations: ['dsMonTrongCombo']
      });
      if (!item) return res.status(404).json({ message: "Không tìm thấy" });
      return res.json(item);
    } catch (e: any) {
      return res.status(500).json({ message: "Lỗi lấy thông tin", error: e.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const obj = this.repository.create(req.body as Combo);
      const saved = await this.repository.save(obj);
      return res.status(201).json(saved);
    } catch (e: any) {
      return res.status(400).json({ message: "Tạo mới thất bại", error: e.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existed = await this.repository.findOne({ where: { MaCombo: id } as any });
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
      const existed = await this.repository.findOne({ where: { MaCombo: id } as any });
      if (!existed) return res.status(404).json({ message: "Không tìm thấy" });
      await this.repository.remove(existed);
      return res.json({ message: "Đã xóa" });
    } catch (e: any) {
      return res.status(400).json({ message: "Xóa thất bại", error: e.message });
    }
  }

  // Lấy các combo đang áp dụng
  async getActiveCombos(req: Request, res: Response) {
    try {
      const now = new Date();
      const currentDay = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][now.getDay()];
      const currentTime = now.toTimeString().slice(0, 8);

      const combos = await this.repository.find({
        where: {
          TrangThai: 'hoạt động',
          NgayBatDau: Between(new Date(0), now) as any,
          NgayKetThuc: Between(now, new Date(9999, 11, 31)) as any
        },
        relations: ['dsMonTrongCombo']
      });

      const activeCombos = combos.filter(combo => {
        if (combo.Thu && combo.Thu !== currentDay) return false;
        if (combo.GioBatDau && combo.GioKetThuc) {
          if (currentTime < combo.GioBatDau || currentTime > combo.GioKetThuc) return false;
        }
        return true;
      });

      return res.json(activeCombos);
    } catch (e: any) {
      return res.status(500).json({ message: "Lỗi lấy combo", error: e.message });
    }
  }
}


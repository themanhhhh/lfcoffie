import { Request, Response } from "express";
import { AppDataSource } from "../database/data-source";
import { PhienLamViec } from "../entities/PhienLamViec";
import { CaLam } from "../entities/CaLam";
import { NhanVien } from "../entities/NhanVien";
import { Between } from "typeorm";

export class PhienLamViecController {
  private repository = AppDataSource.getRepository(PhienLamViec);
  private caLamRepo = AppDataSource.getRepository(CaLam);
  private nhanVienRepo = AppDataSource.getRepository(NhanVien);

  async getAll(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      let where: any = { isDelete: false };
      
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
        where: { MaPhienLamViec: id, isDelete: false } as any,
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
      const { MaPhienLamViec, MaCaLam, MaNhanVien, Ngay, TrangThai } = req.body;

      // Validate required fields
      if (!MaPhienLamViec || !MaCaLam || !MaNhanVien || !Ngay) {
        return res.status(400).json({ 
          message: "Thiếu thông tin bắt buộc", 
          error: "Vui lòng cung cấp đầy đủ: MaPhienLamViec, MaCaLam, MaNhanVien, Ngay" 
        });
      }

      // Check if MaPhienLamViec already exists
      const existing = await this.repository.findOne({ 
        where: { MaPhienLamViec } as any 
      });
      if (existing) {
        return res.status(400).json({ 
          message: "Mã phiên làm việc đã tồn tại", 
          error: `Phiên làm việc ${MaPhienLamViec} đã được tạo trước đó` 
        });
      }

      // Validate MaCaLam exists
      const caLam = await this.caLamRepo.findOne({ 
        where: { MaCaLam, isDelete: false } as any 
      });
      if (!caLam) {
        return res.status(400).json({ 
          message: "Ca làm việc không tồn tại", 
          error: `Không tìm thấy ca làm việc với mã: ${MaCaLam}` 
        });
      }

      // Validate MaNhanVien exists
      const nhanVien = await this.nhanVienRepo.findOne({ 
        where: { MaNhanVien, isDelete: false } as any 
      });
      if (!nhanVien) {
        return res.status(400).json({ 
          message: "Nhân viên không tồn tại", 
          error: `Không tìm thấy nhân viên với mã: ${MaNhanVien}` 
        });
      }

      // Convert Ngay from string to Date if needed
      const ngayDate = Ngay instanceof Date ? Ngay : new Date(Ngay);
      if (isNaN(ngayDate.getTime())) {
        return res.status(400).json({ 
          message: "Ngày không hợp lệ", 
          error: `Không thể chuyển đổi ngày: ${Ngay}` 
        });
      }

      // Create the entity with proper foreign key references
      // TypeORM will handle the foreign keys when we set the relation objects
      const obj = this.repository.create({
        MaPhienLamViec,
        caLam: caLam,
        nhanVien: nhanVien,
        Ngay: ngayDate,
        TrangThai: TrangThai || "mở"
      } as any);

      const saved = await this.repository.save(obj);
      return res.status(201).json(saved);
    } catch (e: any) {
      console.error("Error creating PhienLamViec:", e);
      return res.status(400).json({ 
        message: "Tạo mới thất bại", 
        error: e.message,
        details: e.detail || e.code 
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existed = await this.repository.findOne({ where: { MaPhienLamViec: id, isDelete: false } } as any);
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
      const existed = await this.repository.findOne({ where: { MaPhienLamViec: id, isDelete: false } as any });
      if (!existed) return res.status(404).json({ message: "Không tìm thấy" });
      existed.isDelete = true;
      await this.repository.save(existed);
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
        where: { MaPhienLamViec: maPhienLamViec, isDelete: false } as any 
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
        where: { MaPhienLamViec: maPhienLamViec, isDelete: false } as any 
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


import { Request, Response } from "express";
import { AppDataSource } from "../database/data-source";
import { NhanVien } from "../entities/NhanVien";
import { CaLam } from "../entities/CaLam";
import bcrypt from "bcryptjs";

export class NhanVienController {
  private repository = AppDataSource.getRepository(NhanVien);
  private caLamRepository = AppDataSource.getRepository(CaLam);

  async getAll(req: Request, res: Response) {
    const list = await this.repository.find({ where: { isDelete: false }, relations: ['caLam'] });
    return res.json(list);
  }

  async getOne(req: Request, res: Response) {
    const { id } = req.params;
    const item = await this.repository.findOne({ 
      where: { MaNhanVien: id, isDelete: false } as any,
      relations: ['caLam']
    });
    if (!item) return res.status(404).json({ message: "Không tìm thấy" });
    return res.json(item);
  }

  async create(req: Request, res: Response) {
    try {
      const { MaCaLam, ...nhanVienData } = req.body;
      
      // Load CaLam if MaCaLam is provided
      let caLam = null;
      if (MaCaLam) {
        caLam = await this.caLamRepository.findOne({ where: { MaCaLam, isDelete: false } as any });
        if (!caLam) {
          return res.status(400).json({ message: `Không tìm thấy ca làm với mã: ${MaCaLam}` });
        }
      }
      
      const obj = this.repository.create({
        ...nhanVienData,
        caLam: caLam || undefined
      } as NhanVien);
      
      // Hash password if provided
      if (obj.MatKhau) {
        const saltRounds = 10;
        obj.MatKhau = await bcrypt.hash(obj.MatKhau, saltRounds);
      }
      
      const saved = await this.repository.save(obj);
      // Reload with relations
      const savedWithRelations = await this.repository.findOne({
        where: { MaNhanVien: saved.MaNhanVien } as any,
        relations: ['caLam']
      });
      
      return res.status(201).json(savedWithRelations);
    } catch (e:any) {
      return res.status(400).json({ message: "Tạo mới thất bại", error: e.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
    const { id } = req.params;
      const { MaCaLam, ...nhanVienData } = req.body;
      
      const existed = await this.repository.findOne({ 
        where: { MaNhanVien: id, isDelete: false } as any,
        relations: ['caLam']
      });
    if (!existed) return res.status(404).json({ message: "Không tìm thấy" });
      
      // Load CaLam if MaCaLam is provided
      if (MaCaLam !== undefined) {
        if (MaCaLam) {
          const caLam = await this.caLamRepository.findOne({ where: { MaCaLam, isDelete: false } as any });
          if (!caLam) {
            return res.status(400).json({ message: `Không tìm thấy ca làm với mã: ${MaCaLam}` });
          }
          existed.caLam = caLam;
        } else {
          existed.caLam = null as any;
        }
      }
    
    // Hash password if provided in update
      if (nhanVienData.MatKhau) {
      const saltRounds = 10;
        nhanVienData.MatKhau = await bcrypt.hash(nhanVienData.MatKhau, saltRounds);
    }
    
      Object.assign(existed, nhanVienData);
    const saved = await this.repository.save(existed);
      
      // Reload with relations
      const savedWithRelations = await this.repository.findOne({
        where: { MaNhanVien: saved.MaNhanVien, isDelete: false } as any,
        relations: ['caLam']
      });
      
      return res.json(savedWithRelations);
    } catch (e: any) {
      return res.status(400).json({ message: "Cập nhật thất bại", error: e.message });
    }
  }

  async remove(req: Request, res: Response) {
    const { id } = req.params;
    const existed = await this.repository.findOne({ where: { MaNhanVien: id, isDelete: false } } as any);
    if (!existed) return res.status(404).json({ message: "Không tìm thấy" });
    existed.isDelete = true;
    await this.repository.save(existed);
    return res.json({ message: "Đã xóa" });
  }
}

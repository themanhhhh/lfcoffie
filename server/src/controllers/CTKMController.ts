import { Request, Response } from "express";
import { AppDataSource } from "../database/data-source";
import { CTKM } from "../entities/CTKM";
import { GiamHoaDon } from "../entities/GiamHoaDon";
import { GiamMon } from "../entities/GiamMon";
import { Combo } from "../entities/Combo";
import { DSMonTrongCombo } from "../entities/DSMonTrongCombo";

export class CTKMController {
  private repository = AppDataSource.getRepository(CTKM);
  private giamHoaDonRepo = AppDataSource.getRepository(GiamHoaDon);
  private giamMonRepo = AppDataSource.getRepository(GiamMon);
  private comboRepo = AppDataSource.getRepository(Combo);
  private dsMonTrongComboRepo = AppDataSource.getRepository(DSMonTrongCombo);

  async getAll(req: Request, res: Response) {
    try {
      const list = await this.repository.find({
        where: { isDelete: false },
        relations: ['giamHoaDons', 'giamMons']
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
        where: { MaCTKM: id, isDelete: false } as any,
        relations: ['giamHoaDons', 'giamMons', 'donHangs']
      });
      if (!item) return res.status(404).json({ message: "Không tìm thấy" });
      return res.json(item);
    } catch (e: any) {
      return res.status(500).json({ message: "Lỗi lấy thông tin", error: e.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const body = req.body as any;
      
      // Tạo CTKM
      const ctkmData: any = {
        MaCTKM: body.MaCTKM,
        TenCTKM: body.TenCTKM,
        LoaiCTKM: body.LoaiCTKM
      };
      const obj = this.repository.create(ctkmData);
      const savedResult = await this.repository.save(obj);
      const saved = Array.isArray(savedResult) ? savedResult[0] : savedResult;

      // Tự động tạo bản ghi liên quan dựa trên LoaiCTKM
      if (saved.LoaiCTKM === 'giamhoadon') {
        // Tạo GiamHoaDon
        const maGHD = `GHD${Date.now().toString().slice(-6)}`;
        const giamHoaDonData: any = {
          MaGHD: maGHD,
          MaCTKM: saved.MaCTKM,
          SoTienGiam: body.giaTriGiam || 0,
          LoaiGiam: body.loaiGiam || 'Phần trăm',
          NgayBatDau: body.ngayBatDau ? new Date(body.ngayBatDau) : new Date(),
          NgayKetThuc: body.ngayKetThuc ? new Date(body.ngayKetThuc) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          TrangThai: 'hoạt động'
        };
        
        if (body.soTienToiThieu) {
          giamHoaDonData.GiaTriTu = body.soTienToiThieu;
        }
        
        const giamHoaDon = this.giamHoaDonRepo.create(giamHoaDonData);
        await this.giamHoaDonRepo.save(giamHoaDon);
      } else if (saved.LoaiCTKM === 'giammon') {
        // Tạo GiamMon (cần MaMon từ body, nếu không có thì bỏ qua)
        if (body.MaMon) {
          const maGM = `GM${Date.now().toString().slice(-6)}`;
          const giamMonData: any = {
            MaGM: maGM,
            MaCTKM: saved.MaCTKM,
            MaMon: body.MaMon,
            SoTienGiam: body.giaTriGiam || 0,
            LoaiGiam: body.loaiGiam || 'Phần trăm',
            NgayBatDau: body.ngayBatDau ? new Date(body.ngayBatDau) : new Date(),
            NgayKetThuc: body.ngayKetThuc ? new Date(body.ngayKetThuc) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            TrangThai: 'hoạt động'
          };
          
          const giamMon = this.giamMonRepo.create(giamMonData);
          await this.giamMonRepo.save(giamMon);
        }
      } else if (saved.LoaiCTKM === 'combo') {
        // Tạo Combo: có thể có nhiều món
        // Body cần có: comboItems (mảng các món với MaMon và SoLuong)
        const comboItems = body.comboItems || [];
        
        if (comboItems.length > 0) {
          // 1. Tạo 1 Combo duy nhất
          const maCombo = `CB${Date.now().toString().slice(-6)}`;
          const comboData: any = {
            MaCombo: maCombo,
            TenCombo: saved.TenCTKM,
            GiaCombo: body.giaTriGiam || 0,
            NgayBatDau: body.ngayBatDau ? new Date(body.ngayBatDau) : new Date(),
            NgayKetThuc: body.ngayKetThuc ? new Date(body.ngayKetThuc) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            TrangThai: 'hoạt động'
          };
          
          const combo = this.comboRepo.create(comboData);
          const savedComboResult = await this.comboRepo.save(combo);
          const savedCombo = Array.isArray(savedComboResult) ? savedComboResult[0] : savedComboResult;
          
          // 2. Tạo nhiều DSMonTrongCombo, mỗi cái cho 1 món, liên kết với Combo
          for (let i = 0; i < comboItems.length; i++) {
            const item = comboItems[i];
            if (item.MaMon && item.SoLuong) {
              const maDSMonCombo = `DS${Date.now().toString().slice(-6)}${i}`;
              const dsMonTrongComboData: any = {
                MaDSMonCombo: maDSMonCombo,
                MaMon: item.MaMon,
                SoLuong: item.SoLuong,
                MaCombo: savedCombo.MaCombo
              };
              
              const dsMonTrongCombo = this.dsMonTrongComboRepo.create(dsMonTrongComboData);
              await this.dsMonTrongComboRepo.save(dsMonTrongCombo);
            }
          }
        }
      }

      // Load lại với relations để trả về đầy đủ
      const result = await this.repository.findOne({
        where: { MaCTKM: saved.MaCTKM } as any,
        relations: ['giamHoaDons', 'giamMons']
      });

      return res.status(201).json(result);
    } catch (e: any) {
      return res.status(400).json({ message: "Tạo mới thất bại", error: e.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existed = await this.repository.findOne({ where: { MaCTKM: id, isDelete: false } } as any);
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
      const existed = await this.repository.findOne({ where: { MaCTKM: id, isDelete: false } } as any);
      if (!existed) return res.status(404).json({ message: "Không tìm thấy" });
      existed.isDelete = true;
      await this.repository.save(existed);
      return res.json({ message: "Đã xóa" });
    } catch (e: any) {
      return res.status(400).json({ message: "Xóa thất bại", error: e.message });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { TrangThai } = req.body;
      
      if (!TrangThai) {
        return res.status(400).json({ message: "TrangThai là bắt buộc" });
      }

      const existed = await this.repository.findOne({ 
        where: { MaCTKM: id, isDelete: false } as any,
        relations: ['giamHoaDons', 'giamMons']
      });
      
      if (!existed) {
        return res.status(404).json({ message: "Không tìm thấy" });
      }

      // Cập nhật trạng thái của CTKM
      existed.TrangThai = TrangThai;
      await this.repository.save(existed);

      // Cập nhật trạng thái của các entity con
      if (existed.giamHoaDons && existed.giamHoaDons.length > 0) {
        for (const ghd of existed.giamHoaDons) {
          ghd.TrangThai = TrangThai;
          await this.giamHoaDonRepo.save(ghd);
        }
      }

      if (existed.giamMons && existed.giamMons.length > 0) {
        for (const gm of existed.giamMons) {
          gm.TrangThai = TrangThai;
          await this.giamMonRepo.save(gm);
        }
      }

      // Nếu là combo, cập nhật trạng thái combo
      if (existed.LoaiCTKM === 'combo') {
        const combos = await this.comboRepo.find({
          where: { MaCTKM: id, isDelete: false } as any
        });
        for (const combo of combos) {
          combo.TrangThai = TrangThai;
          await this.comboRepo.save(combo);
        }
      }

      return res.json({ message: "Cập nhật trạng thái thành công", TrangThai });
    } catch (e: any) {
      return res.status(400).json({ message: "Cập nhật trạng thái thất bại", error: e.message });
    }
  }
}


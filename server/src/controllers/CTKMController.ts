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
        where: { MaCTKM: id } as any,
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
        // Tạo Combo: cần tạo DSMonTrongCombo trước
        // Body cần có: MaMon (món trong combo), SoLuong (số lượng món)
        if (body.MaMon && body.SoLuong) {
          // 1. Tạo DSMonTrongCombo trước
          const maDSMonCombo = `DS${Date.now().toString().slice(-6)}`;
          const dsMonTrongComboData: any = {
            MaDSMonCombo: maDSMonCombo,
            MaMon: body.MaMon,
            SoLuong: body.SoLuong
          };
          
          const dsMonTrongCombo = this.dsMonTrongComboRepo.create(dsMonTrongComboData);
          const savedDSMonTrongComboResult = await this.dsMonTrongComboRepo.save(dsMonTrongCombo);
          const savedDSMonTrongCombo = Array.isArray(savedDSMonTrongComboResult) ? savedDSMonTrongComboResult[0] : savedDSMonTrongComboResult;
          
          // 2. Tạo Combo với MaDSMonCombo vừa tạo
          const maCombo = `CB${Date.now().toString().slice(-6)}`;
          const comboData: any = {
            MaCombo: maCombo,
            MaDSMonCombo: savedDSMonTrongCombo.MaDSMonCombo,
            TenCombo: saved.TenCTKM,
            GiaCombo: body.giaTriGiam || 0,
            NgayBatDau: body.ngayBatDau ? new Date(body.ngayBatDau) : new Date(),
            NgayKetThuc: body.ngayKetThuc ? new Date(body.ngayKetThuc) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            TrangThai: 'hoạt động'
          };
          
          const combo = this.comboRepo.create(comboData);
          await this.comboRepo.save(combo);
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
      const existed = await this.repository.findOne({ where: { MaCTKM: id } } as any);
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
      const existed = await this.repository.findOne({ where: { MaCTKM: id } } as any);
      if (!existed) return res.status(404).json({ message: "Không tìm thấy" });
      await this.repository.remove(existed);
      return res.json({ message: "Đã xóa" });
    } catch (e: any) {
      return res.status(400).json({ message: "Xóa thất bại", error: e.message });
    }
  }
}


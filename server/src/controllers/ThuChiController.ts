import { Request, Response } from "express";
import { AppDataSource } from "../database/data-source";
import { ThuChi } from "../entities/ThuChi";
import { DonHang } from "../entities/HoaDon";
import { Between } from "typeorm";

export class ThuChiController {
  private repository = AppDataSource.getRepository(ThuChi);

  async getAll(req: Request, res: Response) {
    try {
      const { startDate, endDate, loaiGiaoDich, maPhienLamViec } = req.query;
      let where: any = { isDelete: false };

      if (startDate && endDate) {
        // Parse date string as local time (not UTC)
        // startDate format: YYYY-MM-DD
        const [startYear, startMonth, startDay] = (startDate as string).split('-').map(Number);
        const [endYear, endMonth, endDay] = (endDate as string).split('-').map(Number);

        // Create dates in local timezone
        const start = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
        const end = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);

        console.log('Date filter - startDate:', startDate, '-> start:', start.toISOString());
        console.log('Date filter - endDate:', endDate, '-> end:', end.toISOString());

        where.ThoiGian = Between(start, end);
      }

      // Filter theo phiên làm việc
      if (maPhienLamViec) {
        where.MaPhienLamViec = maPhienLamViec;
      }

      const list = await this.repository.find({
        where,
        relations: ['phienLamViec', 'nghiepVu', 'phienLamViec.nhanVien']
      });

      let filtered = list;
      if (loaiGiaoDich) {
        filtered = list.filter(item => item.nghiepVu?.LoaiGiaoDich === loaiGiaoDich);
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
        where: { MaGiaoDich: id, isDelete: false } as any,
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
      // Parse ThoiGian từ string thành Date object để đảm bảo timezone đúng
      // TypeORM sẽ tự động xử lý timezone khi lưu vào database
      const thoiGian = req.body.ThoiGian ? new Date(req.body.ThoiGian) : new Date();

      // Tạo object với các field cần thiết
      const data: any = {
        MaGiaoDich: req.body.MaGiaoDich,
        ThoiGian: thoiGian,
        PhuongThucThanhToan: req.body.PhuongThucThanhToan,
        GhiChu: req.body.GhiChu || null,
        SoTien: req.body.SoTien,
        MaPhienLamViec: req.body.MaPhienLamViec || null,
        MaNghiepVu: req.body.MaNghiepVu || null
      };

      console.log('Creating ThuChi with data:', data);
      console.log('ThoiGian string:', req.body.ThoiGian);
      console.log('ThoiGian Date:', thoiGian);

      const obj = this.repository.create(data);
      const saved = await this.repository.save(obj);

      console.log('Saved ThuChi:', saved);
      return res.status(201).json(saved);
    } catch (e: any) {
      console.error('Error creating ThuChi:', e);
      return res.status(400).json({ message: "Tạo mới thất bại", error: e.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existed = await this.repository.findOne({ where: { MaGiaoDich: id, isDelete: false } as any });
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
      const existed = await this.repository.findOne({ where: { MaGiaoDich: id, isDelete: false } as any });
      if (!existed) return res.status(404).json({ message: "Không tìm thấy" });
      existed.isDelete = true;
      await this.repository.save(existed);
      return res.json({ message: "Đã xóa" });
    } catch (e: any) {
      return res.status(400).json({ message: "Xóa thất bại", error: e.message });
    }
  }

  // Lấy danh sách các phương thức thanh toán unique
  async getPaymentMethods(req: Request, res: Response) {
    try {
      const donHangRepo = AppDataSource.getRepository(DonHang);
      const thuChiRepo = AppDataSource.getRepository(ThuChi);

      // Lấy từ ThuChi
      const thuChiMethods = await thuChiRepo
        .createQueryBuilder('thuchi')
        .select('DISTINCT thuchi.PhuongThucThanhToan', 'PhuongThucThanhToan')
        .where('thuchi.PhuongThucThanhToan IS NOT NULL')
        .andWhere('thuchi.isDelete = :isDelete', { isDelete: false })
        .getRawMany();

      // Lấy từ DonHang
      const donHangMethods = await donHangRepo
        .createQueryBuilder('donhang')
        .select('DISTINCT donhang.PhuongThucThanhToan', 'PhuongThucThanhToan')
        .where('donhang.PhuongThucThanhToan IS NOT NULL')
        .andWhere('donhang.isDelete = :isDelete', { isDelete: false })
        .getRawMany();

      // Kết hợp và loại bỏ trùng lặp
      const allMethods = new Set<string>();
      thuChiMethods.forEach((item: any) => {
        if (item.PhuongThucThanhToan) {
          allMethods.add(item.PhuongThucThanhToan);
        }
      });
      donHangMethods.forEach((item: any) => {
        if (item.PhuongThucThanhToan) {
          allMethods.add(item.PhuongThucThanhToan);
        }
      });

      // Chuyển thành array và sắp xếp
      const methodsArray = Array.from(allMethods).sort();

      return res.json(methodsArray);
    } catch (e: any) {
      return res.status(500).json({ message: "Lỗi lấy danh sách phương thức thanh toán", error: e.message });
    }
  }
}


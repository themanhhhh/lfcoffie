import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

import { NhanVien } from "../entities/NhanVien";
import { HoaDon } from "../entities/HoaDon";
import { Mon } from "../entities/Mon";
import { LoaiMon } from "../entities/LoaiMon";
import { NhomThucDon } from "../entities/NhomThucDon";
import { Size } from "../entities/Size";
import { TheBan } from "../entities/TheBan";
import { KhuyenMai } from "../entities/KhuyenMai";
import { NguyenLieu } from "../entities/NguyenLieu";
import { PhieuNhap } from "../entities/PhieuNhap";
import { ChiTietPhieuNhap } from "../entities/ChiTietPhieuNhap";
import { PhieuXuat } from "../entities/PhieuXuat";
import { ChiTietPhieuXuat } from "../entities/ChiTietPhieuXuat";
import { PhieuThu } from "../entities/PhieuThu";
import { ChiTietPhieuThu } from "../entities/ChiTietPhieuThu";
import { PhieuChi } from "../entities/PhieuChi";
import { ChiTietPhieuChi } from "../entities/ChiTietPhieuChi";
import { ChiTietHoaDon } from "../entities/ChiTietHoaDon";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "aishiteru1024",
  database: "lofi",
  synchronize: false, // QUAN TRỌNG: Tắt synchronize khi dùng migrations
  logging: false,
  entities: [NhanVien, HoaDon, Mon, LoaiMon, NhomThucDon, Size, TheBan, KhuyenMai, NguyenLieu, PhieuNhap, ChiTietPhieuNhap, PhieuXuat, ChiTietPhieuXuat, PhieuThu, ChiTietPhieuThu, PhieuChi, ChiTietPhieuChi, ChiTietHoaDon],
  subscribers: [],
  migrations: ["src/migrations/**/*.ts"],
  migrationsTableName: "migrations_history",
});

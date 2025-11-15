import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

import { NhanVien } from "../entities/NhanVien";
import { CaLam } from "../entities/CaLam";
import { PhienLamViec } from "../entities/PhienLamViec";
import { DonHang } from "../entities/HoaDon";
import { ChiTietDonHang } from "../entities/ChiTietHoaDon";
import { Mon } from "../entities/Mon";
import { TheBan } from "../entities/TheBan";
import { CTKM } from "../entities/CTKM";
import { ThuChi } from "../entities/ThuChi";
import { NghiepVu } from "../entities/NghiepVu";
import { TuyChon } from "../entities/TuyChon";
import { TuyChonDonHang } from "../entities/TuyChonDonHang";
import { DSMonTrongCombo } from "../entities/DSMonTrongCombo";
import { Combo } from "../entities/Combo";
import { GiamHoaDon } from "../entities/GiamHoaDon";
import { GiamMon } from "../entities/GiamMon";

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
  entities: [
    NhanVien,
    CaLam,
    PhienLamViec,
    DonHang,
    ChiTietDonHang,
    Mon,
    TheBan,
    CTKM,
    ThuChi,
    NghiepVu,
    TuyChon,
    TuyChonDonHang,
    DSMonTrongCombo,
    Combo,
    GiamHoaDon,
    GiamMon,
  ],
  subscribers: [],
  migrations: ["src/migrations/**/*.ts"],
  migrationsTableName: "migrations_history",
});

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
const NhanVien_1 = require("../entities/NhanVien");
const CaLam_1 = require("../entities/CaLam");
const PhienLamViec_1 = require("../entities/PhienLamViec");
const HoaDon_1 = require("../entities/HoaDon");
const ChiTietHoaDon_1 = require("../entities/ChiTietHoaDon");
const Mon_1 = require("../entities/Mon");
const TheBan_1 = require("../entities/TheBan");
const CTKM_1 = require("../entities/CTKM");
const ThuChi_1 = require("../entities/ThuChi");
const NghiepVu_1 = require("../entities/NghiepVu");
const TuyChon_1 = require("../entities/TuyChon");
const TuyChonDonHang_1 = require("../entities/TuyChonDonHang");
const DSMonTrongCombo_1 = require("../entities/DSMonTrongCombo");
const Combo_1 = require("../entities/Combo");
const GiamHoaDon_1 = require("../entities/GiamHoaDon");
const GiamMon_1 = require("../entities/GiamMon");
dotenv_1.default.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "aishiteru1024",
    database: "lofi",
    synchronize: false, // QUAN TRỌNG: Tắt synchronize khi dùng migrations
    logging: false,
    entities: [
        NhanVien_1.NhanVien,
        CaLam_1.CaLam,
        PhienLamViec_1.PhienLamViec,
        HoaDon_1.DonHang,
        ChiTietHoaDon_1.ChiTietDonHang,
        Mon_1.Mon,
        TheBan_1.TheBan,
        CTKM_1.CTKM,
        ThuChi_1.ThuChi,
        NghiepVu_1.NghiepVu,
        TuyChon_1.TuyChon,
        TuyChonDonHang_1.TuyChonDonHang,
        DSMonTrongCombo_1.DSMonTrongCombo,
        Combo_1.Combo,
        GiamHoaDon_1.GiamHoaDon,
        GiamMon_1.GiamMon,
    ],
    subscribers: [],
    migrations: ["src/migrations/**/*.ts"],
    migrationsTableName: "migrations_history",
});

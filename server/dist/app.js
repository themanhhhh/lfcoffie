"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
require("reflect-metadata");
const data_source_1 = require("./database/data-source");
const nhanvien_1 = __importDefault(require("./routes/nhanvien"));
const hoadon_1 = __importDefault(require("./routes/hoadon"));
const mon_1 = __importDefault(require("./routes/mon"));
const theban_1 = __importDefault(require("./routes/theban"));
const chitiethoadon_1 = __importDefault(require("./routes/chitiethoadon"));
const thongke_1 = __importDefault(require("./routes/thongke"));
const auth_1 = __importDefault(require("./routes/auth"));
const calam_1 = __importDefault(require("./routes/calam"));
const phienlamviec_1 = __importDefault(require("./routes/phienlamviec"));
const ctkm_1 = __importDefault(require("./routes/ctkm"));
const giamhoadon_1 = __importDefault(require("./routes/giamhoadon"));
const giammon_1 = __importDefault(require("./routes/giammon"));
const combo_1 = __importDefault(require("./routes/combo"));
const dsmontrongcombo_1 = __importDefault(require("./routes/dsmontrongcombo"));
const thuchi_1 = __importDefault(require("./routes/thuchi"));
const nghiepvu_1 = __importDefault(require("./routes/nghiepvu"));
const tuychon_1 = __importDefault(require("./routes/tuychon"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((req, res, next) => {
    const allowOrigin = process.env.CLIENT_ORIGIN || "*";
    res.header("Access-Control-Allow-Origin", allowOrigin);
    res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }
    next();
});
// Health check
app.get("/health", (_req, res) => res.json({ status: "ok" }));
// Routes
// Auth routes (no authentication required)
app.use("/api/auth", auth_1.default);
app.use("/api/nhanvien", nhanvien_1.default);
app.use("/api/hoadon", hoadon_1.default);
app.use("/api/mon", mon_1.default);
app.use("/api/theban", theban_1.default);
app.use("/api/chitiethoadon", chitiethoadon_1.default);
app.use("/api/thongke", thongke_1.default);
app.use("/api/calam", calam_1.default);
app.use("/api/phienlamviec", phienlamviec_1.default);
app.use("/api/ctkm", ctkm_1.default);
app.use("/api/giamhoadon", giamhoadon_1.default);
app.use("/api/giammon", giammon_1.default);
app.use("/api/combo", combo_1.default);
app.use("/api/dsmontrongcombo", dsmontrongcombo_1.default);
app.use("/api/thuchi", thuchi_1.default);
app.use("/api/nghiepvu", nghiepvu_1.default);
app.use("/api/tuychon", tuychon_1.default);
// Init DB
data_source_1.AppDataSource.initialize()
    .then(() => console.log("✅ PostgreSQL connected"))
    .catch((err) => console.error("❌ DB Error: ", err));
exports.default = app;

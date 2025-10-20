import express from "express";
import dotenv from "dotenv";
import "reflect-metadata";
import { AppDataSource } from "./database/data-source";

import nhanvienRoutes from "./routes/nhanvien";
import hoadonRoutes from "./routes/hoadon";
import monRoutes from "./routes/mon";

import loaimonRoutes from "./routes/loaimon";
import nhomthucdonRoutes from "./routes/nhomthucdon";
import sizeRoutes from "./routes/size";
import thebanRoutes from "./routes/theban";
import khuyenmaiRoutes from "./routes/khuyenmai";
import nguyenlieuRoutes from "./routes/nguyenlieu";
import phieunhapRoutes from "./routes/phieunhap";
import chitietphieunhapRoutes from "./routes/chitietphieunhap";
import phieuxuatRoutes from "./routes/phieuxuat";
import chitietphieuxuatRoutes from "./routes/chitietphieuxuat";
import phieuthuRoutes from "./routes/phieuthu";
import chitietphieuthuRoutes from "./routes/chitietphieuthu";
import phieuchiRoutes from "./routes/phieuchi";
import chitietphieuchiRoutes from "./routes/chitietphieuchi";
import chitiethoadonRoutes from "./routes/chitiethoadon";
import thongkeRoutes from "./routes/thongke";
import authRoutes from "./routes/auth";

dotenv.config();
const app = express();
app.use(express.json());
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

// Auth routes (no authentication required)
app.use("/api/auth", authRoutes);

// Routes
app.use("/api/nhanvien", nhanvienRoutes);
app.use("/api/hoadon", hoadonRoutes);
app.use("/api/mon", monRoutes);

app.use("/api/loaimon", loaimonRoutes);
app.use("/api/nhomthucdon", nhomthucdonRoutes);
app.use("/api/size", sizeRoutes);
app.use("/api/theban", thebanRoutes);
app.use("/api/khuyenmai", khuyenmaiRoutes);
app.use("/api/nguyenlieu", nguyenlieuRoutes);
app.use("/api/phieunhap", phieunhapRoutes);
app.use("/api/chitietphieunhap", chitietphieunhapRoutes);
app.use("/api/phieuxuat", phieuxuatRoutes);
app.use("/api/chitietphieuxuat", chitietphieuxuatRoutes);
app.use("/api/phieuthu", phieuthuRoutes);
app.use("/api/chitietphieuthu", chitietphieuthuRoutes);
app.use("/api/phieuchi", phieuchiRoutes);
app.use("/api/chitietphieuchi", chitietphieuchiRoutes);
app.use("/api/chitiethoadon", chitiethoadonRoutes);
app.use("/api/thongke", thongkeRoutes);

// Init DB
AppDataSource.initialize()
  .then(() => console.log("✅ PostgreSQL connected"))
  .catch((err) => console.error("❌ DB Error: ", err));

export default app;

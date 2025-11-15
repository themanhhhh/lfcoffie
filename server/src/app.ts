import express from "express";
import dotenv from "dotenv";
import "reflect-metadata";
import { AppDataSource } from "./database/data-source";

import nhanvienRoutes from "./routes/nhanvien";
import hoadonRoutes from "./routes/hoadon";
import monRoutes from "./routes/mon";
import thebanRoutes from "./routes/theban";
import chitiethoadonRoutes from "./routes/chitiethoadon";
import thongkeRoutes from "./routes/thongke";
import authRoutes from "./routes/auth";
import calamRoutes from "./routes/calam";
import phienlamviecRoutes from "./routes/phienlamviec";
import ctkmRoutes from "./routes/ctkm";
import giamhoadonRoutes from "./routes/giamhoadon";
import giammonRoutes from "./routes/giammon";
import comboRoutes from "./routes/combo";
import thuchiRoutes from "./routes/thuchi";
import nghiepvuRoutes from "./routes/nghiepvu";
import tuychonRoutes from "./routes/tuychon";

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

// Routes
// Auth routes (no authentication required)
app.use("/api/auth", authRoutes);
app.use("/api/nhanvien", nhanvienRoutes);
app.use("/api/hoadon", hoadonRoutes);
app.use("/api/mon", monRoutes);
app.use("/api/theban", thebanRoutes);
app.use("/api/chitiethoadon", chitiethoadonRoutes);
app.use("/api/thongke", thongkeRoutes);
app.use("/api/calam", calamRoutes);
app.use("/api/phienlamviec", phienlamviecRoutes);
app.use("/api/ctkm", ctkmRoutes);
app.use("/api/giamhoadon", giamhoadonRoutes);
app.use("/api/giammon", giammonRoutes);
app.use("/api/combo", comboRoutes);
app.use("/api/thuchi", thuchiRoutes);
app.use("/api/nghiepvu", nghiepvuRoutes);
app.use("/api/tuychon", tuychonRoutes);

// Init DB
AppDataSource.initialize()
  .then(() => console.log("✅ PostgreSQL connected"))
  .catch((err) => console.error("❌ DB Error: ", err));

export default app;

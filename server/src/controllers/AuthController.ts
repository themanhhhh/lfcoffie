import { Request, Response } from "express";
import { AppDataSource } from "../database/data-source";
import { NhanVien } from "../entities/NhanVien";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export class AuthController {
  private repository = AppDataSource.getRepository(NhanVien);

  async login(req: Request, res: Response) {
    try {
      const { taiKhoan, matKhau } = req.body;

      if (!taiKhoan || !matKhau) {
        return res.status(400).json({ 
          message: "Tài khoản và mật khẩu là bắt buộc" 
        });
      }

      // Find user by TaiKhoan only
      const user = await this.repository.findOne({
        where: { TaiKhoan: taiKhoan } as any,
        relations: ['caLam']
      });

      if (!user) {
        return res.status(401).json({ 
          message: "Tài khoản hoặc mật khẩu không đúng" 
        });
      }

      // Check if user is active
      if (user.TrangThai && user.TrangThai !== "hoạt động") {
        return res.status(401).json({ 
          message: "Tài khoản đã bị khóa" 
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(matKhau, user.MatKhau);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          message: "Tài khoản hoặc mật khẩu không đúng" 
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          MaNhanVien: user.MaNhanVien, 
          TenNhanVien: user.TenNhanVien, 
          ChucVu: user.ChucVu,
          TaiKhoan: user.TaiKhoan 
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );

      // Return user info and token (exclude password)
      const { MatKhau: _, ...userWithoutPassword } = user;
      
      return res.json({
        message: "Đăng nhập thành công",
        token,
        user: userWithoutPassword
      });

    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ 
        message: "Lỗi server, vui lòng thử lại sau" 
      });
    }
  }

  async verifyToken(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      
      if (!token) {
        return res.status(401).json({ message: "Token không được cung cấp" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any;
      
      // Get fresh user data
      const user = await this.repository.findOne({
        where: { MaNhanVien: decoded.MaNhanVien } as any,
        relations: ['caLam']
      });

      if (!user) {
        return res.status(401).json({ message: "Token không hợp lệ" });
      }

      const { MatKhau: _, ...userWithoutPassword } = user;
      return res.json({ user: userWithoutPassword });

    } catch (error) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }
  }

  async logout(req: Request, res: Response) {
    // For JWT, logout is handled on client side by removing token
    return res.json({ message: "Đăng xuất thành công" });
  }
}

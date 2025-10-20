import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    maNV: string;
    tenNV: string;
    chucVu: string;
    taiKhoan: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Token không được cung cấp" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any;
    req.user = {
      maNV: decoded.maNV,
      tenNV: decoded.tenNV,
      chucVu: decoded.chucVu,
      taiKhoan: decoded.taiKhoan
    };
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token không hợp lệ" });
  }
};

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const data_source_1 = require("../database/data-source");
const NhanVien_1 = require("../entities/NhanVien");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class AuthController {
    constructor() {
        this.repository = data_source_1.AppDataSource.getRepository(NhanVien_1.NhanVien);
    }
    async login(req, res) {
        try {
            const { taiKhoan, matKhau } = req.body;
            if (!taiKhoan || !matKhau) {
                return res.status(400).json({
                    message: "Tài khoản và mật khẩu là bắt buộc"
                });
            }
            // Find user by TaiKhoan only
            const user = await this.repository.findOne({
                where: { TaiKhoan: taiKhoan },
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
            const isPasswordValid = await bcryptjs_1.default.compare(matKhau, user.MatKhau);
            if (!isPasswordValid) {
                return res.status(401).json({
                    message: "Tài khoản hoặc mật khẩu không đúng"
                });
            }
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({
                MaNhanVien: user.MaNhanVien,
                TenNhanVien: user.TenNhanVien,
                ChucVu: user.ChucVu,
                TaiKhoan: user.TaiKhoan
            }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "24h" });
            // Return user info and token (exclude password)
            const { MatKhau: _, ...userWithoutPassword } = user;
            return res.json({
                message: "Đăng nhập thành công",
                token,
                user: userWithoutPassword
            });
        }
        catch (error) {
            console.error("Login error:", error);
            return res.status(500).json({
                message: "Lỗi server, vui lòng thử lại sau"
            });
        }
    }
    async verifyToken(req, res) {
        try {
            const token = req.headers.authorization?.replace("Bearer ", "");
            if (!token) {
                return res.status(401).json({ message: "Token không được cung cấp" });
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "your-secret-key");
            // Get fresh user data
            const user = await this.repository.findOne({
                where: { MaNhanVien: decoded.MaNhanVien },
                relations: ['caLam']
            });
            if (!user) {
                return res.status(401).json({ message: "Token không hợp lệ" });
            }
            const { MatKhau: _, ...userWithoutPassword } = user;
            return res.json({ user: userWithoutPassword });
        }
        catch (error) {
            return res.status(401).json({ message: "Token không hợp lệ" });
        }
    }
    async logout(req, res) {
        // For JWT, logout is handled on client side by removing token
        return res.json({ message: "Đăng xuất thành công" });
    }
}
exports.AuthController = AuthController;

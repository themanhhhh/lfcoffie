"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NhanVien = void 0;
const typeorm_1 = require("typeorm");
const CaLam_1 = require("./CaLam");
const PhienLamViec_1 = require("./PhienLamViec");
let NhanVien = class NhanVien {
};
exports.NhanVien = NhanVien;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: "varchar", length: 10 }),
    __metadata("design:type", String)
], NhanVien.prototype, "MaNhanVien", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CaLam_1.CaLam, (cl) => cl.nhanViens, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: "MaCaLam" }),
    __metadata("design:type", CaLam_1.CaLam)
], NhanVien.prototype, "caLam", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 50 }),
    __metadata("design:type", String)
], NhanVien.prototype, "TenNhanVien", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 15, nullable: true }),
    __metadata("design:type", Object)
], NhanVien.prototype, "SoDienThoai", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 30 }),
    __metadata("design:type", String)
], NhanVien.prototype, "ChucVu", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 10 }),
    __metadata("design:type", String)
], NhanVien.prototype, "GioiTinh", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", Date)
], NhanVien.prototype, "NgaySinh", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 50, unique: true }),
    __metadata("design:type", String)
], NhanVien.prototype, "TaiKhoan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100 }),
    __metadata("design:type", String)
], NhanVien.prototype, "MatKhau", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, nullable: true }),
    __metadata("design:type", Object)
], NhanVien.prototype, "TrangThai", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PhienLamViec_1.PhienLamViec, (plv) => plv.nhanVien),
    __metadata("design:type", Array)
], NhanVien.prototype, "phienLamViecs", void 0);
exports.NhanVien = NhanVien = __decorate([
    (0, typeorm_1.Entity)({ name: "nhanvien" })
], NhanVien);

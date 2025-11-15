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
exports.PhienLamViec = void 0;
const typeorm_1 = require("typeorm");
const CaLam_1 = require("./CaLam");
const NhanVien_1 = require("./NhanVien");
const HoaDon_1 = require("./HoaDon");
const ThuChi_1 = require("./ThuChi");
let PhienLamViec = class PhienLamViec {
};
exports.PhienLamViec = PhienLamViec;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: "varchar", length: 10 }),
    __metadata("design:type", String)
], PhienLamViec.prototype, "MaPhienLamViec", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CaLam_1.CaLam, (cl) => cl.phienLamViecs, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: "MaCaLam" }),
    __metadata("design:type", CaLam_1.CaLam)
], PhienLamViec.prototype, "caLam", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => NhanVien_1.NhanVien, (nv) => nv.phienLamViecs, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: "MaNhanVien" }),
    __metadata("design:type", NhanVien_1.NhanVien)
], PhienLamViec.prototype, "nhanVien", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", Date)
], PhienLamViec.prototype, "Ngay", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "time", nullable: true }),
    __metadata("design:type", Object)
], PhienLamViec.prototype, "ThoiGianMo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "time", nullable: true }),
    __metadata("design:type", Object)
], PhienLamViec.prototype, "ThoiGianDong", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, default: "mở" }),
    __metadata("design:type", String)
], PhienLamViec.prototype, "TrangThai", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => HoaDon_1.DonHang, (dh) => dh.phienLamViec),
    __metadata("design:type", Array)
], PhienLamViec.prototype, "donHangs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ThuChi_1.ThuChi, (tc) => tc.phienLamViec),
    __metadata("design:type", Array)
], PhienLamViec.prototype, "thuChis", void 0);
exports.PhienLamViec = PhienLamViec = __decorate([
    (0, typeorm_1.Entity)({ name: "phienlamviec" })
], PhienLamViec);

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
exports.ChiTietHoaDon = exports.ChiTietDonHang = void 0;
const typeorm_1 = require("typeorm");
const HoaDon_1 = require("./HoaDon");
const Mon_1 = require("./Mon");
const TuyChonDonHang_1 = require("./TuyChonDonHang");
let ChiTietDonHang = class ChiTietDonHang {
};
exports.ChiTietDonHang = ChiTietDonHang;
exports.ChiTietHoaDon = ChiTietDonHang;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: "varchar", length: 10 }),
    __metadata("design:type", String)
], ChiTietDonHang.prototype, "MaCTDH", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => HoaDon_1.DonHang, (dh) => dh.chiTietDonHangs, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: "MaDH" }),
    __metadata("design:type", HoaDon_1.DonHang)
], ChiTietDonHang.prototype, "donHang", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Mon_1.Mon, (m) => m.chiTietDonHangs, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: "MaMon" }),
    __metadata("design:type", Mon_1.Mon)
], ChiTietDonHang.prototype, "mon", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], ChiTietDonHang.prototype, "DonGia", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], ChiTietDonHang.prototype, "SoLuong", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => TuyChonDonHang_1.TuyChonDonHang, (tcdh) => tcdh.chiTietDonHang),
    __metadata("design:type", Array)
], ChiTietDonHang.prototype, "tuyChonDonHangs", void 0);
exports.ChiTietHoaDon = exports.ChiTietDonHang = ChiTietDonHang = __decorate([
    (0, typeorm_1.Entity)({ name: "chitietdonhang" })
], ChiTietDonHang);

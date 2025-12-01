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
exports.HoaDon = exports.DonHang = void 0;
const typeorm_1 = require("typeorm");
const PhienLamViec_1 = require("./PhienLamViec");
const CTKM_1 = require("./CTKM");
const ChiTietHoaDon_1 = require("./ChiTietHoaDon");
let DonHang = class DonHang {
};
exports.DonHang = DonHang;
exports.HoaDon = DonHang;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: "varchar", length: 10 }),
    __metadata("design:type", String)
], DonHang.prototype, "MaDonHang", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PhienLamViec_1.PhienLamViec, (plv) => plv.donHangs, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: "MaPhienLamViec" }),
    __metadata("design:type", PhienLamViec_1.PhienLamViec)
], DonHang.prototype, "phienLamViec", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CTKM_1.CTKM, (ctkm) => ctkm.donHangs, { nullable: true, eager: false }),
    (0, typeorm_1.JoinColumn)({ name: "MaCTKM" }),
    __metadata("design:type", Object)
], DonHang.prototype, "ctkm", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", Date)
], DonHang.prototype, "Ngay", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 50 }),
    __metadata("design:type", String)
], DonHang.prototype, "PhuongThucThanhToan", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ChiTietHoaDon_1.ChiTietDonHang, (ctdh) => ctdh.donHang),
    __metadata("design:type", Array)
], DonHang.prototype, "chiTietDonHangs", void 0);
exports.HoaDon = exports.DonHang = DonHang = __decorate([
    (0, typeorm_1.Entity)({ name: "donhang" })
], DonHang);

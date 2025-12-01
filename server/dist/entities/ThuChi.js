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
exports.ThuChi = void 0;
const typeorm_1 = require("typeorm");
const PhienLamViec_1 = require("./PhienLamViec");
const NghiepVu_1 = require("./NghiepVu");
let ThuChi = class ThuChi {
};
exports.ThuChi = ThuChi;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: "varchar", length: 10 }),
    __metadata("design:type", String)
], ThuChi.prototype, "MaGiaoDich", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 10, nullable: true }),
    __metadata("design:type", Object)
], ThuChi.prototype, "MaPhienLamViec", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PhienLamViec_1.PhienLamViec, (plv) => plv.thuChis, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "MaPhienLamViec" }),
    __metadata("design:type", Object)
], ThuChi.prototype, "phienLamViec", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 10, nullable: true }),
    __metadata("design:type", Object)
], ThuChi.prototype, "MaNghiepVu", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => NghiepVu_1.NghiepVu, (nv) => nv.thuChis, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "MaNghiepVu" }),
    __metadata("design:type", Object)
], ThuChi.prototype, "nghiepVu", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp" }),
    __metadata("design:type", Date)
], ThuChi.prototype, "ThoiGian", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 50 }),
    __metadata("design:type", String)
], ThuChi.prototype, "PhuongThucThanhToan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", Object)
], ThuChi.prototype, "GhiChu", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], ThuChi.prototype, "SoTien", void 0);
exports.ThuChi = ThuChi = __decorate([
    (0, typeorm_1.Entity)({ name: "thuchi" })
], ThuChi);

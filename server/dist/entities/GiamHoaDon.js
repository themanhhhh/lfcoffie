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
exports.GiamHoaDon = void 0;
const typeorm_1 = require("typeorm");
const CTKM_1 = require("./CTKM");
let GiamHoaDon = class GiamHoaDon {
};
exports.GiamHoaDon = GiamHoaDon;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: "varchar", length: 10 }),
    __metadata("design:type", String)
], GiamHoaDon.prototype, "MaGHD", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CTKM_1.CTKM, (ctkm) => ctkm.giamHoaDons, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: "MaCTKM" }),
    __metadata("design:type", CTKM_1.CTKM)
], GiamHoaDon.prototype, "ctkm", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    __metadata("design:type", Object)
], GiamHoaDon.prototype, "GiaTriTu", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], GiamHoaDon.prototype, "SoTienGiam", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20 }),
    __metadata("design:type", String)
], GiamHoaDon.prototype, "LoaiGiam", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", Date)
], GiamHoaDon.prototype, "NgayBatDau", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", Date)
], GiamHoaDon.prototype, "NgayKetThuc", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, nullable: true }),
    __metadata("design:type", Object)
], GiamHoaDon.prototype, "Thu", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "time", nullable: true }),
    __metadata("design:type", Object)
], GiamHoaDon.prototype, "GioBatDau", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "time", nullable: true }),
    __metadata("design:type", Object)
], GiamHoaDon.prototype, "GioKetThuc", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, default: "hoạt động" }),
    __metadata("design:type", String)
], GiamHoaDon.prototype, "TrangThai", void 0);
exports.GiamHoaDon = GiamHoaDon = __decorate([
    (0, typeorm_1.Entity)({ name: "giamhoadon" })
], GiamHoaDon);

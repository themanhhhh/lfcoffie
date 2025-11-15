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
exports.GiamMon = void 0;
const typeorm_1 = require("typeorm");
const CTKM_1 = require("./CTKM");
const Mon_1 = require("./Mon");
let GiamMon = class GiamMon {
};
exports.GiamMon = GiamMon;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: "varchar", length: 10 }),
    __metadata("design:type", String)
], GiamMon.prototype, "MaGM", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CTKM_1.CTKM, (ctkm) => ctkm.giamMons, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: "MaCTKM" }),
    __metadata("design:type", CTKM_1.CTKM)
], GiamMon.prototype, "ctkm", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Mon_1.Mon, (m) => m.giamMons, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: "MaMon" }),
    __metadata("design:type", Mon_1.Mon)
], GiamMon.prototype, "mon", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], GiamMon.prototype, "SoTienGiam", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20 }),
    __metadata("design:type", String)
], GiamMon.prototype, "LoaiGiam", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 50, nullable: true }),
    __metadata("design:type", Object)
], GiamMon.prototype, "ApDungCho", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", Date)
], GiamMon.prototype, "NgayBatDau", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", Date)
], GiamMon.prototype, "NgayKetThuc", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, nullable: true }),
    __metadata("design:type", Object)
], GiamMon.prototype, "Thu", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "time", nullable: true }),
    __metadata("design:type", Object)
], GiamMon.prototype, "GioBatDau", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "time", nullable: true }),
    __metadata("design:type", Object)
], GiamMon.prototype, "GioKetThuc", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, default: "hoạt động" }),
    __metadata("design:type", String)
], GiamMon.prototype, "TrangThai", void 0);
exports.GiamMon = GiamMon = __decorate([
    (0, typeorm_1.Entity)({ name: "giammon" })
], GiamMon);

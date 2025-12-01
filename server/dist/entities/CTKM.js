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
exports.CTKM = void 0;
const typeorm_1 = require("typeorm");
const HoaDon_1 = require("./HoaDon");
const GiamHoaDon_1 = require("./GiamHoaDon");
const GiamMon_1 = require("./GiamMon");
let CTKM = class CTKM {
};
exports.CTKM = CTKM;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: "varchar", length: 10 }),
    __metadata("design:type", String)
], CTKM.prototype, "MaCTKM", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100 }),
    __metadata("design:type", String)
], CTKM.prototype, "TenCTKM", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20 }),
    __metadata("design:type", String)
], CTKM.prototype, "LoaiCTKM", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, default: "hoạt động" }),
    __metadata("design:type", String)
], CTKM.prototype, "TrangThai", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => HoaDon_1.DonHang, (dh) => dh.ctkm),
    __metadata("design:type", Array)
], CTKM.prototype, "donHangs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => GiamHoaDon_1.GiamHoaDon, (ghd) => ghd.ctkm),
    __metadata("design:type", Array)
], CTKM.prototype, "giamHoaDons", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => GiamMon_1.GiamMon, (gm) => gm.ctkm),
    __metadata("design:type", Array)
], CTKM.prototype, "giamMons", void 0);
exports.CTKM = CTKM = __decorate([
    (0, typeorm_1.Entity)({ name: "ctkm" })
], CTKM);

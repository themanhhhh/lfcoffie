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
exports.Mon = void 0;
const typeorm_1 = require("typeorm");
const ChiTietHoaDon_1 = require("./ChiTietHoaDon");
const DSMonTrongCombo_1 = require("./DSMonTrongCombo");
const GiamMon_1 = require("./GiamMon");
let Mon = class Mon {
};
exports.Mon = Mon;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: "varchar", length: 10 }),
    __metadata("design:type", String)
], Mon.prototype, "MaMon", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Mon.prototype, "LoaiMon", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20 }),
    __metadata("design:type", String)
], Mon.prototype, "NhomMon", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Mon.prototype, "TenMon", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], Mon.prototype, "DonGia", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20 }),
    __metadata("design:type", String)
], Mon.prototype, "DonViTinh", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, nullable: true }),
    __metadata("design:type", Object)
], Mon.prototype, "TrangThai", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", Object)
], Mon.prototype, "imgUrl", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ChiTietHoaDon_1.ChiTietDonHang, (ctdh) => ctdh.mon),
    __metadata("design:type", Array)
], Mon.prototype, "chiTietDonHangs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DSMonTrongCombo_1.DSMonTrongCombo, (ds) => ds.mon),
    __metadata("design:type", Array)
], Mon.prototype, "dsMonTrongCombos", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => GiamMon_1.GiamMon, (gm) => gm.mon),
    __metadata("design:type", Array)
], Mon.prototype, "giamMons", void 0);
exports.Mon = Mon = __decorate([
    (0, typeorm_1.Entity)({ name: "mon" })
], Mon);

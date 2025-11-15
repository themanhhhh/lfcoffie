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
exports.CaLam = void 0;
const typeorm_1 = require("typeorm");
const NhanVien_1 = require("./NhanVien");
const PhienLamViec_1 = require("./PhienLamViec");
let CaLam = class CaLam {
};
exports.CaLam = CaLam;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: "varchar", length: 10 }),
    __metadata("design:type", String)
], CaLam.prototype, "MaCaLam", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 50 }),
    __metadata("design:type", String)
], CaLam.prototype, "TenCaLam", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "time" }),
    __metadata("design:type", String)
], CaLam.prototype, "ThoiGianBatDau", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "time" }),
    __metadata("design:type", String)
], CaLam.prototype, "ThoiGianKetThuc", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => NhanVien_1.NhanVien, (nv) => nv.caLam),
    __metadata("design:type", Array)
], CaLam.prototype, "nhanViens", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PhienLamViec_1.PhienLamViec, (plv) => plv.caLam),
    __metadata("design:type", Array)
], CaLam.prototype, "phienLamViecs", void 0);
exports.CaLam = CaLam = __decorate([
    (0, typeorm_1.Entity)({ name: "calam" })
], CaLam);

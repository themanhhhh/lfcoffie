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
exports.TuyChon = void 0;
const typeorm_1 = require("typeorm");
const TuyChonDonHang_1 = require("./TuyChonDonHang");
let TuyChon = class TuyChon {
};
exports.TuyChon = TuyChon;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: "varchar", length: 10 }),
    __metadata("design:type", String)
], TuyChon.prototype, "MaTuyChon", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 50 }),
    __metadata("design:type", String)
], TuyChon.prototype, "LoaiTuyChon", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100 }),
    __metadata("design:type", String)
], TuyChon.prototype, "TenTuyChon", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], TuyChon.prototype, "GiaCongThem", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => TuyChonDonHang_1.TuyChonDonHang, (tcdh) => tcdh.tuyChon),
    __metadata("design:type", Array)
], TuyChon.prototype, "tuyChonDonHangs", void 0);
exports.TuyChon = TuyChon = __decorate([
    (0, typeorm_1.Entity)({ name: "tuychon" })
], TuyChon);

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
exports.NghiepVu = void 0;
const typeorm_1 = require("typeorm");
const ThuChi_1 = require("./ThuChi");
let NghiepVu = class NghiepVu {
};
exports.NghiepVu = NghiepVu;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: "varchar", length: 10 }),
    __metadata("design:type", String)
], NghiepVu.prototype, "MaNghiepVu", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 10 }),
    __metadata("design:type", String)
], NghiepVu.prototype, "LoaiGiaoDich", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100 }),
    __metadata("design:type", String)
], NghiepVu.prototype, "TenNghiepVu", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ThuChi_1.ThuChi, (tc) => tc.nghiepVu),
    __metadata("design:type", Array)
], NghiepVu.prototype, "thuChis", void 0);
exports.NghiepVu = NghiepVu = __decorate([
    (0, typeorm_1.Entity)({ name: "nghiepvu" })
], NghiepVu);

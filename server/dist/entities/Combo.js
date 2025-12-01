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
exports.Combo = void 0;
const typeorm_1 = require("typeorm");
const DSMonTrongCombo_1 = require("./DSMonTrongCombo");
let Combo = class Combo {
};
exports.Combo = Combo;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: "varchar", length: 10 }),
    __metadata("design:type", String)
], Combo.prototype, "MaCombo", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DSMonTrongCombo_1.DSMonTrongCombo, (ds) => ds.combo),
    __metadata("design:type", Array)
], Combo.prototype, "dsMonTrongCombos", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Combo.prototype, "TenCombo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], Combo.prototype, "GiaCombo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", Date)
], Combo.prototype, "NgayBatDau", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", Date)
], Combo.prototype, "NgayKetThuc", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, nullable: true }),
    __metadata("design:type", Object)
], Combo.prototype, "Thu", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "time", nullable: true }),
    __metadata("design:type", Object)
], Combo.prototype, "GioBatDau", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "time", nullable: true }),
    __metadata("design:type", Object)
], Combo.prototype, "GioKetThuc", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, default: "hoạt động" }),
    __metadata("design:type", String)
], Combo.prototype, "TrangThai", void 0);
exports.Combo = Combo = __decorate([
    (0, typeorm_1.Entity)({ name: "combo" })
], Combo);

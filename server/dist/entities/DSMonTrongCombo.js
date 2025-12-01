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
exports.DSMonTrongCombo = void 0;
const typeorm_1 = require("typeorm");
const Mon_1 = require("./Mon");
const Combo_1 = require("./Combo");
let DSMonTrongCombo = class DSMonTrongCombo {
};
exports.DSMonTrongCombo = DSMonTrongCombo;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: "varchar", length: 10 }),
    __metadata("design:type", String)
], DSMonTrongCombo.prototype, "MaDSMonCombo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Mon_1.Mon, (m) => m.dsMonTrongCombos, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: "MaMon" }),
    __metadata("design:type", Mon_1.Mon)
], DSMonTrongCombo.prototype, "mon", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], DSMonTrongCombo.prototype, "SoLuong", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 10, nullable: true }),
    __metadata("design:type", Object)
], DSMonTrongCombo.prototype, "MaCombo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Combo_1.Combo, (c) => c.dsMonTrongCombos, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "MaCombo" }),
    __metadata("design:type", Object)
], DSMonTrongCombo.prototype, "combo", void 0);
exports.DSMonTrongCombo = DSMonTrongCombo = __decorate([
    (0, typeorm_1.Entity)({ name: "dsmontrongcombo" })
], DSMonTrongCombo);

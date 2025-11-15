"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateId = generateId;
exports.generatePhieuThuId = generatePhieuThuId;
exports.generatePhieuChiId = generatePhieuChiId;
exports.generateChiTietPhieuThuId = generateChiTietPhieuThuId;
exports.generateChiTietPhieuChiId = generateChiTietPhieuChiId;
function generateId(prefix) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
}
function generatePhieuThuId() {
    return generateId('PT');
}
function generatePhieuChiId() {
    return generateId('PC');
}
function generateChiTietPhieuThuId() {
    return generateId('CTPT');
}
function generateChiTietPhieuChiId() {
    return generateId('CTPC');
}

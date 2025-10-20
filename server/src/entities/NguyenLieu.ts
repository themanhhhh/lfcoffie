import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { ChiTietPhieuNhap } from "./ChiTietPhieuNhap";
import { ChiTietPhieuXuat } from "./ChiTietPhieuXuat";

@Entity({ name: "nguyenlieu" })
export class NguyenLieu {
  @PrimaryColumn({ type: "varchar", length: 10 })
  maNL!: string;

  @Column({ type: "varchar", length: 50 })
  tenNL!: string;

  @Column({ type: "varchar", length: 10 })
  donViTinh!: string;

  @OneToMany(() => ChiTietPhieuNhap, (ctpn) => ctpn.nguyenLieu)
  chiTietPhieuNhaps!: ChiTietPhieuNhap[];

  @OneToMany(() => ChiTietPhieuXuat, (ctpx) => ctpx.nguyenLieu)
  chiTietPhieuXuats!: ChiTietPhieuXuat[];
}

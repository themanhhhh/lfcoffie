import { Entity, PrimaryColumn, Column, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { NhanVien } from "./NhanVien";
import { ChiTietPhieuXuat } from "./ChiTietPhieuXuat";

@Entity({ name: "phieuxuat" })
export class PhieuXuat {
  @PrimaryColumn({ type: "varchar", length: 10 })
  maPX!: string;

  @ManyToOne(() => NhanVien, (nv) => nv.maNV, { eager: true })
  @JoinColumn({ name: "maNV" })
  nhanVien!: NhanVien;

  @Column({ type: "date" })
  ngayXuatKho!: Date;

  @Column({ type: "varchar", length: 50 })
  lyDoXuatKho!: string;

  @OneToMany(() => ChiTietPhieuXuat, (ct) => ct.phieuXuat)
  chiTietPhieuXuats!: ChiTietPhieuXuat[];
}

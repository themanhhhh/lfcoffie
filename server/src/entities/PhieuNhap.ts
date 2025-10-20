import { Entity, PrimaryColumn, Column, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { NhanVien } from "./NhanVien";
import { ChiTietPhieuNhap } from "./ChiTietPhieuNhap";

@Entity({ name: "phieunhap" })
export class PhieuNhap {
  @PrimaryColumn({ type: "varchar", length: 10 })
  maPN!: string;

  @ManyToOne(() => NhanVien, (nv) => nv.maNV, { eager: true })
  @JoinColumn({ name: "maNV" })
  nhanVien!: NhanVien;

  @Column({ type: "date" })
  ngayNhapKho!: Date;

  @Column({ type: "varchar", length: 30 })
  nguoiGiao!: string;

  @Column({ type: "varchar", length: 50 })
  tenNCC!: string;

  @OneToMany(() => ChiTietPhieuNhap, (ct) => ct.phieuNhap)
  chiTietPhieuNhaps!: ChiTietPhieuNhap[];
}

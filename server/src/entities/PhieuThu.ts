import { Entity, PrimaryColumn, Column, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { ChiTietPhieuThu } from "./ChiTietPhieuThu";
import { NhanVien } from "./NhanVien";

@Entity({ name: "phieuthu" })
export class PhieuThu {
  @PrimaryColumn({ type: "varchar", length: 10 })
  maPT!: string;

  @ManyToOne(() => NhanVien, (nv) => nv.maNV, { eager: true })
  @JoinColumn({ name: "maNV" })
  nhanVien!: NhanVien;

  @Column({ type: "date" })
  ngay!: Date;

  @OneToMany(() => ChiTietPhieuThu, (ct) => ct.phieuThu)
  chiTietPhieuThus!: ChiTietPhieuThu[];
}

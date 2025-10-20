import { Entity, PrimaryColumn, Column, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { ChiTietPhieuChi } from "./ChiTietPhieuChi";
import { NhanVien } from "./NhanVien";

@Entity({ name: "phieuchi" })
export class PhieuChi {
  @PrimaryColumn({ type: "varchar", length: 10 })
  maPC!: string;

  @ManyToOne(() => NhanVien, (nv) => nv.maNV, { eager: true })
  @JoinColumn({ name: "maNV" })
  nhanVien!: NhanVien;

  @Column({ type: "date" })
  ngay!: Date;

  @OneToMany(() => ChiTietPhieuChi, (ct) => ct.phieuChi)
  chiTietPhieuChis!: ChiTietPhieuChi[];
}

import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { NhanVien } from "./NhanVien";
import { TheBan } from "./TheBan";
import { KhuyenMai } from "./KhuyenMai";
import { ChiTietHoaDon } from "./ChiTietHoaDon";

@Entity({ name: "hoadon" })
export class HoaDon {
  @PrimaryColumn({ type: "varchar", length: 10 })
  maHD!: string;

  @ManyToOne(() => NhanVien, (nv) => nv.hoaDons, { eager: true })
  @JoinColumn({ name: "maNV" })
  nhanVien!: NhanVien;

  @ManyToOne(() => TheBan, (tb) => tb.hoaDons, { nullable: true, eager: true })
  @JoinColumn({ name: "maTheBan" })
  theBan?: TheBan | null;

  @ManyToOne(() => KhuyenMai, (km) => km.hoaDons, { nullable: true, eager: true })
  @JoinColumn({ name: "maKM" })
  khuyenMai?: KhuyenMai | null;

  @Column({ type: "date" })
  ngay!: Date;

  @Column({ type: "varchar", length: 30 })
  phuongThucThanhToan!: string;

  @OneToMany(() => ChiTietHoaDon, (ct) => ct.hoaDon)
  chiTietHoaDons!: ChiTietHoaDon[];
}

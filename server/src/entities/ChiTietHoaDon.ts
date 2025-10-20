import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { HoaDon } from "./HoaDon";
import { Mon } from "./Mon";
import { Size } from "./Size";

@Entity({ name: "chitiethoadon" })
export class ChiTietHoaDon {
  @PrimaryColumn({ type: "varchar", length: 10 })
  maCTHD!: string;

  @ManyToOne(() => HoaDon, (hd) => hd.chiTietHoaDons, { eager: true })
  @JoinColumn({ name: "maHD" })
  hoaDon!: HoaDon;

  @ManyToOne(() => Mon, (m) => m.maMon, { eager: true })
  @JoinColumn({ name: "maMon" })
  mon!: Mon;

  @ManyToOne(() => Size, (s) => s.maSize, { eager: true })
  @JoinColumn({ name: "maSize" })
  size!: Size;

  @Column({ type: "int" })
  soLuong!: number;

  @Column({ type: "int", nullable: true })
  donGia?: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  ghiChu?: string;
}

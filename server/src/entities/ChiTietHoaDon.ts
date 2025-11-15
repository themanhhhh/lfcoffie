import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { DonHang } from "./HoaDon";
import { Mon } from "./Mon";
import { TuyChonDonHang } from "./TuyChonDonHang";

@Entity({ name: "chitietdonhang" })
export class ChiTietDonHang {
  @PrimaryColumn({ type: "varchar", length: 10 })
  MaCTDH!: string;

  @ManyToOne(() => DonHang, (dh) => dh.chiTietDonHangs, { eager: true })
  @JoinColumn({ name: "MaDH" })
  donHang!: DonHang;

  @ManyToOne(() => Mon, (m) => m.chiTietDonHangs, { eager: true })
  @JoinColumn({ name: "MaMon" })
  mon!: Mon;

  @Column({ type: "int" })
  DonGia!: number;

  @Column({ type: "int" })
  SoLuong!: number;

  @OneToMany(() => TuyChonDonHang, (tcdh) => tcdh.chiTietDonHang)
  tuyChonDonHangs!: TuyChonDonHang[];
}

// Export alias for backward compatibility
export { ChiTietDonHang as ChiTietHoaDon };

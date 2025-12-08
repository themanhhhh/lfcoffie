import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { PhienLamViec } from "./PhienLamViec";
import { CTKM } from "./CTKM";
import { ChiTietDonHang } from "./ChiTietHoaDon";

@Entity({ name: "donhang" })
export class DonHang {
  @PrimaryColumn({ type: "varchar", length: 10 })
  MaDonHang!: string;

  @ManyToOne(() => PhienLamViec, (plv) => plv.donHangs, { eager: true })
  @JoinColumn({ name: "MaPhienLamViec" })
  phienLamViec!: PhienLamViec;

  @ManyToOne(() => CTKM, (ctkm) => ctkm.donHangs, { nullable: true, eager: false })
  @JoinColumn({ name: "MaCTKM" })
  ctkm?: CTKM | null;

  @Column({ type: "timestamp" })
  Ngay!: Date;

  @Column({ type: "varchar", length: 50 })
  PhuongThucThanhToan!: string;

  @Column({ type: "varchar", length: 50, default: "tại quán" })
  LoaiDonHang!: string; // "tại quán", "mang đi", "giao hàng"

  @OneToMany(() => ChiTietDonHang, (ctdh) => ctdh.donHang)
  chiTietDonHangs!: ChiTietDonHang[];

  @Column({ type: "boolean", default: false })
  isDelete!: boolean;
}

// Export alias for backward compatibility
export { DonHang as HoaDon };

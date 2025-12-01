import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { DonHang } from "./HoaDon";
import { GiamHoaDon } from "./GiamHoaDon";
import { GiamMon } from "./GiamMon";

@Entity({ name: "ctkm" })
export class CTKM {
  @PrimaryColumn({ type: "varchar", length: 10 })
  MaCTKM!: string;

  @Column({ type: "varchar", length: 100 })
  TenCTKM!: string;

  @Column({ type: "varchar", length: 20 })
  LoaiCTKM!: string; // 'giammon', 'giamhoadon', 'combo'

  @Column({ type: "varchar", length: 20, default: "hoạt động" })
  TrangThai!: string; // 'hoạt động', 'tạm dừng', 'hết hạn'

  @OneToMany(() => DonHang, (dh) => dh.ctkm)
  donHangs!: DonHang[];

  @OneToMany(() => GiamHoaDon, (ghd) => ghd.ctkm)
  giamHoaDons!: GiamHoaDon[];

  @OneToMany(() => GiamMon, (gm) => gm.ctkm)
  giamMons!: GiamMon[];

  @Column({ type: "boolean", default: false })
  isDelete!: boolean;
}


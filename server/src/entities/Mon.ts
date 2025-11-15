import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { ChiTietDonHang } from "./ChiTietHoaDon";
import { DSMonTrongCombo } from "./DSMonTrongCombo";
import { GiamMon } from "./GiamMon";

@Entity({ name: "mon" })
export class Mon {
  @PrimaryColumn({ type: "varchar", length: 10 })
  MaMon!: string;

  @Column({ type: "varchar", length: 50 })
  LoaiMon!: string; // 'cafe', 'trà', 'snacks', 'bánh', etc.

  @Column({ type: "varchar", length: 20 })
  NhomMon!: string; // 'đồ ăn', 'đồ uống', 'combo'

  @Column({ type: "varchar", length: 100 })
  TenMon!: string;

  @Column({ type: "int" })
  DonGia!: number;

  @Column({ type: "varchar", length: 20 })
  DonViTinh!: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  TrangThai?: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  imgUrl?: string | null;

  @OneToMany(() => ChiTietDonHang, (ctdh) => ctdh.mon)
  chiTietDonHangs!: ChiTietDonHang[];

  @OneToMany(() => DSMonTrongCombo, (ds) => ds.mon)
  dsMonTrongCombos!: DSMonTrongCombo[];

  @OneToMany(() => GiamMon, (gm) => gm.mon)
  giamMons!: GiamMon[];
}

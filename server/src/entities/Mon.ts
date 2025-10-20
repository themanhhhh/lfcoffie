import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { LoaiMon } from "./LoaiMon";
import { NhomThucDon } from "./NhomThucDon";

@Entity({ name: "mon" })
export class Mon {
  @PrimaryColumn({ type: "varchar", length: 10 })
  maMon!: string;

  @ManyToOne(() => LoaiMon, (lm) => lm.mons, { eager: true })
  @JoinColumn({ name: "maLoaiMon" })
  loaiMon!: LoaiMon;

  @ManyToOne(() => NhomThucDon, (n) => n.mons, { eager: true })
  @JoinColumn({ name: "maNhomThucDon" })
  nhomThucDon!: NhomThucDon;

  @Column({ type: "varchar", length: 30 })
  tenMon!: string;

  @Column({ type: "int" })
  donGia!: number;

  @Column({ type: "varchar", length: 10 })
  donViTinh!: string;
}

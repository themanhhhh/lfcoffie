import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { TuyChonDonHang } from "./TuyChonDonHang";

@Entity({ name: "tuychon" })
export class TuyChon {
  @PrimaryColumn({ type: "varchar", length: 10 })
  MaTuyChon!: string;

  @Column({ type: "varchar", length: 50 })
  LoaiTuyChon!: string;

  @Column({ type: "varchar", length: 100 })
  TenTuyChon!: string;

  @Column({ type: "int", default: 0 })
  GiaCongThem!: number;

  @OneToMany(() => TuyChonDonHang, (tcdh) => tcdh.tuyChon)
  tuyChonDonHangs!: TuyChonDonHang[];
}


import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { ChiTietDonHang } from "./ChiTietHoaDon";
import { TuyChon } from "./TuyChon";

@Entity({ name: "tuychondonhang" })
export class TuyChonDonHang {
  @PrimaryColumn({ type: "varchar", length: 10 })
  MaTCDH!: string;

  @ManyToOne(() => ChiTietDonHang, (ctdh) => ctdh.tuyChonDonHangs, { eager: true })
  @JoinColumn({ name: "MaCTDH" })
  chiTietDonHang!: ChiTietDonHang;

  @ManyToOne(() => TuyChon, (tc) => tc.tuyChonDonHangs, { eager: true })
  @JoinColumn({ name: "MaTuyChon" })
  tuyChon!: TuyChon;

  @Column({ type: "boolean", default: false })
  isDelete!: boolean;
}


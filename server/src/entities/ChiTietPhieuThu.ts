import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { PhieuThu } from "./PhieuThu";

@Entity({ name: "chitietphieuthu" })
export class ChiTietPhieuThu {
  @PrimaryColumn({ type: "varchar", length: 10 })
  maCTPT!: string;

  @ManyToOne(() => PhieuThu, (pt) => pt.chiTietPhieuThus, { eager: true })
  @JoinColumn({ name: "maPT" })
  phieuThu!: PhieuThu;

  @Column({ type: "varchar", length: 225 })
  nguonThu!: string;

  @Column({ type: "int" })
  soTien!: number;

  @Column({ type: "varchar", length: 20 })
  hinhThuc!: string;
}

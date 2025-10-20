import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { PhieuChi } from "./PhieuChi";

@Entity({ name: "chitietphieuchi" })
export class ChiTietPhieuChi {
  @PrimaryColumn({ type: "varchar", length: 10 })
  maCTPC!: string;

  @ManyToOne(() => PhieuChi, (pc) => pc.chiTietPhieuChis, { eager: true })
  @JoinColumn({ name: "maPC" })
  phieuChi!: PhieuChi;

  @Column({ type: "varchar", length: 50 })
  loaiChiPhi!: string;

  @Column({ type: "varchar", length: 225 })
  tenKhoanChi!: string;

  @Column({ type: "int" })
  soTien!: number;

  @Column({ type: "varchar", length: 20 })
  hinhThuc!: string;
}

import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { PhienLamViec } from "./PhienLamViec";
import { NghiepVu } from "./NghiepVu";

@Entity({ name: "thuchi" })
export class ThuChi {
  @PrimaryColumn({ type: "varchar", length: 10 })
  MaGiaoDich!: string;

  @ManyToOne(() => PhienLamViec, (plv) => plv.thuChis, { eager: true })
  @JoinColumn({ name: "MaPhienLamViec" })
  phienLamViec!: PhienLamViec;

  @ManyToOne(() => NghiepVu, (nv) => nv.thuChis, { eager: true })
  @JoinColumn({ name: "MaNghiepVu" })
  nghiepVu!: NghiepVu;

  @Column({ type: "timestamp" })
  ThoiGian!: Date;

  @Column({ type: "varchar", length: 50 })
  PhuongThucThanhToan!: string;

  @Column({ type: "text", nullable: true })
  GhiChu?: string | null;

  @Column({ type: "int" })
  SoTien!: number;
}


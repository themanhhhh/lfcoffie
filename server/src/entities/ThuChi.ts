import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { PhienLamViec } from "./PhienLamViec";
import { NghiepVu } from "./NghiepVu";

@Entity({ name: "thuchi" })
export class ThuChi {
  @PrimaryColumn({ type: "varchar", length: 10 })
  MaGiaoDich!: string;

  @Column({ type: "varchar", length: 10, nullable: true })
  MaPhienLamViec?: string | null;

  @ManyToOne(() => PhienLamViec, (plv) => plv.thuChis, { eager: true, nullable: true })
  @JoinColumn({ name: "MaPhienLamViec" })
  phienLamViec?: PhienLamViec | null;

  @Column({ type: "varchar", length: 10, nullable: true })
  MaNghiepVu?: string | null;

  @ManyToOne(() => NghiepVu, (nv) => nv.thuChis, { eager: true, nullable: true })
  @JoinColumn({ name: "MaNghiepVu" })
  nghiepVu?: NghiepVu | null;

  @Column({ type: "timestamp" })
  ThoiGian!: Date;

  @Column({ type: "varchar", length: 50 })
  PhuongThucThanhToan!: string;

  @Column({ type: "text", nullable: true })
  GhiChu?: string | null;

  @Column({ type: "int" })
  SoTien!: number;
}


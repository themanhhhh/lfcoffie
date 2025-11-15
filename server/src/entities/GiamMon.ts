import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { CTKM } from "./CTKM";
import { Mon } from "./Mon";

@Entity({ name: "giammon" })
export class GiamMon {
  @PrimaryColumn({ type: "varchar", length: 10 })
  MaGM!: string;

  @ManyToOne(() => CTKM, (ctkm) => ctkm.giamMons, { eager: true })
  @JoinColumn({ name: "MaCTKM" })
  ctkm!: CTKM;

  @ManyToOne(() => Mon, (m) => m.giamMons, { eager: true })
  @JoinColumn({ name: "MaMon" })
  mon!: Mon;

  @Column({ type: "int" })
  SoTienGiam!: number;

  @Column({ type: "varchar", length: 20 })
  LoaiGiam!: string; // '%' hoặc 'VND'

  @Column({ type: "varchar", length: 50, nullable: true })
  ApDungCho?: string | null; // enum

  @Column({ type: "date" })
  NgayBatDau!: Date;

  @Column({ type: "date" })
  NgayKetThuc!: Date;

  @Column({ type: "varchar", length: 20, nullable: true })
  Thu?: string | null; // enum: 'Thứ 2', 'Thứ 3', etc.

  @Column({ type: "time", nullable: true })
  GioBatDau?: string | null;

  @Column({ type: "time", nullable: true })
  GioKetThuc?: string | null;

  @Column({ type: "varchar", length: 20, default: "hoạt động" })
  TrangThai!: string;
}


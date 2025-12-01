import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { CTKM } from "./CTKM";

@Entity({ name: "giamhoadon" })
export class GiamHoaDon {
  @PrimaryColumn({ type: "varchar", length: 10 })
  MaGHD!: string;

  @ManyToOne(() => CTKM, (ctkm) => ctkm.giamHoaDons, { eager: true })
  @JoinColumn({ name: "MaCTKM" })
  ctkm!: CTKM;

  @Column({ type: "int", nullable: true })
  GiaTriTu?: number | null;

  @Column({ type: "int" })
  SoTienGiam!: number;

  @Column({ type: "varchar", length: 20 })
  LoaiGiam!: string; // '%' hoặc 'VND'

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

  @Column({ type: "boolean", default: false })
  isDelete!: boolean;
}


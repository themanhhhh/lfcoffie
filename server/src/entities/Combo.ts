import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { DSMonTrongCombo } from "./DSMonTrongCombo";

@Entity({ name: "combo" })
export class Combo {
  @PrimaryColumn({ type: "varchar", length: 10 })
  MaCombo!: string;

  @OneToMany(() => DSMonTrongCombo, (ds) => ds.combo)
  dsMonTrongCombos!: DSMonTrongCombo[];

  @Column({ type: "varchar", length: 100 })
  TenCombo!: string;

  @Column({ type: "int" })
  GiaCombo!: number;

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


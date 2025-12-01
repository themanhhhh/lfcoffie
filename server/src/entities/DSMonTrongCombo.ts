import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Mon } from "./Mon";
import { Combo } from "./Combo";

@Entity({ name: "dsmontrongcombo" })
export class DSMonTrongCombo {
  @PrimaryColumn({ type: "varchar", length: 10 })
  MaDSMonCombo!: string;

  @ManyToOne(() => Mon, (m) => m.dsMonTrongCombos, { eager: true })
  @JoinColumn({ name: "MaMon" })
  mon!: Mon;

  @Column({ type: "int" })
  SoLuong!: number;

  @Column({ type: "varchar", length: 10, nullable: true })
  MaCombo?: string | null;

  @ManyToOne(() => Combo, (c) => c.dsMonTrongCombos, { nullable: true })
  @JoinColumn({ name: "MaCombo" })
  combo?: Combo | null;

  @Column({ type: "boolean", default: false })
  isDelete!: boolean;
}


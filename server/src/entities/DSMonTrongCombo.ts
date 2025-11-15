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

  @OneToMany(() => Combo, (c) => c.dsMonTrongCombo)
  combos!: Combo[];
}


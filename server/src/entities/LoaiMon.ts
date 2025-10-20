import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { Mon } from "./Mon";

@Entity({ name: "loaimon" })
export class LoaiMon {
  @PrimaryColumn({ type: "varchar", length: 10 })
  maLoaiMon!: string;

  @Column({ type: "varchar", length: 30 })
  tenLoaiMon!: string;

  @OneToMany(() => Mon, (mon) => mon.loaiMon)
  mons!: Mon[];
}

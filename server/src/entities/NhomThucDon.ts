import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { Mon } from "./Mon";

@Entity({ name: "nhomthucdon" })
export class NhomThucDon {
  @PrimaryColumn({ type: "varchar", length: 10 })
  maNhomThucDon!: string;

  @Column({ type: "varchar", length: 30 })
  tenNhomThucDon!: string;

  @OneToMany(() => Mon, (mon) => mon.nhomThucDon)
  mons!: Mon[];
}

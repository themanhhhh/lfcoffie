import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { HoaDon } from "./HoaDon";

@Entity({ name: "theban" })
export class TheBan {
  @PrimaryColumn({ type: "varchar", length: 10 })
  maTheBan!: string;

  @Column({ type: "varchar", length: 30 })
  tenTheBan!: string;

  @Column({ type: "boolean" })
  trangThai!: boolean;

  @OneToMany(() => HoaDon, (hd) => hd.theBan)
  hoaDons!: HoaDon[];
}

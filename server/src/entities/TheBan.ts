import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "theban" })
export class TheBan {
  @PrimaryColumn({ type: "varchar", length: 10 })
  MaTheBan!: string;

  @Column({ type: "varchar", length: 50 })
  TenTheBan!: string;

  @Column({ type: "varchar", length: 20 })
  TrangThai!: string;
}

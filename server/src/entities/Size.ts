import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "size" })
export class Size {
  @PrimaryColumn({ type: "varchar", length: 10 })
  maSize!: string;

  @Column({ type: "varchar", length: 10 })
  tenSize!: string;

  @Column({ type: "int" })
  giaCongThem!: number;
}

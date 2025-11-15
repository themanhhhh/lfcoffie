import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { ThuChi } from "./ThuChi";

@Entity({ name: "nghiepvu" })
export class NghiepVu {
  @PrimaryColumn({ type: "varchar", length: 10 })
  MaNghiepVu!: string;

  @Column({ type: "varchar", length: 10 })
  LoaiGiaoDich!: string; // 'thu' hoặc 'chi'

  @Column({ type: "varchar", length: 100 })
  TenNghiepVu!: string;

  @OneToMany(() => ThuChi, (tc) => tc.nghiepVu)
  thuChis!: ThuChi[];
}


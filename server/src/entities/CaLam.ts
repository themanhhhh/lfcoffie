import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { NhanVien } from "./NhanVien";
import { PhienLamViec } from "./PhienLamViec";

@Entity({ name: "calam" })
export class CaLam {
  @PrimaryColumn({ type: "varchar", length: 10 })
  MaCaLam!: string;

  @Column({ type: "varchar", length: 50 })
  TenCaLam!: string;

  @Column({ type: "time" })
  ThoiGianBatDau!: string;

  @Column({ type: "time" })
  ThoiGianKetThuc!: string;

  @OneToMany(() => NhanVien, (nv) => nv.caLam)
  nhanViens!: NhanVien[];

  @OneToMany(() => PhienLamViec, (plv) => plv.caLam)
  phienLamViecs!: PhienLamViec[];

  @Column({ type: "boolean", default: false })
  isDelete!: boolean;
}


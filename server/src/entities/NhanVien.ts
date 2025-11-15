import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { CaLam } from "./CaLam";
import { PhienLamViec } from "./PhienLamViec";

@Entity({ name: "nhanvien" })
export class NhanVien {
  @PrimaryColumn({ type: "varchar", length: 10 })
  MaNhanVien!: string;

  @ManyToOne(() => CaLam, (cl) => cl.nhanViens, { eager: true })
  @JoinColumn({ name: "MaCaLam" })
  caLam!: CaLam;

  @Column({ type: "varchar", length: 50 })
  TenNhanVien!: string;

  @Column({ type: "varchar", length: 15, nullable: true })
  SoDienThoai?: string | null;

  @Column({ type: "varchar", length: 30 })
  ChucVu!: string;

  @Column({ type: "varchar", length: 10 })
  GioiTinh!: string;

  @Column({ type: "date" })
  NgaySinh!: Date;

  @Column({ type: "varchar", length: 50, unique: true })
  TaiKhoan!: string;

  @Column({ type: "varchar", length: 100 })
  MatKhau!: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  TrangThai?: string | null;

  @OneToMany(() => PhienLamViec, (plv) => plv.nhanVien)
  phienLamViecs!: PhienLamViec[];
}

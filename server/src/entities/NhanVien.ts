import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { HoaDon } from "./HoaDon";

@Entity({ name: "nhanvien" })
export class NhanVien {
  @PrimaryColumn({ type: "varchar", length: 10 })
  maNV!: string;

  @Column({ type: "varchar", length: 30 })
  tenNV!: string;

  @Column({ type: "varchar", length: 30 })
  chucVu!: string;

  @Column({ type: "varchar", length: 5 })
  gioiTinh!: string;

  @Column({ type: "date" })
  ngaySinh!: Date;

  @Column({ type: "varchar", length: 30 })
  caLam!: string;

  @Column({ type: "varchar", length: 50, unique: true })
  taiKhoan!: string;

  @Column({ type: "varchar", length: 100 })
  matKhau!: string;

  @Column({ type: "varchar", length: 15, nullable: true })
  soDienThoai?: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  email?: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  diaChi?: string | null;

  @Column({ type: "varchar", length: 20, nullable: true })
  trangThai?: string | null;

  @OneToMany(() => HoaDon, (hoaDon) => hoaDon.nhanVien)
  hoaDons!: HoaDon[];
}

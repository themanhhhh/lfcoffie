import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { CaLam } from "./CaLam";
import { NhanVien } from "./NhanVien";
import { DonHang } from "./HoaDon";
import { ThuChi } from "./ThuChi";

@Entity({ name: "phienlamviec" })
export class PhienLamViec {
  @PrimaryColumn({ type: "varchar", length: 10 })
  MaPhienLamViec!: string;

  @ManyToOne(() => CaLam, (cl) => cl.phienLamViecs, { eager: true })
  @JoinColumn({ name: "MaCaLam" })
  caLam!: CaLam;

  @ManyToOne(() => NhanVien, (nv) => nv.phienLamViecs, { eager: true })
  @JoinColumn({ name: "MaNhanVien" })
  nhanVien!: NhanVien;

  @Column({ type: "date" })
  Ngay!: Date;

  @Column({ type: "time", nullable: true })
  ThoiGianMo?: string | null;

  @Column({ type: "time", nullable: true })
  ThoiGianDong?: string | null;

  @Column({ type: "varchar", length: 20, default: "mở" })
  TrangThai!: string; // 'mở' hoặc 'đóng'

  @OneToMany(() => DonHang, (dh) => dh.phienLamViec)
  donHangs!: DonHang[];

  @OneToMany(() => ThuChi, (tc) => tc.phienLamViec)
  thuChis!: ThuChi[];
}


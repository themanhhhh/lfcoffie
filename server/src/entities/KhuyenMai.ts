import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { HoaDon } from "./HoaDon";

@Entity({ name: "khuyenmai" })
export class KhuyenMai {
  @PrimaryColumn({ type: "varchar", length: 10 })
  maKM!: string;

  @Column({ type: "varchar", length: 255 })
  tenKM!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  loaiKM?: string; // 'percentage', 'fixed', 'free_item'

  @Column({ type: "float", nullable: true })
  giaTriGiam?: number; // Giá trị giảm (% hoặc số tiền)

  @Column({ type: "int", nullable: true })
  soTienToiThieu?: number; // Số tiền tối thiểu để áp dụng

  @Column({ type: "int", nullable: true })
  giamToiDa?: number; // Giảm tối đa (với phần trăm)

  @Column({ type: "int", nullable: true })
  soLuongSuDung?: number; // Giới hạn số lần sử dụng

  @Column({ type: "varchar", length: 500, nullable: true })
  moTa?: string;

  @Column({ type: "timestamp" })
  ngayBatDau!: Date;

  @Column({ type: "timestamp" })
  ngayKetThuc!: Date;

  @OneToMany(() => HoaDon, (hd) => hd.khuyenMai)
  hoaDons!: HoaDon[];
}

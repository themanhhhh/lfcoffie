import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { PhieuNhap } from "./PhieuNhap";
import { NguyenLieu } from "./NguyenLieu";

@Entity({ name: "chitietphieunhap" })
export class ChiTietPhieuNhap {
  @PrimaryColumn({ type: "varchar", length: 10 })
  maCTPN!: string;

  @ManyToOne(() => PhieuNhap, (pn) => pn.chiTietPhieuNhaps, { eager: true })
  @JoinColumn({ name: "maPN" })
  phieuNhap!: PhieuNhap;

  @ManyToOne(() => NguyenLieu, (nl) => nl.chiTietPhieuNhaps, { eager: true })
  @JoinColumn({ name: "maNL" })
  nguyenLieu!: NguyenLieu;

  @Column({ type: "int" })
  soLuong!: number;

  @Column({ type: "date" })
  hanSuDung!: Date;

  @Column({ type: "int" })
  donGia!: number;
}

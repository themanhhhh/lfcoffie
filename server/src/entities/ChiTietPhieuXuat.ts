import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { PhieuXuat } from "./PhieuXuat";
import { NguyenLieu } from "./NguyenLieu";

@Entity({ name: "chitietphieuxuat" })
export class ChiTietPhieuXuat {
  @PrimaryColumn({ type: "varchar", length: 10 })
  maCTPX!: string;

  @ManyToOne(() => PhieuXuat, (px) => px.chiTietPhieuXuats, { eager: true })
  @JoinColumn({ name: "maPX" })
  phieuXuat!: PhieuXuat;

  @ManyToOne(() => NguyenLieu, (nl) => nl.chiTietPhieuXuats, { eager: true })
  @JoinColumn({ name: "maNL" })
  nguyenLieu!: NguyenLieu;

  @Column({ type: "int" })
  soLuong!: number;
}

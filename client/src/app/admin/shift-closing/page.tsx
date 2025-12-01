'use client'
import React, { useState, useEffect } from 'react'
import {
  FaPrint,
  FaFileAlt,
  FaMoneyBillWave,
  FaChartLine,
  FaTags,
  FaBox,
  FaReceipt,
  FaFileExcel
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { phienLamViecApi, thongKeApi, ShiftClosingReport, ApiError } from '../../../lib/api'
import { exportShiftClosingReport } from '../../../utils/excelExport'
import styles from './shiftClosing.module.css'

const formatPrice = (price: number) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' đ'
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const ShiftClosingPage = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<ShiftClosingReport | null>(null)
  const [selectedPhienLamViec, setSelectedPhienLamViec] = useState<string>('')
  const [availablePhienLamViec, setAvailablePhienLamViec] = useState<Array<{
    MaPhienLamViec: string
    Ngay: string
    ThoiGianMo?: string
    ThoiGianDong?: string
    TrangThai: string
    nhanVien?: {
      TenNhanVien: string
    }
  }>>([])

  useEffect(() => {
    loadAvailablePhienLamViec()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selectedPhienLamViec) {
      loadReport(selectedPhienLamViec)
    }
  }, [selectedPhienLamViec])

  const loadAvailablePhienLamViec = async () => {
    try {
      const list = await phienLamViecApi.getAll()
      // Lọc các phiên đã đóng hoặc đang mở, sắp xếp theo ngày mới nhất
      const filtered = list
        .filter(plv => plv.TrangThai === 'đóng' || plv.TrangThai === 'mở')
        .sort((a, b) => {
          const dateA = new Date(a.Ngay).getTime()
          const dateB = new Date(b.Ngay).getTime()
          return dateB - dateA
        })
        .map(plv => ({
          MaPhienLamViec: plv.MaPhienLamViec,
          Ngay: plv.Ngay,
          ThoiGianMo: plv.ThoiGianMo,
          ThoiGianDong: plv.ThoiGianDong,
          TrangThai: plv.TrangThai,
          nhanVien: plv.nhanVien ? { TenNhanVien: plv.nhanVien.TenNhanVien } : undefined
        }))
      setAvailablePhienLamViec(filtered)
      
      // Tự động chọn phiên mới nhất nếu có
      if (filtered.length > 0 && !selectedPhienLamViec) {
        setSelectedPhienLamViec(filtered[0].MaPhienLamViec)
      }
    } catch (err) {
      console.error('Error loading phien lam viec:', err)
      toast.error('Không thể tải danh sách phiên làm việc')
    }
  }

  const loadReport = async (maPhienLamViec: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await thongKeApi.getShiftClosingReport(maPhienLamViec)
      setReport(data)
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Không thể tải báo cáo'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExportExcel = () => {
    if (!report) {
      toast.error('Không có dữ liệu để xuất Excel')
      return
    }
    try {
      const fileName = `Bao_cao_chot_ca_${report.phienLamViec.MaPhienLamViec}_${new Date().toISOString().split('T')[0]}.xlsx`
      exportShiftClosingReport(report, fileName)
      toast.success('Xuất Excel thành công!')
    } catch (err) {
      toast.error('Lỗi khi xuất Excel: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  if (loading && !report) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Đang tải báo cáo...</div>
      </div>
    )
  }

  if (error && !report) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Không có dữ liệu báo cáo</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <h1>
            <FaFileAlt /> Báo cáo chốt ca
          </h1>
          <p>Xem báo cáo chi tiết của các phiên làm việc</p>
        </div>
        <div className={styles.headerActions}>
          <select
            className={styles.selector}
            value={selectedPhienLamViec}
            onChange={(e) => setSelectedPhienLamViec(e.target.value)}
          >
            <option value="">-- Chọn phiên làm việc --</option>
            {availablePhienLamViec.map((plv) => (
              <option key={plv.MaPhienLamViec} value={plv.MaPhienLamViec}>
                {plv.MaPhienLamViec} - {formatDateTime(plv.Ngay)} 
                {plv.nhanVien ? ` - ${plv.nhanVien.TenNhanVien}` : ''}
                {plv.TrangThai === 'mở' ? ' (Đang mở)' : ' (Đã đóng)'}
              </option>
            ))}
          </select>
          <button className={styles.printBtn} onClick={handlePrint} disabled={!report}>
            <FaPrint /> In báo cáo
          </button>
          <button className={styles.excelBtn} onClick={handleExportExcel} disabled={!report}>
            <FaFileExcel /> Xuất Excel
          </button>
        </div>
      </div>

      <div id="shift-closing-report" className={styles.reportContent}>
        {/* Thông tin phiên làm việc */}
        <div className={styles.section}>
          <h2>Thông tin phiên làm việc</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span>Mã PLV:</span>
              <strong>{report.phienLamViec.MaPhienLamViec}</strong>
            </div>
            <div className={styles.infoItem}>
              <span>Mở ca:</span>
              <strong>
                {report.phienLamViec.ThoiGianMo 
                  ? formatDateTime(report.phienLamViec.ThoiGianMo)
                  : 'Chưa có'}
              </strong>
            </div>
            <div className={styles.infoItem}>
              <span>Đóng ca:</span>
              <strong>
                {report.phienLamViec.ThoiGianDong 
                  ? formatDateTime(report.phienLamViec.ThoiGianDong)
                  : 'Chưa đóng'}
              </strong>
            </div>
            <div className={styles.infoItem}>
              <span>Giờ in:</span>
              <strong>{report.tongKet.gioIn ? formatDateTime(report.tongKet.gioIn) : formatDateTime(new Date().toISOString())}</strong>
            </div>
            <div className={styles.infoItem}>
              <span>Thu ngân:</span>
              <strong>{report.phienLamViec.nhanVien?.TenNhanVien || 'Chưa xác định'}</strong>
            </div>
          </div>
        </div>

        {/* Tổng kết */}
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <FaMoneyBillWave />
            <div>
              <span>Số dư đầu</span>
              <strong>{formatPrice(report.tongKet.soDuDau || 0)}</strong>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <FaChartLine />
            <div>
              <span>Doanh thu</span>
              <strong>{formatPrice(report.tongKet.totalRevenue)}</strong>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <FaTags />
            <div>
              <span>Tổng giảm giá món</span>
              <strong>{formatPrice(report.tongKet.totalGiamGiaMon || 0)}</strong>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <FaTags />
            <div>
              <span>Tổng chiết khấu</span>
              <strong>{formatPrice(report.tongKet.totalChietKhau || 0)}</strong>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <FaBox />
            <div>
              <span>Tổng thu/chi</span>
              <strong>{formatPrice((report.tongKet.totalThu || 0) + (report.tongKet.totalChi || 0))}</strong>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <FaMoneyBillWave />
            <div>
              <span>Tiền trong két</span>
              <strong>{formatPrice(report.tongKet.tienTrongKet || 0)}</strong>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <FaReceipt />
            <div>
              <span>Số hóa đơn</span>
              <strong>{report.tongKet.orderCount}</strong>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <FaChartLine />
            <div>
              <span>Trung bình hóa đơn</span>
              <strong>{formatPrice(report.tongKet.averageOrder || 0)}</strong>
            </div>
          </div>
        </div>

        {/* Món và nhóm món */}
        {report.monByNhom && Object.keys(report.monByNhom).length > 0 && (
          <div className={styles.section}>
            <h2>Món và nhóm món</h2>
            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th>Nhóm món</th>
                    <th>Số lượng</th>
                    <th>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(report.monByNhom).map(([nhom, data]) => (
                    <tr key={nhom}>
                      <td>{data.ten}</td>
                      <td>{data.soLuong}</td>
                      <td>{formatPrice(data.doanhThu)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CTKM */}
        {report.ctkmStats && Object.keys(report.ctkmStats).length > 0 && (
          <div className={styles.section}>
            <h2>Chương trình khuyến mãi</h2>
            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th>Tên CTKM</th>
                    <th>Số hóa đơn</th>
                    <th>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(report.ctkmStats).map(([maCTKM, data]) => (
                    <tr key={maCTKM}>
                      <td>{data.ten}</td>
                      <td>{data.soHoaDon}</td>
                      <td>{formatPrice(data.doanhThu)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Phương thức thanh toán */}
        {report.paymentMethods && Object.keys(report.paymentMethods).length > 0 && (
          <div className={styles.section}>
            <h2>Phương thức thanh toán</h2>
            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th>Phương thức</th>
                    <th>Số hóa đơn</th>
                    <th>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(report.paymentMethods).map(([method, data]) => (
                    <tr key={method}>
                      <td>{method}</td>
                      <td>{data.soHoaDon}</td>
                      <td>{formatPrice(data.doanhThu)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShiftClosingPage


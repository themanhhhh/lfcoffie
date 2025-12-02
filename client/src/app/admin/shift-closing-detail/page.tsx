'use client'
import React, { useState, useEffect } from 'react'
import {
  FaPrint,
  FaFileAlt,
  FaMoneyBillWave,
  FaChartLine,
  FaTags,
  FaCreditCard,
  FaBox,
  FaCalendarAlt,
  FaUser,
  FaFileExcel
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { phienLamViecApi, thongKeApi, ShiftClosingReport, ApiError } from '../../../lib/api'
import { exportShiftClosingReport } from '../../../utils/excelExport'
import { buildPrintableHtml } from './PrintableReport'
import styles from '../shift-closing/shiftClosing.module.css'

const formatPrice = (price: number) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' đ'
}

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const ShiftClosingDetailPage = () => {
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
      const filtered = list
        .filter(plv => plv.TrangThai === 'đóng' || plv.TrangThai === 'mở')
        .sort((a, b) => {
          const dateA = new Date(a.Ngay).getTime()
          const dateB = new Date(b.Ngay).getTime()
          return dateB - dateA
        })
      setAvailablePhienLamViec(filtered)

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
    if (!report) {
      toast.error('Không có dữ liệu để in')
      return
    }

    try {
      const html = buildPrintableHtml(report)
      const printWindow = window.open('', '_blank', 'width=900,height=800')
      if (!printWindow) {
        toast.error('Không thể mở cửa sổ in')
        return
      }
      printWindow.document.open()
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.focus()
      // Try to print after load; fallback to a small timeout
      printWindow.onload = () => {
        try { printWindow.print() } catch (e) { /* ignore */ }
      }
      // Auto-close after printing (use onafterprint when available)
      try {
        // Some browsers support onafterprint on the window
        (printWindow as any).onafterprint = () => {
          try { printWindow.close() } catch (e) { /* ignore */ }
        }
      } catch (e) { /* ignore */ }

      // Fallback: close after a short delay to ensure print dialog had time
      setTimeout(() => {
        try { printWindow.close() } catch (e) { /* ignore */ }
      }, 3000)
    } catch (err) {
      toast.error('Lỗi khi mở trang in: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
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

  return (
    <div className={styles.container}>
      {/* Breadcrumb + title giống trang kết quả kinh doanh */}
      <div className={styles.breadcrumb}>
        <span>Báo cáo</span>
        <span> &gt; </span>
        <span>Chốt ca</span>
      </div>

      <h1 className={styles.title}>BÁO CÁO CHỐT CA</h1>

      {/* Thanh chọn phiên + nút hành động dạng filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>
            Ca làm / phiên:
            <select
              className={styles.selector}
              value={selectedPhienLamViec}
              onChange={(e) => setSelectedPhienLamViec(e.target.value)}
            >
              <option value="">-- Chọn phiên làm việc --</option>
              {availablePhienLamViec.map((plv) => (
                <option key={plv.MaPhienLamViec} value={plv.MaPhienLamViec}>
                  {plv.MaPhienLamViec} - {formatDateTime(plv.ThoiGianMo)} ({plv.TrangThai})
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className={styles.actionButtons}>
          <button className={styles.generateButton} onClick={() => selectedPhienLamViec && loadReport(selectedPhienLamViec)} disabled={!selectedPhienLamViec}>
            Tải lại báo cáo
          </button>
          <button className={styles.exportButton} onClick={handleExportExcel} disabled={!report}>
            <FaFileExcel /> Xuất Excel
          </button>
          <button className={styles.exportButton} onClick={handlePrint} disabled={!report}>
            <FaPrint /> In báo cáo
          </button>
        </div>
      </div>

      {loading && !report && (
        <div className={styles.loading}>Đang tải báo cáo...</div>
      )}

      {error && !report && (
        <div className={styles.error}>{error}</div>
      )}

      {!report && !loading && !error && (
        <div className={styles.emptyState}>
          <p>Vui lòng chọn phiên làm việc để xem báo cáo chốt ca</p>
        </div>
      )}

      {report && (
      <div id="invoice-print" className={styles.reportContent}>
        
        {/* Thông tin phiên làm việc */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FaCalendarAlt /> Thông tin phiên làm việc
          </h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Mã PLV:</span>
              <span className={styles.infoValue}>{report.phienLamViec.MaPhienLamViec}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Ngày:</span>
              <span className={styles.infoValue}>
                {new Date(report.phienLamViec.Ngay).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Mở ca:</span>
              <span className={styles.infoValue}>
                {formatDateTime(report.phienLamViec.ThoiGianMo)}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Đóng ca:</span>
              <span className={styles.infoValue}>
                {formatDateTime(report.phienLamViec.ThoiGianDong) || 'Chưa đóng'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Giờ in:</span>
              <span className={styles.infoValue}>
                {formatDateTime(report.tongKet.gioIn)}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Thu ngân:</span>
              <span className={styles.infoValue}>
                <FaUser /> {report.phienLamViec.nhanVien?.TenNhanVien || 'N/A'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Ca làm việc:</span>
              <span className={styles.infoValue}>
                {report.phienLamViec.caLam?.TenCaLam || 'N/A'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Trạng thái:</span>
              <span className={styles.infoValue}>
                <span className={styles.statusBadge}>
                  {report.phienLamViec.TrangThai}
                </span>
              </span>
            </div>
          </div>
        </section>

        {/* Tổng kết */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FaChartLine /> Tổng kết
          </h2>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <FaMoneyBillWave />
              </div>
              <div className={styles.summaryContent}>
                <span>Số dư đầu</span>
                <strong>{formatPrice(report.tongKet.soDuDau)}</strong>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <FaChartLine />
              </div>
              <div className={styles.summaryContent}>
                <span>Doanh thu</span>
                <strong>{formatPrice(report.tongKet.totalRevenue)}</strong>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <FaTags />
              </div>
              <div className={styles.summaryContent}>
                <span>Tổng giảm giá món</span>
                <strong>{formatPrice(report.tongKet.totalGiamGiaMon)}</strong>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <FaTags />
              </div>
              <div className={styles.summaryContent}>
                <span>Tổng chiết khấu</span>
                <strong>{formatPrice(report.tongKet.totalChietKhau)}</strong>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <FaMoneyBillWave />
              </div>
              <div className={styles.summaryContent}>
                <span>Tổng thu</span>
                <strong>{formatPrice(report.tongKet.totalThu)}</strong>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <FaMoneyBillWave />
              </div>
              <div className={styles.summaryContent}>
                <span>Tổng chi</span>
                <strong>{formatPrice(report.tongKet.totalChi)}</strong>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <FaMoneyBillWave />
              </div>
              <div className={styles.summaryContent}>
                <span>Tiền trong két</span>
                <strong>{formatPrice(report.tongKet.tienTrongKet)}</strong>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <FaFileAlt />
              </div>
              <div className={styles.summaryContent}>
                <span>Số hóa đơn</span>
                <strong>{report.tongKet.orderCount}</strong>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <FaChartLine />
              </div>
              <div className={styles.summaryContent}>
                <span>Trung bình hóa đơn</span>
                <strong>{formatPrice(report.tongKet.averageOrder)}</strong>
              </div>
            </div>
          </div>
        </section>

        {/* Món và nhóm món */}
        {report.monByNhom && report.monByNhom.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <FaBox /> Món và nhóm món
            </h2>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Tên nhóm</th>
                    <th>Số lượng</th>
                    <th>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {report.monByNhom.map((item, index) => (
                    <tr key={index}>
                      <td>{item.ten}</td>
                      <td>{item.soLuong}</td>
                      <td>{formatPrice(item.doanhThu)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* CTKM */}
        {report.ctkmStats && report.ctkmStats.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <FaTags /> CTKM
            </h2>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Tên CTKM</th>
                    <th>Số hóa đơn</th>
                    <th>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {report.ctkmStats.map((item, index) => (
                    <tr key={index}>
                      <td>{item.ten}</td>
                      <td>{item.soHoaDon}</td>
                      <td>{formatPrice(item.doanhThu)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Phương thức thanh toán */}
        {report.paymentMethods && report.paymentMethods.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <FaCreditCard /> Phương thức thanh toán
            </h2>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Phương thức</th>
                    <th>Số hóa đơn</th>
                    <th>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {report.paymentMethods.map((item, index) => (
                    <tr key={index}>
                      <td>{item.phuongThuc}</td>
                      <td>{item.soHoaDon}</td>
                      <td>{formatPrice(item.doanhThu)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
      )}
    </div>
  )
}

export default ShiftClosingDetailPage




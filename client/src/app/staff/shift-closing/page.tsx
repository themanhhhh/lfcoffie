'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FaArrowLeft,
  FaPrint,
  FaFileAlt,
  FaMoneyBillWave,
  FaChartLine,
  FaTags,
  FaCreditCard,
  FaBox,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaFileExcel
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../../contexts/AuthContext'
import { phienLamViecApi, thongKeApi, ShiftClosingReport, ApiError } from '../../../lib/api'
import { buildPrintableHtml } from '../../admin/shift-closing-detail/PrintableReport'
import { exportShiftClosingReport } from '../../../utils/excelExport'
import styles from './shiftClosing.module.css'

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

const ShiftClosingPage = () => {
  const { user } = useAuth()
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

  const isManager = !!user?.ChucVu && /quản|admin|giám/i.test(user.ChucVu)

  useEffect(() => {
    loadAvailablePhienLamViec()
  }, [user])

  useEffect(() => {
    if (selectedPhienLamViec) {
      loadReport(selectedPhienLamViec)
    }
  }, [selectedPhienLamViec])

  const loadAvailablePhienLamViec = async () => {
    try {
      const list = await phienLamViecApi.getAll()
      // Lọc các phiên đã đóng hoặc đang mở
      const filtered = list
        .filter(plv => plv.TrangThai === 'đóng' || plv.TrangThai === 'mở')
        .sort((a, b) => {
          const dateA = new Date(a.Ngay).getTime()
          const dateB = new Date(b.Ngay).getTime()
          return dateB - dateA
        })
      // For non-manager roles, only allow viewing the current user's open shift (no filter)
      let finalList = filtered
      if (!isManager) {
        finalList = filtered.filter(plv => (
          (plv.nhanVien && plv.nhanVien.MaNhanVien === user?.MaNhanVien) && plv.TrangThai === 'mở'
        ))
      }
      setAvailablePhienLamViec(finalList)
      
      // Tự động chọn phiên mới nhất nếu có
      if (finalList.length > 0 && !selectedPhienLamViec) {
        setSelectedPhienLamViec(finalList[0].MaPhienLamViec)
      } else if (finalList.length === 0) {
        // Không có phiên nào, tắt loading
        setLoading(false)
      }
    } catch (err) {
      console.error('Error loading phien lam viec:', err)
      toast.error('Không thể tải danh sách phiên làm việc')
      setLoading(false)
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
        toast.error('Không thể mở cửa sổ in (có thể do popup blocker)')
        return
      }
      printWindow.document.open()
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.focus()
      printWindow.onload = () => {
        try { printWindow.print() } catch (e) { /* ignore */ }
      }
      try {
        (printWindow as any).onafterprint = () => {
          try { printWindow.close() } catch (e) { /* ignore */ }
        }
      } catch (e) { /* ignore */ }
      setTimeout(() => {
        try { printWindow.close() } catch (e) { /* ignore */ }
      }, 3000)
    } catch (err) {
      toast.error('Lỗi khi in báo cáo: ' + (err instanceof Error ? err.message : 'Unknown error'))
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
        <Link href="/staff" className={styles.backLink}>
          <FaArrowLeft /> Quay lại
        </Link>
      </div>
    )
  }

  if (!report) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerMain}>
            <Link href="/staff" className={styles.backLink}>
              <FaArrowLeft /> Quay lại
            </Link>
            <h1>
              <FaFileAlt /> Báo cáo chốt ca
            </h1>
          </div>
        </div>
        <div className={styles.emptyState}>
          <FaFileAlt style={{ fontSize: '3rem', color: '#ccc', marginBottom: '1rem' }} />
          <h3>Không có phiên làm việc</h3>
          <p>{isManager 
            ? 'Vui lòng chọn phiên làm việc để xem báo cáo' 
            : 'Bạn chưa có phiên làm việc đang mở. Vui lòng mở ca trước.'}</p>
          {!isManager && (
            <Link href="/staff/open-shift" style={{ 
              marginTop: '1rem', 
              padding: '0.75rem 1.5rem', 
              background: '#8B4513', 
              color: 'white', 
              borderRadius: '8px',
              textDecoration: 'none',
              display: 'inline-block'
            }}>
              Mở phiên làm việc
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <Link href="/staff" className={styles.backLink}>
            <FaArrowLeft /> Quay lại
          </Link>
          <h1>
            <FaFileAlt /> Báo cáo chốt ca
          </h1>
        </div>
        <div className={styles.headerActions}>
          {isManager ? (
            <select
              className={styles.selectPhien}
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
          ) : (
            <div style={{ minWidth: '260px' }}>
              {selectedPhienLamViec ? (
                <div className={styles.currentPhienInfo}>
                  <strong>Phiên hiện tại:</strong>&nbsp;{selectedPhienLamViec}
                </div>
              ) : (
                <div className={styles.currentPhienInfo}>
                  <strong>Phiên hiện tại:</strong>&nbsp;Không có phiên đang mở
                </div>
              )}
            </div>
          )}

          <button className={styles.printBtn} onClick={handlePrint}>
            <FaPrint /> In báo cáo
          </button>
        </div>
      </div>

      <div className={styles.reportContent}>
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
              <div className={styles.summaryIcon} style={{ background: '#dc3545' }}>
                <FaTags />
              </div>
              <div className={styles.summaryContent}>
                <span>Tổng giảm giá món</span>
                <strong>{formatPrice(report.tongKet.totalGiamGiaMon)}</strong>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon} style={{ background: '#dc3545' }}>
                <FaTags />
              </div>
              <div className={styles.summaryContent}>
                <span>Tổng chiết khấu</span>
                <strong>{formatPrice(report.tongKet.totalChietKhau)}</strong>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon} style={{ background: '#28a745' }}>
                <FaMoneyBillWave />
              </div>
              <div className={styles.summaryContent}>
                <span>Tổng thu</span>
                <strong>{formatPrice(report.tongKet.totalThu)}</strong>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon} style={{ background: '#ffc107' }}>
                <FaMoneyBillWave />
              </div>
              <div className={styles.summaryContent}>
                <span>Tổng chi</span>
                <strong>{formatPrice(report.tongKet.totalChi)}</strong>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon} style={{ background: '#17a2b8' }}>
                <FaMoneyBillWave />
              </div>
              <div className={styles.summaryContent}>
                <span>Tiền trong két</span>
                <strong>{formatPrice(report.tongKet.tienTrongKet)}</strong>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon} style={{ background: '#6c757d' }}>
                <FaFileAlt />
              </div>
              <div className={styles.summaryContent}>
                <span>Số hóa đơn</span>
                <strong>{report.tongKet.orderCount}</strong>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon} style={{ background: '#6c757d' }}>
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
    </div>
  )
}

export default ShiftClosingPage


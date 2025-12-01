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
  FaFileExcel,
  FaCalendarAlt
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { phienLamViecApi, thongKeApi, ShiftClosingReport, BusinessReport, ApiError } from '../../../lib/api'
import { exportShiftClosingReport } from '../../../utils/excelExport'
import styles from './shiftClosing.module.css'
import * as XLSX from 'xlsx'

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
  const [businessReport, setBusinessReport] = useState<BusinessReport | null>(null)
  const [selectedPhienLamViec, setSelectedPhienLamViec] = useState<string>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loadingBusinessReport, setLoadingBusinessReport] = useState(false)
  const [availablePhienLamViec, setAvailablePhienLamViec] = useState<Array<{
    MaPhienLamViec: string
    Ngay: string
    ThoiGianMo?: string
    ThoiGianDong?: string
    TrangThai: string
    nhanVien?: {
      TenNhanVien: string
    }
    caLam?: {
      TenCaLam: string
    }
  }>>([])

  useEffect(() => {
    loadAvailablePhienLamViec()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selectedPhienLamViec) {
      loadReport(selectedPhienLamViec)
      // Set dates from phien lam viec
      const plv = availablePhienLamViec.find(p => p.MaPhienLamViec === selectedPhienLamViec)
      if (plv) {
        const ngay = new Date(plv.Ngay)
        setStartDate(ngay.toISOString().split('T')[0])
        setEndDate(ngay.toISOString().split('T')[0])
      }
    }
  }, [selectedPhienLamViec, availablePhienLamViec])

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

  const handleGenerateBusinessReport = async () => {
    if (!startDate || !endDate) {
      toast.error('Vui lòng chọn từ ngày và đến ngày')
      return
    }

    setLoadingBusinessReport(true)
    try {
      const params: { startDate: string; endDate: string; maPhienLamViec?: string } = {
        startDate,
        endDate
      }
      if (selectedPhienLamViec) {
        params.maPhienLamViec = selectedPhienLamViec
      }
      const data = await thongKeApi.getBusinessReport(params)
      setBusinessReport(data)
      toast.success('Tạo báo cáo thành công!')
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Không thể tải báo cáo'
      toast.error(errorMessage)
    } finally {
      setLoadingBusinessReport(false)
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

  const handleExportBusinessReportExcel = () => {
    if (!businessReport) {
      toast.error('Vui lòng tạo báo cáo trước')
      return
    }

    try {
      const wsData: any[][] = [
        ['BÁO CÁO KẾT QUẢ KINH DOANH'],
        [],
        ['Từ ngày:', startDate],
        ['Đến ngày:', endDate],
        selectedPhienLamViec ? ['Ca làm:', availablePhienLamViec.find(p => p.MaPhienLamViec === selectedPhienLamViec)?.caLam?.TenCaLam || ''] : [],
        [],
        ['STT', 'Khoản mục', 'Giá trị (VND)'],
      ]

      // Doanh thu
      wsData.push(['I.', 'Doanh thu (1+2)', ''])
      wsData.push(['', '1. Doanh thu bán hàng', businessReport.doanhThu.banHang])
      wsData.push(['', '2. Doanh thu khác (dịch vụ, bán đồ lưu niệm, phụ thu,...)', businessReport.doanhThu.khac])
      wsData.push(['', 'Tổng doanh thu', businessReport.doanhThu.tong])

      wsData.push([])

      // Chi phí
      const chiPhiCategories = Object.entries(businessReport.chiPhi.byCategory)
      wsData.push(['II.', `Chi phí (1+2+3+4+5)`, ''])
      
      // Map các loại chi phí theo tên nghiệp vụ
      const categoryMap: Record<string, string> = {
        'Chi phí nguyên vật liệu': '1. Chi phí nguyên vật liệu',
        'Chi phí nhân sự': '2. Chi phí nhân sự',
        'Chi phí cố định': '3. Chi phí cố định (mặt bằng, điện nước, khấu hao máy móc,...)',
        'Chi phí marketing': '4. Chi phí marketing',
        'Chi phí khác': '5. Chi phí khác (vệ sinh, văn phòng phẩm, bảo trì,...)'
      }

      let index = 1
      chiPhiCategories.forEach(([category, value]) => {
        const label = categoryMap[category] || `${index}. ${category}`
        wsData.push(['', label, value])
        index++
      })
      wsData.push(['', 'Tổng chi phí', businessReport.chiPhi.tong])

      wsData.push([])

      // Lợi nhuận
      wsData.push(['III.', 'Lợi nhuận', businessReport.loiNhuan])

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet(wsData)
      
      // Set column widths
      ws['!cols'] = [
        { wch: 5 },
        { wch: 60 },
        { wch: 20 }
      ]

      XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo')
      XLSX.writeFile(wb, `BaoCaoKetQuaKinhDoanh_${startDate}_${endDate}.xlsx`)
      toast.success('Xuất Excel thành công!')
    } catch (err) {
      toast.error('Lỗi khi xuất Excel: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const getChiPhiLabel = (categoryName: string, index: number): string => {
    const categoryMap: Record<string, string> = {
      'Chi phí nguyên vật liệu': '1. Chi phí nguyên vật liệu',
      'Chi phí nhân sự': '2. Chi phí nhân sự',
      'Chi phí cố định': '3. Chi phí cố định (mặt bằng, điện nước, khấu hao máy móc,...)',
      'Chi phí marketing': '4. Chi phí marketing',
      'Chi phí khác': '5. Chi phí khác (vệ sinh, văn phòng phẩm, bảo trì,...)'
    }
    return categoryMap[categoryName] || `${index}. ${categoryName}`
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
      <div className={styles.breadcrumb}>
        <span>Báo cáo</span>
        <span> &gt; </span>
        <span>Kinh doanh</span>
      </div>

      <h1 className={styles.title}>BÁO CÁO KẾT QUẢ KINH DOANH</h1>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>
            <FaCalendarAlt /> Từ ngày:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label>
            <FaCalendarAlt /> Đến ngày:
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
          <label>
            Ca làm:
            <select
              value={selectedPhienLamViec}
              onChange={(e) => setSelectedPhienLamViec(e.target.value)}
            >
              <option value="">-- Tất cả ca --</option>
              {availablePhienLamViec.map((plv) => (
                <option key={plv.MaPhienLamViec} value={plv.MaPhienLamViec}>
                  {plv.caLam?.TenCaLam || 'N/A'} - {new Date(plv.Ngay).toLocaleDateString('vi-VN')}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className={styles.actionButtons}>
          <button
            className={styles.generateButton}
            onClick={handleGenerateBusinessReport}
            disabled={loadingBusinessReport || !startDate || !endDate}
          >
            {loadingBusinessReport ? 'Đang tạo...' : 'Tạo'}
          </button>
          <button
            className={styles.exportButton}
            onClick={handleExportBusinessReportExcel}
            disabled={!businessReport}
          >
            <FaFileExcel /> Xuất file
          </button>
        </div>
      </div>

      {businessReport && (
        <div className={styles.reportTable}>
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Khoản mục</th>
                <th>Giá trị (VND)</th>
              </tr>
            </thead>
            <tbody>
              {/* Doanh thu */}
              <tr className={styles.sectionHeader}>
                <td>I.</td>
                <td colSpan={2}><strong>Doanh thu (1+2)</strong></td>
              </tr>
              <tr>
                <td></td>
                <td>1. Doanh thu bán hàng</td>
                <td>{formatPrice(businessReport.doanhThu.banHang)}</td>
              </tr>
              <tr>
                <td></td>
                <td>2. Doanh thu khác (dịch vụ, bán đồ lưu niệm, phụ thu,...)</td>
                <td>{formatPrice(businessReport.doanhThu.khac)}</td>
              </tr>
              <tr className={styles.totalRow}>
                <td></td>
                <td><strong>Tổng doanh thu</strong></td>
                <td><strong>{formatPrice(businessReport.doanhThu.tong)}</strong></td>
              </tr>

              {/* Chi phí */}
              <tr className={styles.sectionHeader}>
                <td>II.</td>
                <td colSpan={2}><strong>Chi phí (1+2+3+4+5)</strong></td>
              </tr>
              {Object.entries(businessReport.chiPhi.byCategory).map(([category, value], index) => (
                <tr key={category}>
                  <td></td>
                  <td>{getChiPhiLabel(category, index + 1)}</td>
                  <td>{formatPrice(value)}</td>
                </tr>
              ))}
              <tr className={styles.totalRow}>
                <td></td>
                <td><strong>Tổng chi phí</strong></td>
                <td><strong>{formatPrice(businessReport.chiPhi.tong)}</strong></td>
              </tr>

              {/* Lợi nhuận */}
              <tr className={styles.sectionHeader}>
                <td>III.</td>
                <td colSpan={2}><strong>Lợi nhuận</strong></td>
              </tr>
              <tr className={styles.totalRow}>
                <td></td>
                <td><strong>Lợi nhuận</strong></td>
                <td><strong>{formatPrice(businessReport.loiNhuan)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {!businessReport && !loadingBusinessReport && (
        <div className={styles.emptyState}>
          <p>Vui lòng chọn khoảng thời gian và nhấn "Tạo" để xem báo cáo</p>
        </div>
      )}

      {/* Phần báo cáo chốt ca cũ - có thể ẩn hoặc giữ lại */}
      {report && (
        <div style={{ marginTop: '3rem' }}>
          <div className={styles.header}>
            <div className={styles.headerMain}>
              <h1>
                <FaFileAlt /> Báo cáo chốt ca
              </h1>
              <p>Xem báo cáo chi tiết của các phiên làm việc</p>
            </div>
            <div className={styles.headerActions}>
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
      )}
    </div>
  )
}

export default ShiftClosingPage


'use client'
import React, { useState, useEffect } from 'react'
import {
  FaFileExcel,
  FaCalendarAlt,
  FaFilePdf
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { phienLamViecApi, thongKeApi, BusinessReport, ApiError } from '../../../lib/api'
import styles from './shiftClosing.module.css'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const formatPrice = (price: number) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' đ'
}

// Sắp xếp các khoản mục chi phí theo thứ tự ưu tiên
const sortChiPhiCategories = (categories: [string, number][]): [string, number][] => {
  const priorityOrder = [
    'Chi phí nguyên vật liệu',
    'Nguyên vật liệu',
    'Chi phí nhân sự',
    'Nhân sự',
    'Chi phí cố định',
    'Cố định',
    'Chi phí marketing',
    'Marketing',
    'Chi phí khác',
    'Khác'
  ]
  
  return categories.sort((a, b) => {
    const indexA = priorityOrder.indexOf(a[0])
    const indexB = priorityOrder.indexOf(b[0])
    
    // Nếu cả hai đều có trong priorityOrder, sắp xếp theo thứ tự
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB
    }
    // Nếu chỉ một trong hai có trong priorityOrder, ưu tiên nó
    if (indexA !== -1) return -1
    if (indexB !== -1) return 1
    // Nếu cả hai đều không có, sắp xếp theo tên
    return a[0].localeCompare(b[0], 'vi')
  })
}

// Map các loại chi phí theo tên nghiệp vụ - tự động từ API
const getChiPhiLabel = (categoryName: string, index: number): string => {
  // Map các tên nghiệp vụ phổ biến sang format chuẩn
  const categoryMap: Record<string, string> = {
    'Chi phí nguyên vật liệu': '1. Chi phí nguyên vật liệu',
    'Chi phí nhân sự': '2. Chi phí nhân sự',
    'Chi phí cố định': '3. Chi phí cố định (mặt bằng, điện nước, khấu hao máy móc,...)',
    'Chi phí marketing': '4. Chi phí marketing',
    'Chi phí khác': '5. Chi phí khác (vệ sinh, văn phòng phẩm, bảo trì,...)',
    // Thêm các mapping khác nếu cần
    'Nguyên vật liệu': '1. Chi phí nguyên vật liệu',
    'Nhân sự': '2. Chi phí nhân sự',
    'Cố định': '3. Chi phí cố định (mặt bằng, điện nước, khấu hao máy móc,...)',
    'Marketing': '4. Chi phí marketing',
    'Khác': '5. Chi phí khác (vệ sinh, văn phòng phẩm, bảo trì,...)'
  }
  
  // Nếu có mapping, dùng mapping, nếu không thì dùng tên gốc với số thứ tự
  if (categoryMap[categoryName]) {
    return categoryMap[categoryName]
  }
  
  // Tự động đánh số cho các khoản mục khác
  return `${index}. ${categoryName}`
}

const ShiftClosingPage = () => {
  const [businessReport, setBusinessReport] = useState<BusinessReport | null>(null)
  const [selectedPhienLamViec, setSelectedPhienLamViec] = useState<string>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [dateError, setDateError] = useState<string | null>(null)
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
    // Set dates from phien lam viec
    if (selectedPhienLamViec) {
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
          nhanVien: plv.nhanVien ? { TenNhanVien: plv.nhanVien.TenNhanVien } : undefined,
          caLam: plv.caLam ? { TenCaLam: plv.caLam.TenCaLam } : undefined
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


  const handleGenerateBusinessReport = async () => {
    const hasFrom = !!startDate
    const hasTo = !!endDate

    // Chỉ chọn 1 trong 2 ngày -> lỗi
    if ((hasFrom && !hasTo) || (!hasFrom && hasTo)) {
      setDateError('Vui lòng chọn đầy đủ cả Từ ngày và Đến ngày')
      toast.error('Vui lòng chọn đầy đủ cả Từ ngày và Đến ngày')
      return
    }

    // Chọn đủ 2 ngày nhưng from > to -> lỗi
    if (hasFrom && hasTo) {
      const from = new Date(startDate)
      const to = new Date(endDate)
      from.setHours(0, 0, 0, 0)
      to.setHours(0, 0, 0, 0)

      if (from > to) {
        setDateError('Ngày bắt đầu không được lớn hơn ngày kết thúc')
        toast.error('Ngày bắt đầu không được lớn hơn ngày kết thúc')
        return
      }
    }

    // Hợp lệ: bắt buộc phải có cả 2 ngày
    if (!hasFrom || !hasTo) {
      setDateError('Vui lòng chọn Từ ngày và Đến ngày')
      toast.error('Vui lòng chọn Từ ngày và Đến ngày')
      return
    }

    setDateError(null)

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


  const handleExportBusinessReportExcel = () => {
    if (!businessReport) {
      toast.error('Vui lòng tạo báo cáo trước')
      return
    }

    try {
      const wsData: (string | number)[][] = [
        ['BÁO CÁO KẾT QUẢ KINH DOANH'],
        [],
        ['Từ ngày:', startDate],
        ['Đến ngày:', endDate],
        selectedPhienLamViec ? ['Ca làm:', availablePhienLamViec.find(p => p.MaPhienLamViec === selectedPhienLamViec)?.caLam?.TenCaLam || ''] : [],
        [],
        ['STT', 'Khoản mục', 'Giá trị (VND)'],
      ]

      // Doanh thu
      wsData.push(['I.', 'Doanh thu ', ''])
      wsData.push(['', '1. Doanh thu bán hàng', businessReport.doanhThu.banHang])
      wsData.push(['', '2. Doanh thu khác (dịch vụ, bán đồ lưu niệm, phụ thu,...)', businessReport.doanhThu.khac])
      wsData.push(['', 'Tổng doanh thu', businessReport.doanhThu.tong])

      wsData.push([])

      // Chi phí - sắp xếp và map
      const chiPhiCategories = Object.entries(businessReport.chiPhi.byCategory)
      const sortedChiPhi = sortChiPhiCategories(chiPhiCategories)
      const chiPhiCount = sortedChiPhi.length
      const chiPhiLabel = chiPhiCount > 0 
        ? `Chi phí (${Array.from({ length: Math.min(chiPhiCount, 5) }, (_, i) => i + 1).join('+')}${chiPhiCount > 5 ? '+' : ''})`
        : 'Chi phí '
      wsData.push(['II.', chiPhiLabel, ''])
      
      // Map các loại chi phí theo tên nghiệp vụ
      sortedChiPhi.forEach(([category, value]: [string, number], index: number) => {
        const label = getChiPhiLabel(category, index + 1)
        wsData.push(['', label, value])
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

  const handleExportBusinessReportPDF = async () => {
    if (!businessReport) {
      toast.error('Vui lòng tạo báo cáo trước')
      return
    }

    try {
      // Hiển thị loading
      toast.loading('Đang tạo PDF...', { id: 'pdf-export' })

      // Tạo iframe ẩn với nội dung báo cáo
      const iframe = document.createElement('iframe')
      iframe.style.position = 'absolute'
      iframe.style.left = '-9999px'
      iframe.style.top = '0'
      iframe.style.width = '210mm'
      iframe.style.height = '297mm'
      iframe.style.border = 'none'
      
      document.body.appendChild(iframe)

      // Tạo HTML cho báo cáo
      const chiPhiCategories = Object.entries(businessReport.chiPhi.byCategory)
      const sortedChiPhi = sortChiPhiCategories(chiPhiCategories)
      const chiPhiCount = sortedChiPhi.length
      const chiPhiLabel = chiPhiCount > 0 
        ? `Chi phí (${Array.from({ length: Math.min(chiPhiCount, 5) }, (_, i) => i + 1).join('+')}${chiPhiCount > 5 ? '+' : ''})`
        : 'Chi phí '

      const caLam = selectedPhienLamViec 
        ? availablePhienLamViec.find(p => p.MaPhienLamViec === selectedPhienLamViec)?.caLam?.TenCaLam || ''
        : ''

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Roboto', 'Arial', 'DejaVu Sans', sans-serif;
              font-size: 12px;
              line-height: 1.6;
              letter-spacing: 0.02em;
              color: #000;
              padding: 20mm;
              background: #fff;
            }
            h1 {
              text-align: center;
              font-size: 18px;
              font-weight: bold;
              line-height: 1.4;
              margin-bottom: 20px;
              letter-spacing: 0.05em;
            }
            .info {
              margin-bottom: 20px;
            }
            .info p {
              margin: 8px 0;
              line-height: 1.6;
            }
            table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 10px 8px;
              text-align: left;
              line-height: 1.5;
              letter-spacing: 0.01em;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
              line-height: 1.6;
            }
            td:last-child {
              text-align: right;
            }
            tr {
              line-height: 1.5;
            }
            strong {
              font-weight: bold;
              letter-spacing: 0.02em;
            }
          </style>
        </head>
        <body>
          <h1>BÁO CÁO KẾT QUẢ KINH DOANH</h1>
          <div class="info">
            <p><strong>Từ ngày:</strong> ${startDate}</p>
            <p><strong>Đến ngày:</strong> ${endDate}</p>
            ${caLam ? `<p><strong>Ca làm:</strong> ${caLam}</p>` : ''}
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 50px;">STT</th>
                <th>Khoản mục</th>
                <th style="width: 150px; text-align: right;">Giá trị (VND)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>I.</strong></td>
                <td><strong>Doanh thu </strong></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td>1. Doanh thu bán hàng</td>
                <td>${formatPrice(businessReport.doanhThu.banHang)}</td>
              </tr>
              <tr>
                <td></td>
                <td>2. Doanh thu khác (dịch vụ, bán đồ lưu niệm, phụ thu,...)</td>
                <td>${formatPrice(businessReport.doanhThu.khac)}</td>
              </tr>
              <tr>
                <td></td>
                <td><strong>Tổng doanh thu</strong></td>
                <td><strong>${formatPrice(businessReport.doanhThu.tong)}</strong></td>
              </tr>
              <tr>
                <td><strong>II.</strong></td>
                <td><strong>${chiPhiLabel}</strong></td>
                <td></td>
              </tr>
              ${sortedChiPhi.map(([category, value]: [string, number], index: number) => {
                const label = getChiPhiLabel(category, index + 1)
                return `
                  <tr>
                    <td></td>
                    <td>${label}</td>
                    <td>${formatPrice(value)}</td>
                  </tr>
                `
              }).join('')}
              <tr>
                <td></td>
                <td><strong>Tổng chi phí</strong></td>
                <td><strong>${formatPrice(businessReport.chiPhi.tong)}</strong></td>
              </tr>
              <tr>
                <td><strong>III.</strong></td>
                <td><strong>Lợi nhuận</strong></td>
                <td><strong>${formatPrice(businessReport.loiNhuan)}</strong></td>
              </tr>
            </tbody>
          </table>
        </body>
        </html>
      `

      // Đợi iframe load xong
      await new Promise<void>((resolve) => {
        iframe.onload = () => {
          resolve()
        }
        iframe.srcdoc = htmlContent
      })

      // Đợi font load (Google Fonts)
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Lấy body của iframe
      const iframeBody = iframe.contentDocument?.body
      if (!iframeBody) {
        throw new Error('Không thể truy cập iframe content')
      }

      // Chụp iframe body thành canvas
      const canvas = await html2canvas(iframeBody, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794, // A4 width in pixels at 96 DPI
        windowHeight: iframeBody.scrollHeight,
        allowTaint: false,
        removeContainer: false,
        imageTimeout: 15000
      })

      // Xóa iframe
      document.body.removeChild(iframe)

      // Tính toán kích thước PDF
      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      const pdf = new jsPDF('p', 'mm', 'a4')

      // Thêm hình ảnh từ canvas vào PDF
      const imgData = canvas.toDataURL('image/png', 1.0)
      let heightLeft = imgHeight
      let position = 0

      // Thêm trang đầu
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= 297 // A4 height in mm

      // Thêm các trang tiếp theo nếu cần
      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= 297
      }

      // Lưu file
      const fileName = `BaoCaoKetQuaKinhDoanh_${startDate}_${endDate}.pdf`
      pdf.save(fileName)
      
      toast.success('Xuất PDF thành công!', { id: 'pdf-export' })
    } catch (err) {
      toast.error('Lỗi khi xuất PDF: ' + (err instanceof Error ? err.message : 'Unknown error'), { id: 'pdf-export' })
    }
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
              max={endDate || undefined}
            />
          </label>
          <label>
            <FaCalendarAlt /> Đến ngày:
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || undefined}
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
        {dateError && (
          <div className={styles.dateError}>
            {dateError}
          </div>
        )}
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
            <FaFileExcel /> Xuất Excel
          </button>
          <button
            className={styles.exportButton}
            onClick={handleExportBusinessReportPDF}
            disabled={!businessReport}
          >
            <FaFilePdf /> Xuất PDF
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
                <td colSpan={2}><strong>Chi phí ({Object.keys(businessReport.chiPhi.byCategory).length > 0 ? `1+${Object.keys(businessReport.chiPhi.byCategory).length > 1 ? `2${Object.keys(businessReport.chiPhi.byCategory).length > 2 ? `+3${Object.keys(businessReport.chiPhi.byCategory).length > 3 ? `+4${Object.keys(businessReport.chiPhi.byCategory).length > 4 ? '+5' : ''}` : ''}` : ''}` : ''}` : '1+2+3+4+5'})</strong></td>
              </tr>
              {sortChiPhiCategories(Object.entries(businessReport.chiPhi.byCategory)).map(([category, value]: [string, number], index: number) => (
                <tr key={category}>
                  <td></td>
                  <td>{getChiPhiLabel(category, index + 1)}</td>
                  <td>{formatPrice(value)}</td>
                </tr>
              ))}
              {Object.keys(businessReport.chiPhi.byCategory).length === 0 && (
                <tr>
                  <td></td>
                  <td colSpan={2} style={{ color: '#999', fontStyle: 'italic' }}>Chưa có chi phí trong khoảng thời gian này</td>
                </tr>
              )}
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
          <p>Vui lòng chọn khoảng thời gian và nhấn &quot;Tạo&quot; để xem báo cáo</p>
        </div>
      )}
    </div>
  )
}

export default ShiftClosingPage


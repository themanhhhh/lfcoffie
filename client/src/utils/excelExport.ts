import * as XLSX from 'xlsx'

// Format số tiền cho Excel
const formatPrice = (price: number) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' đ'
}

// Xuất báo cáo chốt ca
export const exportShiftClosingReport = (report: any, fileName: string = 'Bao_cao_chot_ca.xlsx') => {
  const workbook = XLSX.utils.book_new()

  // Sheet 1: Thông tin phiên làm việc và tổng kết
  const infoData = [
    ['BÁO CÁO CHỐT CA'],
    [],
    ['Thông tin phiên làm việc'],
    ['Mã PLV', report.phienLamViec.MaPhienLamViec],
    ['Ngày', new Date(report.phienLamViec.Ngay).toLocaleDateString('vi-VN')],
    ['Mở ca', report.phienLamViec.ThoiGianMo ? new Date(report.phienLamViec.ThoiGianMo).toLocaleString('vi-VN') : 'N/A'],
    ['Đóng ca', report.phienLamViec.ThoiGianDong ? new Date(report.phienLamViec.ThoiGianDong).toLocaleString('vi-VN') : 'Chưa đóng'],
    ['Giờ in', new Date(report.tongKet.gioIn).toLocaleString('vi-VN')],
    ['Thu ngân', report.phienLamViec.nhanVien?.TenNhanVien || 'N/A'],
    ['Ca làm việc', report.phienLamViec.caLam?.TenCaLam || 'N/A'],
    ['Trạng thái', report.phienLamViec.TrangThai],
    [],
    ['Tổng kết'],
    ['Số dư đầu', formatPrice(report.tongKet.soDuDau)],
    ['Doanh thu', formatPrice(report.tongKet.totalRevenue)],
    ['Tổng giảm giá món', formatPrice(report.tongKet.totalGiamGiaMon)],
    ['Tổng chiết khấu', formatPrice(report.tongKet.totalChietKhau)],
    ['Tổng thu', formatPrice(report.tongKet.totalThu)],
    ['Tổng chi', formatPrice(report.tongKet.totalChi)],
    ['Tiền trong két', formatPrice(report.tongKet.tienTrongKet)],
    ['Số hóa đơn', report.tongKet.orderCount],
    ['Trung bình hóa đơn', formatPrice(report.tongKet.averageOrder)]
  ]

  const infoSheet = XLSX.utils.aoa_to_sheet(infoData)
  XLSX.utils.book_append_sheet(workbook, infoSheet, 'Tổng kết')

  // Sheet 2: Món và nhóm món
  if (report.monByNhom && report.monByNhom.length > 0) {
    const monData = [
      ['Tên nhóm', 'Số lượng', 'Doanh thu']
    ]
    report.monByNhom.forEach((item: any) => {
      monData.push([item.ten, item.soLuong, formatPrice(item.doanhThu)])
    })
    const monSheet = XLSX.utils.aoa_to_sheet(monData)
    XLSX.utils.book_append_sheet(workbook, monSheet, 'Món và nhóm món')
  }

  // Sheet 3: CTKM
  if (report.ctkmStats && report.ctkmStats.length > 0) {
    const ctkmData = [
      ['Tên CTKM', 'Số hóa đơn', 'Doanh thu']
    ]
    report.ctkmStats.forEach((item: any) => {
      ctkmData.push([item.ten, item.soHoaDon, formatPrice(item.doanhThu)])
    })
    const ctkmSheet = XLSX.utils.aoa_to_sheet(ctkmData)
    XLSX.utils.book_append_sheet(workbook, ctkmSheet, 'CTKM')
  }

  // Sheet 4: Phương thức thanh toán
  if (report.paymentMethods && report.paymentMethods.length > 0) {
    const paymentData = [
      ['Phương thức', 'Số hóa đơn', 'Doanh thu']
    ]
    report.paymentMethods.forEach((item: any) => {
      paymentData.push([item.phuongThuc, item.soHoaDon, formatPrice(item.doanhThu)])
    })
    const paymentSheet = XLSX.utils.aoa_to_sheet(paymentData)
    XLSX.utils.book_append_sheet(workbook, paymentSheet, 'Phương thức thanh toán')
  }

  XLSX.writeFile(workbook, fileName)
}

// Xuất báo cáo doanh thu theo ngày
export const exportDailyRevenue = (data: any[], startDate: string, endDate: string) => {
  const workbook = XLSX.utils.book_new()

  const reportData = [
    ['BÁO CÁO DOANH THU THEO NGÀY'],
    ['Từ ngày', new Date(startDate).toLocaleDateString('vi-VN')],
    ['Đến ngày', new Date(endDate).toLocaleDateString('vi-VN')],
    [],
    ['Ngày', 'Doanh thu', 'Số hóa đơn', 'Trung bình hóa đơn']
  ]

  data.forEach((item: any) => {
    reportData.push([
      new Date(item.date).toLocaleDateString('vi-VN'),
      formatPrice(item.revenue || 0),
      item.orderCount || 0,
      formatPrice((item.revenue || 0) / Math.max(item.orderCount || 1, 1))
    ])
  })

  const sheet = XLSX.utils.aoa_to_sheet(reportData)
  XLSX.utils.book_append_sheet(workbook, sheet, 'Doanh thu theo ngày')
  XLSX.writeFile(workbook, `Bao_cao_doanh_thu_${startDate}_${endDate}.xlsx`)
}

// Xuất báo cáo hoạt động kinh doanh
export const exportBusinessActivity = (overview: any, revenueComparison: any, fileName: string = 'Bao_cao_hoat_dong_kinh_doanh.xlsx') => {
  const workbook = XLSX.utils.book_new()

  const reportData = [
    ['BÁO CÁO HOẠT ĐỘNG KINH DOANH'],
    ['Ngày xuất', new Date().toLocaleString('vi-VN')],
    [],
    ['Tổng quan'],
    ['Tổng doanh thu', formatPrice(overview.totalRevenue || 0)],
    ['Tổng chi phí', formatPrice(overview.totalExpense || 0)],
    ['Lợi nhuận gộp', formatPrice(overview.grossProfit || 0)],
    ['Số hóa đơn', overview.invoiceCount || 0],
    ['Tỷ suất lợi nhuận', overview.totalRevenue > 0 
      ? `${((overview.grossProfit / overview.totalRevenue) * 100).toFixed(1)}%` 
      : '0%'],
    [],
    ['So sánh với hôm qua'],
    ['Hôm nay'],
    ['Ngày', revenueComparison?.today?.date || 'N/A'],
    ['Doanh thu', formatPrice(revenueComparison?.today?.revenue || 0)],
    ['Số hóa đơn', revenueComparison?.today?.orderCount || 0],
    [],
    ['Hôm qua'],
    ['Ngày', revenueComparison?.yesterday?.date || 'N/A'],
    ['Doanh thu', formatPrice(revenueComparison?.yesterday?.revenue || 0)],
    ['Số hóa đơn', revenueComparison?.yesterday?.orderCount || 0],
    [],
    ['So sánh'],
    ['Chênh lệch', formatPrice(revenueComparison?.comparison?.difference || 0)],
    ['% thay đổi', `${revenueComparison?.comparison?.percentChange?.toFixed(1) || 0}%`],
    ['Xu hướng', revenueComparison?.comparison?.isIncrease ? 'Tăng' : 'Giảm']
  ]

  const sheet = XLSX.utils.aoa_to_sheet(reportData)
  XLSX.utils.book_append_sheet(workbook, sheet, 'Hoạt động kinh doanh')
  XLSX.writeFile(workbook, fileName)
}

// Xuất báo cáo thu chi
export const exportCashflowReport = (transactions: any[], totals: any, startDate: string, endDate: string) => {
  const workbook = XLSX.utils.book_new()

  // Sheet 1: Tổng kết
  const summaryData = [
    ['BÁO CÁO THU CHI'],
    ['Từ ngày', new Date(startDate).toLocaleDateString('vi-VN')],
    ['Đến ngày', new Date(endDate).toLocaleDateString('vi-VN')],
    [],
    ['Tổng kết'],
    ['Tổng thu', formatPrice(totals.in || 0)],
    ['Tổng chi', formatPrice(totals.out || 0)],
    ['Tăng/Giảm quỹ', formatPrice((totals.in || 0) - (totals.out || 0))]
  ]

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tổng kết')

  // Sheet 2: Chi tiết giao dịch
  const transactionData = [
    ['Thời gian', 'Loại', 'Nghiệp vụ', 'Nội dung', 'Số tiền', 'Phương thức', 'Người thực hiện', 'Ghi chú']
  ]

  transactions.forEach((tx: any) => {
    transactionData.push([
      tx.ThoiGian ? new Date(tx.ThoiGian).toLocaleString('vi-VN') : 'N/A',
      tx.nghiepVu?.LoaiGiaoDich === 'thu' ? 'Thu' : 'Chi',
      tx.nghiepVu?.TenNghiepVu || 'N/A',
      tx.GhiChu || tx.NoiDung || '',
      formatPrice(tx.SoTien || 0),
      tx.PhuongThucThanhToan || 'N/A',
      tx.phienLamViec?.nhanVien?.TenNhanVien || tx.nhanVien?.TenNhanVien || 'N/A',
      tx.GhiChu || ''
    ])
  })

  const transactionSheet = XLSX.utils.aoa_to_sheet(transactionData)
  XLSX.utils.book_append_sheet(workbook, transactionSheet, 'Chi tiết giao dịch')
  XLSX.writeFile(workbook, `Bao_cao_thu_chi_${startDate}_${endDate}.xlsx`)
}


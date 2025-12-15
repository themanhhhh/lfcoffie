import React from 'react'
import { ShiftClosingReport } from '../../../lib/api'

const baseStyles = `
  body { font-family: "Helvetica Neue", Arial, "Segoe UI", Roboto, -apple-system, sans-serif; color: #111; margin: 0; padding: 10mm; }
  .header { text-align: left; margin-bottom: 8px; border-bottom: 1px solid #ddd; padding-bottom: 6px; display:flex; align-items:center; gap:12px; }
  .logo { width: 56px; height: 56px; flex-shrink:0; }
  .brand { font-weight: 800; color: #3f2c1f; font-size: 14px; }
  h1 { font-size: 18px; margin: 6px 0 8px 0; }
  .meta { display: flex; gap: 12px; flex-wrap: wrap; font-size: 11px; color: #222; margin-bottom: 8px; }
  .meta div { min-width: 120px; }
  .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px; }
  .summary-cell { background: #f7f7f7; padding: 8px; border-radius: 4px; }
  .summary-cell strong { display: block; font-size: 11px; color: #555; margin-bottom: 4px; }
  .summary-cell .value { font-weight: 700; font-size: 13px; color: #111; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; color: #111; margin-bottom: 8px; }
  th, td { border: 1px solid #ddd; padding: 8px; }
  thead th { background: #f0f0f0; font-weight: 700; }
  tbody tr:nth-child(even) { background: #fafafa; }
  .section-title { font-size: 13px; font-weight: 700; margin: 8px 0; }
`

export function buildPrintableHtml(report: ShiftClosingReport) {
  const escape = (s: any) => {
    if (s === null || s === undefined) return ''
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  const formatPrice = (price: number) => {
    if (price === null || price === undefined) return '0 đ'
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' đ'
  }

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    return date.toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  // Build monByNhom table rows
  const monByNhomRows = (report.monByNhom || []).map(item => `
    <tr>
      <td>${escape(item.ten)}</td>
      <td style="text-align:right">${escape(item.soLuong)}</td>
      <td style="text-align:right">${escape(formatPrice(item.doanhThu))}</td>
    </tr>
  `).join('')

  const ctkmRows = (report.ctkmStats || []).map(item => `
    <tr>
      <td>${escape(item.ten)}</td>
      <td style="text-align:right">${escape(item.soHoaDon)}</td>
      <td style="text-align:right">${escape(formatPrice(item.doanhThu))}</td>
    </tr>
  `).join('')

  const paymentRows = (report.paymentMethods || []).map(item => `
    <tr>
      <td>${escape(item.phuongThuc)}</td>
      <td style="text-align:right">${escape(item.soHoaDon)}</td>
      <td style="text-align:right">${escape(formatPrice(item.doanhThu))}</td>
    </tr>
  `).join('')

  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Báo cáo chốt ca ${escape(report.phienLamViec.MaPhienLamViec)}</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="header">
            <div class="logo">
              <!-- Inline SVG logo -->
              <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 100 100">
                <rect width="100" height="100" rx="12" fill="#3f2c1f" />
                <text x="50" y="57" font-size="42" font-family="Arial, Helvetica, sans-serif" fill="#fff" font-weight="700" text-anchor="middle">L</text>
              </svg>
            </div>
            <div class="brand">Lofi Cafe</div>
        <h1>BÁO CÁO CHỐT CA</h1>
        <div class="meta">
          <div><strong>Mã PLV:</strong> ${escape(report.phienLamViec.MaPhienLamViec)}</div>
          <div><strong>Ngày:</strong> ${escape(new Date(report.phienLamViec.Ngay).toLocaleDateString('vi-VN'))}</div>
          <div><strong>Thu ngân:</strong> ${escape(report.phienLamViec.nhanVien?.TenNhanVien || 'N/A')}</div>
          <div><strong>Ca làm việc:</strong> ${escape(report.phienLamViec.caLam?.TenCaLam || 'N/A')}${report.phienLamViec.caLam?.ThoiGianBatDau && report.phienLamViec.caLam?.ThoiGianKetThuc ? ` (${report.phienLamViec.caLam.ThoiGianBatDau} - ${report.phienLamViec.caLam.ThoiGianKetThuc})` : ''}</div>
          <div><strong>Giờ in:</strong> ${escape(formatDateTime(report.tongKet.gioIn))}</div>
        </div>
      </div>

      <div class="summary-grid">
        <div class="summary-cell"><strong>Số dư đầu</strong><div class="value">${escape(formatPrice(report.tongKet.soDuDau))}</div></div>
        <div class="summary-cell"><strong>Doanh thu</strong><div class="value">${escape(formatPrice(report.tongKet.totalRevenue))}</div></div>
        <div class="summary-cell"><strong>Tổng thu</strong><div class="value">${escape(formatPrice(report.tongKet.totalThu))}</div></div>
        <div class="summary-cell"><strong>Tổng chi</strong><div class="value">${escape(formatPrice(report.tongKet.totalChi))}</div></div>
        <div class="summary-cell"><strong>Tiền trong két</strong><div class="value">${escape(formatPrice(report.tongKet.tienTrongKet))}</div></div>
        <div class="summary-cell"><strong>Số hóa đơn</strong><div class="value">${escape(report.tongKet.orderCount)}</div></div>
      </div>

      ${report.monByNhom && report.monByNhom.length > 0 ? `
        <div class="section-title">Món và nhóm món</div>
        <table>
          <thead>
            <tr><th>Tên nhóm</th><th style="text-align:right">Số lượng</th><th style="text-align:right">Doanh thu</th></tr>
          </thead>
          <tbody>
            ${monByNhomRows}
          </tbody>
        </table>
      ` : ''}

      ${report.ctkmStats && report.ctkmStats.length > 0 ? `
        <div class="section-title">CTKM</div>
        <table>
          <thead>
            <tr><th>Tên CTKM</th><th style="text-align:right">Số hóa đơn</th><th style="text-align:right">Doanh thu</th></tr>
          </thead>
          <tbody>
            ${ctkmRows}
          </tbody>
        </table>
      ` : ''}

      ${report.paymentMethods && report.paymentMethods.length > 0 ? `
        <div class="section-title">Phương thức thanh toán</div>
        <table>
          <thead>
            <tr><th>Phương thức</th><th style="text-align:right">Số hóa đơn</th><th style="text-align:right">Doanh thu</th></tr>
          </thead>
          <tbody>
            ${paymentRows}
          </tbody>
        </table>
      ` : ''}

      <div style="margin-top:10px; font-size:11px; color:#666;">In lúc: ${escape(formatDateTime(new Date().toISOString()))}</div>
    </body>
  </html>`
}

export default function PrintableReport({ report }: { report: ShiftClosingReport }) {
  // This component can be used for in-page preview; styles here are minimal and rely on global CSS
  return (
    <div>
      <h2>BÁO CÁO CHỐT CA - Preview</h2>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(report, null, 2)}</pre>
    </div>
  )
}

import { SevenDaysReport } from '../../../lib/api'

const baseStyles = `
  body {
    font-family: "Helvetica Neue", Arial, "Segoe UI", Roboto, -apple-system, sans-serif;
    color: #111;
    margin: 0;
    padding: 12mm;
    background: white;
  }
  .header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    border-bottom: 2px solid #ddd;
    padding-bottom: 8px;
  }
  .logo {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
  }
  .logo img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .header-content {
    flex: 1;
  }
  .brand {
    font-weight: 800;
    color: #3f2c1f;
    font-size: 13px;
  }
  h1 {
    font-size: 16px;
    margin: 4px 0;
    color: #111;
    font-weight: 700;
  }
  .period {
    font-size: 11px;
    color: #666;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
    color: #111;
    margin-top: 12px;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 10px 8px;
    text-align: left;
  }
  thead th {
    background: #f0f0f0;
    font-weight: 700;
    text-align: center;
  }
  tbody tr:nth-child(even) {
    background: #fafafa;
  }
  td:not(:first-child) {
    text-align: right;
  }
  .total-row {
    background: #f8f9fa;
    font-weight: 700;
  }
  .footer {
    margin-top: 12px;
    font-size: 10px;
    color: #999;
    border-top: 1px solid #eee;
    padding-top: 6px;
  }
`

export function buildDailyRevenuePrintableHtml(
  sevenDaysReport: SevenDaysReport | null,
  dateFrom: string,
  dateTo: string
) {
  if (!sevenDaysReport || !sevenDaysReport.dailyData) {
    return '<html><body><p>Không có dữ liệu để in</p></body></html>'
  }

  const escape = (s: any) => {
    if (s === null || s === undefined) return ''
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  const formatNumber = (num: number): string => {
    if (!num) return '0'
    return num.toLocaleString('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
  }

  const formatPrice = (price: number): string => {
    if (!price) return '0 đ'
    return formatNumber(price) + ' đ'
  }

  const dailyData = sevenDaysReport.dailyData.map(d => ({
    date: d.date,
    revenue: d.revenue,
    orderCount: d.orderCount || 0
  }))

  const totalRevenue = dailyData.reduce((sum, d) => sum + d.revenue, 0)
  const totalOrders = dailyData.reduce((sum, d) => sum + d.orderCount, 0)
  const averageRevenue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const dailyRows = dailyData
    .map(item => {
      const avgPerOrder = item.orderCount > 0 ? item.revenue / item.orderCount : 0
      const dateObj = new Date(item.date)
      const dateStr = dateObj.toLocaleDateString('vi-VN')
      return `
        <tr>
          <td>${escape(dateStr)}</td>
          <td>${escape(formatPrice(item.revenue))}</td>
          <td>${escape(String(item.orderCount))}</td>
          <td>${escape(formatPrice(avgPerOrder))}</td>
        </tr>
      `
    })
    .join('')

  const startDate = dateFrom || sevenDaysReport.period.startDate
  const endDate = dateTo || sevenDaysReport.period.endDate
  const startDateObj = new Date(startDate)
  const endDateObj = new Date(endDate)
  const startDateStr = startDateObj.toLocaleDateString('vi-VN')
  const endDateStr = endDateObj.toLocaleDateString('vi-VN')
  const printTime = new Date().toLocaleString('vi-VN')

  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Báo cáo doanh thu theo ngày ${escape(startDateStr)} - ${escape(endDateStr)}</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="header">
        <div class="logo">
          <img src="/images/logo.png" alt="Lofi Cafe" onerror="this.style.display='none'" />
        </div>
        <div class="header-content">
          <div class="brand">Lofi Cafe</div>
          <h1>BÁO CÁO DOANH THU BÁN HÀNG THEO NGÀY</h1>
          <div class="period">Từ ${escape(startDateStr)} đến ${escape(endDateStr)}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Ngày</th>
            <th>Doanh thu</th>
            <th>Số hóa đơn</th>
            <th>Trung bình hóa đơn</th>
          </tr>
        </thead>
        <tbody>
          ${dailyRows}
          <tr class="total-row">
            <td>Tổng cộng</td>
            <td>${escape(formatPrice(totalRevenue))}</td>
            <td>${escape(String(totalOrders))}</td>
            <td>${escape(formatPrice(averageRevenue))}</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        <p>In lúc: ${escape(printTime)}</p>
      </div>
    </body>
  </html>`
}

export default function DailyRevenuePrintable() {
  return <div>DailyRevenuePrintable Component</div>
}

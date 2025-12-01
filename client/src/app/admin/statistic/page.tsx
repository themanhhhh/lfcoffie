'use client'
import React, { useEffect, useState } from 'react'
import {
  FaChartLine,
  FaStore,
  FaClipboardCheck,
  FaArrowUp,
  FaArrowDown,
  FaTrophy,
  FaTags,
  FaFileExcel,
  FaCalendarAlt,
  FaTimes
} from 'react-icons/fa'
import { MdOutlineAnalytics } from 'react-icons/md'
import styles from './statistic.module.css'
import { 
  thongKeApi, 
  ApiError, 
  ThongKeOverview, 
  RevenueComparison,
  SevenDaysReport,
  Top10Product,
  Top5Category,
  RevenueByChannel
} from '../../../lib/api'
import { exportBusinessActivity, exportDailyRevenue } from '../../../utils/excelExport'
import { toast } from 'react-hot-toast'

const StatisticPage = () => {
  const [overview, setOverview] = useState<ThongKeOverview | null>(null)
  const [revenueComparison, setRevenueComparison] = useState<RevenueComparison | null>(null)
  const [sevenDaysReport, setSevenDaysReport] = useState<SevenDaysReport | null>(null)
  const [top10Products, setTop10Products] = useState<Top10Product[]>([])
  const [top5Categories, setTop5Categories] = useState<Top5Category[]>([])
  const [revenueChannels, setRevenueChannels] = useState<RevenueByChannel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [dateError, setDateError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Validate date range trước khi gọi API
        // Trường hợp 1: chỉ chọn 1 trong 2 ngày -> lỗi
        const hasFrom = !!dateFrom
        const hasTo = !!dateTo
        if ((hasFrom && !hasTo) || (!hasFrom && hasTo)) {
          setDateError('Vui lòng chọn đầy đủ cả Từ ngày và Đến ngày')
          setOverview(null)
          setRevenueComparison(null)
          setSevenDaysReport(null)
          setTop10Products([])
          setTop5Categories([])
          setRevenueChannels([])
          setLoading(false)
          return
        }

        // Trường hợp 2: chọn đủ 2 ngày nhưng from > to -> lỗi
        if (hasFrom && hasTo) {
          const from = new Date(dateFrom)
          const to = new Date(dateTo)
          from.setHours(0, 0, 0, 0)
          to.setHours(0, 0, 0, 0)

          if (from > to) {
            setDateError('Ngày bắt đầu không được lớn hơn ngày kết thúc')
            setOverview(null)
            setRevenueComparison(null)
            setSevenDaysReport(null)
            setTop10Products([])
            setTop5Categories([])
            setRevenueChannels([])
            setLoading(false)
            return
          }
        }

        // Hợp lệ: hoặc không chọn gì (lấy mặc định backend), hoặc đã chọn đủ khoảng hợp lệ
        setDateError(null)

        // Prepare date params: chỉ gửi khi đã chọn đủ 2 ngày hợp lệ
        const dateParams = hasFrom && hasTo ? {
          startDate: dateFrom,
          endDate: dateTo
        } : undefined

        const [
          overviewData,
          comparisonData,
          sevenDaysData,
          top10Data,
          top5Data,
          channelsData
        ] = await Promise.all([
          thongKeApi.getOverview(dateParams),
          thongKeApi.compareRevenueWithYesterday(),
          thongKeApi.get7DaysReport(),
          thongKeApi.getTop10Products(dateParams),
          thongKeApi.getTop5Categories(dateParams),
          thongKeApi.getRevenueByChannel(dateParams)
        ])

        if (ignore) return

        setOverview(overviewData)
        setRevenueComparison(comparisonData)
        setSevenDaysReport(sevenDaysData)
        setTop10Products(top10Data)
        setTop5Categories(top5Data)
        setRevenueChannels(channelsData)
      } catch (err) {
        if (ignore) return
        setError(
          err instanceof ApiError
            ? err.message
            : 'Không thể tải dữ liệu thống kê. Vui lòng thử lại.'
        )
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadData()
    return () => {
      ignore = true
    }
  }, [dateFrom, dateTo])

  const handleQuickDateFilter = (type: 'today' | 'week' | 'month' | 'clear') => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (type === 'clear') {
      setDateFrom('')
      setDateTo('')
      setDateError(null)
      return
    }
    
    if (type === 'today') {
      const dateStr = today.toISOString().split('T')[0]
      setDateFrom(dateStr)
      setDateTo(dateStr)
    } else if (type === 'week') {
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay()) // Start of week (Sunday)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      setDateFrom(weekStart.toISOString().split('T')[0])
      setDateTo(weekEnd.toISOString().split('T')[0])
    } else if (type === 'month') {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      setDateFrom(monthStart.toISOString().split('T')[0])
      setDateTo(monthEnd.toISOString().split('T')[0])
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải dữ liệu thống kê...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>
      </div>
    )
  }

  // Tính toán summary từ dữ liệu thực
  const revenueSummary = overview && revenueComparison
    ? [
        {
          title: 'Doanh thu hôm nay',
          value: revenueComparison.today.revenue,
          change: revenueComparison.comparison.percentChange,
          positive: revenueComparison.comparison.isIncrease,
          description: `So với hôm qua (${revenueComparison.yesterday.revenue.toLocaleString('vi-VN')} đ)`
        },
        {
          title: 'Chi phí',
          value: overview.totalExpense,
          change: 0,
          positive: false,
          description: 'Tổng chi phí trong kỳ'
        },
        {
          title: 'Số hóa đơn',
          value: overview.invoiceCount,
          change: revenueComparison.comparison.isIncrease ? 
            ((revenueComparison.today.orderCount - revenueComparison.yesterday.orderCount) / Math.max(revenueComparison.yesterday.orderCount, 1)) * 100 : 0,
          positive: revenueComparison.today.orderCount >= revenueComparison.yesterday.orderCount,
          description: `${revenueComparison.today.orderCount} đơn hôm nay`
        }
      ]
    : []

  const totalRevenue = revenueChannels
    .filter(channel => !channel.label.toLowerCase().includes('giao hàng') && !channel.label.toLowerCase().includes('delivery'))
    .reduce((sum, item) => sum + item.value, 0)

  const handleExportBusinessActivity = () => {
    if (!overview || !revenueComparison) {
      toast.error('Chưa có dữ liệu để xuất Excel')
      return
    }
    try {
      exportBusinessActivity(overview, revenueComparison)
      toast.success('Xuất Excel thành công!')
    } catch (err) {
      toast.error('Lỗi khi xuất Excel: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const handleExportDailyRevenue = () => {
    if (!sevenDaysReport || !sevenDaysReport.dailyData) {
      toast.error('Chưa có dữ liệu để xuất Excel')
      return
    }
    try {
      const startDate = sevenDaysReport.period.startDate
      const endDate = sevenDaysReport.period.endDate
      const dailyData = sevenDaysReport.dailyData.map(d => ({
        date: d.date,
        revenue: d.revenue,
        orderCount: d.orderCount || 0
      }))
      exportDailyRevenue(dailyData, startDate, endDate)
      toast.success('Xuất Excel thành công!')
    } catch (err) {
      toast.error('Lỗi khi xuất Excel: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  return (
    <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>
            <FaChartLine /> Thống kê và Báo cáo
          </h1>
          <div className={styles.headerActions}>
            <button className={styles.excelBtn} onClick={handleExportBusinessActivity} disabled={!overview || !revenueComparison}>
              <FaFileExcel /> Xuất Excel - Hoạt động kinh doanh
            </button>
            <button className={styles.excelBtn} onClick={handleExportDailyRevenue} disabled={!sevenDaysReport}>
              <FaFileExcel /> Xuất Excel - Doanh thu theo ngày
            </button>
          </div>
        </div>

        {/* Date Filter */}
        <div className={styles.dateFilterSection}>
            <div className={styles.dateFilterGroup}>
            <FaCalendarAlt />
            <div className={styles.dateInputs}>
              <input
                type="date"
                className={styles.dateInput}
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="Từ ngày"
                max={dateTo || undefined}
              />
              <span className={styles.dateSeparator}>-</span>
              <input
                type="date"
                className={styles.dateInput}
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="Đến ngày"
                min={dateFrom || undefined}
              />
            </div>
            <div className={styles.quickDateButtons}>
              <button
                type="button"
                className={styles.quickDateBtn}
                onClick={() => handleQuickDateFilter('today')}
                title="Hôm nay"
              >
                Hôm nay
              </button>
              <button
                type="button"
                className={styles.quickDateBtn}
                onClick={() => handleQuickDateFilter('week')}
                title="Tuần này"
              >
                Tuần này
              </button>
              <button
                type="button"
                className={styles.quickDateBtn}
                onClick={() => handleQuickDateFilter('month')}
                title="Tháng này"
              >
                Tháng này
              </button>
              {(dateFrom || dateTo) && (
                <button
                  type="button"
                  className={styles.quickDateBtn}
                  onClick={() => handleQuickDateFilter('clear')}
                  title="Xóa bộ lọc"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
          {(dateError || dateFrom || dateTo) && (
            <div className={styles.dateFilterInfo}>
              {dateError ? (
                <span style={{ color: 'red' }}>{dateError}</span>
              ) : (
                <span>
                  Đang lọc: {dateFrom ? `Từ ${new Date(dateFrom).toLocaleDateString('vi-VN')}` : ''} 
                  {dateFrom && dateTo ? ' - ' : ''}
                  {dateTo ? `Đến ${new Date(dateTo).toLocaleDateString('vi-VN')}` : ''}
                  {!dateFrom && !dateTo ? 'Tất cả thời gian' : ''}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <section className={styles.summaryGrid}>
          {revenueSummary.map(item => (
            <div key={item.title} className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <FaChartLine />
              </div>
              <div className={styles.summaryContent}>
                <span>{item.title}</span>
                <strong>{item.value.toLocaleString('vi-VN')} {item.title.includes('Số hóa đơn') ? '' : '₫'}</strong>
                <div className={styles.summaryChange}>
                  {item.change !== 0 && (
                    <>
                      {item.positive ? (
                        <FaArrowUp className={styles.positive} />
                      ) : (
                        <FaArrowDown className={styles.negative} />
                      )}
                      <span className={item.positive ? styles.positive : styles.negative}>
                        {item.positive ? '+' : ''}
                        {item.change.toFixed(1)}%
                      </span>
                    </>
                  )}
                  <small>{item.description}</small>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* 7 Days Report Chart */}
        {sevenDaysReport && (
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>
                <FaChartLine /> Báo cáo 7 ngày gần nhất
              </h2>
              <span>
                Tổng: {sevenDaysReport.summary.totalRevenue.toLocaleString('vi-VN')} đ | 
                TB/ngày: {sevenDaysReport.summary.averageRevenue.toLocaleString('vi-VN')} đ
              </span>
            </div>
            <div className={styles.barChart}>
              {sevenDaysReport.dailyData.map((data) => {
                const date = new Date(data.date)
                const dayName = date.toLocaleDateString('vi-VN', { weekday: 'short' })
                const dayNumber = date.getDate()
                const maxValue = Math.max(...sevenDaysReport!.dailyData.map(d => d.revenue), 1)
                const scale = maxValue > 0 ? 200 / maxValue : 0
                const revenueHeight = Math.max(Math.round(data.revenue * scale), 20)
                
                return (
                  <div key={data.date} className={styles.barColumn}>
                    <span>
                      {dayName}
                      <br />
                      {dayNumber}/{date.getMonth() + 1}
                    </span>
                    <div className={styles.barWrapper}>
                      <div className={`${styles.bar} ${styles.barRevenue}`} style={{ height: `${revenueHeight}px` }}>
                        <small>{data.revenue > 0 ? (data.revenue / 1000).toFixed(0) + 'k' : ''}</small>
                      </div>
                    </div>
                    <small style={{ fontSize: '0.75rem', color: '#7d6d5b' }}>
                      {data.orderCount} đơn
                    </small>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        <section className={styles.gridTwo}>
          {/* Revenue Channels */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>
                <FaStore /> Cơ cấu doanh thu
              </h2>
              <span>Tổng cộng: {totalRevenue.toLocaleString('vi-VN')} ₫</span>
            </div>
            <div className={styles.channelList}>
              {revenueChannels
                .filter(channel => !channel.label.toLowerCase().includes('giao hàng') && !channel.label.toLowerCase().includes('delivery'))
                .map(channel => {
                  const filteredChannels = revenueChannels.filter(c => !c.label.toLowerCase().includes('giao hàng') && !c.label.toLowerCase().includes('delivery'))
                  const filteredTotal = filteredChannels.reduce((sum, c) => sum + c.value, 0)
                  const width = filteredTotal > 0 ? Math.round((channel.value / filteredTotal) * 100) : 0
                  return (
                    <div key={channel.label} className={styles.channelRow}>
                      <div className={styles.channelLabel}>
                        <MdOutlineAnalytics /> {channel.label}
                      </div>
                      <div className={styles.channelProgress}>
                        <div style={{ width: `${width}%` }} />
                      </div>
                      <div className={styles.channelValue}>
                        {channel.value.toLocaleString('vi-VN')} ₫
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Top 10 Products */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>
                <FaTrophy /> Top {top10Products.length > 0 ? top10Products.length : 5} món bán chạy
              </h2>
              <span>Theo số lượng bán</span>
            </div>
            <div className={styles.productList}>
              {top10Products.length > 0 ? (
                top10Products.map(product => (
                  <div key={product.maMon} className={styles.productRow}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={styles.rankBadge}>#{product.rank}</span>
                        <strong>{product.tenMon}</strong>
                      </div>
                      <span>
                        {product.soLuong} lượt bán • {product.loaiMon}
                      </span>
                    </div>
                    <span className={styles.productRevenue}>
                      {product.doanhThu.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                  Chưa có dữ liệu
                </div>
              )}
            </div>
          </div>
        </section>

        <section className={styles.gridTwo}>
          {/* Top 5 Categories */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>
                <FaTags /> Top 5 danh mục bán chạy
              </h2>
              <span>Theo doanh thu</span>
            </div>
            {top5Categories.length > 0 ? (
              (() => {
                const totalRevenue = top5Categories.reduce((sum, c) => sum + c.tongDoanhThu, 0)
                const colors = [
                  '#8CE4FF', // Brown
                  '#FEEE91', // Sienna
                  '#FFA239', // Peru
                  '#D2691E', // Chocolate
                  '#FF5656'  // Burlywood
                ]
                return (
                  <div className={styles.pieChartContainer}>
                    <div className={styles.pieChartWrapper}>
                      <svg viewBox="0 0 200 200" className={styles.pieChart}>
                        {(() => {
                          let currentAngle = -90 // Start from top
                          return top5Categories.map((category, index) => {
                            const percentage = (category.tongDoanhThu / totalRevenue) * 100
                            const angle = (percentage / 100) * 360
                            const startAngle = currentAngle
                            const endAngle = currentAngle + angle
                            currentAngle = endAngle

                            // Calculate arc path
                            const startAngleRad = (startAngle * Math.PI) / 180
                            const endAngleRad = (endAngle * Math.PI) / 180
                            const x1 = 100 + 80 * Math.cos(startAngleRad)
                            const y1 = 100 + 80 * Math.sin(startAngleRad)
                            const x2 = 100 + 80 * Math.cos(endAngleRad)
                            const y2 = 100 + 80 * Math.sin(endAngleRad)
                            const largeArcFlag = angle > 180 ? 1 : 0

                            const pathData = [
                              `M 100 100`,
                              `L ${x1} ${y1}`,
                              `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                              `Z`
                            ].join(' ')

                            return (
                              <path
                                key={category.loaiMon}
                                d={pathData}
                                fill={colors[index % colors.length]}
                                className={styles.pieSlice}
                                style={{ opacity: 0.9 - index * 0.1 }}
                              />
                            )
                          })
                        })()}
                        <circle cx="100" cy="100" r="50" fill="#f5f0e8" />
                        <text x="100" y="100" textAnchor="middle" dominantBaseline="middle" className={styles.pieCenterText}>
                          Top 5
                        </text>
                      </svg>
                    </div>
                    <div className={styles.pieLegend}>
                      {top5Categories.map((category, index) => {
                        const percentage = totalRevenue > 0 ? ((category.tongDoanhThu / totalRevenue) * 100).toFixed(1) : 0
                        return (
                          <div key={category.loaiMon} className={styles.pieLegendItem}>
                            <div className={styles.pieLegendColor} style={{ backgroundColor: colors[index % colors.length] }} />
                            <div className={styles.pieLegendInfo}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span className={styles.rankBadge}>#{category.rank}</span>
                                <strong>{category.loaiMon}</strong>
                                <span className={styles.piePercentage}>{percentage}%</span>
                              </div>
                              <div style={{ fontSize: '0.85rem', color: '#7d6d5b', marginTop: '0.25rem' }}>
                                {category.soMon} món • {category.tongSoLuong} lượt bán
                              </div>
                              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#3f2c1f', marginTop: '0.25rem' }}>
                                {category.tongDoanhThu.toLocaleString('vi-VN')} ₫
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                Chưa có dữ liệu
              </div>
            )}
          </div>

          {/* Overview Summary */}
          {overview && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>
                  <FaClipboardCheck /> Tổng quan {dateFrom || dateTo ? 'kỳ chọn' : 'tuần này'}
                </h2>
                <span>
                  {dateFrom || dateTo 
                    ? `${dateFrom ? new Date(dateFrom).toLocaleDateString('vi-VN') : '...'} - ${dateTo ? new Date(dateTo).toLocaleDateString('vi-VN') : '...'}`
                    : 'Thống kê tổng hợp (7 ngày gần nhất)'
                  }
                </span>
              </div>
              <div className={styles.overviewList}>
                <div className={styles.overviewItem}>
                  <span>Tổng doanh thu:</span>
                  <strong>{overview.totalRevenue.toLocaleString('vi-VN')} ₫</strong>
                </div>
                <div className={styles.overviewItem}>
                  <span>Tổng chi phí:</span>
                  <strong>{overview.totalExpense.toLocaleString('vi-VN')} ₫</strong>
                </div>
                
                <div className={styles.overviewItem}>
                  <span>Số hóa đơn:</span>
                  <strong>{overview.invoiceCount}</strong>
                </div>
               
              </div>
            </div>
          )}
        </section>
      </div>
  )
}

export default StatisticPage

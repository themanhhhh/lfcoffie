'use client'
import React, { useEffect, useState } from 'react'
import {
  FaChartLine,
  FaStore,
  FaClipboardCheck,
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown,
  FaTrophy,
  FaTags
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

const StatisticPage = () => {
  const [overview, setOverview] = useState<ThongKeOverview | null>(null)
  const [revenueComparison, setRevenueComparison] = useState<RevenueComparison | null>(null)
  const [sevenDaysReport, setSevenDaysReport] = useState<SevenDaysReport | null>(null)
  const [top10Products, setTop10Products] = useState<Top10Product[]>([])
  const [top5Categories, setTop5Categories] = useState<Top5Category[]>([])
  const [revenueChannels, setRevenueChannels] = useState<RevenueByChannel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [
          overviewData,
          comparisonData,
          sevenDaysData,
          top10Data,
          top5Data,
          channelsData
        ] = await Promise.all([
          thongKeApi.getOverview(),
          thongKeApi.compareRevenueWithYesterday(),
          thongKeApi.get7DaysReport(),
          thongKeApi.getTop10Products(),
          thongKeApi.getTop5Categories(),
          thongKeApi.getRevenueByChannel()
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
  }, [])

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
          title: 'Lợi nhuận gộp',
          value: overview.grossProfit,
          change: overview.totalRevenue > 0 ? ((overview.grossProfit / overview.totalRevenue) * 100) : 0,
          positive: overview.grossProfit > 0,
          description: `Biên lợi nhuận ${overview.totalRevenue > 0 ? ((overview.grossProfit / overview.totalRevenue) * 100).toFixed(1) : 0}%`
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

  const totalRevenue = revenueChannels.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className={styles.container}>
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
              {revenueChannels.map(channel => {
                const width = totalRevenue > 0 ? Math.round((channel.value / totalRevenue) * 100) : 0
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
                <FaTrophy /> Top 10 món bán chạy
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
                  '#8B4513', // Brown
                  '#A0522D', // Sienna
                  '#CD853F', // Peru
                  '#D2691E', // Chocolate
                  '#DEB887'  // Burlywood
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
                  <FaClipboardCheck /> Tổng quan tuần này
                </h2>
                <span>Thống kê tổng hợp</span>
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
                  <span>Lợi nhuận gộp:</span>
                  <strong className={styles.profitText}>
                    {overview.grossProfit.toLocaleString('vi-VN')} ₫
                  </strong>
                </div>
                <div className={styles.overviewItem}>
                  <span>Số hóa đơn:</span>
                  <strong>{overview.invoiceCount}</strong>
                </div>
                {overview.totalRevenue > 0 && (
                  <div className={styles.overviewItem}>
                    <span>Tỷ suất lợi nhuận:</span>
                    <strong>
                      {((overview.grossProfit / overview.totalRevenue) * 100).toFixed(1)}%
                    </strong>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
  )
}

export default StatisticPage

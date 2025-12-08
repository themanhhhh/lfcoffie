'use client'

import React, { useEffect, useState, useMemo } from 'react'
import {
  FaSearch,
  FaTrash,
  FaEye,
  FaReceipt,
  FaFilter,
  FaTimes,
  FaCalendarAlt
} from 'react-icons/fa'
import styles from './orders.module.css'
import { donHangApi, chiTietDonHangApi, ApiError, DonHang, ChiTietDonHang } from '../../../lib/api'
import { toast } from 'react-hot-toast'

// Helper: format Date to YYYY-MM-DD in local timezone
const formatDateLocal = (date: Date) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<DonHang[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState(() => formatDateLocal(new Date()))
  const [dateTo, setDateTo] = useState(() => formatDateLocal(new Date()))
  const [selectedOrder, setSelectedOrder] = useState<DonHang | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [orderDetails, setOrderDetails] = useState<ChiTietDonHang[]>([])

  useEffect(() => {
    loadOrders()
  }, [dateFrom, dateTo])

  const loadOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const [ordersData, detailsData] = await Promise.all([
        donHangApi.getAll(),
        chiTietDonHangApi.getAll()
      ])

      // Attach order details to orders
      // Backend đã trả về phienLamViec trong donHang (eager loading)
      const ordersWithDetails = ordersData.map(order => {
        // Lấy phienLamViec từ chi tiết đơn hàng (nếu có) hoặc từ order trực tiếp
        const orderDetail = detailsData.find(d => 
          d.donHang?.MaDonHang === order.MaDonHang || d.MaDH === order.MaDonHang
        )
        const phienFromDetail = orderDetail?.donHang?.phienLamViec
        
        return {
          ...order,
          // Ưu tiên phienLamViec từ order, nếu không có thì lấy từ chi tiết
          phienLamViec: order.phienLamViec || phienFromDetail,
          chiTietDonHangs: detailsData.filter(detail => {
            const maDhFromRelation = detail.donHang?.MaDonHang
            const maDhScalar = detail.MaDH
            return maDhFromRelation === order.MaDonHang || maDhScalar === order.MaDonHang
          })
        }
      })
      
      setOrders(ordersWithDetails)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Không thể tải danh sách đơn hàng. Vui lòng thử lại.'
      )
    } finally {
      setLoading(false)
    }
  }

  const loadOrderDetails = async (maDonHang: string) => {
    try {
      const allDetails = await chiTietDonHangApi.getAll()
      const details = allDetails.filter(d => {
        const maDhFromRelation = d.donHang?.MaDonHang
        const maDhScalar = d.MaDH // MaDH đã có trong interface ChiTietDonHang
        return maDhFromRelation === maDonHang || maDhScalar === maDonHang
      })
      setOrderDetails(details)
    } catch (err) {
      console.error('Error loading order details:', err)
    }
  }

  const handleViewDetails = async (order: DonHang) => {
    setSelectedOrder(order)
    await loadOrderDetails(order.MaDonHang)
    setShowDetails(true)
  }

  const handleDeleteOrder = async (maDonHang: string) => {
    if (!confirm('Bạn có chắc muốn xóa đơn hàng này?')) {
      return
    }

    try {
      await donHangApi.delete(maDonHang)
      await loadOrders()
      toast.success('Xóa đơn hàng thành công!')
    } catch (err) {
      toast.error('Lỗi khi xóa đơn hàng: ' + (err instanceof ApiError ? err.message : 'Unknown error'))
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchSearch = 
        order.MaDonHang.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.PhuongThucThanhToan.toLowerCase().includes(searchTerm.toLowerCase())
      const matchPayment = paymentFilter === 'all' || order.PhuongThucThanhToan === paymentFilter
      
      // Filter by date range
      let matchDate = true
      if (dateFrom || dateTo) {
        const orderDate = new Date(order.Ngay)
        orderDate.setHours(0, 0, 0, 0)
        
        if (dateFrom) {
          const fromDate = new Date(dateFrom)
          fromDate.setHours(0, 0, 0, 0)
          if (orderDate < fromDate) {
            matchDate = false
          }
        }
        
        if (dateTo) {
          const toDate = new Date(dateTo)
          toDate.setHours(23, 59, 59, 999)
          if (orderDate > toDate) {
            matchDate = false
          }
        }
      }
      
      return matchSearch && matchPayment && matchDate
    })
  }, [orders, searchTerm, paymentFilter, dateFrom, dateTo])

  const handleQuickDateFilter = (type: 'today' | 'week' | 'month' | 'clear') => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (type === 'clear') {
      setDateFrom('')
      setDateTo('')
      return
    }
    
    if (type === 'today') {
      const dateStr = formatDateLocal(today)
      setDateFrom(dateStr)
      setDateTo(dateStr)
    } else if (type === 'week') {
      // Use Monday as start of week to today
      const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday ...
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - daysToMonday)
      setDateFrom(formatDateLocal(weekStart))
      setDateTo(formatDateLocal(today))
    } else if (type === 'month') {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      setDateFrom(formatDateLocal(monthStart))
      setDateTo(formatDateLocal(monthEnd))
    }
  }

  const totalRevenue = useMemo(() => {
    return filteredOrders.reduce((sum, order) => {
      const orderTotal = order.chiTietDonHangs?.reduce((total, detail) => 
        total + (detail.DonGia * detail.SoLuong), 0) || 0
      return sum + orderTotal
    }, 0)
  }, [filteredOrders])

  const paymentMethods = useMemo(() => {
    const methods = new Set(orders.map(o => o.PhuongThucThanhToan))
    return Array.from(methods)
  }, [orders])

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải dữ liệu...</div>
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

  return (
    <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerMain}>
            <h1>
              <FaReceipt /> Quản lý Đơn hàng
            </h1>
            <p>Quản lý và theo dõi các đơn hàng, hóa đơn</p>
          </div>
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span>Tổng đơn hôm nay:</span>
              <strong>{filteredOrders.length}</strong>
            </div>
            <div className={styles.statItem}>
              <span>Doanh thu hôm nay:</span>
              <strong>{totalRevenue.toLocaleString('vi-VN')} đ</strong>
            </div>
          </div>
        </div>

        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <FaSearch />
            <input
              type="text"
              placeholder="Tìm kiếm đơn hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Date Range Filter */}
          <div className={styles.dateFilterGroup}>
            <FaCalendarAlt />
            <div className={styles.dateInputs}>
              <input
                type="date"
                className={styles.dateInput}
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="Từ ngày"
              />
              <span className={styles.dateSeparator}>-</span>
              <input
                type="date"
                className={styles.dateInput}
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="Đến ngày"
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

          <div className={styles.filterGroup}>
            <FaFilter />
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="all">Tất cả phương thức</option>
              {paymentMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>Mã đơn hàng</th>
                <th>Ngày</th>
                <th>Phương thức thanh toán</th>
                <th>Phiên làm việc</th>
                <th>Khuyến mãi</th>
                <th>Tổng tiền</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => {
                const orderTotal = order.chiTietDonHangs?.reduce((total, detail) => 
                  total + (detail.DonGia * detail.SoLuong), 0) || 0
                
                return (
                  <tr key={order.MaDonHang}>
                    <td className={styles.orderCode}>{order.MaDonHang}</td>
                    <td>{new Date(order.Ngay).toLocaleString('vi-VN')}</td>
                    <td>{order.PhuongThucThanhToan}</td>
                    <td>
                      {order.phienLamViec ? (
                        <span title={`NV: ${order.phienLamViec.nhanVien?.TenNhanVien || 'N/A'}`}>
                          {order.phienLamViec.MaPhienLamViec}
                          {order.phienLamViec.caLam && ` (${order.phienLamViec.caLam.TenCaLam})`}
                        </span>
                      ) : order.MaPhienLamViec || '-'}
                    </td>
                    <td>{order.ctkm?.TenCTKM || '-'}</td>
                    <td className={styles.totalAmount}>
                      {orderTotal.toLocaleString('vi-VN')} đ
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.viewBtn}
                          onClick={() => handleViewDetails(order)}
                          title="Xem chi tiết"
                        >
                          <FaEye />
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteOrder(order.MaDonHang)}
                          title="Xóa"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className={styles.emptyState}>
              <FaReceipt />
              <h3>Không tìm thấy đơn hàng</h3>
              <p>Không có đơn hàng phù hợp với bộ lọc.</p>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {showDetails && selectedOrder && (
          <div className={styles.modalOverlay} onClick={() => setShowDetails(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Chi tiết đơn hàng: {selectedOrder.MaDonHang}</h2>
                <button className={styles.closeBtn} onClick={() => setShowDetails(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.orderInfo}>
                  <div className={styles.infoRow}>
                    <span>Ngày giờ:</span>
                    <span>{new Date(selectedOrder.Ngay).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span>Phương thức thanh toán:</span>
                    <span>{selectedOrder.PhuongThucThanhToan}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span>Loại đơn hàng:</span>
                    <span>{selectedOrder.LoaiDonHang || 'Chưa xác định'}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span>Phiên làm việc:</span>
                    <span>
                      {selectedOrder.phienLamViec ? (
                        <>
                          {selectedOrder.phienLamViec.MaPhienLamViec}
                          {selectedOrder.phienLamViec.caLam && ` - ${selectedOrder.phienLamViec.caLam.TenCaLam}`}
                        </>
                      ) : selectedOrder.MaPhienLamViec || 'N/A'}
                    </span>
                  </div>
                  {selectedOrder.phienLamViec?.nhanVien && (
                    <div className={styles.infoRow}>
                      <span>Nhân viên:</span>
                      <span>{selectedOrder.phienLamViec.nhanVien.TenNhanVien}</span>
                    </div>
                  )}
                  {selectedOrder.ctkm && (
                    <div className={styles.infoRow}>
                      <span>Khuyến mãi:</span>
                      <span>{selectedOrder.ctkm.TenCTKM}</span>
                    </div>
                  )}
                </div>

                <div className={styles.detailsTable}>
                  <h3>Chi tiết món</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Món</th>
                        <th>Đơn giá</th>
                        <th>Số lượng</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderDetails.map(detail => (
                        <tr key={detail.MaCTDH}>
                          <td>{detail.mon?.TenMon || detail.MaMon}</td>
                          <td>{detail.DonGia.toLocaleString('vi-VN')} đ</td>
                          <td>{detail.SoLuong}</td>
                          <td>{(detail.DonGia * detail.SoLuong).toLocaleString('vi-VN')} đ</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3}><strong>Tổng cộng:</strong></td>
                        <td>
                          <strong>
                            {orderDetails.reduce((sum, d) => sum + (d.DonGia * d.SoLuong), 0)
                              .toLocaleString('vi-VN')} đ
                          </strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}

export default OrdersPage


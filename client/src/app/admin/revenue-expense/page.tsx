'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaFilter,
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown,
  FaTimes,
  FaFileExcel
} from 'react-icons/fa'
import styles from './revenue-expense.module.css'
import { thuChiApi, nghiepVuApi, ApiError, ThuChi, NghiepVu } from '../../../lib/api'
import { toast } from 'react-hot-toast'
import { exportCashflowReport } from '../../../utils/excelExport'

const RevenueExpensePage = () => {
  const [transactions, setTransactions] = useState<ThuChi[]>([])
  const [categories, setCategories] = useState<NghiepVu[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<ThuChi | null>(null)
  const [formData, setFormData] = useState({
    MaGiaoDich: '',
    MaPhienLamViec: '',
    MaNghiepVu: '',
    ThoiGian: new Date().toISOString().split('T')[0],
    PhuongThucThanhToan: 'Tiền mặt',
    SoTien: 0,
    GhiChu: ''
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [transData, catData] = await Promise.all([
        thuChiApi.getAll(),
        nghiepVuApi.getAll()
      ])
      setTransactions(transData)
      setCategories(catData)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Không thể tải dữ liệu. Vui lòng thử lại.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  const loadFilteredTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const params: { startDate?: string; endDate?: string; loaiGiaoDich?: string } = {}
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate
      if (typeFilter !== 'all') params.loaiGiaoDich = typeFilter
      
      const data = await thuChiApi.getAll(params)
      setTransactions(data)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Không thể tải dữ liệu. Vui lòng thử lại.'
      )
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, typeFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (startDate || endDate || typeFilter !== 'all') {
      loadFilteredTransactions()
    } else {
      loadData()
    }
  }, [startDate, endDate, typeFilter, loadFilteredTransactions, loadData])

  const handleAddTransaction = () => {
    setEditingTransaction(null)
    setFormData({
      MaGiaoDich: '',
      MaPhienLamViec: '',
      MaNghiepVu: '',
      ThoiGian: new Date().toISOString().split('T')[0],
      PhuongThucThanhToan: 'Tiền mặt',
      SoTien: 0,
      GhiChu: ''
    })
    setShowModal(true)
  }

  const handleEditTransaction = (transaction: ThuChi) => {
    setEditingTransaction(transaction)
    setFormData({
      MaGiaoDich: transaction.MaGiaoDich,
      MaPhienLamViec: transaction.phienLamViec?.MaPhienLamViec || transaction.MaPhienLamViec || '',
      MaNghiepVu: transaction.nghiepVu?.MaNghiepVu || transaction.MaNghiepVu || '',
      ThoiGian: new Date(transaction.ThoiGian).toISOString().split('T')[0],
      PhuongThucThanhToan: transaction.PhuongThucThanhToan,
      SoTien: transaction.SoTien,
      GhiChu: transaction.GhiChu || ''
    })
    setShowModal(true)
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const submitData = {
        ...formData,
        ThoiGian: new Date(formData.ThoiGian).toISOString(),
        MaPhienLamViec: formData.MaPhienLamViec || undefined
      }

      if (editingTransaction) {
        await thuChiApi.update(editingTransaction.MaGiaoDich, submitData)
        toast.success('Cập nhật giao dịch thành công!')
      } else {
        await thuChiApi.create(submitData)
        toast.success('Thêm giao dịch mới thành công!')
      }

      setShowModal(false)
      await loadData()
    } catch (err) {
      toast.error('Lỗi: ' + (err instanceof ApiError ? err.message : 'Unknown error'))
    }
  }

  const handleDeleteTransaction = async (maGiaoDich: string) => {
    if (!confirm('Bạn có chắc muốn xóa giao dịch này?')) {
      return
    }

    try {
      await thuChiApi.delete(maGiaoDich)
      await loadData()
      toast.success('Xóa giao dịch thành công!')
    } catch (err) {
      toast.error('Lỗi khi xóa giao dịch: ' + (err instanceof ApiError ? err.message : 'Unknown error'))
    }
  }

  const filteredTransactions = useMemo(() => {
    return transactions.filter(trans => {
      const matchSearch = 
        trans.MaGiaoDich.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trans.nghiepVu?.TenNghiepVu.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trans.GhiChu?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchSearch
    })
  }, [transactions, searchTerm])

  const stats = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, trans) => {
        if (trans.nghiepVu?.LoaiGiaoDich === 'thu') {
          acc.revenue += trans.SoTien
        } else if (trans.nghiepVu?.LoaiGiaoDich === 'chi') {
          acc.expense += trans.SoTien
        }
        return acc
      },
      { revenue: 0, expense: 0 }
    )
  }, [filteredTransactions])

  const handleExportExcel = async () => {
    if (filteredTransactions.length === 0) {
      toast.error('Không có dữ liệu để xuất Excel')
      return
    }
    try {
      const exportStartDate = startDate || new Date().toISOString().split('T')[0]
      const exportEndDate = endDate || new Date().toISOString().split('T')[0]
      const totals = {
        in: stats.revenue,
        out: stats.expense
      }
      exportCashflowReport(filteredTransactions, totals, exportStartDate, exportEndDate)
      toast.success('Xuất Excel thành công!')
    } catch (err) {
      toast.error('Lỗi khi xuất Excel: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const revenueCategories = useMemo(() => {
    return categories.filter(cat => cat.LoaiGiaoDich === 'thu')
  }, [categories])

  const expenseCategories = useMemo(() => {
    return categories.filter(cat => cat.LoaiGiaoDich === 'chi')
  }, [categories])

  if (loading && transactions.length === 0) {
    return (
      <div className={styles.container}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải dữ liệu...</div>
      </div>
    )
  }

  if (error && transactions.length === 0) {
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
              <FaMoneyBillWave /> Quản lý Thu Chi
            </h1>
            <p>Quản lý các giao dịch thu chi của quán</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className={styles.addButton} onClick={handleExportExcel} disabled={filteredTransactions.length === 0}>
              <FaFileExcel /> Xuất Excel
            </button>
            <button className={styles.addButton} onClick={handleAddTransaction}>
              <FaPlus /> Thêm giao dịch
            </button>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FaArrowUp />
            </div>
            <div className={styles.statContent}>
              <span>Tổng thu</span>
              <strong>{stats.revenue.toLocaleString('vi-VN')} đ</strong>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.expenseIcon}`}>
              <FaArrowDown />
            </div>
            <div className={styles.statContent}>
              <span>Tổng chi</span>
              <strong>{stats.expense.toLocaleString('vi-VN')} đ</strong>
            </div>
          </div>
       
        </div>

        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <FaSearch />
            <input
              type="text"
              placeholder="Tìm kiếm giao dịch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.filterGroup}>
            <FaFilter />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">Tất cả loại</option>
              <option value="thu">Thu</option>
              <option value="chi">Chi</option>
            </select>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Từ ngày"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="Đến ngày"
            />
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.transactionsTable}>
            <thead>
              <tr>
                <th>Mã giao dịch</th>
                <th>Thời gian</th>
                <th>Nghiệp vụ</th>
                <th>Loại</th>
                <th>Số tiền</th>
                <th>Phương thức</th>
                <th>Ghi chú</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(trans => {
                const isRevenue = trans.nghiepVu?.LoaiGiaoDich === 'thu'
                return (
                  <tr key={trans.MaGiaoDich}>
                    <td className={styles.transCode}>{trans.MaGiaoDich}</td>
                    <td>{new Date(trans.ThoiGian).toLocaleString('vi-VN')}</td>
                    <td>{trans.nghiepVu?.TenNghiepVu || '-'}</td>
                    <td>
                      <span className={isRevenue ? styles.revenueTag : styles.expenseTag}>
                        {isRevenue ? 'Thu' : 'Chi'}
                      </span>
                    </td>
                    <td className={isRevenue ? styles.revenueAmount : styles.expenseAmount}>
                      {isRevenue ? '+' : '-'}{trans.SoTien.toLocaleString('vi-VN')} đ
                    </td>
                    <td>{trans.PhuongThucThanhToan}</td>
                    <td>{trans.GhiChu || '-'}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.editBtn}
                          onClick={() => handleEditTransaction(trans)}
                          title="Chỉnh sửa"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteTransaction(trans.MaGiaoDich)}
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

          {filteredTransactions.length === 0 && (
            <div className={styles.emptyState}>
              <FaMoneyBillWave />
              <h3>Không tìm thấy giao dịch</h3>
              <p>Không có giao dịch phù hợp với bộ lọc.</p>
            </div>
          )}
        </div>

        {/* Modal for Add/Edit Transaction */}
        {showModal && (
          <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{editingTransaction ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch mới'}</h2>
                <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleSubmitForm} className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label>Mã giao dịch *</label>
                  <input
                    type="text"
                    value={formData.MaGiaoDich}
                    onChange={(e) => setFormData({ ...formData, MaGiaoDich: e.target.value })}
                    disabled={!!editingTransaction}
                    required
                    placeholder="VD: GD001"
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Nghiệp vụ *</label>
                    <select
                      value={formData.MaNghiepVu}
                      onChange={(e) => setFormData({ ...formData, MaNghiepVu: e.target.value })}
                      required
                    >
                      <option value="">Chọn nghiệp vụ</option>
                      <optgroup label="Thu">
                        {revenueCategories.map(cat => (
                          <option key={cat.MaNghiepVu} value={cat.MaNghiepVu}>
                            {cat.TenNghiepVu}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Chi">
                        {expenseCategories.map(cat => (
                          <option key={cat.MaNghiepVu} value={cat.MaNghiepVu}>
                            {cat.TenNghiepVu}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Phiên làm việc</label>
                    <input
                      type="text"
                      value={formData.MaPhienLamViec}
                      onChange={(e) => setFormData({ ...formData, MaPhienLamViec: e.target.value })}
                      placeholder="VD: PLV001"
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Thời gian *</label>
                    <input
                      type="datetime-local"
                      value={formData.ThoiGian}
                      onChange={(e) => setFormData({ ...formData, ThoiGian: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Phương thức thanh toán *</label>
                    <select
                      value={formData.PhuongThucThanhToan}
                      onChange={(e) => setFormData({ ...formData, PhuongThucThanhToan: e.target.value })}
                      required
                    >
                      <option value="Tiền mặt">Tiền mặt</option>
                      <option value="Chuyển khoản">Chuyển khoản</option>
                      <option value="Thẻ">Thẻ</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Số tiền *</label>
                  <input
                    type="number"
                    value={formData.SoTien}
                    onChange={(e) => setFormData({ ...formData, SoTien: Number(e.target.value) })}
                    required
                    min="0"
                    placeholder="0"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Ghi chú</label>
                  <textarea
                    value={formData.GhiChu}
                    onChange={(e) => setFormData({ ...formData, GhiChu: e.target.value })}
                    rows={3}
                    placeholder="Ghi chú về giao dịch..."
                  />
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                    Hủy
                  </button>
                  <button type="submit" className={styles.submitBtn}>
                    {editingTransaction ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  )
}

export default RevenueExpensePage


'use client'
import React, { FormEvent, useMemo, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  FaArrowLeft,
  FaExchangeAlt,
  FaArrowCircleDown,
  FaArrowCircleUp,
  FaCalculator,
  FaFileInvoice
} from 'react-icons/fa'
import styles from './cashflow.module.css'
import { thuChiApi, nghiepVuApi, phienLamViecApi, ApiError, NghiepVu, ThuChi } from '../../../lib/api'
import { useAuth } from '../../../contexts/AuthContext'
import { toast } from 'react-hot-toast'

type TransactionType = 'in' | 'out'

interface Transaction {
  id: number
  type: TransactionType
  amount: number
  reason: string
  performedBy: string
  time: string
  phuongThucThanhToan: string
}

interface CashFormState {
  amount: string
  reason: string
  performedBy: string
  nghiepVu: string
  phuongThucThanhToan: string
}


const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
})

const buildInitialFormState = (): CashFormState => ({
  amount: '',
  reason: '',
  performedBy: '',
  nghiepVu: '',
  phuongThucThanhToan: 'Tiền mặt'
})

const CashflowPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [cashInForm, setCashInForm] = useState<CashFormState>(() => buildInitialFormState())
  const [cashOutForm, setCashOutForm] = useState<CashFormState>(() => buildInitialFormState())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPhienLamViec, setCurrentPhienLamViec] = useState<string | null>(null)
  const [nghiepVuThuList, setNghiepVuThuList] = useState<NghiepVu[]>([])
  const [nghiepVuChiList, setNghiepVuChiList] = useState<NghiepVu[]>([])
  const [paymentMethods, setPaymentMethods] = useState<string[]>(['Tiền mặt'])
  
  const { user } = useAuth()


  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const today = new Date().toISOString().split('T')[0]
      
      // Load nghiepvu for thu and chi, and payment methods
      const [nghiepVuThu, nghiepVuChi, paymentMethodsData] = await Promise.all([
        nghiepVuApi.getAll({ loaiGiaoDich: 'thu' }),
        nghiepVuApi.getAll({ loaiGiaoDich: 'chi' }),
        thuChiApi.getPaymentMethods().catch(() => ['Tiền mặt', 'Chuyển khoản', 'Thẻ']) // Fallback nếu API lỗi
      ])
      
      setNghiepVuThuList(nghiepVuThu)
      setNghiepVuChiList(nghiepVuChi)
      setPaymentMethods(paymentMethodsData.length > 0 ? paymentMethodsData : ['Tiền mặt', 'Chuyển khoản', 'Thẻ'])
      
      // Set default nghiepVu for forms
      if (nghiepVuThu.length > 0) {
        setCashInForm(prev => ({ ...prev, nghiepVu: nghiepVuThu[0].MaNghiepVu }))
      }
      if (nghiepVuChi.length > 0) {
        setCashOutForm(prev => ({ ...prev, nghiepVu: nghiepVuChi[0].MaNghiepVu }))
      }

      // Load current phien lam viec
      if (user?.MaNhanVien) {
        const phienLamViecList = await phienLamViecApi.getAll()
        const activePhien = phienLamViecList.find((plv) => {
          const maNhanVien = plv.MaNhanVien ?? plv.nhanVien?.MaNhanVien
          return maNhanVien === user.MaNhanVien && plv.TrangThai === 'mở'
        })
        if (activePhien) {
          setCurrentPhienLamViec(activePhien.MaPhienLamViec)
        } else {
          console.warn('Không tìm thấy phiên làm việc đang mở cho nhân viên:', user.MaNhanVien)
          console.log('Danh sách phiên làm việc:', phienLamViecList)
        }
      }

      // Load thu chi data - load tất cả rồi phân loại ở frontend để tránh mất dữ liệu khi MaNghiepVu null
      const allThuChiData = await thuChiApi.getAll({ startDate: today, endDate: today })
      
      // Phân loại thu/chi dựa trên nghiepVu hoặc dựa vào type từ form (nếu không có nghiepVu)
      // Nếu không có nghiepVu, sẽ không hiển thị, nhưng ít nhất sẽ load được tất cả dữ liệu
      const thuData = allThuChiData.filter(tc => tc.nghiepVu?.LoaiGiaoDich === 'thu')
      const chiData = allThuChiData.filter(tc => tc.nghiepVu?.LoaiGiaoDich === 'chi')
      
      // Nếu có dữ liệu không có nghiepVu, log để debug
      const dataWithoutNghiepVu = allThuChiData.filter(tc => !tc.nghiepVu)
      if (dataWithoutNghiepVu.length > 0) {
        console.warn('Có dữ liệu thu chi không có nghiepVu:', dataWithoutNghiepVu)
      }

      const allTransactions: Transaction[] = []
      let id = 1

      // Transform thu data
      thuData.forEach((tc) => {
        const date = new Date(tc.ThoiGian)
        allTransactions.push({
          id: id++,
          type: 'in',
          amount: tc.SoTien,
          reason: tc.nghiepVu?.TenNghiepVu || tc.GhiChu || 'Thu tiền',
          performedBy: tc.phienLamViec?.nhanVien?.TenNhanVien || 'N/A',
          time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
          phuongThucThanhToan: tc.PhuongThucThanhToan || 'Tiền mặt'
        })
      })

      // Transform chi data
      chiData.forEach((tc) => {
        const date = new Date(tc.ThoiGian)
        allTransactions.push({
          id: id++,
          type: 'out',
          amount: tc.SoTien,
          reason: tc.nghiepVu?.TenNghiepVu || tc.GhiChu || 'Chi tiền',
          performedBy: tc.phienLamViec?.nhanVien?.TenNhanVien || 'N/A',
          time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
          phuongThucThanhToan: tc.PhuongThucThanhToan || 'Tiền mặt'
        })
      })

      // Sắp xếp theo thời gian
      allTransactions.sort((a, b) => {
        const [aH, aM] = a.time.split(':').map(Number)
        const [bH, bM] = b.time.split(':').map(Number)
        return (bH * 60 + bM) - (aH * 60 + aM)
      })

      setTransactions(allTransactions)
    } catch (err) {
      console.error('Error loading cashflow data:', err)
      const errorMessage = err instanceof ApiError
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Không thể tải dữ liệu giao dịch. Vui lòng thử lại.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'in') {
          acc.in += transaction.amount
        } else {
          acc.out += transaction.amount
        }
        return acc
      },
      { in: 0, out: 0 }
    )
  }, [transactions])

  const netCash = totals.in - totals.out

  const handleFormChange = (
    type: TransactionType,
    key: keyof CashFormState,
    value: string
  ) => {
    if (type === 'in') {
      setCashInForm(prev => ({ ...prev, [key]: value }))
    } else {
      setCashOutForm(prev => ({ ...prev, [key]: value }))
    }
  }

  const handleSubmit = (type: TransactionType) => async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = type === 'in' ? cashInForm : cashOutForm
    const amount = Number(form.amount.replace(/\D/g, '')) || Number(form.amount)

    // Debug log
    console.log('Form data:', { 
      reason: form.reason, 
      amount: form.amount, 
      parsedAmount: amount, 
      nghiepVu: form.nghiepVu,
      phuongThucThanhToan: form.phuongThucThanhToan
    })

    if (!form.reason?.trim() || !amount || amount <= 0 || !form.nghiepVu?.trim()) {
      console.error('Validation failed:', {
        hasReason: !!form.reason?.trim(),
        hasAmount: !!amount && amount > 0,
        hasNghiepVu: !!form.nghiepVu?.trim()
      })
      toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc: số tiền, nội dung và nghiệp vụ.')
      return
    }

    // Kiểm tra và load lại phiên làm việc nếu chưa có
    let maPhienLamViec = currentPhienLamViec
    if (!maPhienLamViec && user?.MaNhanVien) {
      try {
        const phienLamViecList = await phienLamViecApi.getAll()
        const activePhien = phienLamViecList.find((plv) => {
          const maNhanVien = plv.MaNhanVien ?? plv.nhanVien?.MaNhanVien
          return maNhanVien === user.MaNhanVien && plv.TrangThai === 'mở'
        })
        if (activePhien) {
          maPhienLamViec = activePhien.MaPhienLamViec
          setCurrentPhienLamViec(maPhienLamViec)
        }
      } catch (err) {
        console.error('Error loading phien lam viec:', err)
      }
    }

    if (!maPhienLamViec) {
      toast.error('Chưa có phiên làm việc đang mở. Vui lòng mở phiên làm việc trước.')
      console.error('Không tìm thấy phiên làm việc đang mở. User:', user?.MaNhanVien)
      return
    }

    try {
      // Generate MaGiaoDich (max 10 characters: GD + 8 digits)
      const timestamp = Date.now().toString().slice(-8)
      const maGiaoDich = `GD${timestamp}`

      // Use reason as GhiChu
      const ghiChu = form.reason

      // Tạo ThoiGian với local timezone đúng
      // Format: YYYY-MM-DDTHH:mm:ss+HH:mm (với timezone offset)
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      
      // Tính timezone offset (ví dụ: +07:00 cho GMT+7)
      const offsetMinutes = now.getTimezoneOffset()
      const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60)
      const offsetMins = Math.abs(offsetMinutes) % 60
      const offsetSign = offsetMinutes <= 0 ? '+' : '-'
      const timezoneOffset = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMins).padStart(2, '0')}`
      
      const thoiGian = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${timezoneOffset}`

      interface CreateThuChiPayload {
        MaGiaoDich: string
        ThoiGian: string
        PhuongThucThanhToan: string
        GhiChu: string
        SoTien: number
        MaPhienLamViec?: string
        MaNghiepVu?: string
      }

      const payload: CreateThuChiPayload = {
        MaGiaoDich: maGiaoDich,
        ThoiGian: thoiGian,
        PhuongThucThanhToan: form.phuongThucThanhToan || 'Tiền mặt',
        GhiChu: ghiChu,
        SoTien: amount
      }
      
      // Chỉ thêm MaPhienLamViec và MaNghiepVu nếu có giá trị
      if (maPhienLamViec) {
        payload.MaPhienLamViec = maPhienLamViec
      }
      if (form.nghiepVu && form.nghiepVu.trim()) {
        payload.MaNghiepVu = form.nghiepVu
      }
      
      console.log('Submitting payload:', payload)

      await thuChiApi.create(payload)

      if (type === 'in') {
        setCashInForm(buildInitialFormState())
      } else {
        setCashOutForm(buildInitialFormState())
      }

      // Reload data to get the latest transactions
      // Thêm delay nhỏ để đảm bảo database đã commit transaction
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Force reload bằng cách gọi lại logic load thu chi data
      try {
        const today = new Date().toISOString().split('T')[0]
        // Load tất cả rồi phân loại ở frontend
        const allThuChiData = await thuChiApi.getAll({ startDate: today, endDate: today })
        const thuData = allThuChiData.filter(tc => tc.nghiepVu?.LoaiGiaoDich === 'thu')
        const chiData = allThuChiData.filter(tc => tc.nghiepVu?.LoaiGiaoDich === 'chi')

        const allTransactions: Transaction[] = []
        let id = 1

        // Transform thu data
        thuData.forEach((tc) => {
          const date = new Date(tc.ThoiGian)
          allTransactions.push({
            id: id++,
            type: 'in',
            amount: tc.SoTien,
            reason: tc.nghiepVu?.TenNghiepVu || tc.GhiChu || 'Thu tiền',
            performedBy: tc.phienLamViec?.nhanVien?.TenNhanVien || 'N/A',
            time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
            phuongThucThanhToan: tc.PhuongThucThanhToan || 'Tiền mặt'
          })
        })

        // Transform chi data
        chiData.forEach((tc) => {
          const date = new Date(tc.ThoiGian)
          allTransactions.push({
            id: id++,
            type: 'out',
            amount: tc.SoTien,
            reason: tc.nghiepVu?.TenNghiepVu || tc.GhiChu || 'Chi tiền',
            performedBy: tc.phienLamViec?.nhanVien?.TenNhanVien || 'N/A',
            time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
            phuongThucThanhToan: tc.PhuongThucThanhToan || 'Tiền mặt'
          })
        })

        // Sắp xếp theo thời gian
        allTransactions.sort((a, b) => {
          const [aH, aM] = a.time.split(':').map(Number)
          const [bH, bM] = b.time.split(':').map(Number)
          return (bH * 60 + bM) - (aH * 60 + aM)
        })

        setTransactions(allTransactions)
        console.log('Reloaded transactions:', allTransactions.length, 'items')
      } catch (reloadErr) {
        console.error('Error reloading transactions:', reloadErr)
        // Fallback: gọi loadData nếu reload thủ công thất bại
      await loadData()
      }

      toast.success('Ghi nhận giao dịch thành công!')
    } catch (err) {
      toast.error('Lỗi khi ghi nhận giao dịch: ' + (err instanceof ApiError ? err.message : 'Unknown error'))
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerMain}>
            <h1>Đang tải dữ liệu...</h1>
          </div>
        </header>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerMain}>
            <h1 style={{ color: 'red' }}>{error}</h1>
            <Link href="/staff" className={styles.backLink}>
              <FaArrowLeft /> Quay lại
            </Link>
          </div>
        </header>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerMain}>
          <Link href="/staff" className={styles.backLink}>
            <FaArrowLeft /> Quay về quầy bán hàng
          </Link>
          <h1>Quản lý thu chi trong ca</h1>
          <p>Theo dõi dòng tiền mặt, phiếu thu và chi tạm ứng trong ngày làm việc.</p>
        </div>
        <div className={styles.headerBadge}>
          <FaExchangeAlt />
        </div>
      </header>

      <section className={styles.summary}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon + ' ' + styles.summaryIconIn}>
            <FaArrowCircleDown />
          </div>
          <div>
            <span>Tiền thu trong ngày</span>
            <strong>{currencyFormatter.format(totals.in)}</strong>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon + ' ' + styles.summaryIconOut}>
            <FaArrowCircleUp />
          </div>
          <div>
            <span>Tiền chi trong ngày</span>
            <strong>{currencyFormatter.format(totals.out)}</strong>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon + ' ' + styles.summaryIconNet}>
            <FaCalculator />
          </div>
          <div>
            <span>Tăng/giảm quỹ</span>
            <strong>{currencyFormatter.format(netCash)}</strong>
          </div>
        </div>
      </section>

      <div className={styles.forms}>
        <form className={styles.formCard} onSubmit={handleSubmit('in')}>
          <div className={styles.formHeader}>
            <h2><FaArrowCircleDown /> Phiếu thu</h2>
            <span>Ghi nhận tiền vào quỹ (khách thanh toán, thu tạm ứng...)</span>
          </div>
          <label className={styles.field}>
            <span>Số tiền</span>
            <input
              type="number"
              min={0}
              placeholder="Ví dụ: 1500000"
              value={cashInForm.amount}
              onChange={event => handleFormChange('in', 'amount', event.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Nghiệp vụ thu <span style={{ color: 'red' }}>*</span></span>
            <select
              value={cashInForm.nghiepVu}
              onChange={event => handleFormChange('in', 'nghiepVu', event.target.value)}
              required
            >
              {nghiepVuThuList.length === 0 ? (
                <option value="">Chưa có nghiệp vụ thu</option>
              ) : (
                nghiepVuThuList.map((nv) => (
                <option key={nv.MaNghiepVu} value={nv.MaNghiepVu}>
                  {nv.TenNghiepVu}
                </option>
                ))
              )}
            </select>
          </label>
          <label className={styles.field}>
            <span>Nội dung thu <span style={{ color: 'red' }}>*</span></span>
            <input
              type="text"
              placeholder="Lý do thu tiền"
              value={cashInForm.reason}
              onChange={event => handleFormChange('in', 'reason', event.target.value)}
              required
            />
          </label>
          <label className={styles.field}>
            <span>Phương thức thanh toán <span style={{ color: 'red' }}>*</span></span>
            <select
              value={cashInForm.phuongThucThanhToan}
              onChange={event => handleFormChange('in', 'phuongThucThanhToan', event.target.value)}
              required
            >
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className={styles.submitIn}>
            Lưu phiếu thu
          </button>
        </form>

        <form className={styles.formCard} onSubmit={handleSubmit('out')}>
          <div className={styles.formHeader}>
            <h2><FaArrowCircleUp /> Phiếu chi</h2>
            <span>Ghi nhận chi phí phát sinh, tạm ứng, hoàn tiền...</span>
          </div>
          <label className={styles.field}>
            <span>Số tiền</span>
            <input
              type="number"
              min={0}
              placeholder="Ví dụ: 300000"
              value={cashOutForm.amount}
              onChange={event => handleFormChange('out', 'amount', event.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Nghiệp vụ chi <span style={{ color: 'red' }}>*</span></span>
            <select
              value={cashOutForm.nghiepVu}
              onChange={event => handleFormChange('out', 'nghiepVu', event.target.value)}
              required
            >
              {nghiepVuChiList.length === 0 ? (
                <option value="">Chưa có nghiệp vụ chi</option>
              ) : (
                nghiepVuChiList.map((nv) => (
                <option key={nv.MaNghiepVu} value={nv.MaNghiepVu}>
                  {nv.TenNghiepVu}
                </option>
                ))
              )}
            </select>
          </label>
          <label className={styles.field}>
            <span>Nội dung chi <span style={{ color: 'red' }}>*</span></span>
            <input
              type="text"
              placeholder="Lý do chi tiền"
              value={cashOutForm.reason}
              onChange={event => handleFormChange('out', 'reason', event.target.value)}
              required
            />
          </label>
          <label className={styles.field}>
            <span>Phương thức thanh toán <span style={{ color: 'red' }}>*</span></span>
            <select
              value={cashOutForm.phuongThucThanhToan}
              onChange={event => handleFormChange('out', 'phuongThucThanhToan', event.target.value)}
              required
            >
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className={styles.submitOut}>
            Lưu phiếu chi
          </button>
        </form>
      </div>

      <section className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <h2><FaFileInvoice /> Lịch sử thu chi</h2>
          <span>Ghi nhận {transactions.length} giao dịch trong ca hiện tại</span>
        </div>
        <div className={styles.tableWrapper}>
          <table>
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Loại</th>
                <th>Số tiền</th>
                <th>Nội dung</th>
                <th>Phương thức</th>
                <th>Nhân viên</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id}>
                  <td>{transaction.time}</td>
                  <td>
                    <span
                      className={
                        transaction.type === 'in' ? styles.badgeIn : styles.badgeOut
                      }
                    >
                      {transaction.type === 'in' ? 'Thu' : 'Chi'}
                    </span>
                  </td>
                  <td>{currencyFormatter.format(transaction.amount)}</td>
                  <td>{transaction.reason}</td>
                  <td>{transaction.phuongThucThanhToan}</td>
                  <td>{transaction.performedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default CashflowPage

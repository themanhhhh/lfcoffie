'use client'
import React, { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaArrowLeft, FaDoorOpen, FaMoneyBillWave, FaClipboardList, FaClock, FaUserClock, FaCheckCircle, FaSync } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { phienLamViecApi, caLamApi, ApiError, CaLam } from '@/lib/api'
import styles from './openShift.module.css'

type ShiftKey = 'morning' | 'afternoon' | 'evening'

interface ShiftInfo {
  date: string
  shift: ShiftKey
  supervisor: string
  supportStaff: string
  note: string
}

interface CashRow {
  label: string
  value: number
  quantity: number
}

const SHIFT_DETAILS: Record<ShiftKey, { label: string; time: string; checklist: string[] }> = {
  morning: {
    label: 'Ca sáng',
    time: '07:00 - 12:00',
    checklist: ['Vệ sinh quầy', 'Kiểm kho nguyên liệu', 'Chuẩn bị máy pha']
  },
  afternoon: {
    label: 'Ca chiều',
    time: '12:00 - 17:00',
    checklist: ['Bàn giao tồn ca sáng', 'Kiểm tra doanh thu tạm tính', 'Chuẩn bị món theo giờ']
  },
  evening: {
    label: 'Ca tối',
    time: '17:00 - 22:00',
    checklist: ['Chuẩn bị tồn kho cuối ngày', 'Kiểm tra lịch đặt bàn', 'Vệ sinh khu vực khách']
  }
}

const CASH_TEMPLATE: CashRow[] = [
  { label: 'Tiền 500.000đ', value: 500000, quantity: 0 },
  { label: 'Tiền 200.000đ', value: 200000, quantity: 0 },
  { label: 'Tiền 100.000đ', value: 100000, quantity: 0 },
  { label: 'Tiền 50.000đ', value: 50000, quantity: 0 },
  { label: 'Tiền 20.000đ', value: 20000, quantity: 0 },
  { label: 'Tiền 10.000đ', value: 10000, quantity: 0 },
  { label: 'Tiền 5.000đ', value: 5000, quantity: 0 },
  { label: 'Tiền 2.000đ', value: 2000, quantity: 0 },
  { label: 'Tiền 1.000đ', value: 1000, quantity: 0 }
]

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
})

const OpenShiftPage = () => {
  const router = useRouter()
  const { user } = useAuth()
  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  const [shiftInfo, setShiftInfo] = useState<ShiftInfo>({
    date: today,
    shift: 'morning',
    supervisor: '',
    supportStaff: '',
    note: ''
  })

  const [cashRows, setCashRows] = useState<CashRow[]>(CASH_TEMPLATE)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [caLamList, setCaLamList] = useState<CaLam[]>([])
  const [selectedMaCaLam, setSelectedMaCaLam] = useState<string>('')

  const totalOpeningCash = useMemo(
    () => cashRows.reduce((sum, row) => sum + row.value * row.quantity, 0),
    [cashRows]
  )

  // Fetch ca làm việc từ API
    const fetchCaLam = async () => {
      try {
        const list = await caLamApi.getAll()
      setCaLamList(list)
      
      // Tự động chọn ca đầu tiên nếu có và chưa chọn ca nào
      if (list.length > 0 && !selectedMaCaLam) {
        setSelectedMaCaLam(list[0].MaCaLam)
      }
      } catch (err) {
        console.error('Error fetching ca lam:', err)
        toast.error('Không thể tải danh sách ca làm việc')
      }
    }
    
  useEffect(() => {
    fetchCaLam()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleShiftInfoChange = <K extends keyof ShiftInfo>(key: K, value: ShiftInfo[K]) => {
    setShiftInfo(prev => ({ ...prev, [key]: value }))
  }

  const handleCashQuantityChange = (index: number, quantity: number) => {
    setCashRows(prev =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, quantity: Math.max(0, quantity) } : row
      )
    )
  }

  const handleIncrement = (index: number) => {
    setCashRows(prev =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, quantity: row.quantity + 1 } : row
      )
    )
  }

  const handleDecrement = (index: number) => {
    setCashRows(prev =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, quantity: Math.max(0, row.quantity - 1) } : row
      )
    )
  }

  const handleStartShift = async () => {
    if (!user?.MaNhanVien) {
      toast.error('Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.')
      return
    }

    // Validate required fields
    if (!shiftInfo.supervisor.trim()) {
      toast.error('Vui lòng nhập tên thu ngân chính')
      return
    }

    if (!selectedMaCaLam) {
      toast.error('Vui lòng chọn ca làm việc')
      return
    }

    setIsSubmitting(true)
    try {
      // Generate MaPhienLamViec (max 10 characters: PLV + 7 digits)
      const timestamp = Date.now().toString().slice(-7)
      const maPhienLamViec = `PLV${timestamp}`

      // Use selectedMaCaLam directly from dropdown
      const maCaLam = selectedMaCaLam

      // Create new phien lam viec
      await phienLamViecApi.create({
        MaPhienLamViec: maPhienLamViec,
        MaCaLam: maCaLam,
        MaNhanVien: user.MaNhanVien,
        Ngay: shiftInfo.date,
        TrangThai: 'mở'
      })

      // Open the shift
      await phienLamViecApi.openShift(maPhienLamViec)

      toast.success('Mở phiên làm việc thành công!')
      
      // Redirect to staff page
      router.push('/staff')
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Không thể mở phiên làm việc. Vui lòng thử lại.'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerMain}>
          <Link href="/staff" className={styles.backLink}>
            <FaArrowLeft /> Quay về quầy bán hàng
          </Link>
          <h1>Mở phiên làm việc</h1>
          <p>Bật chế độ bán hàng cho ca hiện tại và ghi nhận số quỹ đầu ca.</p>
        </div>
        <div className={styles.headerBadge}>
          <FaDoorOpen />
        </div>
      </header>

      <div className={styles.layout}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2><FaClipboardList /> Thông tin phiên</h2>
              <span>Cập nhật ca làm việc và người phụ trách</span>
            </div>
          </div>

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Ngày làm việc</span>
              <input
                type="date"
                value={shiftInfo.date}
                onChange={event => handleShiftInfoChange('date', event.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span>Chọn ca</span>
              <div className={styles.selectWithRefresh}>
              <select
                  value={selectedMaCaLam}
                  onChange={event => setSelectedMaCaLam(event.target.value)}
              >
                  <option value="">-- Chọn ca làm việc --</option>
                  {caLamList.map((caLam) => (
                    <option key={caLam.MaCaLam} value={caLam.MaCaLam}>
                      {caLam.TenCaLam} ({caLam.ThoiGianBatDau} - {caLam.ThoiGianKetThuc})
                    </option>
                  ))}
              </select>
                <button
                  type="button"
                  onClick={fetchCaLam}
                  className={styles.refreshBtn}
                  title="Làm mới danh sách ca"
                >
                  <FaSync />
                </button>
              </div>
            </label>

            <label className={styles.field}>
              <span>Thu ngân chính</span>
              <input
                type="text"
                placeholder="Nhập tên nhân viên phụ trách"
                value={shiftInfo.supervisor}
                onChange={event => handleShiftInfoChange('supervisor', event.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span>Nhân viên hỗ trợ</span>
              <input
                type="text"
                placeholder="Tên nhân viên hỗ trợ trong ca"
                value={shiftInfo.supportStaff}
                onChange={event => handleShiftInfoChange('supportStaff', event.target.value)}
              />
            </label>

            <label className={`${styles.field} ${styles.fullWidth}`}>
              <span>Ghi chú ca</span>
              <textarea
                placeholder="Nhập ghi chú cho ca (ví dụ: event, đặt bàn, lưu ý đặc biệt...)"
                value={shiftInfo.note}
                onChange={event => handleShiftInfoChange('note', event.target.value)}
                rows={3}
              />
            </label>
          </div>

          <div className={styles.shiftSummary}>
            <div>
              <h3><FaClock /> Thời gian ca</h3>
              <p>{SHIFT_DETAILS[shiftInfo.shift].label} · {SHIFT_DETAILS[shiftInfo.shift].time}</p>
            </div>
            <div className={styles.checklist}>
              <h4><FaUserClock /> Checklist đầu ca</h4>
              <ul>
                {SHIFT_DETAILS[shiftInfo.shift].checklist.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2><FaMoneyBillWave /> Nhập tiền đầu phiên</h2>
              <span>Kiểm đếm tiền mặt tại quầy thu ngân</span>
            </div>
          </div>

          <div className={styles.cashTable}>
            <div className={`${styles.cashRow} ${styles.cashHeader}`}>
              <span>Mệnh giá</span>
              <span>Số lượng</span>
              <span>Thành tiền</span>
            </div>
            {cashRows.map((row, index) => (
              <div key={row.label} className={styles.cashRow}>
                <span>{row.label}</span>
                <div className={styles.quantityControl}>
                  <button
                    type="button"
                    className={styles.quantityButton}
                    onClick={() => handleDecrement(index)}
                    disabled={row.quantity === 0}
                  >
                    −
                  </button>
                <input
                  type="number"
                  min={0}
                  value={row.quantity}
                  onChange={event =>
                    handleCashQuantityChange(index, Number(event.target.value) || 0)
                  }
                />
                  <button
                    type="button"
                    className={styles.quantityButton}
                    onClick={() => handleIncrement(index)}
                  >
                    +
                  </button>
                </div>
                <strong>{currencyFormatter.format(row.value * row.quantity)}</strong>
              </div>
            ))}
          </div>

          <div className={styles.cashFooter}>
            <div>
              <span>Tổng tiền mặt đầu phiên</span>
              <strong>{currencyFormatter.format(totalOpeningCash)}</strong>
            </div>
            <p>Nhớ đối chiếu với biên bản bàn giao cuối ca trước.</p>
          </div>
        </section>

        <section className={`${styles.section} ${styles.summarySection}`}>
          <div className={styles.sectionHeader}>
            <div>
              <h2><FaCheckCircle /> Xác nhận mở phiên</h2>
              <span>Kiểm tra thông tin trước khi bắt đầu bán hàng</span>
            </div>
          </div>

          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <h3>Thông tin ca</h3>
              <ul>
                <li>Ngày làm việc: {shiftInfo.date}</li>
                <li>Ca: {SHIFT_DETAILS[shiftInfo.shift].label}</li>
                <li>Thời gian: {SHIFT_DETAILS[shiftInfo.shift].time}</li>
              </ul>
            </div>
            <div className={styles.summaryCard}>
              <h3>Nhân sự</h3>
              <ul>
                <li>Thu ngân: {shiftInfo.supervisor || 'Chưa cập nhật'}</li>
                <li>Hỗ trợ: {shiftInfo.supportStaff || 'Chưa cập nhật'}</li>
              </ul>
            </div>
            <div className={styles.summaryCard}>
              <h3>Quỹ đầu ca</h3>
              <p className={styles.summaryAmount}>{currencyFormatter.format(totalOpeningCash)}</p>
            </div>
          </div>

          {shiftInfo.note && (
            <div className={styles.noteBlock}>
              <strong>Ghi chú:</strong>
              <p>{shiftInfo.note}</p>
            </div>
          )}

          <button 
            className={styles.submitButton} 
            onClick={handleStartShift}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Bắt đầu phiên làm việc'}
          </button>
        </section>
      </div>
    </div>
  )
}

export default OpenShiftPage

'use client'
import React, { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FaArrowLeft,
  FaUserCheck,
  FaClock,
  FaUserTie,
  FaSignInAlt,
  FaSignOutAlt,
  FaClipboardCheck
} from 'react-icons/fa'
import styles from './checkinCheckout.module.css'
import { useAuth } from '../../../contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { phienLamViecApi, ApiError } from '../../../lib/api'

type ShiftStatus = 'pending' | 'working' | 'completed'

type HistoryAction = 'checkin' | 'checkout'

interface HistoryItem {
  action: HistoryAction
  time: string
  note?: string
}

interface StaffShift {
  id: string
  name: string
  role: string
  status: ShiftStatus
  checkIn?: string
  checkOut?: string
  note?: string
  history: HistoryItem[]
}

const CheckinCheckoutPage = () => {
  const [staffShifts, setStaffShifts] = useState<StaffShift[]>([])
  const [selectedStaffId, setSelectedStaffId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.MaNhanVien) {
      setError('Không tìm thấy thông tin nhân viên')
      setLoading(false)
      return
    }

    // Load history from localStorage
    const storageKey = `checkin_history_${user.MaNhanVien}`
    const savedHistory = localStorage.getItem(storageKey)
    let history: HistoryItem[] = []
    let savedStatus: ShiftStatus = 'pending'
    let savedCheckIn: string | undefined = undefined
    let savedCheckOut: string | undefined = undefined

    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory)
        history = parsed.history || []
        savedStatus = parsed.status || 'pending'
        savedCheckIn = parsed.checkIn
        savedCheckOut = parsed.checkOut
      } catch (e) {
        console.error('Error parsing saved history:', e)
      }
    }

    // Sử dụng trực tiếp thông tin từ user context
    const mapped: StaffShift[] = [{
      id: user.MaNhanVien,
      name: user.TenNhanVien || 'Không tên',
      role: user.ChucVu || 'Nhân viên',
      status: savedStatus,
      checkIn: savedCheckIn,
      checkOut: savedCheckOut,
      history: history
    }]

    setStaffShifts(mapped)
    setSelectedStaffId(user.MaNhanVien)
    setLoading(false)
  }, [user])

  const selectedStaff = useMemo(
    () => staffShifts.find(staff => staff.id === selectedStaffId),
    [selectedStaffId, staffShifts]
  )

  const formatNow = () =>
    new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

  const updateStaff = (id: string, updater: (staff: StaffShift) => StaffShift) => {
    setStaffShifts(prev => {
      const updated = prev.map(staff => (staff.id === id ? updater(staff) : staff))
      // Save to localStorage
      const updatedStaff = updated.find(s => s.id === id)
      if (updatedStaff && user?.MaNhanVien) {
        const storageKey = `checkin_history_${user.MaNhanVien}`
        localStorage.setItem(storageKey, JSON.stringify({
          status: updatedStaff.status,
          checkIn: updatedStaff.checkIn,
          checkOut: updatedStaff.checkOut,
          history: updatedStaff.history
        }))
      }
      return updated
    })
  }

  const handleCheckIn = () => {
    if (!selectedStaff) return
    if (selectedStaff.status === 'working') {
      toast.error('Nhân viên đã check-in trong ca.')
      return
    }
    const time = formatNow()
    updateStaff(selectedStaff.id, staff => ({
      ...staff,
      status: 'working',
      checkIn: time,
      history: [{ action: 'checkin', time }, ...staff.history]
    }))
  }

  const handleCheckOut = async () => {
    if (!selectedStaff) return
    if (selectedStaff.status === 'pending') {
      toast.error('Nhân viên chưa check-in.')
      return
    }
    if (selectedStaff.status === 'completed') {
      toast.error('Nhân viên đã kết ca.')
      return
    }

    try {
      // Tìm phiên làm việc đang mở của nhân viên này
      const phienLamViecList = await phienLamViecApi.getAll()
      const currentPhien = phienLamViecList.find((plv) => {
        // Kiểm tra cả MaNhanVien trực tiếp và qua relation nhanVien
        const maNhanVien = plv.MaNhanVien ?? plv.nhanVien?.MaNhanVien
        return maNhanVien === user?.MaNhanVien && plv.TrangThai === 'mở'
      })

      if (currentPhien) {
        // Đóng phiên làm việc trong database
        await phienLamViecApi.closeShift(currentPhien.MaPhienLamViec)
        toast.success('Đã đóng phiên làm việc và kết ca thành công!')
      } else {
        toast.error('Không tìm thấy phiên làm việc đang mở')
        return
      }

      const time = formatNow()
      updateStaff(selectedStaff.id, staff => ({
        ...staff,
        status: 'completed',
        checkOut: time,
        history: [{ action: 'checkout', time }, ...staff.history]
      }))
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Không thể đóng phiên làm việc'
      toast.error(errorMessage)
    }
  }

  const statusLabel: Record<ShiftStatus, string> = {
    pending: 'Chưa vào ca',
    working: 'Đang làm việc',
    completed: 'Đã kết ca'
  }

  const statusClass: Record<ShiftStatus, string> = {
    pending: styles.statusPending,
    working: styles.statusWorking,
    completed: styles.statusCompleted
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
          <h1>Điểm danh ca làm việc</h1>
          <p>Ghi nhận thời gian check-in / check-out của nhân viên trong ngày.</p>
        </div>
        <div className={styles.headerBadge}>
          <FaUserCheck />
        </div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <h2><FaClipboardCheck /> Thông tin ca làm việc</h2>
          {staffShifts && staffShifts.length > 0 && (
            <ul>
              {staffShifts.map((staff) => (
                <li
                  key={staff.id}
                  className={`${styles.staffItem} ${styles.staffItemActive}`}
                >
                  <div className={styles.staffInfo}>
                    <strong>{staff.name}</strong>
                    <span><FaUserTie /> {staff.role}</span>
                  </div>
                  <div className={`${styles.statusBadge} ${statusClass[staff.status]}`}>
                    {statusLabel[staff.status]}
                  </div>
                  <div className={styles.timeInfo}>
                    <span><FaSignInAlt /> {staff.checkIn || '—'}</span>
                    <span><FaSignOutAlt /> {staff.checkOut || '—'}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className={styles.content}>
          {selectedStaff ? (
            <>
              <div className={styles.contentHeader}>
                <div>
                  <h2>{selectedStaff.name}</h2>
                  <span>{selectedStaff.role}</span>
                </div>
                <div className={`${styles.statusBadge} ${statusClass[selectedStaff.status]}`}>
                  {statusLabel[selectedStaff.status]}
                </div>
              </div>

              <div className={styles.currentState}>
                <div>
                  <span>Thời gian vào ca</span>
                  <strong>{selectedStaff.checkIn || 'Chưa điểm danh'}</strong>
                </div>
                <div>
                  <span>Thời gian kết ca</span>
                  <strong>{selectedStaff.checkOut || 'Chưa kết ca'}</strong>
                </div>
                <div>
                  <span>Ghi chú gần nhất</span>
                  <strong>
                    {selectedStaff.history[0]?.note
                      ? selectedStaff.history[0].note
                      : 'Không có'}
                  </strong>
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.checkInBtn}
                  type="button"
                  onClick={handleCheckIn}
                >
                  <FaSignInAlt /> Check-in
                </button>
                <button
                  className={styles.checkOutBtn}
                  type="button"
                  onClick={handleCheckOut}
                >
                  <FaSignOutAlt /> Check-out
                </button>
              </div>

              <div className={styles.timeline}>
                <h3><FaClock /> Lịch sử thao tác</h3>
                {selectedStaff.history.length === 0 ? (
                  <p className={styles.emptyTimeline}>Chưa có lịch sử cho nhân viên này.</p>
                ) : (
                  <ul>
                    {selectedStaff.history.map((item, index) => (
                      <li key={`${item.action}-${item.time}-${index}`}>
                        <div className={styles.timelinePoint} />
                        <div className={styles.timelineContent}>
                          <span className={styles.timelineTime}>{item.time}</span>
                          <strong>
                            {item.action === 'checkin' ? 'Check-in' : 'Check-out'}
                          </strong>
                          {item.note && <p>{item.note}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <FaUserCheck />
              <p>Chọn một nhân viên ở danh sách bên trái để xem chi tiết ca làm việc.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default CheckinCheckoutPage

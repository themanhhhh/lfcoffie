'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  FaUserPlus,
  FaSearch,
  FaUserTie,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendarAlt
} from 'react-icons/fa'
import { MdOutlineSchedule, MdOutlineAccessTime } from 'react-icons/md'
import { FaTimes } from 'react-icons/fa'
import styles from './staff.module.css'
import { nhanVienApi, donHangApi, caLamApi, ApiError, CaLam } from '../../../lib/api'
import { toast } from 'react-hot-toast'

type StaffStatus = 'active' | 'probation' | 'leave'

interface StaffMember {
  id: string
  name: string
  role: string
  department: string
  status: StaffStatus
  shift: string
  phone: string
  email: string
  joinDate: string
  lastShift: string
  totalShifts: number
  address: string
  username: string
  gender: string
  birthDate: string
}

const STATUS_OPTIONS: { value: 'all' | StaffStatus; label: string }[] = [
  { value: 'all', label: 'Trạng thái' },
  { value: 'active', label: 'Đang làm việc' },
  { value: 'probation', label: 'Thử việc' },
  { value: 'leave', label: 'Thôi việc' }
]

const statusClassName: Record<StaffStatus, string> = {
  active: styles.statusActive,
  probation: styles.statusProbation,
  leave: styles.statusLeave
}

const statusLabel: Record<StaffStatus, string> = {
  active: 'Đang làm việc',
  probation: 'Thử việc',
  leave: 'Thôi việc'
}

const formatDate = (value?: string | null) => {
  if (!value) return 'Chưa cập nhật'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Chưa cập nhật'
  return date.toLocaleDateString('vi-VN')
}

const daysBetween = (value?: string | null) => {
  if (!value) return Number.POSITIVE_INFINITY
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return Number.POSITIVE_INFINITY
  const diff = Date.now() - date.getTime()
  return diff / (1000 * 60 * 60 * 24)
}

interface NhanVienFormData {
  MaNhanVien: string
  TenNhanVien: string
  SoDienThoai: string
  ChucVu: string
  GioiTinh: string
  NgaySinh: string
  TaiKhoan: string
  MatKhau: string
  MaCaLam: string
  TrangThai: string
}

const StaffPage = () => {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | StaffStatus>('all')
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [caLamList, setCaLamList] = useState<CaLam[]>([])
  const [formData, setFormData] = useState<NhanVienFormData>({
    MaNhanVien: '',
    TenNhanVien: '',
    SoDienThoai: '',
    ChucVu: '',
    GioiTinh: 'Nam',
    NgaySinh: '',
    TaiKhoan: '',
    MatKhau: '',
    MaCaLam: '',
    TrangThai: 'active'
  })

  useEffect(() => {
    let ignore = false

    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [nhanVienList, hoaDonList, caLamListData] = await Promise.all([
          nhanVienApi.getAll(),
          donHangApi.getAll(),
          caLamApi.getAll()
        ])
        
        setCaLamList(caLamListData)

        if (ignore) return

        const invoiceStats = new Map<
          string,
          { total: number; earliest?: string; latest?: string }
        >()

        hoaDonList.forEach((invoice) => {
          const staffId = invoice.phienLamViec?.nhanVien?.MaNhanVien
          if (!staffId) return
          if (!invoiceStats.has(staffId)) {
            invoiceStats.set(staffId, { total: 0 })
          }
          const entry = invoiceStats.get(staffId)!
          entry.total += 1
          const invoiceDate = typeof invoice.Ngay === 'string' ? invoice.Ngay : (invoice.Ngay as Date).toISOString()
          if (!entry.earliest || invoiceDate < entry.earliest) {
            entry.earliest = invoiceDate
          }
          if (!entry.latest || invoiceDate > entry.latest) {
            entry.latest = invoiceDate
          }
        })

        const mappedStaff: StaffMember[] = nhanVienList.map((employee) => {
          const stat = invoiceStats.get(employee.MaNhanVien) ?? { total: 0 }
          const joinDate = formatDate(stat.earliest)
          const lastShift = formatDate(stat.latest)

          // Ưu tiên trạng thái từ database
          let status: StaffStatus = 'active'
          if (employee.TrangThai === 'leave') {
            status = 'leave'
          } else if (employee.TrangThai === 'probation') {
            status = 'probation'
          } else if (employee.TrangThai === 'active') {
            status = 'active'
          }

          return {
            id: employee.MaNhanVien,
            name: employee.TenNhanVien,
            role: employee.ChucVu,
            department: employee.ChucVu,
            status,
            shift: employee.caLam?.TenCaLam ?? 'Chưa cập nhật',
            phone: employee.SoDienThoai ?? 'Chưa cập nhật',
            email: employee.TaiKhoan,
            joinDate,
            lastShift,
            totalShifts: stat.total,
            address: 'Chưa cập nhật',
            username: employee.TaiKhoan,
            gender: employee.GioiTinh,
            birthDate: formatDate(employee.NgaySinh)
          }
        })

        setStaff(mappedStaff)
        setSelectedStaffId(mappedStaff[0]?.id ?? null)
      } catch (err) {
        if (ignore) return
        setError(
          err instanceof ApiError
            ? err.message
            : 'Không thể tải dữ liệu nhân viên. Vui lòng thử lại.'
        )
        setStaff([])
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

  const departmentOptions = useMemo(() => {
    const unique = Array.from(new Set(staff.map((member) => member.department).filter(Boolean)))
    return unique
  }, [staff])

  const filteredStaff = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()
    return staff.filter((member) => {
      const matchesKeyword =
        keyword.length === 0 ||
        member.name.toLowerCase().includes(keyword) ||
        member.role.toLowerCase().includes(keyword) ||
        member.id.toLowerCase().includes(keyword)

      const matchesDepartment =
        departmentFilter === 'all' || member.department === departmentFilter

      const matchesStatus =
        statusFilter === 'all' || member.status === statusFilter

      return matchesKeyword && matchesDepartment && matchesStatus
    })
  }, [staff, searchTerm, departmentFilter, statusFilter])

  const selectedStaff = useMemo(
    () => filteredStaff.find((member) => member.id === selectedStaffId) ?? null,
    [filteredStaff, selectedStaffId]
  )

  useEffect(() => {
    if (!selectedStaff && filteredStaff.length > 0) {
      setSelectedStaffId(filteredStaff[0].id)
    }
  }, [filteredStaff, selectedStaff])

  const resetForm = () => {
    setFormData({
      MaNhanVien: '',
      TenNhanVien: '',
      SoDienThoai: '',
      ChucVu: '',
      GioiTinh: 'Nam',
      NgaySinh: '',
      TaiKhoan: '',
      MatKhau: '',
      MaCaLam: '',
      TrangThai: 'active'
    })
  }

  const handleOpenAddModal = () => {
    // Auto-generate MaNhanVien
    const timestamp = Date.now().toString().slice(-8)
    const autoMaNhanVien = `NV${timestamp}`
    setFormData({
      MaNhanVien: autoMaNhanVien,
      TenNhanVien: '',
      SoDienThoai: '',
      ChucVu: '',
      GioiTinh: 'Nam',
      NgaySinh: '',
      TaiKhoan: '',
      MatKhau: '',
      MaCaLam: '',
      TrangThai: 'active'
    })
    setIsEditing(false)
    setShowModal(true)
  }

  const handleOpenEditModal = async () => {
    if (!selectedStaffId) return
    
    try {
      const nhanVien = await nhanVienApi.getOne(selectedStaffId)
      setFormData({
        MaNhanVien: nhanVien.MaNhanVien,
        TenNhanVien: nhanVien.TenNhanVien,
        SoDienThoai: nhanVien.SoDienThoai || '',
        ChucVu: nhanVien.ChucVu,
        GioiTinh: nhanVien.GioiTinh,
        NgaySinh: nhanVien.NgaySinh ? new Date(nhanVien.NgaySinh).toISOString().split('T')[0] : '',
        TaiKhoan: nhanVien.TaiKhoan,
        MatKhau: '', // Don't prefill password
        MaCaLam: nhanVien.MaCaLam || '',
        TrangThai: nhanVien.TrangThai || 'active'
      })
      setIsEditing(true)
      setShowModal(true)
    } catch {
      toast.error('Không thể tải thông tin nhân viên')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.MaNhanVien || !formData.TenNhanVien || !formData.ChucVu || 
        !formData.GioiTinh || !formData.NgaySinh || !formData.TaiKhoan) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    if (!isEditing && !formData.MatKhau) {
      toast.error('Vui lòng nhập mật khẩu cho nhân viên mới')
      return
    }

    try {
      const payload: {
        MaNhanVien: string
        TenNhanVien: string
        ChucVu: string
        GioiTinh: string
        NgaySinh: string
        TaiKhoan: string
        MaCaLam?: string
        TrangThai: string
        SoDienThoai?: string
        MatKhau?: string
      } = {
        MaNhanVien: formData.MaNhanVien,
        TenNhanVien: formData.TenNhanVien,
        ChucVu: formData.ChucVu,
        GioiTinh: formData.GioiTinh,
        NgaySinh: formData.NgaySinh,
        TaiKhoan: formData.TaiKhoan,
        MaCaLam: formData.MaCaLam || undefined,
        TrangThai: formData.TrangThai
      }

      if (formData.SoDienThoai) {
        payload.SoDienThoai = formData.SoDienThoai
      }

      if (formData.MatKhau) {
        payload.MatKhau = formData.MatKhau
      }

      if (isEditing) {
        await nhanVienApi.update(formData.MaNhanVien, payload)
        toast.success('Cập nhật nhân viên thành công!')
      } else {
        await nhanVienApi.create(payload)
        toast.success('Thêm nhân viên thành công!')
      }

      setShowModal(false)
      resetForm()
      
      // Reload data
      const [nhanVienList, hoaDonList] = await Promise.all([
        nhanVienApi.getAll(),
        donHangApi.getAll()
      ])

      const invoiceStats = new Map<string, { total: number; earliest?: string; latest?: string }>()
      hoaDonList.forEach((invoice) => {
        const staffId = invoice.phienLamViec?.nhanVien?.MaNhanVien
        if (!staffId) return
        if (!invoiceStats.has(staffId)) {
          invoiceStats.set(staffId, { total: 0 })
        }
        const entry = invoiceStats.get(staffId)!
        entry.total += 1
        const invoiceDate = typeof invoice.Ngay === 'string' ? invoice.Ngay : (invoice.Ngay as Date).toISOString()
        if (!entry.earliest || invoiceDate < entry.earliest) {
          entry.earliest = invoiceDate
        }
        if (!entry.latest || invoiceDate > entry.latest) {
          entry.latest = invoiceDate
        }
      })

      const mappedStaff: StaffMember[] = nhanVienList.map((employee) => {
        const stat = invoiceStats.get(employee.MaNhanVien) ?? { total: 0 }
        const joinDate = formatDate(stat.earliest)
        const lastShift = formatDate(stat.latest)

        // Ưu tiên trạng thái từ database
        let status: StaffStatus = 'active'
        if (employee.TrangThai === 'leave') {
          status = 'leave'
        } else if (employee.TrangThai === 'probation') {
          status = 'probation'
        } else if (employee.TrangThai === 'active') {
          status = 'active'
        }

        return {
          id: employee.MaNhanVien,
          name: employee.TenNhanVien,
          role: employee.ChucVu,
          department: employee.ChucVu,
          status,
          shift: employee.caLam?.TenCaLam ?? 'Chưa cập nhật',
          phone: employee.SoDienThoai ?? 'Chưa cập nhật',
          email: employee.TaiKhoan,
          joinDate,
          lastShift,
          totalShifts: stat.total,
          address: 'Chưa cập nhật',
          username: employee.TaiKhoan,
          gender: employee.GioiTinh,
          birthDate: formatDate(employee.NgaySinh)
        }
      })

      setStaff(mappedStaff)
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Có lỗi xảy ra'
      toast.error(errorMessage)
    }
  }

  return (
    <div className={styles.page}>
        <header className={styles.pageHeader}>
          <div>
            <h1>Quản lý nhân sự</h1>
            <p>Theo dõi thông tin nhân viên và ca làm việc tại quán</p>
          </div>
          <button className={styles.addButton} onClick={handleOpenAddModal}>
            <FaUserPlus /> Thêm nhân viên
          </button>
        </header>

        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <FaSearch />
            <input
              type="text"
              placeholder="Tìm kiếm nhân viên..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className={styles.filterSelects}>
            <select
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
            >
              <option value="all">Tất cả bộ phận</option>
              {departmentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | StaffStatus)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.layout}>
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th>Mã NV</th>
                  <th>Nhân viên</th>
                  <th>Bộ phận</th>
                  <th>Ca làm</th>
                  <th>Trạng thái</th>
                  <th>Ca gần nhất</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className={styles.tableState}>
                      Đang tải dữ liệu nhân viên...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className={`${styles.tableState} ${styles.tableStateError}`}>
                      {error}
                    </td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.tableState}>
                      Không tìm thấy nhân viên phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((member) => (
                    <tr
                      key={member.id}
                      className={member.id === selectedStaffId ? styles.selectedRow : undefined}
                      onClick={() => setSelectedStaffId(member.id)}
                    >
                      <td>{member.id}</td>
                      <td>
                        <div className={styles.staffCell}>
                          <FaUserTie />
                          <div>
                            <strong>{member.name}</strong>
                            <span>{member.role}</span>
                          </div>
                        </div>
                      </td>
                      <td>{member.department}</td>
                      <td>{member.shift}</td>
                      <td>
                        <span className={`${styles.statusTag} ${statusClassName[member.status]}`}>
                          {statusLabel[member.status]}
                        </span>
                      </td>
                      <td>{member.lastShift}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <aside className={styles.detailPanel}>
            {selectedStaff ? (
              <>
                <div className={styles.detailHeader}>
                  <h3>{selectedStaff.name}</h3>
                  <span>{selectedStaff.role}</span>
                  <div className={`${styles.statusTag} ${statusClassName[selectedStaff.status]}`}>
                    {statusLabel[selectedStaff.status]}
                  </div>
                </div>

                <div className={styles.detailStats}>
                  <div>
                    <span>Tổng hóa đơn</span>
                    <strong>{selectedStaff.totalShifts}</strong>
                  </div>
                  <div>
                    <span>Trạng thái</span>
                    <strong>{statusLabel[selectedStaff.status]}</strong>
                  </div>
                </div>

                <div className={styles.detailList}>
                  <div>
                    <FaPhoneAlt /> <span>{selectedStaff.phone}</span>
                  </div>
                  <div>
                    <FaEnvelope /> <span>{selectedStaff.email}</span>
                  </div>
                  <div>
                    <FaMapMarkerAlt /> <span>{selectedStaff.address}</span>
                  </div>
                  <div>
                    <FaCalendarAlt /> <span>Ngày sinh: {selectedStaff.birthDate}</span>
                  </div>
                  <div>
                    <MdOutlineSchedule /> <span>Ca chính: {selectedStaff.shift}</span>
                  </div>
                  <div>
                    <MdOutlineAccessTime /> <span>Ca gần nhất: {selectedStaff.lastShift}</span>
                  </div>
                  <div>
                    <MdOutlineAccessTime /> <span>Ngày vào làm: {selectedStaff.joinDate}</span>
                  </div>
                </div>

                <button className={styles.primaryAction} onClick={handleOpenEditModal}>
                  Cập nhật thông tin nhân viên
                </button>
              </>
            ) : (
              <div className={styles.detailPlaceholder}>
                Chọn một nhân viên ở bảng bên trái để xem chi tiết.
              </div>
            )}
          </aside>
        </div>

        {showModal && (
          <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{isEditing ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}</h2>
                <button className={styles.modalClose} onClick={() => setShowModal(false)}>
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmit} className={styles.modalForm}>
                <div className={styles.formRow}>
                  <label>
                    <span>Mã nhân viên <span style={{ color: 'red' }}>*</span></span>
                    <input
                      type="text"
                      value={formData.MaNhanVien}
                      onChange={(e) => setFormData({ ...formData, MaNhanVien: e.target.value })}
                      placeholder={isEditing ? "Mã nhân viên" : "Tự động tạo"}
                      required
                      disabled={true}
                      maxLength={10}
                      style={{ 
                        backgroundColor: '#f5f5f5', 
                        cursor: 'not-allowed',
                        color: '#666'
                      }}
                    />
                  </label>
                  <label>
                    <span>Tên nhân viên <span style={{ color: 'red' }}>*</span></span>
                    <input
                      type="text"
                      value={formData.TenNhanVien}
                      onChange={(e) => setFormData({ ...formData, TenNhanVien: e.target.value })}
                      required
                      maxLength={50}
                    />
                  </label>
                </div>

                <div className={styles.formRow}>
                  <label>
                    <span>Số điện thoại</span>
                    <input
                      type="tel"
                      value={formData.SoDienThoai}
                      onChange={(e) => setFormData({ ...formData, SoDienThoai: e.target.value })}
                      maxLength={15}
                    />
                  </label>
                  <label>
                    <span>Chức vụ <span style={{ color: 'red' }}>*</span></span>
                    <input
                      type="text"
                      value={formData.ChucVu}
                      onChange={(e) => setFormData({ ...formData, ChucVu: e.target.value })}
                      required
                      maxLength={30}
                    />
                  </label>
                </div>

                <div className={styles.formRow}>
                  <label>
                    <span>Giới tính <span style={{ color: 'red' }}>*</span></span>
                    <select
                      value={formData.GioiTinh}
                      onChange={(e) => setFormData({ ...formData, GioiTinh: e.target.value })}
                      required
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </label>
                  <label>
                    <span>Ngày sinh <span style={{ color: 'red' }}>*</span></span>
                    <input
                      type="date"
                      value={formData.NgaySinh}
                      onChange={(e) => setFormData({ ...formData, NgaySinh: e.target.value })}
                      required
                    />
                  </label>
                </div>

                <div className={styles.formRow}>
                  <label>
                    <span>Tài khoản <span style={{ color: 'red' }}>*</span></span>
                    <input
                      type="text"
                      value={formData.TaiKhoan}
                      onChange={(e) => setFormData({ ...formData, TaiKhoan: e.target.value })}
                      required
                      maxLength={50}
                    />
                  </label>
                  <label>
                    <span>Mật khẩu {!isEditing && <span style={{ color: 'red' }}>*</span>}</span>
                    <input
                      type="password"
                      value={formData.MatKhau}
                      onChange={(e) => setFormData({ ...formData, MatKhau: e.target.value })}
                      required={!isEditing}
                      placeholder={isEditing ? 'Để trống nếu không đổi' : ''}
                    />
                  </label>
                </div>

                <div className={styles.formRow}>
                  <label>
                    <span>Ca làm việc</span>
                    <select
                      value={formData.MaCaLam}
                      onChange={(e) => setFormData({ ...formData, MaCaLam: e.target.value })}
                    >
                      <option value="">-- Chọn ca làm việc --</option>
                      {caLamList.map((ca) => (
                        <option key={ca.MaCaLam} value={ca.MaCaLam}>
                          {ca.TenCaLam}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Trạng thái</span>
                    <select
                      value={formData.TrangThai}
                      onChange={(e) => setFormData({ ...formData, TrangThai: e.target.value })}
                    >
                      <option value="active">Đang làm việc</option>
                      <option value="probation">Thử việc</option>
                      <option value="leave">Thôi việc</option>
                    </select>
                  </label>
                </div>

                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelButton} onClick={() => setShowModal(false)}>
                    Hủy
                  </button>
                  <button type="submit" className={styles.submitButton}>
                    {isEditing ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  )
}

export default StaffPage

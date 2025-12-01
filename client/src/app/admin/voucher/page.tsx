'use client'
import React, { useState, useMemo, useEffect } from 'react'
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaCopy,
  FaCalendarAlt,
  FaTag,
  FaPercentage,
  FaGift,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaTimes
} from 'react-icons/fa'
import styles from './voucher.module.css'
import { apiFetch, ApiError, monApi, Mon } from '../../../lib/api'
import { toast } from 'react-hot-toast'

type VoucherType = 'percentage' | 'fixed' | 'free_item'
type VoucherStatus = 'active' | 'inactive' | 'expired'

interface Voucher {
  id: string
  code: string
  name: string
  type: VoucherType
  value: number
  minOrderAmount?: number
  maxDiscount?: number
  usageLimit: number
  usedCount: number
  startDate: string
  endDate: string
  status: VoucherStatus
  description: string
  applicableItems?: string[]
  comboItems?: Array<{ name: string; quantity: number }>
}

interface KhuyenMaiDto {
  MaCTKM: string
  TenCTKM: string
  LoaiCTKM?: string
  TrangThai?: string
  giaTriGiam?: number
  soTienToiThieu?: number
  giamToiDa?: number
  soLuongSuDung?: number
  moTa?: string
  ngayBatDau?: string
  ngayKetThuc?: string
  giamHoaDons?: Array<{
    maHD: string;
    GiaTriTu?: number;
    SoTienGiam: number;
    LoaiGiam: string;
    NgayBatDau: string;
    NgayKetThuc: string;
  }>
  giamMons?: Array<{
    maMon: string;
    MaMon: string;
    SoTienGiam: number;
    LoaiGiam: string;
    NgayBatDau: string;
    NgayKetThuc: string;
  }>
  donHangs?: Array<{ maDH: string }>
  combos?: Array<{
    MaCombo: string;
    TenCombo: string;
    GiaCombo: number;
    dsMonTrongCombos?: Array<{
      MaMon: string;
      SoLuong: number;
      mon?: { TenMon: string };
    }>
  }>
}

// ... (VoucherFormData interface remains same)

const TYPE_OPTIONS = [
  { value: 'all', label: 'Tất cả loại' },
  { value: 'percentage', label: 'Phần trăm' },
  { value: 'fixed', label: 'Giá trị cố định' },
  { value: 'free_item', label: 'Combo' }
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Tạm dừng' },
  { value: 'expired', label: 'Hết hạn' }
]

const VoucherPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null)
  const [formData, setFormData] = useState<VoucherFormData>({
    maKM: '',
    tenKM: '',
    loaiKM: 'percentage',
    trangThai: 'active',
    giaTriGiam: 0,
    soTienToiThieu: 0,
    giamToiDa: 0,
    soLuongSuDung: 100,
    moTa: '',
    ngayBatDau: new Date().toISOString().split('T')[0],
    ngayKetThuc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    comboItems: []
  })
  const [monList, setMonList] = useState<Mon[]>([])

  useEffect(() => {
    let ignore = false
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Load monList first to map names
        const monData = await monApi.getAll()
        setMonList(monData)

        const data = await apiFetch<KhuyenMaiDto[]>('/api/ctkm')
        if (ignore) return

        // Transform data - CTKM structure
        const mapped: Voucher[] = data.map((km: KhuyenMaiDto) => {
          // CTKM doesn't have date fields directly, get from sub-entities
          const now = new Date()
          let startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          let endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
          let value = 0
          let minOrderAmount = 0
          let maxDiscount = 0
          let applicableItems: string[] = []
          let comboItems: Array<{ name: string; quantity: number }> = []

          if (km.LoaiCTKM === 'giamhoadon' && km.giamHoaDons && km.giamHoaDons.length > 0) {
            const ghd = km.giamHoaDons[0]
            startDate = new Date(ghd.NgayBatDau)
            endDate = new Date(ghd.NgayKetThuc)
            value = ghd.SoTienGiam
            minOrderAmount = ghd.GiaTriTu || 0
            // maxDiscount logic if available
          } else if (km.LoaiCTKM === 'giammon' && km.giamMons && km.giamMons.length > 0) {
            const gm = km.giamMons[0]
            startDate = new Date(gm.NgayBatDau)
            endDate = new Date(gm.NgayKetThuc)
            value = gm.SoTienGiam

            // Map applicable items
            applicableItems = km.giamMons.map(g => {
              const mon = monData.find(m => m.MaMon === g.MaMon)
              return mon ? mon.TenMon : g.MaMon
            })
          } else if (km.LoaiCTKM === 'combo' && km.combos && km.combos.length > 0) {
            const cb = km.combos[0]
            // Combo dates might be in Combo entity (not fully exposed in DTO yet but let's assume)
            // For now use defaults or if backend sends them

            value = cb.GiaCombo

            // Map combo items
            if (cb.dsMonTrongCombos) {
              comboItems = cb.dsMonTrongCombos.map(ds => ({
                name: ds.mon?.TenMon || 'Món không xác định',
                quantity: ds.SoLuong
              }))
            }
          }

          // Map TrangThai from API to VoucherStatus
          let status: VoucherStatus = 'active'
          if (km.TrangThai) {
            const trangThai = km.TrangThai.toLowerCase()
            if (trangThai === 'hoạt động' || trangThai === 'active') {
              status = 'active'
            } else if (trangThai === 'tạm dừng' || trangThai === 'inactive') {
              status = 'inactive'
            } else if (trangThai === 'hết hạn' || trangThai === 'expired') {
              status = 'expired'
            }
          }

          return {
            id: km.MaCTKM,
            code: km.MaCTKM,
            name: km.TenCTKM,
            type: (km.LoaiCTKM === 'giamhoadon' ? 'fixed' : km.LoaiCTKM === 'giammon' ? 'percentage' : km.LoaiCTKM === 'combo' ? 'free_item' : 'percentage') as VoucherType,
            value,
            minOrderAmount,
            maxDiscount,
            usageLimit: 100, // Default or from DB if available
            usedCount: km.donHangs?.length || 0,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            status,
            description: km.TenCTKM || '',
            applicableItems,
            comboItems
          }
        })

        setVouchers(mapped)
      } catch (err) {
        if (ignore) return
        setError(
          err instanceof ApiError
            ? err.message
            : 'Không thể tải danh sách khuyến mãi. Vui lòng thử lại.'
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

  // Load danh sách món
  useEffect(() => {
    const loadMonList = async () => {
      try {
        const data = await monApi.getAll()
        setMonList(data)
      } catch (err) {
        console.error('Error loading mon list:', err)
      }
    }
    loadMonList()
  }, [])

  const filteredVouchers = useMemo(() => {
    return vouchers.filter(voucher => {
      const matchSearch =
        voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voucher.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchType = typeFilter === 'all' || voucher.type === typeFilter
      const matchStatus = statusFilter === 'all' || voucher.status === statusFilter
      return matchSearch && matchType && matchStatus
    })
  }, [searchTerm, typeFilter, statusFilter, vouchers])

  const stats = useMemo(() => {
    return vouchers.reduce(
      (acc, voucher) => {
        acc.total += 1
        if (voucher.status === 'active') acc.active += 1
        if (voucher.status === 'inactive') acc.inactive += 1
        if (voucher.status === 'expired') acc.expired += 1
        acc.totalUsed += voucher.usedCount
        acc.totalLimit += voucher.usageLimit
        return acc
      },
      { total: 0, active: 0, inactive: 0, expired: 0, totalUsed: 0, totalLimit: 0 }
    )
  }, [vouchers])

  const getTypeIcon = (type: VoucherType) => {
    switch (type) {
      case 'percentage': return <FaPercentage />
      case 'fixed': return <FaTag />
      case 'free_item': return <FaGift />
      default: return <FaTag />
    }
  }

  const getTypeLabel = (type: VoucherType) => {
    switch (type) {
      case 'percentage': return 'Phần trăm'
      case 'fixed': return 'Giá trị cố định'
      case 'free_item': return 'Combo'
      default: return 'Không xác định'
    }
  }

  const getStatusIcon = (status: VoucherStatus) => {
    switch (status) {
      case 'active': return <FaCheckCircle />
      case 'inactive': return <FaTimesCircle />
      case 'expired': return <FaClock />
      default: return <FaTimesCircle />
    }
  }

  const getStatusLabel = (status: VoucherStatus) => {
    switch (status) {
      case 'active': return 'Đang hoạt động'
      case 'inactive': return 'Tạm dừng'
      case 'expired': return 'Hết hạn'
      default: return 'Không xác định'
    }
  }

  const getStatusClass = (status: VoucherStatus) => {
    switch (status) {
      case 'active': return styles.statusActive
      case 'inactive': return styles.statusInactive
      case 'expired': return styles.statusExpired
      default: return styles.statusInactive
    }
  }

  const formatValue = (voucher: Voucher) => {
    switch (voucher.type) {
      case 'percentage':
        return `${voucher.value}%`
      case 'fixed':
        return `${voucher.value.toLocaleString('vi-VN')}đ`
      case 'free_item':
        return 'Combo'
      default:
        return 'N/A'
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success(`Đã sao chép mã: ${code}`)
  }

  // ... (loadVouchersData update)
  const loadVouchersData = async () => {
    try {
      // Ensure monList is available (might need to fetch if empty)
      let currentMonList = monList
      if (currentMonList.length === 0) {
        currentMonList = await monApi.getAll()
        setMonList(currentMonList)
      }

      const data = await apiFetch<KhuyenMaiDto[]>('/api/ctkm')

      const mapped: Voucher[] = data.map((km: KhuyenMaiDto) => {
        const now = new Date()
        let startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        let endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        let value = 0
        let minOrderAmount = 0
        let maxDiscount = 0
        let applicableItems: string[] = []
        let comboItems: Array<{ name: string; quantity: number }> = []

        if (km.LoaiCTKM === 'giamhoadon' && km.giamHoaDons && km.giamHoaDons.length > 0) {
          const ghd = km.giamHoaDons[0]
          startDate = new Date(ghd.NgayBatDau)
          endDate = new Date(ghd.NgayKetThuc)
          value = ghd.SoTienGiam
          minOrderAmount = ghd.GiaTriTu || 0
        } else if (km.LoaiCTKM === 'giammon' && km.giamMons && km.giamMons.length > 0) {
          const gm = km.giamMons[0]
          startDate = new Date(gm.NgayBatDau)
          endDate = new Date(gm.NgayKetThuc)
          value = gm.SoTienGiam

          applicableItems = km.giamMons.map(g => {
            const mon = currentMonList.find(m => m.MaMon === g.MaMon)
            return mon ? mon.TenMon : g.MaMon
          })
        } else if (km.LoaiCTKM === 'combo' && km.combos && km.combos.length > 0) {
          const cb = km.combos[0]
          value = cb.GiaCombo
          if (cb.dsMonTrongCombos) {
            comboItems = cb.dsMonTrongCombos.map(ds => ({
              name: ds.mon?.TenMon || 'Món không xác định',
              quantity: ds.SoLuong
            }))
          }
        }

        let status: VoucherStatus = 'active'
        if (km.TrangThai) {
          const trangThai = km.TrangThai.toLowerCase()
          if (trangThai === 'hoạt động' || trangThai === 'active') {
            status = 'active'
          } else if (trangThai === 'tạm dừng' || trangThai === 'inactive') {
            status = 'inactive'
          } else if (trangThai === 'hết hạn' || trangThai === 'expired') {
            status = 'expired'
          }
        }

        return {
          id: km.MaCTKM,
          code: km.MaCTKM,
          name: km.TenCTKM,
          type: (km.LoaiCTKM === 'giamhoadon' ? 'fixed' : km.LoaiCTKM === 'giammon' ? 'percentage' : km.LoaiCTKM === 'combo' ? 'free_item' : 'percentage') as VoucherType,
          value,
          minOrderAmount,
          maxDiscount,
          usageLimit: 100,
          usedCount: km.donHangs?.length || 0,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          status,
          description: km.TenCTKM || '',
          applicableItems,
          comboItems
        }
      })

      setVouchers(mapped)
    } catch (err) {
      throw err
    }
  }

  const handleAddVoucher = () => {
    setEditingVoucher(null)
    setFormData({
      maKM: '',
      tenKM: '',
      loaiKM: 'percentage',
      trangThai: 'active',
      giaTriGiam: 0,
      soTienToiThieu: 0,
      giamToiDa: 0,
      soLuongSuDung: 100,
      moTa: '',
      ngayBatDau: new Date().toISOString().split('T')[0],
      ngayKetThuc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    })
    setShowModal(true)
  }

  const handleEditVoucher = (voucher: Voucher) => {
    setEditingVoucher(voucher)
    setFormData({
      maKM: voucher.id,
      tenKM: voucher.name,
      loaiKM: voucher.type,
      trangThai: voucher.status,
      giaTriGiam: voucher.value,
      soTienToiThieu: voucher.minOrderAmount || 0,
      giamToiDa: voucher.maxDiscount || 0,
      soLuongSuDung: voucher.usageLimit,
      moTa: voucher.description,
      ngayBatDau: voucher.startDate,
      ngayKetThuc: voucher.endDate
    })
    setShowModal(true)
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Map loaiKM từ form sang LoaiCTKM của database
      // percentage/fixed -> giamhoadon, free_item -> combo
      const loaiCTKM = formData.loaiKM === 'free_item' ? 'combo' : 'giamhoadon'

      interface CreateCTKMPayload {
        MaCTKM: string
        TenCTKM: string
        LoaiCTKM: string
        giaTriGiam: number
        soTienToiThieu: number | null
        giamToiDa: number | null
        ngayBatDau: string
        ngayKetThuc: string
        loaiGiam: string
        comboItems?: Array<{ MaMon: string; SoLuong: number }>
      }

      const payload: CreateCTKMPayload = {
        MaCTKM: formData.maKM,
        TenCTKM: formData.tenKM,
        LoaiCTKM: loaiCTKM,
        // Thêm các thông tin để tạo bản ghi liên quan
        giaTriGiam: formData.giaTriGiam,
        // Nếu là combo, không gửi soTienToiThieu và giamToiDa
        soTienToiThieu: loaiCTKM === 'combo' ? null : (formData.soTienToiThieu || null),
        giamToiDa: loaiCTKM === 'combo' ? null : (formData.giamToiDa || null),
        ngayBatDau: formData.ngayBatDau,
        ngayKetThuc: formData.ngayKetThuc,
        loaiGiam: formData.loaiKM === 'percentage' ? 'Phần trăm' : 'VND'
      }

      // Nếu là combo, thêm thông tin các món
      if (loaiCTKM === 'combo') {
        payload.comboItems = formData.comboItems || []
      }

      if (editingVoucher) {
        // Update - Map VoucherStatus to Vietnamese TrangThai
        const trangThaiMap: Record<VoucherStatus, string> = {
          'active': 'hoạt động',
          'inactive': 'tạm dừng',
          'expired': 'hết hạn'
        }

        await apiFetch(`/api/ctkm/${editingVoucher.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            MaCTKM: formData.maKM,
            TenCTKM: formData.tenKM,
            LoaiCTKM: loaiCTKM,
            TrangThai: trangThaiMap[formData.trangThai]
          })
        })
        toast.success('Cập nhật voucher thành công!')
      } else {
        // Create - gửi đầy đủ dữ liệu để backend tạo các bản ghi liên quan
        await apiFetch('/api/ctkm', {
          method: 'POST',
          body: JSON.stringify(payload)
        })
        toast.success('Thêm voucher mới thành công!')
      }

      setShowModal(false)
      await loadVouchersData()
    } catch (err) {
      toast.error('Lỗi: ' + (err instanceof ApiError ? err.message : 'Unknown error'))
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingVoucher(null)
  }

  const handleDeleteVoucher = async (voucherId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa voucher này?')) {
      return
    }

    try {
      await apiFetch(`/api/ctkm/${voucherId}`, {
        method: 'DELETE'
      })

      await loadVouchersData()
      if (selectedVoucher?.id === voucherId) {
        setSelectedVoucher(null)
      }
      toast.success('Xóa voucher thành công!')
    } catch (err) {
      toast.error('Lỗi khi xóa voucher: ' + (err instanceof ApiError ? err.message : 'Unknown error'))
    }
  }

  const handleUpdateStatus = async (voucherId: string, newStatus: VoucherStatus) => {
    try {
      // Map VoucherStatus sang TrangThai trong database
      const trangThaiMap: Record<VoucherStatus, string> = {
        'active': 'hoạt động',
        'inactive': 'tạm dừng',
        'expired': 'hết hạn'
      }

      await apiFetch(`/api/ctkm/${voucherId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ TrangThai: trangThaiMap[newStatus] })
      })

      await loadVouchersData()

      // Cập nhật selectedVoucher nếu đang được chọn
      if (selectedVoucher?.id === voucherId) {
        setSelectedVoucher({ ...selectedVoucher, status: newStatus })
      }

      toast.success('Cập nhật trạng thái thành công!')
    } catch (err) {
      toast.error('Lỗi khi cập nhật trạng thái: ' + (err instanceof ApiError ? err.message : 'Unknown error'))
    }
  }

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
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <h1>Quản lý Voucher</h1>
          <p>Quản lý và theo dõi các mã giảm giá, khuyến mãi</p>
        </div>
        <button
          className={styles.createButton}
          onClick={handleAddVoucher}
        >
          <FaPlus /> Tạo voucher mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaTag />
          </div>
          <div className={styles.statContent}>
            <span>Tổng voucher</span>
            <strong>{stats.total}</strong>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconActive}`}>
            <FaCheckCircle />
          </div>
          <div className={styles.statContent}>
            <span>Đang hoạt động</span>
            <strong>{stats.active}</strong>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconInactive}`}>
            <FaTimesCircle />
          </div>
          <div className={styles.statContent}>
            <span>Tạm dừng</span>
            <strong>{stats.inactive}</strong>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconExpired}`}>
            <FaClock />
          </div>
          <div className={styles.statContent}>
            <span>Hết hạn</span>
            <strong>{stats.expired}</strong>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <FaSearch />
          <input
            type="text"
            placeholder="Tìm theo mã voucher, tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.filterGroup}>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {TYPE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Voucher List */}
        <div className={styles.voucherList}>
          <div className={styles.listHeader}>
            <h2>Danh sách Voucher ({filteredVouchers.length})</h2>
          </div>
          <div className={styles.voucherGrid}>
            {filteredVouchers.map(voucher => (
              <div
                key={voucher.id}
                className={`${styles.voucherCard} ${selectedVoucher?.id === voucher.id ? styles.selected : ''}`}
                onClick={() => setSelectedVoucher(voucher)}
              >
                <div className={styles.voucherHeader}>
                  <div className={styles.voucherCode}>
                    <span className={styles.code}>{voucher.code}</span>
                    <button
                      className={styles.copyBtn}
                      onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(voucher.code)
                      }}
                    >
                      <FaCopy />
                    </button>
                  </div>
                  <div className={`${styles.statusTag} ${getStatusClass(voucher.status)}`}>
                    {getStatusIcon(voucher.status)}
                    {getStatusLabel(voucher.status)}
                  </div>
                </div>

                <div className={styles.voucherBody}>
                  <h3>{voucher.name}</h3>
                  <p>{voucher.description}</p>

                  <div className={styles.voucherDetails}>
                    <div className={styles.detailRow}>
                      <span>Loại:</span>
                      <span className={styles.detailValue}>
                        {getTypeIcon(voucher.type)}
                        {getTypeLabel(voucher.type)}
                      </span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Giá trị:</span>
                      <span className={styles.detailValue}>{formatValue(voucher)}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Sử dụng:</span>
                      <span className={styles.detailValue}>
                        {voucher.usedCount}/{voucher.usageLimit}
                      </span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Hạn sử dụng:</span>
                      <span className={styles.detailValue}>
                        <FaCalendarAlt />
                        {new Date(voucher.endDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.voucherActions}>
                  <button
                    className={styles.actionBtn}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditVoucher(voucher)
                    }}
                    title="Chỉnh sửa"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className={styles.actionBtn}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteVoucher(voucher.id)
                    }}
                    title="Xóa"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Voucher Details */}
        <div className={styles.voucherDetails}>
          {selectedVoucher ? (
            <div className={styles.detailsPanel}>
              <div className={styles.detailsHeader}>
                <h2>{selectedVoucher.name}</h2>
                <div className={`${styles.statusTag} ${getStatusClass(selectedVoucher.status)}`}>
                  {getStatusIcon(selectedVoucher.status)}
                  {getStatusLabel(selectedVoucher.status)}
                </div>
              </div>

              <div className={styles.detailsContent}>
                <div className={styles.detailSection}>
                  <h3>Thông tin cơ bản</h3>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <span>Mã voucher:</span>
                      <span className={styles.codeValue}>{selectedVoucher.code}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Loại:</span>
                      <span>{getTypeLabel(selectedVoucher.type)}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Giá trị:</span>
                      <span className={styles.valueHighlight}>{formatValue(selectedVoucher)}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Mô tả:</span>
                      <span>{selectedVoucher.description}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Trạng thái:</span>
                      <select
                        value={selectedVoucher.status}
                        onChange={(e) => handleUpdateStatus(selectedVoucher.id, e.target.value as VoucherStatus)}
                        className={styles.statusSelect}
                      >
                        <option value="active">Đang hoạt động</option>
                        <option value="inactive">Tạm dừng</option>
                        <option value="expired">Hết hạn</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles.detailsActions}>
                    <button
                      className={styles.primaryBtn}
                      onClick={() => handleEditVoucher(selectedVoucher)}
                    >
                      <FaEdit /> Chỉnh sửa
                    </button>
                    <button
                      className={styles.secondaryBtn}
                      onClick={() => copyToClipboard(selectedVoucher.code)}
                    >
                      <FaCopy /> Sao chép mã
                    </button>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3>{selectedVoucher.type === 'free_item' ? 'Chi tiết Combo' : 'Điều kiện sử dụng'}</h3>
                  <div className={styles.detailGrid}>
                    {selectedVoucher.type === 'fixed' && (
                      <>
                        <div className={styles.detailItem}>
                          <span>Đơn hàng tối thiểu:</span>
                          <span>{selectedVoucher.minOrderAmount?.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span>Giảm giá tối đa:</span>
                          <span>{selectedVoucher.maxDiscount ? `${selectedVoucher.maxDiscount.toLocaleString('vi-VN')}đ` : 'Không giới hạn'}</span>
                        </div>
                      </>
                    )}

                    {selectedVoucher.type === 'percentage' && (
                      <div className={styles.detailItem} style={{ gridColumn: '1 / -1' }}>
                        <span>Sản phẩm áp dụng:</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                          {selectedVoucher.applicableItems && selectedVoucher.applicableItems.length > 0 ? (
                            selectedVoucher.applicableItems.map((item, index) => (
                              <span key={index} className={styles.tag}>{item}</span>
                            ))
                          ) : (
                            <span>Tất cả sản phẩm</span>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedVoucher.type === 'free_item' && (
                      <div className={styles.detailItem} style={{ gridColumn: '1 / -1' }}>
                        <span>Danh sách món:</span>
                        <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem' }}>
                          {selectedVoucher.comboItems && selectedVoucher.comboItems.length > 0 ? (
                            selectedVoucher.comboItems.map((item, index) => (
                              <li key={index} style={{ padding: '0.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                                <span>{item.name}</span>
                                <strong>x{item.quantity}</strong>
                              </li>
                            ))
                          ) : (
                            <li>Chưa có món nào trong combo</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3>Thống kê sử dụng</h3>
                  <div className={styles.usageStats}>
                    <div className={styles.usageBar}>
                      <div
                        className={styles.usageFill}
                        style={{
                          width: `${(selectedVoucher.usedCount / selectedVoucher.usageLimit) * 100}%`
                        }}
                      ></div>
                    </div>
                    <div className={styles.usageText}>
                      {selectedVoucher.usedCount} / {selectedVoucher.usageLimit} lượt sử dụng
                    </div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3>Thời gian</h3>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <span>Ngày bắt đầu:</span>
                      <span>{new Date(selectedVoucher.startDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Ngày kết thúc:</span>
                      <span>{new Date(selectedVoucher.endDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <FaTag />
              <h3>Chọn một voucher</h3>
              <p>Chọn voucher từ danh sách bên trái để xem thông tin chi tiết</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Add/Edit Voucher */}
      {showModal && (
        <div key="voucher-modal" className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingVoucher ? 'Chỉnh sửa voucher' : 'Tạo voucher mới'}</h2>
              <button className={styles.closeBtn} onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmitForm} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Mã voucher *</label>
                <input
                  type="text"
                  value={formData.maKM}
                  onChange={(e) => setFormData({ ...formData, maKM: e.target.value })}
                  disabled={!!editingVoucher}
                  required
                  placeholder="VD: KM001, SUMMER2025"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Tên voucher *</label>
                <input
                  type="text"
                  value={formData.tenKM}
                  onChange={(e) => setFormData({ ...formData, tenKM: e.target.value })}
                  required
                  placeholder="VD: Giảm giá mùa hè"
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Loại voucher *</label>
                  <select
                    value={formData.loaiKM}
                    onChange={(e) => setFormData({ ...formData, loaiKM: e.target.value })}
                    required
                  >
                    <option value="percentage">Phần trăm</option>
                    <option value="fixed">Giá trị cố định</option>
                    <option value="free_item">Combo</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Trạng thái *</label>
                  <select
                    value={formData.trangThai}
                    onChange={(e) => setFormData({ ...formData, trangThai: e.target.value as VoucherStatus })}
                    required
                  >
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Tạm dừng</option>
                    <option value="expired">Hết hạn</option>
                  </select>
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>{formData.loaiKM === 'free_item' ? 'Giá combo *' : 'Giá trị giảm *'}</label>
                  <input
                    type="number"
                    value={formData.giaTriGiam}
                    onChange={(e) => setFormData({ ...formData, giaTriGiam: Number(e.target.value) })}
                    required
                    min="0"
                    placeholder={formData.loaiKM === 'percentage' ? '10' : formData.loaiKM === 'free_item' ? '50000' : '50000'}
                  />
                  <small>{formData.loaiKM === 'percentage' ? '(%)' : formData.loaiKM === 'free_item' ? '(VNĐ)' : '(VNĐ)'}</small>
                </div>
                <div className={styles.formGroup}>
                  <label>Số lần sử dụng *</label>
                  <input
                    type="number"
                    value={formData.soLuongSuDung}
                    onChange={(e) => setFormData({ ...formData, soLuongSuDung: Number(e.target.value) })}
                    required
                    min="1"
                  />
                </div>
              </div>
              {formData.loaiKM !== 'free_item' && (
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Đơn hàng tối thiểu</label>
                    <input
                      type="number"
                      value={formData.soTienToiThieu}
                      onChange={(e) => setFormData({ ...formData, soTienToiThieu: Number(e.target.value) })}
                      min="0"
                      placeholder="0"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Giảm tối đa</label>
                    <input
                      type="number"
                      value={formData.giamToiDa}
                      onChange={(e) => setFormData({ ...formData, giamToiDa: Number(e.target.value) })}
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>
              )}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Ngày bắt đầu *</label>
                  <input
                    type="date"
                    value={formData.ngayBatDau}
                    onChange={(e) => setFormData({ ...formData, ngayBatDau: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Ngày kết thúc *</label>
                  <input
                    type="date"
                    value={formData.ngayKetThuc}
                    onChange={(e) => setFormData({ ...formData, ngayKetThuc: e.target.value })}
                    required
                  />
                </div>
              </div>
              {/* Phần chọn món và số lượng cho combo */}
              {formData.loaiKM === 'free_item' && (
                <div className={styles.formGroup}>
                  <label>Món trong combo *</label>
                  <div className={styles.comboItemsList}>
                    {(formData.comboItems || []).map((item, index) => (
                      <div key={index} className={styles.comboItemRow}>
                        <select
                          value={item.MaMon}
                          onChange={(e) => {
                            const newItems = [...(formData.comboItems || [])]
                            newItems[index].MaMon = e.target.value
                            setFormData({ ...formData, comboItems: newItems })
                          }}
                          required
                        >
                          <option value="">-- Chọn món --</option>
                          {monList.map((mon) => (
                            <option key={mon.MaMon} value={mon.MaMon}>
                              {mon.TenMon}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={item.SoLuong}
                          onChange={(e) => {
                            const newItems = [...(formData.comboItems || [])]
                            newItems[index].SoLuong = Number(e.target.value) || 1
                            setFormData({ ...formData, comboItems: newItems })
                          }}
                          min="1"
                          placeholder="Số lượng"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newItems = (formData.comboItems || []).filter((_, i) => i !== index)
                            setFormData({ ...formData, comboItems: newItems })
                          }}
                          className={styles.removeBtn}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          comboItems: [...(formData.comboItems || []), { MaMon: '', SoLuong: 1 }]
                        })
                      }}
                      className={styles.addItemBtn}
                    >
                      <FaPlus /> Thêm món
                    </button>
                  </div>
                </div>
              )}
              <div className={styles.formGroup}>
                <label>Mô tả</label>
                <textarea
                  value={formData.moTa}
                  onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                  rows={3}
                  placeholder="Mô tả chi tiết về voucher..."
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={handleCloseModal}>
                  Hủy
                </button>
                <button type="submit" className={styles.submitBtn}>
                  {editingVoucher ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default VoucherPage

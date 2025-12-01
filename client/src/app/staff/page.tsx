'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image, { StaticImageData } from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Style from '../style/staff.module.css'
import {
  FaShoppingCart,
  FaUser,
  FaTimes,
  FaPlus,
  FaMinus,
  FaCheck,
  FaDoorOpen,
  FaMoneyBillWave,
  FaExchangeAlt,
  FaIdBadge,
  FaThLarge,
  FaSignOutAlt,
  FaQrcode,
  FaPrint,
  FaStore,
  FaHome,
  FaUserCog
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { MdLocalCafe, MdLocalBar, MdCake, MdFastfood } from 'react-icons/md'
import { GiTeapot } from 'react-icons/gi'
import { logo, coffeeBlack } from '../image/index'
import { monApi, donHangApi, chiTietDonHangApi, phienLamViecApi, tuyChonApi, ApiError, TuyChon, giamHoaDonApi, GiamHoaDon, comboApi } from '../../lib/api'
import { ProtectedRoute } from '../../components/ProtectedRoute'
import { useAuth } from '../../contexts/AuthContext'

type IconType = React.ComponentType<{ className?: string }>


interface Product {
  id: string
  name: string
  description: string
  price: number
  image: StaticImageData | string
  categoryId: string
  categoryName: string
}

interface Category {
  id: string
  name: string
  icon: IconType
}

interface CartItem extends Product {
  quantity: number
  topping?: TuyChon[]
  size?: string
  sugar?: string
  ice?: string
  note?: string
}

const CATEGORY_ICON_CYCLE: IconType[] = [MdLocalCafe, GiTeapot, MdLocalBar, MdCake, MdFastfood]

interface ShiftInfo {
  name?: string
  start?: string
  end?: string
}

const formatPrice = (price: number) => {
  // Format với dấu chấm ngăn cách phần nguyên (VD: 1.000.000 đ)
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' đ'
}

const quickActions = [
  {
    href: '/staff/open-shift',
    icon: FaDoorOpen,
    title: 'Mở phiên làm việc',
    description: 'Thiết lập ca mới và phân công nhân sự'
  },
  {
    href: '/staff/cashflow',
    icon: FaExchangeAlt,
    title: 'Thu chi trong ngày',
    description: 'Theo dõi phiếu thu, chi và tổng kết ca'
  },
  {
    href: '/staff/checkin-checkout',
    icon: FaIdBadge,
    title: 'Checkin / Checkout',
    description: 'Điểm danh thời gian vào ca và kết ca'
  }
]

const Staff = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [cart, setCart] = useState<CartItem[]>([])
  const [tableNumber, setTableNumber] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([
    { id: 'all', name: 'Tất cả', icon: FaThLarge }
  ])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('dine-in')
  const [selectedTable, setSelectedTable] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash')
  const [currentPhienLamViec, setCurrentPhienLamViec] = useState<string | null>(null)
  const [currentShiftInfo, setCurrentShiftInfo] = useState<ShiftInfo | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null)
  const [availablePromotions, setAvailablePromotions] = useState<GiamHoaDon[]>([])
  const [selectedPromotion, setSelectedPromotion] = useState<GiamHoaDon | null>(null)
  const [customerCash, setCustomerCash] = useState<string>('')
  const [showCustomizeModal, setShowCustomizeModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [toppings, setToppings] = useState<TuyChon[]>([])
  const [sizes, setSizes] = useState<TuyChon[]>([])
  const [sugars, setSugars] = useState<TuyChon[]>([])
  const [ices, setIces] = useState<TuyChon[]>([])
  const [customizeOptions, setCustomizeOptions] = useState({
    topping: [] as TuyChon[],
    size: '',
    sugar: '',
    ice: '',
    note: ''
  })
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [invoiceData, setInvoiceData] = useState<{
    maDonHang: string
    ngayGio: Date
    cart: CartItem[]
    orderType: 'dine-in' | 'takeaway'
    tableNumber: string | null
    paymentMethod: 'cash' | 'transfer'
    total: number
    discount?: number
    promotion?: string | null
  } | null>(null)
  
  const { user, logout } = useAuth()
  const router = useRouter()

  const showInvoicePrint = (data: {
    maDonHang: string
    ngayGio: Date
    cart: CartItem[]
    orderType: 'dine-in' | 'takeaway'
    tableNumber: string | null
    paymentMethod: 'cash' | 'transfer'
    total: number
  }) => {
    setInvoiceData(data)
    setShowInvoiceModal(true)
  }

  const handlePrintInvoice = () => {
    window.print()
  }

  const handleCloseInvoice = () => {
    setShowInvoiceModal(false)
    setInvoiceData(null)
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  // Load QR code from localStorage on mount
  useEffect(() => {
    const savedQrCode = localStorage.getItem('qrCodeImage')
    if (savedQrCode) {
      setQrCodeImage(savedQrCode)
    }
  }, [])

  // Load toppings from API
  useEffect(() => {
    const loadTuyChons = async () => {
      try {
        const [toppingData, sizeData, sugarData, iceData] = await Promise.all([
          tuyChonApi.getAll({ loaiTuyChon: 'topping' }),
          tuyChonApi.getAll({ loaiTuyChon: 'size' }),
          tuyChonApi.getAll({ loaiTuyChon: 'sugar' }),
          tuyChonApi.getAll({ loaiTuyChon: 'ice' })
        ])
        setToppings(toppingData)
        setSizes(sizeData)
        setSugars(sugarData)
        setIces(iceData)
        
        // Set default values if available
        if (sizeData.length > 0 && !customizeOptions.size) {
          const defaultSize = sizeData.find(s => s.TenTuyChon === 'M') || sizeData[0]
          setCustomizeOptions(prev => ({ ...prev, size: defaultSize.TenTuyChon }))
        }
        if (sugarData.length > 0 && !customizeOptions.sugar) {
          const defaultSugar = sugarData.find(s => s.TenTuyChon.includes('100')) || sugarData[0]
          setCustomizeOptions(prev => ({ ...prev, sugar: defaultSugar.TenTuyChon }))
        }
        if (iceData.length > 0 && !customizeOptions.ice) {
          const defaultIce = iceData.find(s => s.TenTuyChon.includes('Bình thường')) || iceData[0]
          setCustomizeOptions(prev => ({ ...prev, ice: defaultIce.TenTuyChon }))
        }
      } catch (err) {
        console.error('Error loading tuy chons:', err)
      }
    }
    loadTuyChons()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let ignore = false

    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [monData, phienLamViecData, comboData] = await Promise.all([
          monApi.getAll(),
          phienLamViecApi.getAll(),
          comboApi.getActiveCombos().catch(() => []) // Load combo, nếu lỗi thì trả về mảng rỗng
        ])

        if (ignore) return

        // Tìm phiên làm việc đang mở của nhân viên hiện tại
        if (user?.MaNhanVien) {
          const activePhien = phienLamViecData.find((plv) => {
            const maNhanVien = plv.MaNhanVien ?? plv.nhanVien?.MaNhanVien
            return maNhanVien === user.MaNhanVien && plv.TrangThai === 'mở'
          })
          if (activePhien) {
            setCurrentPhienLamViec(activePhien.MaPhienLamViec)
            if (activePhien.caLam) {
              setCurrentShiftInfo({
                name: activePhien.caLam.TenCaLam,
                start: activePhien.caLam.ThoiGianBatDau,
                end: activePhien.caLam.ThoiGianKetThuc
              })
            }
          }
        }

        // Extract unique categories from mon data
        const uniqueCategories = Array.from(new Set(monData.map(m => m.LoaiMon)))
        const baseCategories: Category[] = [
          { id: 'all', name: 'Tất cả', icon: FaThLarge },
          ...uniqueCategories.map((categoryName, index) => ({
            id: categoryName,
            name: categoryName,
            icon: CATEGORY_ICON_CYCLE[index % CATEGORY_ICON_CYCLE.length]
          }))
        ]

        // Map món thành products
        const mappedProducts: Product[] = monData.map((item) => ({
          id: item.MaMon,
          name: item.TenMon,
          description: `${item.NhomMon} - ${item.LoaiMon}`,
          price: item.DonGia ?? 0,
          image: item.imgUrl || coffeeBlack, // Use imgUrl from API or default
          categoryId: item.LoaiMon ?? 'other',
          categoryName: item.LoaiMon ?? 'Khác'
        }))

        // Map combo thành products
        const mappedCombos: Product[] = comboData.map((combo) => {
          const itemsDesc = combo.dsMonTrongCombos 
            ? combo.dsMonTrongCombos.map(ds => `${ds.mon?.TenMon || ''} x${ds.SoLuong}`).join(', ')
            : 'Combo'
          return {
            id: combo.MaCombo,
            name: combo.TenCombo,
            description: `Combo: ${itemsDesc}`,
            price: combo.GiaCombo ?? 0,
            image: coffeeBlack,
            categoryId: 'combo',
            categoryName: 'Combo'
          }
        })

        // Combine products và combos
        const allProducts = [...mappedProducts, ...mappedCombos]

        const hasOtherCategory = mappedProducts.some(
          (product) => product.categoryId === 'other'
        )

        // Thêm category combo nếu có combo
        const finalCategories = comboData.length > 0
          ? [...baseCategories, { id: 'combo', name: 'Combo', icon: MdFastfood }]
          : baseCategories

        const mappedCategories = hasOtherCategory
          ? [...finalCategories, { id: 'other', name: 'Khác', icon: MdFastfood }]
          : finalCategories

        setCategories(mappedCategories)
        setProducts(allProducts)

        if (mappedProducts.length === 0) {
          setActiveCategory('all')
        } else {
          const firstCategoryFromData = mappedProducts[0].categoryId
          const hasCategory = mappedCategories.some((cat) => cat.id === firstCategoryFromData)
          setActiveCategory(hasCategory ? firstCategoryFromData : 'all')
        }
      } catch (err) {
        if (ignore) return
        setError(
          err instanceof ApiError
            ? err.message
            : 'Không thể tải dữ liệu món. Vui lòng thử lại.'
        )
        setProducts([])
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
  }, [user])

  const visibleProducts = useMemo(() => {
    if (activeCategory === 'all') {
      return products
    }
    return products.filter((product) => product.categoryId === activeCategory)
  }, [activeCategory, products])

  const openCustomizeModal = (product: Product) => {
    setSelectedProduct(product)
    // Set default values from DB if available, otherwise empty
    const defaultSize = sizes.find(s => s.TenTuyChon === 'M')?.TenTuyChon || sizes[0]?.TenTuyChon || ''
    const defaultSugar = sugars.find(s => s.TenTuyChon.includes('100'))?.TenTuyChon || sugars[0]?.TenTuyChon || ''
    const defaultIce = ices.find(s => s.TenTuyChon.includes('Bình thường'))?.TenTuyChon || ices[0]?.TenTuyChon || ''
    setCustomizeOptions({
      topping: [] as TuyChon[],
      size: defaultSize,
      sugar: defaultSugar,
      ice: defaultIce,
      note: ''
    })
    setShowCustomizeModal(true)
  }

  const handleAddCustomizedItem = () => {
    if (!selectedProduct) return
    
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => {
          const sameTopping = JSON.stringify(
            (item.topping || []).map(t => t.MaTuyChon).sort()
          ) === JSON.stringify(
            customizeOptions.topping.map(t => t.MaTuyChon).sort()
          )
          return item.id === selectedProduct.id &&
            item.size === customizeOptions.size &&
            item.sugar === customizeOptions.sugar &&
            item.ice === customizeOptions.ice &&
            sameTopping &&
            item.note === customizeOptions.note
        }
      )
      
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === existingItem.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      
      return [...prevCart, {
        ...selectedProduct,
        quantity: 1,
        topping: customizeOptions.topping.length > 0 ? customizeOptions.topping : undefined,
        size: customizeOptions.size,
        sugar: customizeOptions.sugar,
        ice: customizeOptions.ice,
        note: customizeOptions.note || undefined
      }]
    })
    
    setShowCustomizeModal(false)
    setSelectedProduct(null)
    toast.success('Đã thêm món vào đơn hàng')
  }

  const addToCart = (product: Product) => {
    // Nếu là combo, thêm trực tiếp vào giỏ hàng (không cần customize)
    if (product.categoryId === 'combo') {
      const existingItem = cart.find(item => item.id === product.id)
      if (existingItem) {
        updateQuantity(product.id, existingItem.quantity + 1)
      } else {
        setCart(prevCart => [...prevCart, {
          ...product,
          quantity: 1
        }])
      }
      toast.success(`Đã thêm ${product.name} vào giỏ hàng`)
    } else {
      // Món thường, mở modal customize
    openCustomizeModal(product)
    }
  }

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
    setTableNumber('')
    setSelectedTable('')
    setOrderType('dine-in')
    setPaymentMethod('cash')
  }

  const handleOpenPaymentModal = async () => {
    if (cart.length === 0) return
    
    // Reload phiên làm việc để đảm bảo có phiên mới nhất
    if (user?.MaNhanVien) {
      try {
        const phienLamViecData = await phienLamViecApi.getAll()
        const activePhien = phienLamViecData.find((plv) => {
          const maNhanVien = plv.MaNhanVien ?? plv.nhanVien?.MaNhanVien
          return maNhanVien === user.MaNhanVien && plv.TrangThai === 'mở'
        })
        if (activePhien) {
          setCurrentPhienLamViec(activePhien.MaPhienLamViec)
          if (activePhien.caLam) {
            setCurrentShiftInfo({
              name: activePhien.caLam.TenCaLam,
              start: activePhien.caLam.ThoiGianBatDau,
              end: activePhien.caLam.ThoiGianKetThuc
            })
          }
        } else {
          setCurrentPhienLamViec(null)
        }
      } catch (err) {
        console.error('Error reloading phien lam viec:', err)
      }
    }
    
    setShowPaymentModal(true)
    // Sync table selection with current input when dùng tại quán
    if (orderType === 'dine-in') {
      setSelectedTable(tableNumber)
    } else {
      setSelectedTable('')
    }
    setPaymentMethod('cash')
    setSelectedPromotion(null)
    setCustomerCash('')
    
    // Load available promotions
    try {
      const promotions = await giamHoaDonApi.getActiveRules()
      const totalPrice = getTotalPrice()
      // Filter promotions that apply to current order
      const applicablePromotions = promotions.filter(promo => {
        if (promo.GiaTriTu && totalPrice < promo.GiaTriTu) return false
        return true
      })
      setAvailablePromotions(applicablePromotions)
    } catch (err) {
      console.error('Error loading promotions:', err)
      setAvailablePromotions([])
    }
  }

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false)
  }

  const handleQrCodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh')
        return
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 2MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setQrCodeImage(result)
        localStorage.setItem('qrCodeImage', result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProcessPayment = async () => {
    if (!currentPhienLamViec) {
      toast.error('Chưa có phiên làm việc đang mở. Vui lòng mở phiên làm việc trước.')
      return
    }

    if (orderType === 'dine-in' && !selectedTable) {
      toast.error('Vui lòng chọn số thẻ bàn')
      return
    }

    setIsProcessing(true)
    try {
      const now = new Date()
      
      // Tạo mã đơn hàng (max 10 characters: DH + 8 digits)
      const timestamp = Date.now().toString().slice(-8)
      const maDonHang = `DH${timestamp}`
      
      // Tạo đơn hàng
      await donHangApi.create({
        MaDonHang: maDonHang,
        MaPhienLamViec: currentPhienLamViec,
        Ngay: now.toISOString().split('T')[0],
        PhuongThucThanhToan: paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản',
        ...(selectedPromotion?.MaCTKM && { MaCTKM: selectedPromotion.MaCTKM })
      })

      // Tạo chi tiết đơn hàng
      const chiTietPromises = cart.map(async (item, index) => {
        // MaCTDH tối đa 10 ký tự (varchar(10)): CT + 6 số + 2 số thứ tự
        const detailTimestamp = Date.now().toString().slice(-6)
        const maCTDH = `CT${detailTimestamp}${String(index + 1).padStart(2, '0')}`
        return chiTietDonHangApi.create({
          MaCTDH: maCTDH,
          MaDH: maDonHang,
          MaMon: item.id,
          DonGia: item.price,
          SoLuong: item.quantity
        })
      })

      await Promise.all(chiTietPromises)

      // Lưu thông tin hóa đơn để hiển thị
      const invoiceData = {
        maDonHang,
        ngayGio: now,
        cart: [...cart],
        orderType,
        tableNumber: orderType === 'dine-in' ? selectedTable : null,
        paymentMethod,
        total: getTotalPrice(),
        discount: getDiscountAmount(),
        promotion: selectedPromotion?.ctkm?.TenCTKM || null
      }

      // Hiển thị hóa đơn
      setShowPaymentModal(false)
      
      // Hiển thị modal hóa đơn để in
      setTimeout(() => {
        showInvoicePrint(invoiceData)
      }, 300)

      toast.success('Thanh toán thành công!')
      clearCart()
    } catch (err) {
      toast.error('Lỗi: ' + (err instanceof ApiError ? err.message : 'Không thể tạo đơn hàng'))
    } finally {
      setIsProcessing(false)
    }
  }

  const getSubtotal = () =>
    cart.reduce((total, item) => {
      const itemPrice = item.price * item.quantity
      const toppingPrice = (item.topping || []).reduce((sum, topping) => sum + topping.GiaCongThem * item.quantity, 0)
      return total + itemPrice + toppingPrice
    }, 0)
  
  const getDiscountAmount = () => {
    if (!selectedPromotion) return 0
    const subtotal = getSubtotal()
    return selectedPromotion.LoaiGiam === 'Phần trăm' 
      ? subtotal * (selectedPromotion.SoTienGiam / 100)
      : selectedPromotion.SoTienGiam
  }
  
  const getTotalPrice = () => {
    const subtotal = getSubtotal()
    const discount = getDiscountAmount()
    return Math.max(0, subtotal - discount)
  }
  
  const getChangeAmount = () => {
    if (paymentMethod !== 'cash' || !customerCash) return 0
    const cashAmount = parseFloat(customerCash) || 0
    const total = getTotalPrice()
    return cashAmount - total // Trả về số dương nếu thừa, số âm nếu thiếu
  }

  useEffect(() => {
    if (!currentShiftInfo && user?.caLam) {
      setCurrentShiftInfo({
        name: user.caLam.TenCaLam,
        start: user.caLam.ThoiGianBatDau,
        end: user.caLam.ThoiGianKetThuc
      })
    }
  }, [currentShiftInfo, user])

  const shiftDisplay = useMemo(() => {
    const info = currentShiftInfo
    if (!info || (!info.name && !info.start && !info.end)) {
      return 'Ca hiện tại: Chưa xác định'
    }

    const parts = []
    if (info.name) {
      parts.push(info.name)
    }

    if (info.start || info.end) {
      parts.push(`${info.start || '??'} - ${info.end || '??'}`)
    }

    return `Ca hiện tại: ${parts.join(' · ')}`
  }, [currentShiftInfo])

  return (
    <ProtectedRoute>
      <div className={Style.staffContainer}>
        <header className={Style.header}>
          <div className={Style.headerLeft}>
            <div className={Style.logo}>
              <div className={Style.logoIconContainer}>
                <Image
                  src={logo}
                  alt="Cafe POS Logo"
                  width={40}
                  height={40}
                  className={Style.logoImage}
                />
              </div>
              <div>
                <h1>LOFI Coffee</h1>
                <p>Hệ thống bán hàng</p>
              </div>
            </div>
          </div>
          <div className={Style.headerRight}>
            <div className={Style.workTime}>{shiftDisplay}</div>
            <Link 
              href="/admin/statistic"
              className={Style.adminBtn}
              title="Truy cập Admin Panel"
            >
              <FaUserCog /> Admin
            </Link>
            <div className={Style.userIcon}>
              <FaUser />
            </div>
            <div>
              <strong>{user?.TenNhanVien || 'Người dùng'}</strong>
              <p>Chức vụ: {user?.ChucVu || 'Nhân viên'}</p>
            </div>
            <button 
              className={Style.logoutBtn}
              onClick={handleLogout}
              title="Đăng xuất"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </header>

      <div className={Style.quickActions}>
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.title} href={action.href} className={Style.quickActionCard}>
              <div className={Style.quickActionIcon}>
                <Icon />
              </div>
              <div className={Style.quickActionInfo}>
                <h3 className={Style.quickActionTitle}>{action.title}</h3>
                <p className={Style.quickActionDescription}>{action.description}</p>
              </div>
            </Link>
          )
        })}
      </div>

      <div className={Style.mainContent}>
        <div className={Style.leftPanel}>
          <div className={Style.categoryTabs}>
            {categories.map((category) => {
              const Icon = category.icon
              const isActive = activeCategory === category.id
              return (
                <button
                  key={category.id}
                  type="button"
                  className={`${Style.categoryTab} ${isActive ? Style.active : ''}`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <Icon className={Style.categoryIcon} />
                  <span>{category.name}</span>
                </button>
              )
            })}
          </div>

          <div className={Style.productGrid}>
            {loading ? (
              <div className={`${Style.productState} ${Style.productStateLoading}`}>
                Đang tải dữ liệu món...
              </div>
            ) : error ? (
              <div className={`${Style.productState} ${Style.productStateError}`}>
                {error}
              </div>
            ) : visibleProducts.length === 0 ? (
              <div className={Style.productState}>
                Không có món trong danh mục này.
              </div>
            ) : (
              visibleProducts.map((product) => (
                <div key={product.id} className={Style.productCard}>
                  <div className={Style.productImage}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={280}
                      height={200}
                      className={Style.productImg}
                    />
                    <div className={Style.productPrice}>{formatPrice(product.price)}</div>
                  </div>
                  <div className={Style.productInfo}>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <button
                      className={Style.addToCartBtn}
                      onClick={() => addToCart(product)}
                    >
                      <FaPlus /> Thêm vào đơn
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={Style.rightPanel}>
          <div className={Style.orderSection}>
            <h2>Đơn hàng hiện tại</h2>

            <div className={Style.customerInfo}>
              <div className={Style.inputGroup}>
                <label>Loại đơn</label>
                <div className={Style.orderTypeButtons}>
                  <button
                    type="button"
                    className={`${Style.orderTypeBtn} ${orderType === 'dine-in' ? Style.active : ''}`}
                    onClick={() => {
                      setOrderType('dine-in')
                      setTableNumber('')
                    }}
                  >
                    <FaStore /> Dùng tại quán
                  </button>
                  <button
                    type="button"
                    className={`${Style.orderTypeBtn} ${orderType === 'takeaway' ? Style.active : ''}`}
                    onClick={() => {
                      setOrderType('takeaway')
                      setTableNumber('Mang về')
                    }}
                  >
                    <FaHome /> Mang về
                  </button>
                </div>
              </div>
              {orderType === 'dine-in' && (
                <div className={Style.inputGroup}>
                  <label>Số thẻ bàn *</label>
                  <input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            <div className={Style.cartItems}>
              {cart.length === 0 ? (
                <div className={Style.emptyCart}>
                  <FaShoppingCart className={Style.emptyCartIcon} />
                  <p>Chưa có món nào trong đơn hàng</p>
                </div>
              ) : (
                cart.map((item, index) => (
                  <div key={`${item.id}-${index}`} className={Style.cartItem}>
                    <div className={Style.cartItemInfo}>
                      <h4>{item.name}</h4>
                      <p>{formatPrice(item.price)}</p>
                      {(item.size || item.sugar || item.ice || item.topping?.length || item.note) && (
                        <div className={Style.cartItemOptions}>
                          {item.size && <span>Size: {item.size}</span>}
                          {item.sugar && <span>Đường: {item.sugar}</span>}
                          {item.ice && <span>Đá: {item.ice}</span>}
                          {item.topping && item.topping.length > 0 && (
                            <span>
                              Topping: {item.topping.map(t => t.TenTuyChon).join(', ')}
                              {item.topping.reduce((sum, t) => sum + t.GiaCongThem, 0) > 0 && (
                                <span style={{ marginLeft: '0.5rem', color: '#8B4513', fontWeight: 600 }}>
                                  (+{formatPrice(item.topping.reduce((sum, t) => sum + t.GiaCongThem, 0) * item.quantity)})
                                </span>
                              )}
                            </span>
                          )}
                          {item.note && <span className={Style.cartItemNote}>Ghi chú: {item.note}</span>}
                        </div>
                      )}
                      <div className={Style.quantityControls}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className={Style.quantityBtn}
                        >
                          <FaMinus />
                        </button>
                        <span className={Style.quantity}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className={Style.quantityBtn}
                        >
                          <FaPlus />
                        </button>
                      </div>
                    </div>
                    <div className={Style.cartItemActions}>
                      <div className={Style.cartItemTotal}>
                        {formatPrice(
                          item.price * item.quantity + 
                          (item.topping || []).reduce((sum, t) => sum + t.GiaCongThem * item.quantity, 0)
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className={Style.removeBtn}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className={Style.orderTotal}>
              <div className={Style.totalRow}>
                <span>Tổng cộng:</span>
                <span className={Style.totalPrice}>{formatPrice(getTotalPrice())}</span>
              </div>
            </div>

            <div className={Style.actionButtons}>
              {cart.length > 0 && (
                <button className={Style.clearBtn} onClick={clearCart}>
                  Xóa đơn
                </button>
              )}
              <button
                className={Style.paymentBtn}
                disabled={cart.length === 0}
                onClick={handleOpenPaymentModal}
              >
                <FaCheck /> Thanh toán
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customize Modal */}
      {showCustomizeModal && selectedProduct && (
        <div className={Style.paymentModalOverlay} onClick={() => setShowCustomizeModal(false)}>
          <div className={Style.paymentModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={Style.paymentModalHeader}>
              <h2>Tùy chọn món: {selectedProduct.name}</h2>
              <button className={Style.closeBtn} onClick={() => setShowCustomizeModal(false)}>
                <FaTimes />
              </button>
            </div>

            <div className={Style.paymentModalBody}>
              {/* Size Selection - Optional */}
              {sizes.length > 0 && (
              <div className={Style.paymentSection}>
                  <label>Size (tùy chọn)</label>
                <div className={Style.orderTypeButtons}>
                    <button
                      type="button"
                      className={`${Style.orderTypeBtn} ${!customizeOptions.size ? Style.active : ''}`}
                      onClick={() => setCustomizeOptions({ ...customizeOptions, size: '' })}
                    >
                      Không chọn
                    </button>
                    {sizes.map((size) => (
                      <button
                        key={size.MaTuyChon}
                        type="button"
                        className={`${Style.orderTypeBtn} ${customizeOptions.size === size.TenTuyChon ? Style.active : ''}`}
                        onClick={() => setCustomizeOptions({ ...customizeOptions, size: size.TenTuyChon })}
                    >
                        {size.TenTuyChon}
                    </button>
                  ))}
                </div>
              </div>
              )}

              {/* Sugar Selection - Optional */}
              {sugars.length > 0 && (
              <div className={Style.paymentSection}>
                  <label>Đường (tùy chọn)</label>
                <div className={Style.orderTypeButtons}>
                    <button
                      type="button"
                      className={`${Style.orderTypeBtn} ${!customizeOptions.sugar ? Style.active : ''}`}
                      onClick={() => setCustomizeOptions({ ...customizeOptions, sugar: '' })}
                    >
                      Không chọn
                    </button>
                    {sugars.map((sugar) => (
                      <button
                        key={sugar.MaTuyChon}
                        type="button"
                        className={`${Style.orderTypeBtn} ${customizeOptions.sugar === sugar.TenTuyChon ? Style.active : ''}`}
                        onClick={() => setCustomizeOptions({ ...customizeOptions, sugar: sugar.TenTuyChon })}
                    >
                        {sugar.TenTuyChon}
                    </button>
                  ))}
                </div>
              </div>
              )}

              {/* Ice Selection - Optional */}
              {ices.length > 0 && (
              <div className={Style.paymentSection}>
                  <label>Đá (tùy chọn)</label>
                <div className={Style.orderTypeButtons}>
                    <button
                      type="button"
                      className={`${Style.orderTypeBtn} ${!customizeOptions.ice ? Style.active : ''}`}
                      onClick={() => setCustomizeOptions({ ...customizeOptions, ice: '' })}
                    >
                      Không chọn
                    </button>
                    {ices.map((ice) => (
                      <button
                        key={ice.MaTuyChon}
                        type="button"
                        className={`${Style.orderTypeBtn} ${customizeOptions.ice === ice.TenTuyChon ? Style.active : ''}`}
                        onClick={() => setCustomizeOptions({ ...customizeOptions, ice: ice.TenTuyChon })}
                    >
                        {ice.TenTuyChon}
                    </button>
                  ))}
                </div>
              </div>
              )}

              {/* Topping Selection */}
              <div className={Style.paymentSection}>
                <label>Topping (có thể chọn nhiều)</label>
                <div className={Style.orderTypeButtons} style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                  {toppings.length > 0 ? (
                    toppings.map((topping) => {
                      const isSelected = customizeOptions.topping.some(t => t.MaTuyChon === topping.MaTuyChon)
                      return (
                        <button
                          key={topping.MaTuyChon}
                          type="button"
                          className={`${Style.orderTypeBtn} ${isSelected ? Style.active : ''}`}
                          onClick={() => {
                            if (isSelected) {
                              setCustomizeOptions({
                                ...customizeOptions,
                                topping: customizeOptions.topping.filter(t => t.MaTuyChon !== topping.MaTuyChon)
                              })
                            } else {
                              setCustomizeOptions({
                                ...customizeOptions,
                                topping: [...customizeOptions.topping, topping]
                              })
                            }
                          }}
                        >
                          {topping.TenTuyChon}
                          {topping.GiaCongThem > 0 && (
                            <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', opacity: 0.8 }}>
                              (+{formatPrice(topping.GiaCongThem)})
                            </span>
                          )}
                        </button>
                      )
                    })
                  ) : (
                    <p style={{ color: '#999', fontSize: '0.9rem' }}>Đang tải danh sách topping...</p>
                  )}
                </div>
              </div>

              {/* Note Input */}
              <div className={Style.paymentSection}>
                <label>Ghi chú</label>
                <textarea
                  className={Style.tableInput}
                  placeholder="Nhập ghi chú đặc biệt (nếu có)..."
                  value={customizeOptions.note}
                  onChange={(e) => setCustomizeOptions({ ...customizeOptions, note: e.target.value })}
                  rows={3}
                />
              </div>

              <div className={Style.paymentModalActions}>
                <button
                  type="button"
                  className={Style.clearBtn}
                  onClick={() => setShowCustomizeModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className={Style.paymentBtn}
                  onClick={handleAddCustomizedItem}
                >
                  <FaCheck /> Thêm vào đơn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className={Style.paymentModalOverlay} onClick={handleClosePaymentModal}>
          <div className={Style.paymentModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={Style.paymentModalHeader}>
              <h2>Thanh toán</h2>
              <button className={Style.closeBtn} onClick={handleClosePaymentModal}>
                <FaTimes />
              </button>
            </div>

            <div className={Style.paymentModalBody}>
              {/* Order Type Selection */}
              <div className={Style.paymentSection}>
                <label>Loại đơn</label>
                <div className={Style.orderTypeButtons}>
                  <button
                    type="button"
                    className={`${Style.orderTypeBtn} ${orderType === 'dine-in' ? Style.active : ''}`}
                    onClick={() => {
                      setOrderType('dine-in')
                      setSelectedTable('')
                    }}
                  >
                    <FaStore /> Dùng tại quán
                  </button>
                  <button
                    type="button"
                    className={`${Style.orderTypeBtn} ${orderType === 'takeaway' ? Style.active : ''}`}
                    onClick={() => {
                      setOrderType('takeaway')
                      setSelectedTable('')
                    }}
                  >
                    <FaHome /> Mang về
                  </button>
                </div>
              </div>

              {/* Table Selection (only for dine-in) */}
              {orderType === 'dine-in' && (
                <div className={Style.paymentSection}>
                  <label>Số thẻ bàn *</label>
                  <div className={Style.tableGrid}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                      <button
                        key={num}
                        type="button"
                        className={`${Style.tableBtn} ${selectedTable === num.toString() ? Style.selected : ''}`}
                        onClick={() => {
                          setSelectedTable(num.toString())
                          setTableNumber(num.toString())
                        }}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    className={Style.tableInput}
                    placeholder="Hoặc nhập số thẻ bàn khác"
                    value={selectedTable}
                    onChange={(e) => {
                      setSelectedTable(e.target.value)
                      setTableNumber(e.target.value)
                    }}
                  />
                </div>
              )}

              {/* Promotion Selection */}
              <div className={Style.paymentSection}>
                <label>Khuyến mãi (tùy chọn)</label>
                {availablePromotions.length > 0 ? (
                  <select
                    className={Style.promotionSelect}
                    value={selectedPromotion?.MaGHD || ''}
                    onChange={(e) => {
                      const promo = availablePromotions.find(p => p.MaGHD === e.target.value)
                      setSelectedPromotion(promo || null)
                    }}
                  >
                    <option value="">-- Không chọn khuyến mãi --</option>
                    {availablePromotions.map((promo) => (
                      <option key={promo.MaGHD} value={promo.MaGHD}>
                        {promo.ctkm?.TenCTKM || 'Khuyến mãi'} - {promo.LoaiGiam === 'Phần trăm' 
                          ? `Giảm ${promo.SoTienGiam}%`
                          : `Giảm ${formatPrice(promo.SoTienGiam)}`}
                        {promo.GiaTriTu && ` (Từ ${formatPrice(promo.GiaTriTu)})`}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className={Style.promotionSelect} style={{ 
                    padding: '0.75rem', 
                    backgroundColor: '#f5f5f5', 
                    color: '#999',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'not-allowed'
                  }}>
                    Không có khuyến mãi khả dụng
                  </div>
                )}
              </div>

              {/* Payment Method Selection */}
              <div className={Style.paymentSection}>
                <label>Phương thức thanh toán</label>
                <div className={Style.paymentMethodButtons}>
                  <button
                    type="button"
                    className={`${Style.paymentMethodBtn} ${paymentMethod === 'cash' ? Style.active : ''}`}
                    onClick={() => {
                      setPaymentMethod('cash')
                      setCustomerCash('')
                    }}
                  >
                    <FaMoneyBillWave /> Tiền mặt
                  </button>
                  <button
                    type="button"
                    className={`${Style.paymentMethodBtn} ${paymentMethod === 'transfer' ? Style.active : ''}`}
                    onClick={() => {
                      setPaymentMethod('transfer')
                      setCustomerCash('')
                    }}
                  >
                    <FaQrcode /> Chuyển khoản
                  </button>
                </div>
              </div>

              {/* Cash Input for Change Calculation */}
              {paymentMethod === 'cash' && (
                <div className={Style.paymentSection}>
                  <label>Tiền khách đưa</label>
                  <input
                    type="number"
                    className={Style.cashInput}
                    placeholder="Nhập số tiền khách đưa"
                    value={customerCash}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                        setCustomerCash(value)
                      }
                    }}
                    min={0}
                    step={1000}
                  />
                  {/* Quick Money Buttons */}
                  <div className={Style.quickMoneyButtons}>
                    {[1000, 2000, 5000, 10000, 20000, 50000, 100000].map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        className={Style.quickMoneyBtn}
                        onClick={() => {
                          const current = customerCash ? parseFloat(customerCash) || 0 : 0
                          setCustomerCash(String(current + amount))
                        }}
                      >
                        +{amount >= 1000 ? `${amount / 1000}k` : amount}
                      </button>
                    ))}
                  </div>
                  {customerCash && parseFloat(customerCash) > 0 && (
                    <>
                      <div className={Style.changeInfo}>
                        <span>Tổng tiền cần thanh toán:</span>
                        <strong>{formatPrice(getTotalPrice())}</strong>
                      </div>
                      {getChangeAmount() > 0 && (
                        <div className={Style.changeAmount} style={{ color: '#28a745' }}>
                          <span>Tiền thừa cần trả lại:</span>
                          <strong>{formatPrice(getChangeAmount())}</strong>
                        </div>
                      )}
                      {getChangeAmount() < 0 && (
                        <div className={Style.changeAmount} style={{ color: '#dc3545' }}>
                          <span>Khách còn thiếu:</span>
                          <strong>{formatPrice(Math.abs(getChangeAmount()))}</strong>
                        </div>
                      )}
                      {getChangeAmount() === 0 && (
                        <div className={Style.changeAmount} style={{ color: '#28a745' }}>
                          <span>Đủ tiền, không cần trả lại</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* QR Code for Transfer */}
              {paymentMethod === 'transfer' && (
                <div className={Style.paymentSection}>
                  <label>QR Code thanh toán</label>
                  <div className={Style.qrCodeContainer}>
                    {qrCodeImage ? (
                      <div className={Style.qrCodeImageWrapper}>
                        <Image 
                          src={qrCodeImage} 
                          alt="QR Code thanh toán" 
                          className={Style.qrCodeImage}
                          width={200}
                          height={200}
                          unoptimized
                        />
                        <div className={Style.qrAmount}>
                          {formatPrice(getTotalPrice())}
                        </div>
                        <small>Quét mã để thanh toán</small>
                      </div>
                    ) : (
                      <div className={Style.qrCodePlaceholder}>
                        <FaQrcode className={Style.qrIcon} />
                        <p>Chưa có QR Code</p>
                        <small>Vui lòng upload ảnh QR Code</small>
                      </div>
                    )}
                  </div>
                  <div className={Style.qrCodeUpload}>
                    <label htmlFor="qrCodeUpload" className={Style.qrCodeUploadLabel}>
                      <FaQrcode /> {qrCodeImage ? 'Thay đổi QR Code' : 'Upload QR Code'}
                    </label>
                    <input
                      id="qrCodeUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleQrCodeUpload}
                      className={Style.qrCodeUploadInput}
                    />
                  </div>
                </div>
              )}

              {/* Invoice Preview */}
              <div className={Style.paymentSection}>
                <div className={Style.invoicePreview}>
                  <div className={Style.invoiceHeader}>
                    <h3>LOFI COFFEE</h3>
                    <p>Hóa đơn thanh toán</p>
                  </div>
                  <div className={Style.invoiceInfo}>
                    <div className={Style.invoiceRow}>
                      <span>Khách hàng:</span>
                      <span>Khách vãng lai</span>
                    </div>
                    {orderType === 'dine-in' && tableNumber && (
                      <div className={Style.invoiceRow}>
                        <span>Số thẻ bàn:</span>
                        <span>{tableNumber}</span>
                      </div>
                    )}
                    <div className={Style.invoiceRow}>
                      <span>Phương thức:</span>
                      <span>{paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}</span>
                    </div>
                    <div className={Style.invoiceDivider}></div>
                    <div className={Style.invoiceItems}>
                      {cart.map((item) => {
                        const itemTotal = item.price * item.quantity
                        const toppingTotal = (item.topping || []).reduce((sum, t) => sum + t.GiaCongThem * item.quantity, 0)
                        const total = itemTotal + toppingTotal
                        return (
                          <div key={item.id} className={Style.invoiceItem}>
                            <div>
                              <span className={Style.invoiceItemName}>{item.name}</span>
                              {item.size && <span style={{ fontSize: '0.85rem', color: '#666', marginLeft: '0.5rem' }}>({item.size})</span>}
                              <span className={Style.invoiceItemQty}>x{item.quantity}</span>
                              {item.topping && item.topping.length > 0 && (
                                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                                  Topping: {item.topping.map(t => t.TenTuyChon).join(', ')}
                                </div>
                              )}
                            </div>
                            <span>{formatPrice(total)}</span>
                          </div>
                        )
                      })}
                    </div>
                    {selectedPromotion && getDiscountAmount() > 0 && (
                      <>
                        <div className={Style.invoiceDivider}></div>
                        <div className={Style.invoiceRow}>
                          <span>Khuyến mãi:</span>
                          <span style={{ color: '#28a745' }}>
                            -{formatPrice(getDiscountAmount())}
                          </span>
                        </div>
                      </>
                    )}
                    <div className={Style.invoiceDivider}></div>
                    <div className={Style.invoiceTotal}>
                      <span>Tổng cộng:</span>
                      <span className={Style.invoiceTotalAmount}>{formatPrice(getTotalPrice())}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {!currentPhienLamViec && (
              <div style={{ 
                padding: '12px', 
                marginBottom: '16px', 
                backgroundColor: '#fee2e2', 
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#991b1b',
                fontSize: '0.9rem'
              }}>
                ⚠️ Chưa có phiên làm việc đang mở. Vui lòng <Link href="/staff/open-shift" style={{ color: '#dc2626', textDecoration: 'underline' }}>mở phiên làm việc</Link> trước khi thanh toán.
              </div>
            )}
            <div className={Style.paymentModalActions}>
              <button
                type="button"
                className={Style.cancelPaymentBtn}
                onClick={handleClosePaymentModal}
                disabled={isProcessing}
              >
                Hủy
              </button>
              <button
                type="button"
                className={Style.confirmPaymentBtn}
                onClick={handleProcessPayment}
                disabled={isProcessing || !currentPhienLamViec || (orderType === 'dine-in' && !selectedTable)}
                title={!currentPhienLamViec ? 'Vui lòng mở phiên làm việc trước' : undefined}
              >
                {isProcessing ? 'Đang xử lý...' : (
                  <>
                    <FaPrint /> Xác nhận và in hóa đơn
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Print Modal */}
      {showInvoiceModal && invoiceData && (
        <div className={Style.invoicePrintOverlay} id="invoice-print">
          <div className={Style.invoicePrintContent}>
            <div className={Style.invoicePrintHeader}>
              <h2>LOFI COFFEE</h2>
              <p>Hóa đơn thanh toán</p>
            </div>
            <div className={Style.invoicePrintInfo}>
              <div className={Style.invoicePrintRow}>
                <span>Mã đơn hàng:</span>
                <strong>{invoiceData.maDonHang}</strong>
              </div>
              <div className={Style.invoicePrintRow}>
                <span>Ngày giờ:</span>
                <span>{invoiceData.ngayGio.toLocaleString('vi-VN')}</span>
              </div>
              <div className={Style.invoicePrintRow}>
                <span>Nhân viên:</span>
                <span>{user?.TenNhanVien || 'N/A'}</span>
              </div>
              {invoiceData.orderType === 'dine-in' && invoiceData.tableNumber && (
                <div className={Style.invoicePrintRow}>
                  <span>Số thẻ bàn:</span>
                  <span>{invoiceData.tableNumber}</span>
                </div>
              )}
              {invoiceData.orderType === 'takeaway' && (
                <div className={Style.invoicePrintRow}>
                  <span>Loại đơn:</span>
                  <span>Mang về</span>
                </div>
              )}
              <div className={Style.invoicePrintRow}>
                <span>Phương thức:</span>
                <span>{invoiceData.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}</span>
              </div>
              <div className={Style.invoicePrintDivider}></div>
              <div className={Style.invoicePrintItems}>
                {invoiceData.cart.map((item) => {
                  const itemTotal = item.price * item.quantity
                  const toppingTotal = (item.topping || []).reduce((sum, t) => sum + t.GiaCongThem * item.quantity, 0)
                  const total = itemTotal + toppingTotal
                  return (
                    <div key={item.id} className={Style.invoicePrintItem}>
                      <div>
                        <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>
                          {item.name}
                          {item.size && <span style={{ fontSize: '0.9rem', marginLeft: '0.5rem', color: '#666' }}>({item.size})</span>}
                          <span style={{ marginLeft: '0.5rem', color: '#666' }}>x{item.quantity}</span>
                        </div>
                        {item.topping && item.topping.length > 0 && (
                          <div style={{ fontSize: '0.85rem', color: '#666', marginLeft: '1rem' }}>
                            + {item.topping.map(t => t.TenTuyChon).join(', ')}
                          </div>
                        )}
                        {(item.sugar || item.ice || item.note) && (
                          <div style={{ fontSize: '0.85rem', color: '#999', marginLeft: '1rem', marginTop: '0.25rem' }}>
                            {item.sugar && `Đường: ${item.sugar} `}
                            {item.ice && `Đá: ${item.ice} `}
                            {item.note && `Ghi chú: ${item.note}`}
                          </div>
                        )}
                      </div>
                      <span style={{ fontWeight: 600 }}>{formatPrice(total)}</span>
                    </div>
                  )
                })}
              </div>
              {invoiceData.discount && invoiceData.discount > 0 && (
                <>
                  <div className={Style.invoicePrintDivider}></div>
                  <div className={Style.invoicePrintRow}>
                    <span>Khuyến mãi:</span>
                    <span style={{ color: '#28a745' }}>
                      -{formatPrice(invoiceData.discount)}
                    </span>
                  </div>
                </>
              )}
              <div className={Style.invoicePrintDivider}></div>
              <div className={Style.invoicePrintTotal}>
                <span>Tổng cộng:</span>
                <strong className={Style.invoicePrintTotalAmount}>{formatPrice(invoiceData.total)}</strong>
              </div>
              <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#666', fontSize: '0.9rem' }}>
                <p>Cảm ơn quý khách!</p>
                <p>Hẹn gặp lại</p>
              </div>
            </div>
            <div className={Style.invoicePrintActions}>
              <button
                type="button"
                className={Style.cancelPaymentBtn}
                onClick={handleCloseInvoice}
              >
                Đóng
              </button>
              <button
                type="button"
                className={Style.confirmPaymentBtn}
                onClick={handlePrintInvoice}
              >
                <FaPrint /> In hóa đơn
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </ProtectedRoute>
  )
}

export default Staff

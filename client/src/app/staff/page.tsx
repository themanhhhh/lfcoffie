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
import { monApi, donHangApi, chiTietDonHangApi, phienLamViecApi, tuyChonApi, ApiError, TuyChon } from '../../lib/api'
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

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(price) + ' đ'

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
  const [showCustomizeModal, setShowCustomizeModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [toppings, setToppings] = useState<TuyChon[]>([])
  const [customizeOptions, setCustomizeOptions] = useState({
    topping: [] as TuyChon[],
    size: 'M',
    sugar: '100%',
    ice: 'Bình thường',
    note: ''
  })
  
  const { user, logout } = useAuth()
  const router = useRouter()

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
    const loadToppings = async () => {
      try {
        const toppingData = await tuyChonApi.getAll({ loaiTuyChon: 'topping' })
        setToppings(toppingData)
      } catch (err) {
        console.error('Error loading toppings:', err)
      }
    }
    loadToppings()
  }, [])

  useEffect(() => {
    let ignore = false

    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [monData, phienLamViecData] = await Promise.all([
          monApi.getAll(),
          phienLamViecApi.getAll()
        ])

        if (ignore) return

        // Tìm phiên làm việc đang mở của nhân viên hiện tại
        if (user?.MaNhanVien) {
          const activePhien = phienLamViecData.find(
            (plv) => plv.MaNhanVien === user.MaNhanVien && plv.TrangThai === 'mở'
          )
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

        const mappedProducts: Product[] = monData.map((item) => ({
          id: item.MaMon,
          name: item.TenMon,
          description: `${item.NhomMon} - ${item.LoaiMon}`,
          price: item.DonGia ?? 0,
          image: item.imgUrl || coffeeBlack, // Use imgUrl from API or default
          categoryId: item.LoaiMon ?? 'other',
          categoryName: item.LoaiMon ?? 'Khác'
        }))

        const hasOtherCategory = mappedProducts.some(
          (product) => product.categoryId === 'other'
        )

        const mappedCategories = hasOtherCategory
          ? [...baseCategories, { id: 'other', name: 'Khác', icon: MdFastfood }]
          : baseCategories

        setCategories(mappedCategories)
        setProducts(mappedProducts)

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
    setCustomizeOptions({
      topping: [] as TuyChon[],
      size: 'M',
      sugar: '100%',
      ice: 'Bình thường',
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
    openCustomizeModal(product)
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
        const activePhien = phienLamViecData.find(
          (plv) => plv.MaNhanVien === user.MaNhanVien && plv.TrangThai === 'mở'
        )
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
      
      // Tạo mã đơn hàng
      const maDonHang = `DH${Date.now().toString().slice(-6)}`
      
      // Tạo đơn hàng
      await donHangApi.create({
        MaDonHang: maDonHang,
        MaPhienLamViec: currentPhienLamViec,
        Ngay: now.toISOString().split('T')[0],
        PhuongThucThanhToan: paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'
      })

      // Tạo chi tiết đơn hàng
      const chiTietPromises = cart.map(async (item, index) => {
        const maCTDH = `CT${maDonHang}${String(index + 1).padStart(2, '0')}`
        return chiTietDonHangApi.create({
          MaCTDH: maCTDH,
          MaDH: maDonHang,
          MaMon: item.id,
          DonGia: item.price,
          SoLuong: item.quantity
        })
      })

      await Promise.all(chiTietPromises)

      // Hiển thị hóa đơn
      setShowPaymentModal(false)
      
      // In hóa đơn (có thể mở window print)
      setTimeout(() => {
        window.print()
      }, 500)

      toast.success('Thanh toán thành công!')
      clearCart()
    } catch (err) {
      toast.error('Lỗi: ' + (err instanceof ApiError ? err.message : 'Không thể tạo đơn hàng'))
    } finally {
      setIsProcessing(false)
    }
  }

  const getTotalPrice = () =>
    cart.reduce((total, item) => {
      const itemPrice = item.price * item.quantity
      const toppingPrice = (item.topping || []).reduce((sum, topping) => sum + topping.GiaCongThem * item.quantity, 0)
      return total + itemPrice + toppingPrice
    }, 0)

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
              {/* Size Selection */}
              <div className={Style.paymentSection}>
                <label>Size *</label>
                <div className={Style.orderTypeButtons}>
                  {['S', 'M', 'L'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`${Style.orderTypeBtn} ${customizeOptions.size === size ? Style.active : ''}`}
                      onClick={() => setCustomizeOptions({ ...customizeOptions, size })}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sugar Selection */}
              <div className={Style.paymentSection}>
                <label>Đường *</label>
                <div className={Style.orderTypeButtons}>
                  {['0%', '25%', '50%', '75%', '100%'].map((sugar) => (
                    <button
                      key={sugar}
                      type="button"
                      className={`${Style.orderTypeBtn} ${customizeOptions.sugar === sugar ? Style.active : ''}`}
                      onClick={() => setCustomizeOptions({ ...customizeOptions, sugar })}
                    >
                      {sugar}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ice Selection */}
              <div className={Style.paymentSection}>
                <label>Đá *</label>
                <div className={Style.orderTypeButtons}>
                  {['Không đá', 'Ít đá', 'Bình thường', 'Nhiều đá'].map((ice) => (
                    <button
                      key={ice}
                      type="button"
                      className={`${Style.orderTypeBtn} ${customizeOptions.ice === ice ? Style.active : ''}`}
                      onClick={() => setCustomizeOptions({ ...customizeOptions, ice })}
                    >
                      {ice}
                    </button>
                  ))}
                </div>
              </div>

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

              {/* Payment Method Selection */}
              <div className={Style.paymentSection}>
                <label>Phương thức thanh toán</label>
                <div className={Style.paymentMethodButtons}>
                  <button
                    type="button"
                    className={`${Style.paymentMethodBtn} ${paymentMethod === 'cash' ? Style.active : ''}`}
                    onClick={() => setPaymentMethod('cash')}
                  >
                    <FaMoneyBillWave /> Tiền mặt
                  </button>
                  <button
                    type="button"
                    className={`${Style.paymentMethodBtn} ${paymentMethod === 'transfer' ? Style.active : ''}`}
                    onClick={() => setPaymentMethod('transfer')}
                  >
                    <FaQrcode /> Chuyển khoản
                  </button>
                </div>
              </div>

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
                      {cart.map((item) => (
                        <div key={item.id} className={Style.invoiceItem}>
                          <div>
                            <span className={Style.invoiceItemName}>{item.name}</span>
                            <span className={Style.invoiceItemQty}>x{item.quantity}</span>
                          </div>
                          <span>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
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
      </div>
    </ProtectedRoute>
  )
}

export default Staff

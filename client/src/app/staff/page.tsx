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
  FaHome
} from 'react-icons/fa'
import { MdLocalCafe, MdLocalBar, MdCake, MdFastfood } from 'react-icons/md'
import { GiTeapot } from 'react-icons/gi'
import { logo, coffeeBlack } from '../image/index'
import { monApi, donHangApi, chiTietDonHangApi, phienLamViecApi, ApiError } from '../../lib/api'
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
}

const CATEGORY_ICON_CYCLE: IconType[] = [MdLocalCafe, GiTeapot, MdLocalBar, MdCake, MdFastfood]

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
    href: '/staff/open-shift',
    icon: FaMoneyBillWave,
    title: 'Nhập tiền đầu phiên',
    description: 'Ghi nhận tiền mặt tại quầy trước khi bán'
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
  const [customerName, setCustomerName] = useState('')
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
  const [isProcessing, setIsProcessing] = useState(false)
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null)
  
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

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prevCart, { ...product, quantity: 1 }]
    })
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
    setCustomerName('')
    setTableNumber('')
    setSelectedTable('')
    setOrderType('dine-in')
    setPaymentMethod('cash')
  }

  const handleOpenPaymentModal = () => {
    if (cart.length === 0) return
    setShowPaymentModal(true)
    // Reset payment options
    setOrderType('dine-in')
    setSelectedTable('')
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
        alert('Vui lòng chọn file ảnh')
        return
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 2MB')
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
      alert('Chưa có phiên làm việc đang mở. Vui lòng mở phiên làm việc trước.')
      return
    }

    if (orderType === 'dine-in' && !selectedTable) {
      alert('Vui lòng chọn số bàn')
      return
    }

    setIsProcessing(true)
    try {
      const totalAmount = getTotalPrice()
      const now = new Date()
      
      // Tạo mã đơn hàng
      const maDonHang = `DH${Date.now().toString().slice(-6)}`
      
      // Tạo đơn hàng
      const donHang = await donHangApi.create({
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

      alert('Thanh toán thành công!')
      clearCart()
    } catch (err) {
      alert('Lỗi: ' + (err instanceof ApiError ? err.message : 'Không thể tạo đơn hàng'))
    } finally {
      setIsProcessing(false)
    }
  }

  const getTotalPrice = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0)

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
            <div className={Style.workTime}>Ca hiện tại: 07:00 - 12:00</div>
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
                <label>Tên khách hàng</label>
                <input
                  type="text"
                  placeholder="Nhập tên khách hàng"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
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
                  <label>Số bàn *</label>
                  <input
                    type="text"
                    placeholder="Nhập số bàn (VD: 1, 2, 3...)"
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
                cart.map((item) => (
                  <div key={item.id} className={Style.cartItem}>
                    <div className={Style.cartItemInfo}>
                      <h4>{item.name}</h4>
                      <p>{formatPrice(item.price)}</p>
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
                        {formatPrice(item.price * item.quantity)}
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
                  <label>Số bàn *</label>
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
                    placeholder="Hoặc nhập số bàn khác"
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
                        <img 
                          src={qrCodeImage} 
                          alt="QR Code thanh toán" 
                          className={Style.qrCodeImage}
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
                      <span>{customerName || 'Khách vãng lai'}</span>
                    </div>
                    {orderType === 'dine-in' && tableNumber && (
                      <div className={Style.invoiceRow}>
                        <span>Số bàn:</span>
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
                disabled={isProcessing || (orderType === 'dine-in' && !selectedTable)}
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

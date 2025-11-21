'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image, { StaticImageData } from 'next/image'
import Style from '../style/admin.module.css'
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes
} from 'react-icons/fa'
import { coffeeBlack } from '../image/index'
import { monApi, ApiError } from '../../lib/api'
import { toast } from 'react-hot-toast'

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: StaticImageData | string
  categoryId: string
  categoryName: string
}


const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(price) + ' đ'

interface ProductFormData {
  MaMon: string
  TenMon: string
  DonGia: number
  DonViTinh: string
  LoaiMon: string
  NhomMon: string
  TrangThai?: string
  imgUrl?: string
}

const Admin = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const [menuItems, setMenuItems] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>({
    MaMon: '',
    TenMon: '',
    DonGia: 0,
    DonViTinh: 'ly',
    LoaiMon: 'cafe',
    NhomMon: 'đồ uống',
    TrangThai: 'hoạt động',
    imgUrl: ''
  })

  useEffect(() => {
    let ignore = false
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const monData = await monApi.getAll()
        if (ignore) return

        // Extract unique categories from mon data
        const uniqueCategories = Array.from(new Set(monData.map(m => m.LoaiMon)))
        const mappedCategories: Category[] = uniqueCategories.map((categoryName) => ({
          id: categoryName,
          name: categoryName
        }))

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

        setCategories(
          hasOtherCategory
            ? [...mappedCategories, { id: 'other', name: 'Khác' }]
            : mappedCategories
        )
        setMenuItems(mappedProducts)
      } catch (err) {
        if (ignore) return
        setError(
          err instanceof ApiError
            ? err.message
            : 'Không thể tải dữ liệu menu. Vui lòng thử lại.'
        )
        setMenuItems([])
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

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterCategory])

  const filteredItems = useMemo(() => {
    const lowerKeyword = searchTerm.trim().toLowerCase()
    return menuItems.filter((item) => {
      const matchesSearch =
        lowerKeyword.length === 0 ||
        item.name.toLowerCase().includes(lowerKeyword) ||
        item.description.toLowerCase().includes(lowerKeyword)
      const matchesCategory =
        filterCategory === 'all' || item.categoryId === filterCategory
      return matchesSearch && matchesCategory
    })
  }, [menuItems, searchTerm, filterCategory])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredItems.slice(startIndex, endIndex)

  const loadMenuData = async () => {
    try {
      const monData = await monApi.getAll()

      // Extract unique categories from mon data
      const uniqueCategories = Array.from(new Set(monData.map(m => m.LoaiMon)))
      const mappedCategories: Category[] = uniqueCategories.map((categoryName) => ({
        id: categoryName,
        name: categoryName
      }))

      const mappedProducts: Product[] = monData.map((item) => ({
        id: item.MaMon,
        name: item.TenMon,
        description: `${item.NhomMon} - ${item.LoaiMon}`,
        price: item.DonGia ?? 0,
        image: coffeeBlack, // Default image
        categoryId: item.LoaiMon ?? 'other',
        categoryName: item.LoaiMon ?? 'Khác'
      }))

      const hasOtherCategory = mappedProducts.some(
        (product) => product.categoryId === 'other'
      )

      setCategories(
        hasOtherCategory
          ? [...mappedCategories, { id: 'other', name: 'Khác' }]
          : mappedCategories
      )
      setMenuItems(mappedProducts)
    } catch (err) {
      throw err
    }
  }

  const handleAddItem = () => {
    setEditingProduct(null)
    setFormData({
      MaMon: '',
      TenMon: '',
      DonGia: 0,
      DonViTinh: 'ly',
      LoaiMon: categories[0]?.id || 'cafe',
      NhomMon: 'đồ uống',
      TrangThai: 'hoạt động',
      imgUrl: ''
    })
    setShowModal(true)
  }

  const handleEditItem = (item: Product) => {
    setEditingProduct(item)
    const monItem = menuItems.find(m => m.id === item.id)
    setFormData({
      MaMon: item.id,
      TenMon: item.name,
      DonGia: item.price,
      DonViTinh: 'ly',
      LoaiMon: item.categoryId,
      NhomMon: monItem?.description?.split(' - ')[0] || 'đồ uống',
      TrangThai: 'hoạt động',
      imgUrl: typeof item.image === 'string' ? item.image : ''
    })
    setShowModal(true)
  }

  const handleDeleteItem = async (item: Product) => {
    if (!confirm(`Bạn có chắc muốn xóa "${item.name}"?`)) {
      return
    }

    try {
      await monApi.delete(item.id)
      await loadMenuData()
      toast.success('Xóa món thành công!')
    } catch (err) {
      toast.error('Lỗi khi xóa món: ' + (err instanceof ApiError ? err.message : 'Unknown error'))
    }
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingProduct) {
        // Update
        await monApi.update(editingProduct.id, formData)
        toast.success('Cập nhật món thành công!')
      } else {
        // Create
        await monApi.create(formData)
        toast.success('Thêm món mới thành công!')
      }

      setShowModal(false)
      await loadMenuData()
    } catch (err) {
      toast.error('Lỗi: ' + (err instanceof ApiError ? err.message : 'Unknown error'))
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingProduct(null)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const getPageNumbers = () => {
    const pages: number[] = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - 2)
    const end = Math.min(totalPages, start + maxVisible - 1)

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  }

  return (
    <div className={Style.content}>
          <div className={Style.contentHeader}>
            <div className={Style.pageTitle}>
              <h2>Quản lý Menu</h2>
              <p>
                Tổng số món: {filteredItems.length} | Hiển thị:{' '}
                {filteredItems.length === 0
                  ? '0'
                  : `${startIndex + 1}-${Math.min(endIndex, filteredItems.length)}`}
              </p>
            </div>
            <button className={Style.addBtn} onClick={handleAddItem}>
              <FaPlus /> Thêm món mới
            </button>
          </div>

          <div className={Style.filterSection}>
            <div className={Style.searchBox}>
              <FaSearch className={Style.searchIcon} />
              <input
                type="text"
                placeholder="Tìm kiếm món ăn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={Style.searchInput}
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={Style.filterSelect}
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className={Style.tableContainer}>
            <table className={Style.menuTable}>
              <thead>
                <tr>
                  <th>Món</th>
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Mô tả</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className={Style.tableState}>
                      Đang tải dữ liệu menu...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className={`${Style.tableState} ${Style.tableStateError}`}>
                      {error}
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={Style.tableState}>
                      Không tìm thấy món phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className={Style.menuItemCell}>
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={60}
                            height={60}
                            className={Style.menuTableImg}
                          />
                          <div className={Style.menuItemInfo}>
                            <h4>{item.name}</h4>
                            <span className={Style.itemId}>ID: {item.id}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={Style.categoryTag}>{item.categoryName}</span>
                      </td>
                      <td className={Style.priceCell}>{formatPrice(item.price)}</td>
                      <td className={Style.descCell}>{item.description}</td>
                      <td>
                        <div className={Style.actionButtons}>
                          <button
                            className={Style.editBtn}
                            onClick={() => handleEditItem(item)}
                            title="Chỉnh sửa"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className={Style.deleteBtn}
                            onClick={() => handleDeleteItem(item)}
                            title="Xóa"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && !loading && !error && (
            <div className={Style.paginationContainer}>
              <div className={Style.paginationInfo}>
                Trang {currentPage} / {totalPages}
              </div>
              <div className={Style.pagination}>
                <button
                  className={`${Style.pageBtn} ${currentPage === 1 ? Style.disabled : ''}`}
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  «
                </button>

                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    className={`${Style.pageBtn} ${currentPage === page ? Style.active : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  className={`${Style.pageBtn} ${currentPage === totalPages ? Style.disabled : ''}`}
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  »
                </button>
              </div>
            </div>
          )}

      {/* Modal for Add/Edit Product */}
      {showModal && (
        <div className={Style.modalOverlay} onClick={handleCloseModal}>
          <div className={Style.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={Style.modalHeader}>
              <h2>{editingProduct ? 'Chỉnh sửa món' : 'Thêm món mới'}</h2>
              <button className={Style.closeBtn} onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmitForm} className={Style.modalForm}>
              <div className={Style.formGroup}>
                <label>Mã món *</label>
                <input
                  type="text"
                  value={formData.MaMon}
                  onChange={(e) => setFormData({ ...formData, MaMon: e.target.value })}
                  disabled={!!editingProduct}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Tên món *</label>
                <input
                  type="text"
                  value={formData.TenMon}
                  onChange={(e) => setFormData({ ...formData, TenMon: e.target.value })}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Loại món *</label>
                <select
                  value={formData.LoaiMon}
                  onChange={(e) => setFormData({ ...formData, LoaiMon: e.target.value })}
                  required
                >
                  <option value="">-- Chọn loại món --</option>
                  {categories
                    .filter((cat) => cat.id !== 'other')
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className={Style.formGroup}>
                <label>Nhóm món *</label>
                <select
                  value={formData.NhomMon}
                  onChange={(e) => setFormData({ ...formData, NhomMon: e.target.value })}
                  required
                >
                  <option value="đồ uống">Đồ uống</option>
                  <option value="đồ ăn">Đồ ăn</option>
                  <option value="combo">Combo</option>
                </select>
              </div>
              <div className={Style.formRow}>
                <div className={Style.formGroup}>
                  <label>Đơn giá *</label>
                  <input
                    type="number"
                    value={formData.DonGia}
                    onChange={(e) => setFormData({ ...formData, DonGia: Number(e.target.value) })}
                    required
                    min="0"
                  />
                </div>
                <div className={Style.formGroup}>
                  <label>Đơn vị tính *</label>
                  <input
                    type="text"
                    value={formData.DonViTinh}
                    onChange={(e) => setFormData({ ...formData, DonViTinh: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className={Style.formGroup}>
                <label>Trạng thái</label>
                <select
                  value={formData.TrangThai || 'hoạt động'}
                  onChange={(e) => setFormData({ ...formData, TrangThai: e.target.value })}
                >
                  <option value="hoạt động">Hoạt động</option>
                  <option value="tạm ngưng">Tạm ngưng</option>
                </select>
              </div>
              <div className={Style.formGroup}>
                <label>URL hình ảnh</label>
                <input
                  type="url"
                  value={formData.imgUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imgUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className={Style.modalActions}>
                <button type="button" className={Style.cancelBtn} onClick={handleCloseModal}>
                  Hủy
                </button>
                <button type="submit" className={Style.submitBtn}>
                  {editingProduct ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin

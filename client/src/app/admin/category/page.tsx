'use client'

import React, { useEffect, useState } from 'react'
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
  FaList
} from 'react-icons/fa'
import styles from './category.module.css'
import { apiFetch, ApiError } from '../../../lib/api'

interface Category {
  maLoaiMon: string
  tenLoaiMon: string
}

interface CategoryFormData {
  maLoaiMon: string
  tenLoaiMon: string
}

const CategoryPage = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({
    maLoaiMon: '',
    tenLoaiMon: ''
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    setError(null)
    try {
      // Get all mon and extract unique LoaiMon
      const monData = await apiFetch<any[]>('/api/mon')
      // Extract unique LoaiMon values
      const uniqueLoaiMon = Array.from(new Set(monData.map(m => m.LoaiMon)))
      // Map to Category format
      const data: Category[] = uniqueLoaiMon.map((loaiMon, index) => ({
        maLoaiMon: `LM${String(index + 1).padStart(2, '0')}`, // Generate code like LM01, LM02
        tenLoaiMon: loaiMon
      }))
      setCategories(data)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Không thể tải danh sách danh mục. Vui lòng thử lại.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = () => {
    setEditingCategory(null)
    setFormData({
      maLoaiMon: '',
      tenLoaiMon: ''
    })
    setShowModal(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      maLoaiMon: category.maLoaiMon,
      tenLoaiMon: category.tenLoaiMon
    })
    setShowModal(true)
  }

  const handleDeleteCategory = async (category: Category) => {
    alert('Chức năng xóa danh mục hiện chưa khả dụng. Danh mục được quản lý thông qua các món.')
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    alert('Chức năng thêm/sửa danh mục hiện chưa khả dụng. Danh mục được tự động tạo từ LoaiMon của các món. Để thêm danh mục mới, hãy tạo món với LoaiMon mới.')
    setShowModal(false)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCategory(null)
  }

  const filteredCategories = categories.filter((cat) =>
    cat.tenLoaiMon.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.maLoaiMon.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        <div className={styles.header}>
          <div className={styles.headerMain}>
            <h1>
              <FaList /> Quản lý Danh mục
            </h1>
            <p>Quản lý các loại món ăn, đồ uống</p>
          </div>
          <button className={styles.addButton} onClick={handleAddCategory}>
            <FaPlus /> Thêm danh mục mới
          </button>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <FaSearch />
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.stats}>
            <span>Tổng số: {filteredCategories.length} danh mục</span>
          </div>
        </div>

        <div className={styles.gridContainer}>
          {filteredCategories.map((category) => (
            <div key={category.maLoaiMon} className={styles.categoryCard}>
              <div className={styles.categoryHeader}>
                <h3>{category.tenLoaiMon}</h3>
                <span className={styles.categoryCode}>{category.maLoaiMon}</span>
              </div>
              <div className={styles.categoryActions}>
                <button
                  className={styles.editBtn}
                  onClick={() => handleEditCategory(category)}
                  title="Chỉnh sửa"
                >
                  <FaEdit /> Sửa
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDeleteCategory(category)}
                  title="Xóa"
                >
                  <FaTrash /> Xóa
                </button>
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className={styles.emptyState}>
              <FaList />
              <h3>Không tìm thấy danh mục</h3>
              <p>Không có danh mục phù hợp với từ khóa tìm kiếm.</p>
            </div>
          )}
        </div>

      {/* Modal for Add/Edit Category */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h2>
              <button className={styles.closeBtn} onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmitForm} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Mã danh mục *</label>
                <input
                  type="text"
                  value={formData.maLoaiMon}
                  onChange={(e) => setFormData({ ...formData, maLoaiMon: e.target.value })}
                  disabled={!!editingCategory}
                  required
                  placeholder="VD: LM01"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Tên danh mục *</label>
                <input
                  type="text"
                  value={formData.tenLoaiMon}
                  onChange={(e) => setFormData({ ...formData, tenLoaiMon: e.target.value })}
                  required
                  placeholder="VD: Cà phê"
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={handleCloseModal}>
                  Hủy
                </button>
                <button type="submit" className={styles.submitBtn}>
                  {editingCategory ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
  )
}

export default CategoryPage

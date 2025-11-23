'use client'

import React, { useEffect, useState } from 'react'
import {
  FaSearch,
  FaTimes,
  FaList,
  FaChartBar
} from 'react-icons/fa'
import styles from './category.module.css'
import { apiFetch, ApiError, Mon, thongKeApi, CategoryStats } from '../../../lib/api'
import { toast } from 'react-hot-toast'

interface Category {
  maLoaiMon: string
  tenLoaiMon: string
}

const CategoryPage = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [categoryStats, setCategoryStats] = useState<CategoryStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    setError(null)
    try {
      // Get all mon and extract unique LoaiMon
      const monData = await apiFetch<Mon[]>('/api/mon')
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

  const handleViewStats = async (category: Category) => {
    setSelectedCategory(category)
    setShowStatsModal(true)
    setLoadingStats(true)
    setCategoryStats(null)
    
    try {
      const stats = await thongKeApi.getCategoryStats({
        loaiMon: category.tenLoaiMon
      })
      setCategoryStats(stats)
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : 'Không thể tải thống kê danh mục. Vui lòng thử lại.'
      )
    } finally {
      setLoadingStats(false)
    }
  }

  const handleCloseStatsModal = () => {
    setShowStatsModal(false)
    setSelectedCategory(null)
    setCategoryStats(null)
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
            <p>Xem danh sách và thống kê các loại món ăn, đồ uống</p>
          </div>
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
                  className={styles.viewStatsBtn}
                  onClick={() => handleViewStats(category)}
                  title="Xem thống kê"
                >
                  <FaChartBar /> Xem thống kê
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

      {/* Modal for Category Statistics */}
      {showStatsModal && (
        <div className={styles.modalOverlay} onClick={handleCloseStatsModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                <FaChartBar /> Thống kê danh mục: {selectedCategory?.tenLoaiMon}
              </h2>
              <button className={styles.closeBtn} onClick={handleCloseStatsModal}>
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalForm}>
              {loadingStats ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  Đang tải thống kê...
                </div>
              ) : categoryStats ? (
                <div className={styles.statsContainer}>
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Số món</div>
                    <div className={styles.statValue}>{categoryStats.soMon}</div>
                    <div className={styles.statDescription}>Tổng số món trong danh mục</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Tổng số lượng bán</div>
                    <div className={styles.statValue}>{categoryStats.tongSoLuong.toLocaleString('vi-VN')}</div>
                    <div className={styles.statDescription}>Tổng số lượng đã bán</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Tổng doanh thu</div>
                    <div className={styles.statValue}>{categoryStats.tongDoanhThu.toLocaleString('vi-VN')} ₫</div>
                    <div className={styles.statDescription}>Doanh thu từ danh mục này</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Số đơn hàng</div>
                    <div className={styles.statValue}>{categoryStats.soDonHang}</div>
                    <div className={styles.statDescription}>Số đơn hàng có món thuộc danh mục</div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                  Không có dữ liệu thống kê
                </div>
              )}
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={handleCloseStatsModal}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryPage

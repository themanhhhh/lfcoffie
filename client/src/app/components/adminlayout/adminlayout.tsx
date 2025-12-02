'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FaChartBar, FaList, FaTicketAlt, FaUsers, FaUtensils, FaReceipt, FaMoneyBillWave, FaFileAlt, FaFilePdf } from 'react-icons/fa'
import { IconType } from 'react-icons'

import AdminHeader from '../adminheader/adminheader'
import Style from '../../style/admin.module.css'
import { useExport } from '../../../contexts/ExportContext'
import { toast } from 'react-hot-toast'

interface SidebarItem {
  id: string
  href: string
  label: string
  icon: IconType
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'stats', href: '/admin/statistic', label: 'Thống kê', icon: FaChartBar },
  { id: 'menu', href: '/admin', label: 'Quản lý Menu', icon: FaUtensils },
  { id: 'categories', href: '/admin/category', label: 'Danh mục', icon: FaList },
  { id: 'orders', href: '/admin/orders', label: 'Đơn hàng', icon: FaReceipt },
  { id: 'revenue-expense', href: '/admin/revenue-expense', label: 'Thu Chi', icon: FaMoneyBillWave },
  { id: 'staff', href: '/admin/staff', label: 'Nhân viên', icon: FaUsers },
  { id: 'vouchers', href: '/admin/voucher', label: 'Voucher', icon: FaTicketAlt },
  { id: 'shift-closing', href: '/admin/shift-closing', label: 'Báo cáo kết quả kinh doanh', icon: FaFileAlt },
  { id: 'shift-closing-detail', href: '/admin/shift-closing-detail', label: 'Báo cáo chốt ca', icon: FaFileAlt },
]

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname()
  const router = useRouter()
  const { exportDailyRevenuePDF } = useExport()

  const handleExportPDF = async () => {
    if (!exportDailyRevenuePDF) {
      // Nếu chưa có function, navigate đến trang statistic trước
      router.push('/admin/statistic')
      toast.error('Vui lòng đợi trang tải xong rồi thử lại')
      return
    }
    
    try {
      await exportDailyRevenuePDF()
    } catch (err) {
      toast.error('Lỗi khi xuất PDF: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  return (
    <div className={Style.adminContainer}>
      <AdminHeader />
      <div className={Style.mainLayout}>
        <nav className={Style.sidebar}>
          {SIDEBAR_ITEMS.map(item => {
            const IconComponent = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`${Style.sidebarItem} ${isActive ? Style.active : ''}`}
              >
                <IconComponent className={Style.sidebarIcon} />
                {item.label}
              </Link>
            )
          })}
          <button
            onClick={handleExportPDF}
            className={Style.sidebarItem}
            style={{ border: 'none', width: '100%' }}
          >
            <FaFilePdf className={Style.sidebarIcon} />
            Xuất PDF - Doanh thu theo ngày
          </button>
        </nav>
        <div className={Style.content}>{children}</div>
      </div>
    </div>
  )
}

export default AdminLayout


'use client'

import React from 'react'
import { ProtectedRoute } from '../../components/ProtectedRoute'
import AdminLayout from '../components/adminlayout/adminlayout'

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRole="Quản lý">
      <AdminLayout>
        {children}
      </AdminLayout>
    </ProtectedRoute>
  )
}


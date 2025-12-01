'use client'

import React from 'react'
import { ProtectedRoute } from '../../components/ProtectedRoute'
import AdminLayout from '../components/adminlayout/adminlayout'
import { ExportProvider } from '../../contexts/ExportContext'

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRole="Quản lý">
      <ExportProvider>
        <AdminLayout>
          {children}
        </AdminLayout>
      </ExportProvider>
    </ProtectedRoute>
  )
}


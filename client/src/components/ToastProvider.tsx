'use client'

import { Toaster } from 'react-hot-toast'

export const ToastProvider = () => (
  <Toaster
    position="top-center"
    toastOptions={{
      duration: 4000,
      style: {
        textAlign: 'center',
        padding: '14px 18px',
        borderRadius: '16px',
        fontSize: '0.95rem',
        fontWeight: 500,
        background: 'linear-gradient(135deg, #1f2937, #0f172a)',
        color: '#f8fafc',
        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.35)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        letterSpacing: '0.2px'
      },
      success: {
        iconTheme: {
          primary: '#4ade80',
          secondary: '#0f172a'
        }
      },
      error: {
        iconTheme: {
          primary: '#fb7185',
          secondary: '#0f172a'
        }
      }
    }}
  />
)


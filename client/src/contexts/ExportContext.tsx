'use client'
import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react'

interface ExportContextType {
  exportDailyRevenuePDF: (() => Promise<void>) | null
  setExportDailyRevenuePDF: Dispatch<SetStateAction<(() => Promise<void>) | null>>
}

const ExportContext = createContext<ExportContextType | undefined>(undefined)

export const useExport = () => {
  const context = useContext(ExportContext)
  if (context === undefined) {
    throw new Error('useExport must be used within an ExportProvider')
  }
  return context
}

interface ExportProviderProps {
  children: ReactNode
}

export const ExportProvider: React.FC<ExportProviderProps> = ({ children }) => {
  const [exportDailyRevenuePDF, setExportDailyRevenuePDF] = useState<(() => Promise<void>) | null>(null)

  return (
    <ExportContext.Provider value={{ exportDailyRevenuePDF, setExportDailyRevenuePDF }}>
      {children}
    </ExportContext.Provider>
  )
}


'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextType {
  toast: (message: string, type?: 'success' | 'error' | 'info') => void
}

const ToastContext = createContext<ToastContextType | null>(null)

/**
 * Global Toast Alert Context Provider.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = Math.random().toString(36).substring(2, 9)
      setToasts((prev) => [...prev, { id, message, type }])
      
      // Auto-expire toast alerts in 3.5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 3500)
    },
    []
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* Toast Render Layout Container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center justify-between p-4 rounded-2xl shadow-xl text-xs font-bold text-white pointer-events-auto border animate-slide-in-right ${
              t.type === 'error'
                ? 'bg-rose-600 border-rose-700'
                : t.type === 'info'
                ? 'bg-zinc-800 border-zinc-950'
                : 'bg-emerald-600 border-emerald-700'
            }`}
            role="alert"
          >
            <span>{t.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((toastItem) => toastItem.id !== t.id))}
              className="ml-3 text-white/70 hover:text-white hover:scale-105 transition-all"
              aria-label="Dismiss alert"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

/**
 * Hook to access global mutation toast notifications.
 */
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider context.')
  }
  return context
}

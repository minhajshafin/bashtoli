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
 * Renders tactile stationery memo capsules with wax-seal micro-badges,
 * hairline progress countdown, and mobile-safe dock positioning.
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

      {/* Toast Render Layout Container - centered at top below nav, free from drawer and bottom dock collisions */}
      <div
        className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2.5 max-w-sm sm:max-w-md w-[calc(100%-2rem)] pointer-events-none"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="group relative flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl bg-cream-100/95 text-forest-950 border border-forest-200/90 shadow-sm pointer-events-auto overflow-hidden animate-toast-enter selection:bg-gold-500/20 selection:text-forest-900"
            role="alert"
          >
            {/* Wax-Seal Status Micro-Badge */}
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border ${
                t.type === 'error'
                  ? 'bg-terracotta-800 text-terracotta-100 border-terracotta-600'
                  : t.type === 'info'
                  ? 'bg-forest-800 text-cream-200 border-forest-700'
                  : 'bg-forest-900 text-gold-400 border-forest-800'
              }`}
            >
              {t.type === 'error' ? (
                <svg className="h-4 w-4 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
              ) : t.type === 'info' ? (
                <svg className="h-4 w-4 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                </svg>
              ) : (
                <svg className="h-4 w-4 stroke-[2.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              )}
            </div>

            {/* Notification message */}
            <div className="flex-1 min-w-0 pr-1 pt-0.5">
              <p className="text-xs sm:text-[13px] font-sans font-medium text-forest-950 leading-snug">
                {t.message}
              </p>
            </div>

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              className="shrink-0 -mr-1 -mt-0.5 p-1 rounded-lg text-forest-400 hover:text-forest-950 hover:bg-forest-900/10 active:scale-95 transition-all cursor-pointer"
              aria-label="Dismiss alert"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Hairline Countdown Progress Line */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-forest-200/40">
              <div
                className={`h-full animate-toast-countdown ${
                  t.type === 'error'
                    ? 'bg-terracotta-500'
                    : t.type === 'info'
                    ? 'bg-forest-600'
                    : 'bg-gold-500'
                }`}
              />
            </div>
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
    return {
      toast: () => {},
    }
  }
  return context
}

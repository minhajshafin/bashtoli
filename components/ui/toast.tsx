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

      // Auto-expire toast alerts in 3.0 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 3000)
    },
    []
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast Render Layout Container - centered at top below nav as a sleek floating capsule */}
      <div
        className="fixed top-18 sm:top-22 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 max-w-[calc(100vw-2rem)] sm:max-w-md pointer-events-none"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
            className="group relative flex items-center gap-2.5 sm:gap-3 pl-3.5 pr-2.5 sm:pr-3 py-2 sm:py-2.5 rounded-full bg-forest-950/98 text-cream-50 border border-gold-500/40 shadow-2xl backdrop-blur-md pointer-events-auto overflow-hidden animate-toast-enter cursor-pointer select-none max-w-full ring-1 ring-gold-400/15"
            role="alert"
          >
            {/* Wax-Seal Micro-Badge */}
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border shadow-2xs ${
                t.type === 'error'
                  ? 'bg-terracotta-700 text-cream-50 border-terracotta-500/60 ring-1 ring-terracotta-400/30'
                  : t.type === 'info'
                  ? 'bg-forest-800 text-gold-300 border-forest-600 ring-1 ring-forest-500/30'
                  : 'bg-gold-500 text-forest-950 border-gold-400/80 shadow-xs ring-1 ring-gold-400/50'
              }`}
            >
              {t.type === 'error' ? (
                <svg className="h-3.5 w-3.5 stroke-[2.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
              ) : t.type === 'info' ? (
                <svg className="h-3.5 w-3.5 stroke-[2.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                </svg>
              ) : (
                <svg className="h-3.5 w-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              )}
            </div>

            {/* Notification message */}
            <div className="min-w-0 pr-1">
              <p className="text-xs sm:text-[13px] font-sans font-medium text-cream-50 tracking-tight leading-none truncate max-w-[260px] sm:max-w-xs">
                {t.message}
              </p>
            </div>

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setToasts((prev) => prev.filter((item) => item.id !== t.id))
              }}
              className="shrink-0 flex items-center justify-center h-5 w-5 rounded-full text-cream-400 hover:text-cream-100 hover:bg-forest-800/80 active:scale-90 transition-all cursor-pointer"
              aria-label="Dismiss alert"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Hairline Countdown Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-forest-800/60 overflow-hidden rounded-full">
              <div
                className={`h-full animate-toast-countdown ${
                  t.type === 'error'
                    ? 'bg-terracotta-400'
                    : t.type === 'info'
                    ? 'bg-forest-400'
                    : 'bg-gold-400'
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

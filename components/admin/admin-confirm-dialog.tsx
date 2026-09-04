'use client'

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import { AlertTriangle, AlertCircle, HelpCircle, X } from 'lucide-react'

export interface AdminConfirmOptions {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'default'
}

interface AdminConfirmContextType {
  confirm: (options: AdminConfirmOptions) => Promise<boolean>
}

const AdminConfirmDialogContext = createContext<AdminConfirmContextType | null>(null)

/**
 * Admin-specific confirmation dialog provider.
 * Completely styled with the crisp Slate / Neutral admin design system
 * (pure white modal surface, slate borders, dark slate typography, semantic accents),
 * completely isolated from the public storefront theme.
 */
export function AdminConfirmDialogProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<AdminConfirmOptions>({ title: '' })
  const resolveRef = useRef<((value: boolean) => void) | null>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  const confirm = useCallback((opts: AdminConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setOptions(opts)
      resolveRef.current = resolve
      setIsOpen(true)
    })
  }, [])

  const handleConfirm = useCallback(() => {
    setIsOpen(false)
    if (resolveRef.current) {
      resolveRef.current(true)
      resolveRef.current = null
    }
  }, [])

  const handleCancel = useCallback(() => {
    setIsOpen(false)
    if (resolveRef.current) {
      resolveRef.current(false)
      resolveRef.current = null
    }
  }, [])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleCancel])

  // Lock body scroll & autofocus confirm button
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      const timer = setTimeout(() => {
        confirmButtonRef.current?.focus()
      }, 50)

      return () => {
        document.body.style.overflow = originalOverflow
        clearTimeout(timer)
      }
    }
  }, [isOpen])

  const variant = options.variant || 'default'

  return (
    <AdminConfirmDialogContext.Provider value={{ confirm }}>
      {children}

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-confirm-title"
          aria-describedby="admin-confirm-desc"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          {/* Backdrop */}
          <div
            onClick={handleCancel}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity cursor-pointer animate-in fade-in duration-150"
          />

          {/* Dialog Container */}
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl z-10 text-slate-900 animate-in zoom-in-95 duration-150">
            {/* Close button in top right */}
            <button
              onClick={handleCancel}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-4 mb-4">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                  variant === 'danger'
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : variant === 'warning'
                    ? 'border-amber-200 bg-amber-50 text-amber-600'
                    : 'border-slate-200 bg-slate-100 text-slate-700'
                }`}
              >
                {variant === 'danger' ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : variant === 'warning' ? (
                  <AlertCircle className="h-5 w-5" />
                ) : (
                  <HelpCircle className="h-5 w-5" />
                )}
              </div>

              <div className="min-w-0 pr-6">
                <h3
                  id="admin-confirm-title"
                  className="text-lg font-bold text-slate-900 leading-snug"
                >
                  {options.title}
                </h3>
                {options.description && (
                  <p
                    id="admin-confirm-desc"
                    className="mt-1.5 text-sm text-slate-500 leading-relaxed"
                  >
                    {options.description}
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancel}
                className="w-full sm:w-auto rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {options.cancelText || 'Cancel'}
              </button>

              <button
                ref={confirmButtonRef}
                type="button"
                onClick={handleConfirm}
                className={`w-full sm:w-auto rounded-lg px-4 py-2 text-xs font-bold text-white transition-all shadow-xs cursor-pointer ${
                  variant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
                    : variant === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800'
                    : 'bg-slate-900 hover:bg-slate-800 active:bg-slate-950'
                }`}
              >
                {options.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminConfirmDialogContext.Provider>
  )
}

export function useAdminConfirm() {
  const ctx = useContext(AdminConfirmDialogContext)
  if (!ctx) {
    throw new Error('useAdminConfirm must be used within an AdminConfirmDialogProvider.')
  }
  return ctx.confirm
}

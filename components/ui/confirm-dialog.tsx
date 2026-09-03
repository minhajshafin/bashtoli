'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'

export interface ConfirmOptions {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'default'
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmDialogContext = createContext<ConfirmContextType | null>(null)

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions>({ title: '' })
  const resolveRef = useRef<((value: boolean) => void) | null>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  const confirm = useCallback((opts: ConfirmOptions) => {
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

  // Lock body scroll when dialog is open & auto-focus confirm button
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      // Focus button after mount
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
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-desc"
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          {/* Backdrop */}
          <div
            onClick={handleCancel}
            className="fixed inset-0 bg-forest-950/80 backdrop-blur-sm transition-opacity cursor-pointer animate-in fade-in duration-200"
          />

          {/* Warm Cream Dialog Card */}
          <div className="relative w-full max-w-md rounded-3xl border border-[#e5dac5] bg-[#faf6ef] p-6 sm:p-8 shadow-2xl z-10 text-forest-900 animate-in zoom-in-95 duration-200">
            {/* Top Accent Ring & Icon */}
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
                  variant === 'danger'
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : variant === 'warning'
                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                    : 'border-[#dfd0b5] bg-[#f3eae0] text-forest-800'
                }`}
              >
                {variant === 'danger' ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                ) : variant === 'warning' ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 18.75h.007v.008H12v-.008z" />
                  </svg>
                )}
              </div>

              <div className="min-w-0">
                <h3
                  id="confirm-dialog-title"
                  style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                  className="text-xl sm:text-2xl font-normal text-forest-900 leading-tight"
                >
                  {options.title}
                </h3>
              </div>
            </div>

            {/* Message Description */}
            {options.description && (
              <p
                id="confirm-dialog-desc"
                className="text-sm text-forest-700/90 leading-relaxed mb-8"
                style={{ fontFamily: "'Source Sans 3', system-ui, sans-serif" }}
              >
                {options.description}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="w-full sm:w-auto rounded-full border border-forest-200 bg-white/80 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-forest-700 hover:bg-cream-200/60 hover:text-forest-900 transition-colors cursor-pointer shadow-xs"
              >
                {options.cancelText || 'Cancel'}
              </button>

              <button
                ref={confirmButtonRef}
                type="button"
                onClick={handleConfirm}
                className={`w-full sm:w-auto rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider active:scale-95 transition-all shadow-md cursor-pointer ${
                  variant === 'danger'
                    ? 'bg-rose-600 text-white hover:bg-rose-700'
                    : 'bg-forest-800 text-cream-100 hover:bg-forest-900'
                }`}
              >
                {options.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmDialogContext)
  if (!ctx) {
    throw new Error('useConfirm must be used within a ConfirmDialogProvider context.')
  }
  return ctx.confirm
}

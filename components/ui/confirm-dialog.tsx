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

          {/* Tactile Stationery Document Card */}
          <div className="relative w-full max-w-md sm:max-w-[450px] rounded-[26px] border border-forest-900/15 bg-cream-100 bg-laid-paper p-6 sm:p-7 shadow-sm z-10 text-forest-900 animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Top Gilded Accent Hairline */}
            <div
              className={`absolute top-0 inset-x-0 h-[2px] ${
                variant === 'danger'
                  ? 'bg-gradient-to-r from-transparent via-btn-danger-bg/45 to-transparent'
                  : variant === 'warning'
                  ? 'bg-gradient-to-r from-transparent via-btn-warning-bg/40 to-transparent'
                  : 'bg-gradient-to-r from-transparent via-btn-accent-bg/40 to-transparent'
              }`}
            />

            {/* Corner Dismiss Button */}
            <button
              type="button"
              onClick={handleCancel}
              aria-label="Close dialog"
              className="absolute right-3.5 top-3.5 sm:right-4 sm:top-4 h-8 w-8 rounded-full flex items-center justify-center text-forest-400 hover:text-forest-950 hover:bg-cream-200/50 transition-all cursor-pointer outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Eyebrow Accent Tag */}
            <div className="flex items-center gap-2 mb-3">
              <span className="h-px w-5 bg-btn-accent-bg/60" />
              <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-forest-600/90">
                {variant === 'danger' ? 'Action Notice' : variant === 'warning' ? 'Attention' : 'Notice'}
              </span>
            </div>

            {/* Circular Wax-Seal Medallion & Title */}
            <div className="flex items-start gap-3.5 sm:gap-4 mb-3 pr-6">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border shadow-2xs transition-colors ${
                  variant === 'danger'
                    ? 'border-btn-danger-border/35 bg-btn-danger-bg/10 text-btn-danger-bg ring-4 ring-btn-danger-bg/8'
                    : variant === 'warning'
                    ? 'border-btn-warning-border/35 bg-btn-warning-bg/10 text-btn-warning-bg ring-4 ring-btn-warning-bg/8'
                    : 'border-btn-accent-border/40 bg-forest-900/10 text-forest-900 ring-4 ring-btn-accent-bg/10'
                }`}
              >
                {variant === 'danger' ? (
                  <svg className="h-5 w-5 sm:h-5.5 sm:w-5.5 stroke-[1.8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                ) : variant === 'warning' ? (
                  <svg className="h-5 w-5 sm:h-5.5 sm:w-5.5 stroke-[1.8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 sm:h-5.5 sm:w-5.5 stroke-[1.8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 18.75h.007v.008H12v-.008z" />
                  </svg>
                )}
              </div>

              <div className="min-w-0 pt-0.5">
                <h3
                  id="confirm-dialog-title"
                  className="font-display font-medium text-xl sm:text-2xl text-forest-950 tracking-[-0.015em] leading-snug"
                >
                  {options.title}
                </h3>
              </div>
            </div>

            {/* Message Description */}
            {options.description && (
              <p
                id="confirm-dialog-desc"
                className="text-xs sm:text-[13px] font-sans text-forest-700/90 leading-relaxed mb-6"
              >
                {options.description}
              </p>
            )}

            {/* Subtle Parchment Divider Hairline */}
            <div className="h-px bg-border-primary mb-5" />

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary w-full sm:w-auto rounded-full px-5 sm:px-6 h-10 sm:h-10.5 text-xs font-sans font-semibold uppercase tracking-[0.12em] outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                {options.cancelText || 'Cancel'}
              </button>

              <button
                ref={confirmButtonRef}
                type="button"
                onClick={handleConfirm}
                className={`w-full sm:w-auto rounded-full px-6 sm:px-7 h-10 sm:h-10.5 text-xs font-sans font-bold uppercase tracking-[0.12em] flex items-center justify-center gap-1.5 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  variant === 'danger'
                    ? 'btn-danger focus-visible:ring-btn-danger-border'
                    : variant === 'warning'
                    ? 'btn-warning focus-visible:ring-btn-warning-border'
                    : 'btn-primary border-btn-accent-border/40 text-gold-400 hover:text-white focus-visible:ring-focus-ring'
                }`}
              >
                <span>{options.confirmText || 'Confirm'}</span>
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

'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { AlertTriangle, AlertCircle, HelpCircle, X } from 'lucide-react'
import type { BaseConfirmOptions } from '@/components/ui/use-confirm'

export type AdminConfirmOptions = BaseConfirmOptions

interface AdminConfirmContextType {
  confirm: (options: AdminConfirmOptions) => Promise<boolean>
}

const AdminConfirmDialogContext = createContext<AdminConfirmContextType | null>(null)

/**
 * Admin confirmation dialog built on native `<dialog>` with `showModal()`.
 * Provides native top-layer modality, focus trapping, inert background,
 * Esc dismissal, and bounded light-dismiss with monochrome dual-tone styling.
 */
export function AdminConfirmDialogProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<AdminConfirmOptions>({ title: '' })
  const resolveRef = useRef<((value: boolean) => void) | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)
  const pressedOutsideRef = useRef(false)

  const confirm = useCallback((opts: AdminConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setOptions(opts)
      resolveRef.current = resolve
      setIsOpen(true)
    })
  }, [])

  const finish = useCallback((accepted: boolean) => {
    setIsOpen(false)
    if (resolveRef.current) {
      resolveRef.current(accepted)
      resolveRef.current = null
    }
  }, [])

  const handleConfirm = useCallback(() => finish(true), [finish])
  const handleCancel = useCallback(() => finish(false), [finish])

  const variant = options.variant || 'default'
  const isDestructive = variant === 'danger' || variant === 'warning'

  // Sync open state with native <dialog>.showModal() / .close()
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      dialog.setAttribute('closedby', 'any')
      if (typeof dialog.showModal === 'function') {
        if (!dialog.open) dialog.showModal()
      } else {
        dialog.setAttribute('open', '')
      }

      const targetBtn = isDestructive ? cancelButtonRef.current : confirmButtonRef.current
      targetBtn?.focus()
    } else {
      if (typeof dialog.close === 'function') {
        if (dialog.open) {
          dialog.returnValue = ''
          dialog.close()
        }
      } else {
        dialog.removeAttribute('open')
      }
    }
  }, [isOpen, isDestructive])

  // Jsdom fallback for environments without native HTMLDialogElement.prototype.showModal
  useEffect(() => {
    if (!isOpen) return
    const hasNativeDialog =
      typeof HTMLDialogElement !== 'undefined' &&
      typeof HTMLDialogElement.prototype.showModal === 'function'

    if (hasNativeDialog) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleCancel()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, handleCancel])

  // Pointer light-dismiss fallback when closedby is unsupported (e.g. Safari)
  function isOutsideDialog(e: React.PointerEvent<HTMLDialogElement>, dialog: HTMLDialogElement) {
    const r = dialog.getBoundingClientRect()
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom
  }

  return (
    <AdminConfirmDialogContext.Provider value={{ confirm }}>
      {children}

      <dialog
        ref={dialogRef}
        aria-labelledby="admin-confirm-title"
        aria-describedby={options.description ? 'admin-confirm-desc' : undefined}
        className="admin-dialog w-full max-w-md"
        onCancel={(e) => {
          e.preventDefault()
          handleCancel()
        }}
        onPointerDown={(e) => {
          const dialog = dialogRef.current
          if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return
          pressedOutsideRef.current = isOutsideDialog(e, dialog)
        }}
        onPointerUp={(e) => {
          const dialog = dialogRef.current
          if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return
          if (pressedOutsideRef.current && isOutsideDialog(e, dialog)) {
            handleCancel()
          }
          pressedOutsideRef.current = false
        }}
      >
        {isOpen && (
          <div className="relative w-full rounded-2xl border border-paper-300 bg-paper-50 p-6 text-ink-950 shadow-elevation-3 overflow-hidden">
            {/* Top accent rule */}
            <div
              className={`absolute inset-x-0 top-0 h-[3px] ${
                variant === 'danger'
                  ? 'bg-signal-danger'
                  : variant === 'warning'
                  ? 'bg-signal-warning'
                  : 'bg-ink-950'
              }`}
              aria-hidden="true"
            />

            {/* Close button */}
            <button
              type="button"
              onClick={handleCancel}
              className="absolute right-3 top-3 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-ink-500 hover:bg-paper-200 hover:text-ink-950 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="flex items-start gap-4 mb-4 pr-10">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                  variant === 'danger'
                    ? 'border-signal-danger-border bg-signal-danger-bg text-signal-danger'
                    : variant === 'warning'
                    ? 'border-signal-warning-border bg-signal-warning-bg text-signal-warning'
                    : 'border-ink-800 bg-ink-950 text-paper-50'
                }`}
              >
                {variant === 'danger' ? (
                  <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                ) : variant === 'warning' ? (
                  <AlertCircle className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <HelpCircle className="h-5 w-5" aria-hidden="true" />
                )}
              </div>

              <div className="min-w-0 pt-0.5">
                <p className="admin-kicker text-ink-500 mb-1">
                  {variant === 'danger'
                    ? 'Confirm Destructive Action'
                    : variant === 'warning'
                    ? 'Confirm Role Change'
                    : 'Confirmation Required'}
                </p>
                <h2
                  id="admin-confirm-title"
                  className="text-lg font-bold text-ink-950 leading-snug tracking-tight"
                >
                  {options.title}
                </h2>
                {options.description && (
                  <p
                    id="admin-confirm-desc"
                    className="mt-2 text-sm text-ink-600 leading-relaxed"
                  >
                    {options.description}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-4 border-t border-paper-300">
              <button
                ref={cancelButtonRef}
                type="button"
                autoFocus={isDestructive}
                onClick={handleCancel}
                className="w-full sm:w-auto min-h-[44px] rounded-xl border border-ink-400/70 bg-paper-50 px-5 py-2 text-xs font-semibold text-ink-900 hover:bg-paper-200 transition-colors cursor-pointer"
              >
                {options.cancelText || 'Cancel'}
              </button>

              <button
                ref={confirmButtonRef}
                type="button"
                autoFocus={!isDestructive}
                onClick={handleConfirm}
                className={`w-full sm:w-auto min-h-[44px] rounded-xl px-5 py-2 text-xs font-bold text-paper-50 transition-colors shadow-elevation-1 cursor-pointer ${
                  variant === 'danger'
                    ? 'bg-signal-danger hover:bg-signal-danger-hover'
                    : 'bg-ink-950 hover:bg-ink-800'
                }`}
              >
                {options.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        )}
      </dialog>
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

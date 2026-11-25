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
 * Provides top-layer modality, focus trapping, Esc dismissal, and light-dismiss.
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
          <div className="relative w-full rounded-2xl border border-adm-border bg-adm-surface p-6 text-adm-fg shadow-elevation-3 overflow-hidden">
            <button
              type="button"
              onClick={handleCancel}
              className="absolute right-3 top-3 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-adm-muted hover:bg-adm-surface-2 hover:text-adm-fg transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="flex items-start gap-4 mb-4 pr-10">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                  variant === 'danger'
                    ? 'border-adm-danger-border bg-adm-danger-bg text-adm-danger'
                    : variant === 'warning'
                    ? 'border-adm-warning-border bg-adm-warning-bg text-adm-warning'
                    : 'border-adm-accent-border bg-adm-accent-tint text-adm-accent-text'
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
                <h2
                  id="admin-confirm-title"
                  className="text-base font-bold text-adm-fg leading-snug tracking-tight"
                >
                  {options.title}
                </h2>
                {options.description && (
                  <p
                    id="admin-confirm-desc"
                    className="mt-2 text-sm text-adm-muted leading-relaxed"
                  >
                    {options.description}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-4 border-t border-adm-border">
              <button
                ref={cancelButtonRef}
                type="button"
                autoFocus={isDestructive}
                onClick={handleCancel}
                className="w-full sm:w-auto min-h-[44px] rounded-xl border border-adm-input-border/70 bg-adm-surface px-5 py-2 text-xs font-semibold text-adm-fg hover:bg-adm-surface-2 transition-colors cursor-pointer"
              >
                {options.cancelText || 'Cancel'}
              </button>

              <button
                ref={confirmButtonRef}
                type="button"
                autoFocus={!isDestructive}
                onClick={handleConfirm}
                className={`w-full sm:w-auto min-h-[44px] rounded-xl px-5 py-2 text-xs font-semibold transition-colors shadow-elevation-1 cursor-pointer ${
                  variant === 'danger'
                    ? 'bg-adm-danger hover:bg-adm-danger-hover text-adm-danger-fg'
                    : 'bg-adm-accent hover:bg-adm-accent-hover text-adm-accent-fg'
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

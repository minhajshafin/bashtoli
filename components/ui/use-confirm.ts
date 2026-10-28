'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

export interface BaseConfirmOptions {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'default'
}

/**
 * Headless state machine and interaction manager for confirmation modal dialogs.
 * Handles Promise-based resolution, keyboard Escape listener, body scroll lock,
 * and button autofocus.
 */
export function useConfirmState<T extends BaseConfirmOptions>(defaultOptions: T) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<T>(defaultOptions)
  const resolveRef = useRef<((value: boolean) => void) | null>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  const confirm = useCallback((opts: T) => {
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

      const timer = setTimeout(() => {
        confirmButtonRef.current?.focus()
      }, 50)

      return () => {
        document.body.style.overflow = originalOverflow
        clearTimeout(timer)
      }
    }
  }, [isOpen])

  return {
    isOpen,
    options,
    confirm,
    handleConfirm,
    handleCancel,
    confirmButtonRef,
  }
}

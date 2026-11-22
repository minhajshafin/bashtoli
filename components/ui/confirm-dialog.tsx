'use client'

import React, { createContext, useContext } from 'react'
import dynamic from 'next/dynamic'
import { useConfirmState, type BaseConfirmOptions } from './use-confirm'

const ConfirmDialogModal = dynamic(
  () => import('./confirm-dialog-modal').then((m) => m.ConfirmDialogModal),
  { ssr: false }
)

export type ConfirmOptions = BaseConfirmOptions

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmDialogContext = createContext<ConfirmContextType | null>(null)

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const {
    isOpen,
    options,
    confirm,
    handleConfirm,
    handleCancel,
    confirmButtonRef,
  } = useConfirmState<ConfirmOptions>({ title: '' })

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}

      {isOpen && (
        <ConfirmDialogModal
          options={options}
          confirmButtonRef={confirmButtonRef}
          handleConfirm={handleConfirm}
          handleCancel={handleCancel}
        />
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

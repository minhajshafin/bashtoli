'use client'

import React from 'react'
import { Printer } from 'lucide-react'

interface PrintReceiptButtonProps {
  className?: string
}

export function PrintReceiptButton({ className = '' }: PrintReceiptButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      aria-label="Download or Print Receipt"
      className={`btn-secondary inline-flex h-12 sm:h-11 items-center justify-center gap-2 rounded-xl px-5 text-xs font-sans font-medium uppercase tracking-[0.14em] active:scale-[0.98] transition-all duration-200 cursor-pointer print:hidden ${className}`}
    >
      <Printer className="h-4 w-4 text-forest-600 shrink-0" />
      <span>Print / Save Receipt</span>
    </button>
  )
}

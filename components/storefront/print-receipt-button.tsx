'use client'

import React from 'react'

export function PrintReceiptButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-forest-200/80 bg-cream-50/80 px-5 text-xs font-sans font-medium uppercase tracking-[0.14em] text-forest-700 hover:border-gold-500/80 hover:bg-white active:scale-[0.98] transition-all cursor-pointer print:hidden"
    >
      <svg className="h-4 w-4 text-forest-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.03.48-2.079 1.54-2.079H15.74c1.06 0 1.78 1.05 1.54 2.079l-1.02 4.37a2.25 2.25 0 0 1-2.19 1.741H9.93a2.25 2.25 0 0 1-2.19-1.741l-1.02-4.37ZM6.75 6.75A2.25 2.25 0 0 1 9 4.5h6a2.25 2.25 0 0 1 2.25 2.25v2.25H6.75V6.75Z" />
      </svg>
      <span>Print Receipt</span>
    </button>
  )
}

'use client'

import React from 'react'
import Link from 'next/link'

export default function StorefrontError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  void _error
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12 selection:bg-gold-500/20 selection:text-forest-900">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-cream-100/90 border border-forest-200/80 shadow-xs text-center space-y-5">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-900/5 border border-forest-200 text-forest-700">
          <svg className="h-6 w-6 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-medium text-forest-950 font-display tracking-tight">
            Something went wrong
          </h2>
          <p className="text-xs sm:text-[13px] text-forest-600 max-w-sm mx-auto font-light leading-relaxed">
            An unexpected error interrupted this page. Please try again or return to our catalog.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
          <button
            type="button"
            onClick={reset}
            className="h-10 px-5 rounded-xl bg-forest-900 border border-forest-800 text-cream-100 text-xs font-bold uppercase tracking-wider hover:bg-forest-800 active:scale-[0.99] transition-all cursor-pointer"
          >
            Try Again
          </button>
          <Link
            href="/products"
            className="h-10 px-5 rounded-xl bg-cream-50/90 border border-forest-200 text-forest-800 text-xs font-semibold hover:bg-cream-200/60 active:scale-[0.99] transition-all inline-flex items-center justify-center"
          >
            Return to Shop
          </Link>
        </div>
      </div>
    </div>
  )
}

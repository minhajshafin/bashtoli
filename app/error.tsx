'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { CheckoutBackgroundArt } from '@/components/storefront/checkout-background-art'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Root Application Error Boundary aligned with Bashtoli theme.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Unhandled Root Error:', error)
  }, [error])

  return (
    <div className="relative min-h-[calc(100dvh-5rem)] flex items-center justify-center bg-cream-50 bg-laid-paper px-4 py-16 text-center overflow-hidden selection:bg-gold-500/20 selection:text-forest-900">
      {/* Ambient background art */}
      <CheckoutBackgroundArt className="text-forest-900/[0.04]" />

      <div className="relative z-10 w-full max-w-lg mx-auto bg-cream-100/95 border border-forest-200/85 rounded-3xl p-8 sm:p-12 shadow-sm space-y-6">
        {/* Error badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-forest-900/5 border border-forest-200/80 px-4 py-1.5 shadow-xs">
          <span className="h-2 w-2 rounded-full bg-amber-600 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-forest-700">
            System Notice · Unexpected Interruption
          </span>
        </div>

        {/* Heading & description */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-normal text-forest-950 tracking-tight font-display">
            An unexpected fold.
          </h1>
          <p className="text-xs sm:text-[13px] text-forest-600 leading-relaxed max-w-sm mx-auto font-light">
            A temporary issue prevented this page from loading properly. You can try refreshing or return to the shop while we sort it out.
          </p>
        </div>

        {/* Diagnostic Digest if present */}
        {error.digest && (
          <div className="rounded-xl border border-forest-200/80 bg-cream-50/80 p-3.5 text-left max-w-sm mx-auto">
            <p className="text-[9px] font-mono uppercase tracking-wider text-forest-500 mb-1">
              Error Digest
            </p>
            <p className="font-mono text-[11px] text-forest-800 select-all break-all">
              {error.digest}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="btn-primary inline-flex h-11 items-center justify-center gap-2 px-6 rounded-xl text-xs font-bold uppercase tracking-wider"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>

          <Link
            href="/products"
            className="btn-secondary inline-flex h-11 items-center justify-center px-6 rounded-xl text-xs font-semibold"
          >
            Return to Shop
          </Link>
        </div>
      </div>
    </div>
  )
}

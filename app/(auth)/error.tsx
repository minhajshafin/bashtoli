'use client'

import React from 'react'
import Link from 'next/link'

export default function AuthError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  void _error
  return (
    <div className="w-full max-w-md bg-forest-900/95 text-cream-50 border border-forest-800/90 rounded-3xl p-8 shadow-2xl text-center space-y-5 selection:bg-gold-500/25 selection:text-gold-200">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-950 border border-forest-800 text-gold-400">
        <svg className="h-6 w-6 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-medium text-cream-50 font-display tracking-tight">
          Authentication Notice
        </h2>
        <p className="text-xs sm:text-[13px] text-forest-200/90 max-w-xs mx-auto leading-relaxed">
          An unexpected interruption occurred during authentication. Please retry or return to sign in.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
        <button
          type="button"
          onClick={reset}
          className="btn-accent h-10 px-5 rounded-xl text-xs font-bold uppercase tracking-wider active:scale-[0.99] transition-colors cursor-pointer shadow-xs"
        >
          Try Again
        </button>
        <Link
          href="/login"
          className="border border-forest-700/80 bg-forest-950/60 text-cream-100 hover:bg-forest-800 hover:text-gold-300 hover:border-gold-500/40 h-10 px-5 rounded-xl text-xs font-semibold active:scale-[0.99] transition-colors inline-flex items-center justify-center"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  )
}

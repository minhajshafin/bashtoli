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
    <div className="w-full max-w-md bg-forest-900/90 border border-forest-700/80 rounded-3xl p-8 shadow-sm backdrop-blur-md text-center space-y-5">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-800 border border-forest-700 text-gold-400">
        <svg className="h-6 w-6 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-medium text-cream-100 font-display tracking-tight">
          Authentication Notice
        </h2>
        <p className="text-xs sm:text-[13px] text-forest-300 font-light max-w-xs mx-auto leading-relaxed">
          An unexpected interruption occurred during authentication. Please retry or return to sign in.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
        <button
          type="button"
          onClick={reset}
          className="h-10 px-5 rounded-xl bg-gold-500 text-forest-950 text-xs font-bold uppercase tracking-wider hover:bg-gold-400 active:scale-[0.99] transition-all cursor-pointer"
        >
          Try Again
        </button>
        <Link
          href="/login"
          className="h-10 px-5 rounded-xl border border-forest-700 bg-forest-950/40 text-cream-200 text-xs font-semibold hover:border-gold-500/60 hover:text-gold-300 transition-all inline-flex items-center justify-center"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  )
}

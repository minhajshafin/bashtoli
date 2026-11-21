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
    <div className="w-full max-w-md bg-white/95 border border-border-primary rounded-3xl p-8 shadow-atelier text-center space-y-5">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-900 border border-forest-800 text-gold-400">
        <svg className="h-6 w-6 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-medium text-text-primary font-display tracking-tight">
          Authentication Notice
        </h2>
        <p className="text-xs sm:text-[13px] text-text-secondary max-w-xs mx-auto leading-relaxed">
          An unexpected interruption occurred during authentication. Please retry or return to sign in.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
        <button
          type="button"
          onClick={reset}
          className="btn-primary h-10 px-5 rounded-xl text-xs font-bold uppercase tracking-wider active:scale-[0.99] transition-colors cursor-pointer"
        >
          Try Again
        </button>
        <Link
          href="/login"
          className="btn-secondary h-10 px-5 rounded-xl text-xs font-semibold active:scale-[0.99] transition-colors inline-flex items-center justify-center"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  )
}

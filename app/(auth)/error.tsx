'use client'

import Link from 'next/link'

export default function AuthError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      </div>
      <h2
        className="text-xl font-normal text-forest-900 mb-2"
        style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic' }}
      >
        Authentication Error
      </h2>
      <p className="text-sm text-forest-600 max-w-sm mb-6">
        Something went wrong during authentication. Please try again.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="h-10 px-5 rounded-full bg-gold-500 text-sm font-bold text-forest-800 hover:bg-gold-400 transition-colors cursor-pointer"
        >
          Try Again
        </button>
        <Link
          href="/login"
          className="h-10 px-5 rounded-full border border-forest-600 text-sm font-bold text-gold-400 hover:bg-forest-700 transition-colors inline-flex items-center"
        >
          Back to Login
        </Link>
      </div>
    </div>
  )
}

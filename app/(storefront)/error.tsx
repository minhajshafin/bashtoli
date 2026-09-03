'use client'

import Link from 'next/link'

export default function StorefrontError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      </div>
      <h2
        className="text-2xl font-normal text-forest-900 mb-2"
        style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic' }}
      >
        Something went wrong
      </h2>
      <p className="text-sm text-forest-600 max-w-md mb-6">
        We encountered an unexpected error. Please try again or return to the homepage.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="h-11 px-6 rounded-full bg-forest-800 text-sm font-bold text-cream-100 hover:bg-forest-700 transition-colors cursor-pointer"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="h-11 px-6 rounded-full border border-forest-200 text-sm font-bold text-forest-800 hover:bg-cream-100 transition-colors inline-flex items-center"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}

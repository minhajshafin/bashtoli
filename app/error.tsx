'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Root Application Error Boundary Page.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log unexpected application errors to monitoring console
    console.error('Unhandled Root Error:', error)
  }, [error])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-stone-50/30 px-4 text-center dark:bg-zinc-950">
      <div className="max-w-md space-y-6">
        <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-800 dark:bg-rose-950/20 dark:text-rose-500 border border-rose-200/50">
          Application Error
        </span>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight sm:text-4xl dark:text-white">
            Something went wrong!
          </h1>
          <p className="text-sm text-zinc-550 leading-relaxed dark:text-zinc-400">
            An unexpected error occurred while loading this page. Our team has been notified.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs active:scale-[0.98]"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 hover:border-zinc-300 bg-white px-5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}

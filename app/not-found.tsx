import React from 'react'
import Link from 'next/link'

export const metadata = {
  title: 'Page Not Found | Bashtoli',
  description: 'The requested page was not found.',
}

/**
 * Global 404 Page View.
 */
export default function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-stone-50/30 px-4 text-center dark:bg-zinc-950">
      <div className="max-w-md space-y-6">
        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-950/20 dark:text-amber-500 border border-amber-200/50">
          Error 404
        </span>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight sm:text-4xl dark:text-white">
            Page Not Found
          </h1>
          <p className="text-sm text-zinc-550 leading-relaxed dark:text-zinc-400">
            We couldn&apos;t find the page you are looking for. It might have been moved, deleted, or the URL might be incorrect.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs active:scale-[0.98]"
          >
            Return Home
          </Link>
          <Link
            href="/products"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 hover:border-zinc-300 bg-white px-5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  )
}

'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { LeafDownfacing, LeafUprising } from '@/components/storefront/leaf-decorations'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Root Application Error Boundary with stationery satire & Bashtoli theme.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Unhandled Root Error:', error)
  }, [error])

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] flex items-center justify-center bg-cream-50 px-4 py-16 text-center overflow-hidden">
      {/* Botanical ambient decoration */}
      <LeafDownfacing
        className="absolute top-0 right-0 w-60 h-auto md:w-80 pointer-events-none text-forest-800"
        style={{ opacity: 0.15 }}
      />
      <LeafUprising
        className="absolute bottom-0 left-0 w-52 h-auto md:w-72 pointer-events-none text-forest-800"
        style={{ opacity: 0.12 }}
      />

      <div className="relative z-10 max-w-xl mx-auto space-y-6">
        {/* Satirical badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-forest-800 border border-forest-700 px-4 py-1.5 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-400">
            500 · Ink Spill on the Motherboard
          </span>
        </div>

        {/* Satirical heading */}
        <div className="space-y-3">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-light text-forest-950 tracking-tight"
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontStyle: 'italic',
              lineHeight: 1.15,
            }}
          >
            Well, this is awkward.<br />
            <span className="text-forest-800">Someone spilled ink on the server.</span>
          </h1>
          <p className="text-sm sm:text-base text-forest-700 leading-relaxed max-w-md mx-auto font-light">
            We tried writing this web application using artisanal fountain pens and handmade Japanese parchment, but our lead developer dropped a bottle of waterproof ink right into the backend.
          </p>
        </div>

        {/* Diagnostic Card */}
        {error.digest && (
          <div className="rounded-2xl border border-forest-200 bg-cream-100/90 p-4 text-left max-w-md mx-auto shadow-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gold-600 mb-1">
              Scribe Diagnostic Digest
            </p>
            <p className="font-mono text-xs text-forest-800 select-all break-all">
              {error.digest}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-500 text-forest-900 text-sm font-bold shadow-sm hover:bg-gold-400 active:scale-[0.98] transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Blot the Ink & Try Again
          </button>

          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 rounded-full bg-forest-800 border border-forest-700 text-cream-100 text-sm font-semibold hover:bg-forest-700 transition-colors"
          >
            Escape to Home
          </Link>

          <a
            href="https://github.com/minhajshafin/bashtoli/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-5 py-3 rounded-full border border-forest-300 text-forest-700 hover:border-gold-500 hover:text-forest-900 text-sm font-medium transition-colors"
          >
            Roast our code on GitHub ↗
          </a>
        </div>
      </div>
    </div>
  )
}

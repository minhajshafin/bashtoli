import React from 'react'
import Link from 'next/link'
import { LeafDownfacing, LeafUprising } from '@/components/storefront/leaf-decorations'

export const metadata = {
  title: 'Page Not Found | Bashtoli',
  description: 'The requested page seems to have escaped between the margins.',
}

/**
 * Global 404 Page View with stationery satire & Bashtoli theme.
 */
export default function NotFoundPage() {
  return (
    <div className="relative min-h-[calc(100dvh-4rem)] flex items-center justify-center bg-cream-50 px-4 py-16 text-center overflow-hidden">
      {/* Botanical corner decorations */}
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
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-400">
            404 · Blank Page Error
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
            Lost between the margins.<br />
            <span className="text-forest-800">This page was erased.</span>
          </h1>
          <p className="text-sm sm:text-base text-forest-700 leading-relaxed max-w-md mx-auto font-light">
            We searched every notebook, checked under the washi tapes, and even flipped our bamboo desk upside down. This URL simply does not exist in our archives.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-500 text-forest-900 text-sm font-bold shadow-sm hover:bg-gold-400 active:scale-[0.98] transition-all"
          >
            Return to Civilization (Home)
          </Link>

          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 rounded-full bg-forest-800 border border-forest-700 text-cream-100 text-sm font-semibold hover:bg-forest-700 transition-colors"
          >
            Browse Real Stationery
          </Link>
        </div>
      </div>
    </div>
  )
}

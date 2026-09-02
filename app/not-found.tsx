import React from 'react'
import Link from 'next/link'

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
      <svg
        viewBox="0 0 320 320"
        fill="none"
        className="absolute top-0 right-0 w-64 h-64 md:w-80 md:h-80 pointer-events-none opacity-20"
        aria-hidden="true"
      >
        <path d="M300 10 Q260 70 200 110 Q150 145 170 210 Q185 250 230 270" stroke="#c9a96e" strokeWidth="1.5" fill="none" />
        <path d="M200 90 Q182 65 158 82 Q148 100 168 112 Q188 124 200 90Z" fill="#c9a96e" opacity="0.7" />
        <path d="M240 55 Q222 30 198 47 Q188 65 208 77 Q228 89 240 55Z" fill="#c9a96e" opacity="0.5" />
      </svg>
      <svg
        viewBox="0 0 280 280"
        fill="none"
        className="absolute bottom-0 left-0 w-56 h-56 md:w-72 md:h-72 pointer-events-none opacity-15"
        aria-hidden="true"
      >
        <path d="M20 260 Q60 215 80 155 Q100 95 55 45" stroke="#c9a96e" strokeWidth="1.5" fill="none" />
        <path d="M75 120 Q95 95 80 70 Q62 63 57 80 Q52 97 75 120Z" fill="#c9a96e" opacity="0.6" />
      </svg>

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

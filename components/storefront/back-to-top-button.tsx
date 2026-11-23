'use client'

import React from 'react'

export function BackToTopButton() {
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="inline-flex group items-center gap-1.5 sm:gap-2 text-forest-400 hover:text-gold-300 transition-colors duration-200 cursor-pointer active:scale-95 py-1 px-1.5 -mr-1.5 rounded-lg focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-gold-400/60"
      aria-label="Scroll back to top of page"
    >
      <span className="text-[11px] font-sans font-medium tracking-wide">Back to top</span>
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-forest-800 group-hover:border-gold-400/60 group-hover:bg-forest-800/60 transition-colors">
        <svg
          className="h-2.5 w-2.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="6 11 12 5 18 11" />
        </svg>
      </span>
    </button>
  )
}

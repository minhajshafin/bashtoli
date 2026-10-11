'use client'

import React from 'react'

const ITEMS = 'Notebooks ✦ Fountain Pens ✦ Washi Tapes ✦ Letterpress Cards ✦ Artisanal Inks ✦ বাঁশতলী Atelier ✦ '

export function MarqueeBand() {
  return (
    <div
      className="relative overflow-hidden py-3.5 sm:py-4 bg-[#f3ede2] border-y border-gold-500/30 shadow-[inset_0_1px_3px_rgba(16,34,24,0.03)]"
      style={{ overflowAnchor: 'none' }}
      aria-hidden="true"
    >
      {/* Left/Right Edge Fade Scrims */}
      <div className="absolute left-0 inset-y-0 w-12 sm:w-20 bg-gradient-to-r from-[#f3ede2] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 inset-y-0 w-12 sm:w-20 bg-gradient-to-l from-[#f3ede2] to-transparent z-10 pointer-events-none" />

      <div
        className="flex whitespace-nowrap"
        style={{ animation: 'marquee 36s linear infinite' }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className="mx-6 sm:mx-8 text-xs sm:text-sm text-forest-900/85 font-editorial tracking-[0.2em] font-medium select-none"
          >
            {ITEMS}
          </span>
        ))}
      </div>
    </div>
  )
}

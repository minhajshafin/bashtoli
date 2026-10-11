'use client'

import React from 'react'

const ITEMS = 'বাঁশতলী Bamboo Atelier ✦ Fountain Pen Journals ✦ Handcrafted Papers ✦ Artisanal Inks ✦ Washi Tapes ✦ Desk Crafts ✦ '

export function MarqueeBand() {
  return (
    <div
      className="relative overflow-hidden py-3 sm:py-3.5 bg-[#f3ede2] border-y border-gold-500/30 shadow-[inset_0_1px_3px_rgba(16,34,24,0.03)]"
      style={{ overflowAnchor: 'none' }}
      aria-hidden="true"
    >
      {/* Left/Right Edge Fade Scrims */}
      <div className="absolute left-0 inset-y-0 w-12 sm:w-24 bg-gradient-to-r from-[#f3ede2] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 inset-y-0 w-12 sm:w-24 bg-gradient-to-l from-[#f3ede2] to-transparent z-10 pointer-events-none" />

      <div
        className="flex whitespace-nowrap"
        style={{ animation: 'marquee 34s linear infinite' }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className="mx-6 sm:mx-8 text-[11px] sm:text-xs text-forest-950 font-sans tracking-[0.24em] font-semibold uppercase select-none"
          >
            {ITEMS}
          </span>
        ))}
      </div>
    </div>
  )
}

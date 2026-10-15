'use client'

import React from 'react'

const ITEMS = 'বাঁশতলী Bamboo Atelier ✦ Fountain Pen Journals ✦ Handcrafted Papers ✦ Artisanal Inks ✦ Washi Tapes ✦ Desk Crafts ✦ '

export function MarqueeBand() {
  return (
    <div
      className="relative overflow-hidden py-3 sm:py-3.5 bg-bg-surface border-y border-border-gold"
      style={{ overflowAnchor: 'none' }}
      aria-hidden="true"
    >
      {/* Left/Right Edge Fade Scrims */}
      <div className="absolute left-0 inset-y-0 w-12 sm:w-24 bg-gradient-to-r from-bg-surface to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 inset-y-0 w-12 sm:w-24 bg-gradient-to-l from-bg-surface to-transparent z-10 pointer-events-none" />

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

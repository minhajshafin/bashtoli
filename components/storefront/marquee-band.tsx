'use client'

import React from 'react'

const ITEMS = 'Notebooks ·  Fountain Pens ·  Washi Tapes ·  Letterpress Cards ·  Ink Sets ·  বাঁশতলী ·  '

export function MarqueeBand() {
  return (
    <div className="overflow-hidden py-4 bg-gold-500" style={{ overflowAnchor: 'none' }} aria-hidden="true">
      <div
        className="flex whitespace-nowrap"
        style={{ animation: 'marquee 30s linear infinite' }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className="mx-8 text-sm sm:text-base text-forest-950 font-editorial tracking-wider font-medium"
          >
            {ITEMS}
          </span>
        ))}
      </div>
    </div>
  )
}

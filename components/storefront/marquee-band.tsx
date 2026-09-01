'use client'

import React from 'react'

const ITEMS = 'Notebooks ·  Fountain Pens ·  Washi Tapes ·  Letterpress Cards ·  Ink Sets ·  বাঁশতলী ·  '

export function MarqueeBand() {
  return (
    <div className="overflow-hidden py-4 bg-gold-500" aria-hidden="true">
      <div
        className="flex whitespace-nowrap"
        style={{ animation: 'marquee 30s linear infinite' }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className="mx-8 text-sm text-forest-800"
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontStyle: 'italic',
              letterSpacing: '0.05em',
            }}
          >
            {ITEMS}
          </span>
        ))}
      </div>
    </div>
  )
}

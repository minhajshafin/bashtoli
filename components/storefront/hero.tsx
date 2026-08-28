'use client'

import React from 'react'
import Link from 'next/link'

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-amber-950 text-white rounded-3xl py-20 px-6 sm:px-12 md:py-28 md:px-16 shadow-xl">
      {/* Background Graphic Patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(251,146,60,0.12),transparent_55%)]" />
      
      <div className="relative max-w-2xl space-y-6 md:space-y-8">
        <span className="inline-flex items-center rounded-full bg-amber-400/15 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-300 ring-1 ring-inset ring-amber-400/30">
          ✏️ Your Neighbourhood Stationery Shop
        </span>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
          Everything You Need <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300">
            To Write &amp; Create
          </span>
        </h1>
        
        <p className="text-sm sm:text-base md:text-lg text-amber-100/80 leading-relaxed max-w-lg">
          Pens, pencils, notebooks, pouches, key rings &amp; more — all in one friendly place.
          Bashtoli Stationery is your go-to shop for everyday essentials and little extras that make your day better.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <Link
            id="hero-shop-collection-btn"
            href="/products"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-amber-400 hover:bg-amber-300 px-6 text-sm font-bold text-amber-950 shadow-md shadow-amber-400/25 active:scale-[0.98] transition-all"
          >
            Browse Products
          </Link>
          <Link
            href="/about"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-amber-800 hover:border-amber-600 bg-amber-950/50 hover:bg-amber-900/60 px-6 text-sm font-bold text-amber-100 transition-all"
          >
            Our Story
          </Link>
        </div>
      </div>
    </div>
  )
}

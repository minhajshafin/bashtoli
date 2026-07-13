'use client'

import React from 'react'
import Link from 'next/link'

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-stone-900 text-white rounded-3xl py-20 px-6 sm:px-12 md:py-28 md:px-16 shadow-xl">
      {/* Background Graphic Patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,119,6,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.1),transparent_50%)]" />
      
      <div className="relative max-w-2xl space-y-6 md:space-y-8">
        <span className="inline-flex items-center rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-400 ring-1 ring-inset ring-amber-500/25 animate-pulse">
          100% Organic & Handcrafted
        </span>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
          Bringing Nature <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-emerald-400">
            Into Your Home
          </span>
        </h1>
        
        <p className="text-sm sm:text-base md:text-lg text-stone-300 leading-relaxed max-w-lg">
          Bashtoli brings you premium sustainable home decor made from organic bamboo and cane, hand-woven with passion by local artisans in Bangladesh.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <Link
            id="hero-shop-collection-btn"
            href="/products"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-amber-500 hover:bg-amber-600 px-6 text-sm font-bold text-stone-950 shadow-md shadow-amber-500/20 active:scale-[0.98] transition-all"
          >
            Shop Collection
          </Link>
          <Link
            href="/about"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-stone-700 hover:border-stone-500 bg-stone-900/50 hover:bg-stone-800 px-6 text-sm font-bold text-white transition-all"
          >
            Our Story
          </Link>
        </div>
      </div>
    </div>
  )
}

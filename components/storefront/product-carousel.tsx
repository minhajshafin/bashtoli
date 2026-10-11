'use client'

import React, { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { ProductCard } from '@/components/storefront/product-card'
import type { ProductWithDetails } from '@/lib/queries/products'

export function ProductCarousel({ products }: { products: ProductWithDetails[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const update = () => {
      const maxScroll = el.scrollWidth - el.clientWidth
      setCanScrollLeft(el.scrollLeft > 6)
      setCanScrollRight(el.scrollLeft < maxScroll - 6)
      if (maxScroll > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (el.scrollLeft / maxScroll) * 100)))
      }
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [products.length])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const step = el.clientWidth * 0.72
    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' })
  }

  return (
    <div className="w-full">
      {/* Editorial Header Row: Minimal Titles on Left, Directional Controls on Right */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-7 sm:mb-9 gap-4">
        <div>
          <h2 className="font-editorial text-forest-950 font-normal leading-tight text-2xl sm:text-3xl md:text-4xl tracking-tight">
            Curated Essentials
          </h2>
          <p className="text-xs sm:text-sm text-forest-700/80 font-light mt-1.5 font-sans max-w-md">
            Handpicked notebooks, fine writing instruments, and archival paper goods.
          </p>
        </div>

        {/* Top Controls: "View All" + Directional Arrow Buttons */}
        <div className="flex items-center gap-3.5 self-start sm:self-auto">
          <Link
            id="featured-view-all-link"
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] font-semibold text-forest-900 hover:text-gold-600 transition-colors group font-sans"
          >
            <span>View All</span>
            <svg
              className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>

          {/* Minimal Circular Directional Buttons */}
          <div className="flex items-center gap-1.5 pl-2.5 border-l border-forest-900/15">
            <button
              type="button"
              aria-label="Previous products"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="flex items-center justify-center w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full border border-forest-900/20 text-forest-900 hover:bg-forest-950 hover:text-cream-100 hover:border-forest-950 disabled:opacity-20 disabled:pointer-events-none transition-all duration-200 cursor-pointer active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next products"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="flex items-center justify-center w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full border border-forest-900/20 text-forest-900 hover:bg-forest-950 hover:text-cream-100 hover:border-forest-950 disabled:opacity-20 disabled:pointer-events-none transition-all duration-200 cursor-pointer active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Rail Viewport */}
      <div className="relative">
        {/* Left edge fade scrim */}
        <div
          className="absolute left-0 top-0 bottom-4 w-6 sm:w-12 z-10 pointer-events-none transition-opacity duration-300"
          style={{
            background: 'linear-gradient(to right, #f6f0e4 0%, transparent 100%)',
            opacity: canScrollLeft ? 0.95 : 0,
          }}
        />

        {/* Scroll rail */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {products.map((p) => (
            <div
              key={p.id}
              className="shrink-0 w-[220px] sm:w-[250px] md:w-[270px]"
              style={{ scrollSnapAlign: 'start' }}
            >
              <ProductCard product={p} />
            </div>
          ))}
          <div className="shrink-0 w-3 sm:w-4" aria-hidden="true" />
        </div>

        {/* Right edge fade scrim */}
        <div
          className="absolute right-0 top-0 bottom-4 w-6 sm:w-12 z-10 pointer-events-none transition-opacity duration-300"
          style={{
            background: 'linear-gradient(to left, #f6f0e4 0%, transparent 100%)',
            opacity: canScrollRight ? 0.95 : 0,
          }}
        />
      </div>

      {/* Subtle Progress Bar */}
      <div className="flex items-center justify-center mt-5">
        <div className="w-20 sm:w-28 h-[2px] rounded-full bg-forest-900/10 overflow-hidden">
          <div
            className="h-full bg-forest-900/40 rounded-full transition-all duration-150 ease-out"
            style={{ width: `${Math.max(14, scrollProgress)}%` }}
          />
        </div>
      </div>
    </div>
  )
}

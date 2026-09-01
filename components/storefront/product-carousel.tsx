'use client'

import React, { useRef, useState, useEffect } from 'react'
import { ProductCard } from '@/components/storefront/product-card'
import type { ProductWithDetails } from '@/lib/queries/products'

export function ProductCarousel({ products }: { products: ProductWithDetails[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 8)
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    return () => el.removeEventListener('scroll', update)
  }, [])

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -290 : 290, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      {/* Left fade */}
      <div
        className="absolute left-0 top-0 bottom-4 w-24 z-10 pointer-events-none transition-opacity duration-300"
        style={{
          background: 'linear-gradient(to right, #faf6ef 0%, rgba(250,246,239,0.8) 30%, transparent 100%)',
          opacity: canScrollLeft ? 1 : 0,
        }}
      />
      {/* Left button */}
      <button
        aria-label="Scroll left"
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 z-20 flex items-center justify-center w-11 h-11 rounded-full bg-forest-800 text-gold-400 border border-forest-700 shadow-md transition-all duration-300 hover:bg-gold-500 hover:text-forest-800 hover:border-gold-500"
        style={{
          transform: 'translateY(calc(-50% - 8px))',
          opacity: canScrollLeft ? 1 : 0,
          pointerEvents: canScrollLeft ? 'auto' : 'none',
        }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Scroll rail */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-4"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {products.map((p) => (
          <div key={p.id} style={{ minWidth: '260px', width: '260px', flexShrink: 0, scrollSnapAlign: 'start' }}>
            <ProductCard product={p} />
          </div>
        ))}
        <div style={{ minWidth: '32px', flexShrink: 0 }} aria-hidden="true" />
      </div>

      {/* Right fade */}
      <div
        className="absolute right-0 top-0 bottom-4 w-24 z-10 pointer-events-none transition-opacity duration-300"
        style={{
          background: 'linear-gradient(to left, #faf6ef 0%, rgba(250,246,239,0.8) 30%, transparent 100%)',
          opacity: canScrollRight ? 1 : 0,
        }}
      />
      {/* Right button */}
      <button
        aria-label="Scroll right"
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 z-20 flex items-center justify-center w-11 h-11 rounded-full bg-forest-800 text-gold-400 border border-forest-700 shadow-md transition-all duration-300 hover:bg-gold-500 hover:text-forest-800 hover:border-gold-500"
        style={{
          transform: 'translateY(calc(-50% - 8px))',
          opacity: canScrollRight ? 1 : 0,
          pointerEvents: canScrollRight ? 'auto' : 'none',
        }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}

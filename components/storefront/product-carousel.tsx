'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { ProductCard } from '@/components/storefront/product-card'
import type { ProductWithDetails } from '@/lib/queries/products'

export function ProductCarousel({ products }: { products: ProductWithDetails[] }) {
  const trackRef = useRef<HTMLDivElement>(null)

  if (!products || products.length === 0) return null

  const handleNext = () => {
    if (!trackRef.current) return
    const card = trackRef.current.querySelector('.carousel-card-item') as HTMLElement | null
    const cardWidth = card ? card.offsetWidth : 205
    trackRef.current.scrollBy({ left: cardWidth + 16, behavior: 'smooth' })
  }

  const handlePrevious = () => {
    if (!trackRef.current) return
    const card = trackRef.current.querySelector('.carousel-card-item') as HTMLElement | null
    const cardWidth = card ? card.offsetWidth : 205
    trackRef.current.scrollBy({ left: -(cardWidth + 16), behavior: 'smooth' })
  }

  return (
    <div className="w-full">
      {/* Header: High-contrast title and restrained controls */}
      <div className="flex items-center justify-between mb-3 sm:mb-4.5 gap-2 px-4 sm:px-0">
        <div className="min-w-0 pr-2">
          <h2 className="type-heading font-medium text-forest-950 truncate">
            The Writing Desk
          </h2>
        </div>

        {/* Controls: Previous / Next (desktop only) + View All */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5" role="group" aria-label="Carousel navigation">
            <button
              type="button"
              onClick={handlePrevious}
              aria-label="Previous products"
              className="btn-secondary inline-flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next products"
              className="btn-secondary inline-flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <Link
            id="featured-view-all-link"
            href="/products"
            className="group/link inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-sans font-semibold text-forest-900 hover:text-gold-700 tracking-wide transition-colors py-1 shrink-0 sm:pl-3.5 sm:border-l sm:border-forest-900/15"
          >
            <span className="relative pb-0.5 after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 group-hover/link:after:w-full after:bg-gold-600 after:transition-all after:duration-300">
              View All
            </span>
            <span className="text-xs sm:text-sm transition-transform duration-200 group-hover/link:translate-x-1" aria-hidden="true">
              &rarr;
            </span>
          </Link>
        </div>
      </div>

      {/* Native Hardware-Accelerated Smooth Scroll-Snap Container */}
      <div className="relative w-full py-1">
        <div
          ref={trackRef}
          tabIndex={0}
          aria-label="Featured products"
          className="flex gap-3 sm:gap-4 lg:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none px-4 sm:px-0 focus:outline-hidden"
        >
          {products.map((p) => (
            <div
              key={p.id}
              className="carousel-card-item shrink-0 w-[140px] sm:w-[180px] md:w-[195px] lg:w-[205px] snap-start"
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { ProductCard } from '@/components/storefront/product-card'
import type { ProductWithDetails } from '@/lib/queries/products'
import { ScrollReveal } from '@/components/storefront/scroll-reveal'

export function ProductCarousel({ products }: { products: ProductWithDetails[] }) {
  const trackRef = useRef<HTMLDivElement>(null)

  if (!products || products.length === 0) return null

  const handleNext = () => {
    if (!trackRef.current) return
    const card = trackRef.current.querySelector('.carousel-card-item') as HTMLElement | null
    const cardWidth = card ? card.offsetWidth : 240
    trackRef.current.scrollBy({ left: cardWidth + 16, behavior: 'smooth' })
  }

  const handlePrevious = () => {
    if (!trackRef.current) return
    const card = trackRef.current.querySelector('.carousel-card-item') as HTMLElement | null
    const cardWidth = card ? card.offsetWidth : 240
    trackRef.current.scrollBy({ left: -(cardWidth + 16), behavior: 'smooth' })
  }

  return (
    <div className="w-full">
      {/* Header: High-contrast title and restrained controls */}
      <ScrollReveal>
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2 px-4 sm:px-0">
          <div className="min-w-0 pr-2">
            <div className="hidden sm:inline-flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
              <span className="h-px w-3 sm:w-4 bg-gold-600/60" />
              <span className="type-kicker text-gold-700">
                Curated Essentials &middot; Daily Rituals
              </span>
            </div>
            <h2 className="type-heading font-medium text-forest-950 truncate">
              The Writing Desk
            </h2>
            <p className="hidden sm:block type-body-sm text-forest-700/80 mt-0.5">
              Everyday notebooks, pens, and paper goods crafted for daily rituals.
            </p>
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
              className="inline-flex items-center gap-1 sm:gap-2 shrink-0 type-kicker text-gold-700 hover:text-gold-900 transition-colors duration-200 group/link pb-0.5 sm:pb-1 sm:pl-3 sm:border-l sm:border-forest-900/15"
            >
              <span className="border-b border-gold-600/40 group-hover/link:border-gold-900 pb-0.5 transition-colors">
                View All
              </span>
              <span className="text-xs sm:text-sm transition-transform duration-300 group-hover/link:translate-x-1">
                &rarr;
              </span>
            </Link>
          </div>
        </div>
      </ScrollReveal>

      {/* Native Hardware-Accelerated Smooth Scroll-Snap Container */}
      <div className="relative w-full py-1 sm:py-2">
        <div
          ref={trackRef}
          tabIndex={0}
          aria-label="Featured products"
          className="flex gap-3 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none px-4 sm:px-0 focus:outline-hidden"
        >
          {products.map((p) => (
            <div
              key={p.id}
              className="carousel-card-item shrink-0 w-[150px] sm:w-[220px] md:w-[240px] snap-start"
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

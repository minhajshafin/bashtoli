'use client'

import React, { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { ProductCard } from '@/components/storefront/product-card'
import type { ProductWithDetails } from '@/lib/queries/products'

export function ProductCarousel({ products }: { products: ProductWithDetails[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const isInteractingRef = useRef(false)
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Ensure there are enough items to loop seamlessly across all desktop viewports
  const baseItems =
    products.length >= 6
      ? products
      : products.length >= 3
      ? [...products, ...products]
      : [...products, ...products, ...products, ...products]

  const infiniteItems = [...baseItems, ...baseItems]

  // Continuous auto-gliding motion with hover & manual interaction pause
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    // Honor users who prefer reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    let rafId: number
    const speed = 0.65 // subtle, luxurious glide speed

    const step = () => {
      if (!isHovered && !isInteractingRef.current && container) {
        container.scrollLeft += speed
        const halfWidth = container.scrollWidth / 2
        if (container.scrollLeft >= halfWidth) {
          container.scrollLeft -= halfWidth
        }
      }
      rafId = requestAnimationFrame(step)
    }

    rafId = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(rafId)
      if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current)
    }
  }, [isHovered])

  // Handle seamless wrap when scrolling manually
  const handleScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return
    const halfWidth = container.scrollWidth / 2

    if (container.scrollLeft <= 0) {
      container.scrollLeft += halfWidth
    } else if (container.scrollLeft >= halfWidth * 1.95) {
      container.scrollLeft -= halfWidth
    }
  }

  // Manual scroll with Left / Right buttons
  const scrollManual = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (!container) return

    isInteractingRef.current = true
    if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current)

    const scrollDelta = direction === 'left' ? -310 : 310
    container.scrollBy({ left: scrollDelta, behavior: 'smooth' })

    // Resume subtle auto-drift after 4s of idle time
    interactionTimeoutRef.current = setTimeout(() => {
      isInteractingRef.current = false
    }, 4000)
  }

  return (
    <div className="w-full">
      {/* Header Row: Upright High-Contrast Serif + Minimal Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 sm:mb-5 lg:mb-6 gap-4">
        <div>
          <h2 className="font-display font-medium text-forest-950 leading-tight text-2xl sm:text-[1.75rem] lg:text-[2.1rem] tracking-[-0.015em]">
            Curated Essentials
          </h2>
          <p className="text-xs sm:text-[13px] lg:text-sm text-forest-800/90 font-normal mt-1.5 font-sans max-w-lg leading-relaxed">
            Handpicked fountain pen journals, fine writing instruments, and bamboo paper goods.
          </p>
        </div>

        {/* Minimal Controls: Manual Navigation Arrows + View All */}
        <div className="flex items-center gap-3.5 self-start sm:self-auto">
          <div className="flex items-center gap-1.5" role="group" aria-label="Carousel navigation">
            <button
              type="button"
              onClick={() => scrollManual('left')}
              aria-label="Scroll left"
              className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-forest-900/15 bg-cream-50/90 text-forest-900 hover:bg-forest-950 hover:text-cream-50 hover:border-forest-950 transition-all duration-200 cursor-pointer shadow-xs active:scale-95"
            >
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollManual('right')}
              aria-label="Scroll right"
              className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-forest-900/15 bg-cream-50/90 text-forest-900 hover:bg-forest-950 hover:text-cream-50 hover:border-forest-950 transition-all duration-200 cursor-pointer shadow-xs active:scale-95"
            >
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <Link
            id="featured-view-all-link"
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] font-semibold text-forest-950 hover:text-gold-700 transition-colors group font-sans pl-3 border-l border-forest-900/15"
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
        </div>
      </div>

      {/* Infinite Scroll Viewport with Narrow, Refined Edge Scrims */}
      <div
        className="relative overflow-hidden -mx-6 sm:-mx-10 md:-mx-14 lg:-mx-20 xl:-mx-24 2xl:-mx-28 px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24 2xl:px-28"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Subtle, narrow left edge fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-4 sm:w-8 z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, rgba(246, 240, 228, 0.75) 0%, transparent 100%)',
          }}
        />

        {/* Horizontal Carousel Track with Native Scroll & Auto-Gliding */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none py-2 select-none"
        >
          {infiniteItems.map((p, index) => (
            <div
              key={`${p.id}-${index}`}
              className="shrink-0 w-[230px] sm:w-[260px] md:w-[280px]"
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>

        {/* Subtle, narrow right edge fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-4 sm:w-8 z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to left, rgba(246, 240, 228, 0.75) 0%, transparent 100%)',
          }}
        />
      </div>
    </div>
  )
}

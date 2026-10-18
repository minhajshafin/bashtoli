'use client'

import React, { useRef, useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ProductCard } from '@/components/storefront/product-card'
import type { ProductWithDetails } from '@/lib/queries/products'
import { gsap, isReducedMotion, horizontalLoop, type HorizontalLoopTimeline } from '@/lib/motion'
import { ScrollReveal } from '@/components/storefront/scroll-reveal'

export function ProductCarousel({ products }: { products: ProductWithDetails[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const loopRef = useRef<HorizontalLoopTimeline | null>(null)
  const isHoveredRef = useRef(false)

  // Ensure enough items to span any viewport seamlessly
  const displayProducts = useMemo(() => {
    if (!products || products.length === 0) return []
    let list = [...products]
    while (list.length < 12) {
      list = [...list, ...products]
    }
    return list
  }, [products])

  // Initialize GSAP Hardware-Accelerated Horizontal Loop
  useEffect(() => {
    if (!trackRef.current || displayProducts.length === 0) return

    const reduced = isReducedMotion()
    const items = gsap.utils.toArray<HTMLElement>('.carousel-card-item', trackRef.current)
    if (items.length === 0) return

    // Exact responsive gap between items (12px on mobile, 24px on sm+)
    const gap = window.innerWidth >= 640 ? 24 : 12

    const loop = horizontalLoop(items, {
      speed: reduced ? 0 : 0.45, // Gentle, silky-smooth continuous glide
      paused: reduced,
      repeat: -1,
      paddingRight: gap,
    })

    loopRef.current = loop

    // Resize handler to adjust layout if window changes
    let resizeTimer: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        loop.kill()
        gsap.set(items, { clearProps: 'all' })
        const newGap = window.innerWidth >= 640 ? 24 : 12
        loopRef.current = horizontalLoop(items, {
          speed: reduced ? 0 : 0.45,
          paused: reduced || isHoveredRef.current,
          repeat: -1,
          paddingRight: newGap,
        })
      }, 200)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(resizeTimer)
      window.removeEventListener('resize', handleResize)
      loop.kill()
      gsap.set(items, { clearProps: 'all' })
    }
  }, [displayProducts])

  // Next / Previous buttons: smoothly glide by 1 card without stopping the continuous motion
  const handleNext = () => {
    if (!loopRef.current) return
    loopRef.current.next({
      duration: 0.65,
      ease: 'power2.out',
      onComplete: () => {
        if (!isHoveredRef.current && !isReducedMotion()) {
          loopRef.current?.play()
        }
      },
    })
  }

  const handlePrevious = () => {
    if (!loopRef.current) return
    loopRef.current.previous({
      duration: 0.65,
      ease: 'power2.out',
      onComplete: () => {
        if (!isHoveredRef.current && !isReducedMotion()) {
          loopRef.current?.play()
        }
      },
    })
  }

  const handleMouseEnter = () => {
    isHoveredRef.current = true
    loopRef.current?.pause()
  }

  const handleMouseLeave = () => {
    isHoveredRef.current = false
    if (!isReducedMotion()) {
      loopRef.current?.play()
    }
  }

  return (
    <div className="w-full">
      {/* Minimal Header: High-contrast title and restrained controls */}
      <ScrollReveal>
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2 px-4 sm:px-0">
          <div className="min-w-0 pr-2">
            <h2 className="font-display font-medium text-forest-950 text-lg sm:text-[1.75rem] lg:text-[2.1rem] tracking-tight leading-tight truncate">
              The Writing Desk
            </h2>
            <p className="hidden sm:block text-xs sm:text-[13px] lg:text-sm text-forest-700/80 mt-0.5 font-sans">
              Everyday notebooks, pens, and paper goods crafted for daily rituals.
            </p>
          </div>

          {/* Minimal Controls: Previous / Next (desktop only) + View All */}
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
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs uppercase tracking-[0.14em] sm:tracking-[0.16em] font-medium text-text-primary hover:text-text-accent transition-colors font-sans sm:pl-2.5 sm:border-l sm:border-forest-900/15"
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
      </ScrollReveal>

      {/* Contained Track Viewport: Aligned strictly with section header & content grid */}
      <div
        ref={containerRef}
        className="relative overflow-hidden w-full py-1 sm:py-2"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={trackRef}
          className="flex gap-3 sm:gap-6 will-change-transform"
        >
          {displayProducts.map((p, index) => (
            <div
              key={`${p.id}-${index}`}
              className="carousel-card-item shrink-0 w-[150px] sm:w-[220px] md:w-[240px]"
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

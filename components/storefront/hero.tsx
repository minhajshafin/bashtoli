'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import {
  BADGE_COLOR_PRESETS,
  DEFAULT_FALLBACK_SLIDE,
  type HeroSlideItem,
} from '@/lib/validations/hero-slides'
import { LeafDownfacing, LeafUprising } from '@/components/storefront/leaf-decorations'

function LeafTopRight() {
  return (
    <LeafDownfacing
      className="absolute top-0 right-0 w-44 h-auto sm:w-52 md:w-60 lg:w-72 pointer-events-none text-gold-400"
      style={{ opacity: 0.15 }}
    />
  )
}

function LeafBottomLeft() {
  return (
    <LeafUprising
      className="absolute bottom-0 left-0 w-36 h-auto sm:w-44 md:w-52 lg:w-60 pointer-events-none text-gold-400"
      style={{ opacity: 0.12 }}
    />
  )
}

function HeroSlideshow({ slides }: { slides?: HeroSlideItem[] }) {
  const activeSlides = slides && slides.length > 0 ? slides : [DEFAULT_FALLBACK_SLIDE]
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    if (activeSlides.length <= 1) return
    const timer = setInterval(() => setSlide((s) => (s + 1) % activeSlides.length), 4500)
    return () => clearInterval(timer)
  }, [activeSlides.length])

  const currentSlide = activeSlides[slide] || activeSlides[0]
  const preset =
    BADGE_COLOR_PRESETS[currentSlide.badge_color_preset] || BADGE_COLOR_PRESETS.gold

  return (
    <div className="relative" style={{ maxWidth: '380px', margin: '0 auto', width: '100%' }}>
      {/* Glow frame */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius: '28px',
          boxShadow: '0 0 0 1px rgba(201,169,110,0.25), 0 32px 80px rgba(201,169,110,0.08)',
          transform: 'translate(10px, 10px)',
        }}
      />
      {/* Slides */}
      <div
        style={{
          borderRadius: '24px',
          aspectRatio: '4/5',
          overflow: 'hidden',
          position: 'relative',
          maxHeight: '480px',
        }}
        className="bg-forest-900/60"
      >
        {activeSlides.map((s, i) => {
          // Mount the current slide and immediately adjacent slides (for seamless cross-fading)
          const isCurrent = i === slide
          const isNext = (slide + 1) % activeSlides.length === i
          const isPrev = (slide - 1 + activeSlides.length) % activeSlides.length === i
          const shouldMountImage = isCurrent || isNext || isPrev

          const content = shouldMountImage ? (
            <Image
              src={s.image_url}
              alt={s.alt_text || 'Bashtoli Stationery'}
              fill
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'low'}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 480px"
              className="object-cover"
              style={{
                filter: 'brightness(0.92) saturate(1.1)',
              }}
            />
          ) : null

          return (
            <div
              key={s.id}
              className="absolute inset-0 w-full h-full"
              style={{
                opacity: i === slide ? 1 : 0,
                pointerEvents: i === slide ? 'auto' : 'none',
                transition: 'opacity 0.9s ease',
              }}
            >
              {s.link_url ? (
                <Link href={s.link_url} className="block w-full h-full relative">
                  {content}
                </Link>
              ) : (
                content
              )}
            </div>
          )
        })}

        {/* Badge */}
        <div
          className="absolute top-4 left-4 px-4 py-1.5 text-xs font-semibold z-10 pointer-events-none"
          style={{
            backgroundColor: preset.bg,
            color: preset.text,
            borderRadius: '100px',
            letterSpacing: '0.06em',
            transition: 'background-color 0.4s, color 0.4s',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          {currentSlide.badge_text}
        </div>

        {/* Dots (only shown if > 1 slide) */}
        {activeSlides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {activeSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                aria-label={`Slide ${i + 1}`}
                style={{
                  width: i === slide ? '22px' : '7px',
                  height: '7px',
                  borderRadius: '100px',
                  backgroundColor: i === slide ? '#c9a96e' : 'rgba(255,255,255,0.5)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'width 0.35s ease, background-color 0.35s',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating card */}
      <div
        className="absolute -left-5 bottom-10 px-5 py-4 shadow-2xl hidden md:block z-10 pointer-events-none"
        style={{ backgroundColor: '#f5ede0', borderRadius: '18px', maxWidth: '190px' }}
      >
        <p
          style={{
            fontFamily: "var(--font-fraunces), 'Fraunces', Georgia, serif",
            fontSize: '0.98rem',
            fontWeight: 600,
            color: '#1a3326',
            lineHeight: 1.3,
          }}
        >
          {currentSlide.badge_text}
        </p>
        <p style={{ fontSize: '0.72rem', color: '#3d6e54', marginTop: '5px' }}>
          {currentSlide.subtext || 'Now in store & online'}
        </p>
      </div>
    </div>
  )
}

export function Hero({ slides }: { slides?: HeroSlideItem[] } = {}) {
  return (
    <section
      className="relative flex items-center overflow-hidden bg-forest-800"
      style={{ minHeight: '60svh' }}
    >
      <LeafTopRight />
      <LeafBottomLeft />

      <div className="relative max-w-7xl mx-auto px-5 md:px-8 w-full grid lg:grid-cols-12 gap-10 lg:gap-12 items-center py-12 sm:py-16 lg:py-20">
        {/* Left: Branding & Story */}
        <div className="lg:col-span-7 max-w-xl">
          {/* Brand Logo & Est */}
          <div className="flex flex-col items-start gap-2.5 mb-6">
            <div className="relative h-14 sm:h-16 md:h-18 lg:h-20 w-56 sm:w-64 md:w-72 lg:w-80">
              <Image
                src="/logo-text.svg"
                alt="Bashtoli Stationery"
                fill
                loading="eager"
                fetchPriority="high"
                className="object-contain object-left"
              />
            </div>
            <p
              className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-gold-400 font-semibold"
              style={{ fontFamily: "'Source Sans 3', system-ui, sans-serif" }}
            >
              Stationery &amp; Gifts&nbsp;·&nbsp;Est. 2026
            </p>
          </div>

          <h1
            className="mb-5 sm:mb-6 text-cream-100"
            style={{
              fontFamily: "var(--font-fraunces), 'Fraunces', Georgia, serif",
              fontSize: 'clamp(2.2rem, 3.8vw, 3.6rem)',
              fontWeight: 300,
              letterSpacing: '-0.02em',
              lineHeight: 1.12,
            }}
          >
            Craft your{' '}
            <em>story,</em>
            <br />
            <span style={{ color: '#c9a96e', fontStyle: 'italic', fontWeight: 500 }}>one page</span>
            <br />
            at a time.
          </h1>

          <p
            className="mb-8 text-sm sm:text-base leading-relaxed text-forest-300 font-light max-w-lg"
          >
            Handpicked notebooks, artisanal pens, and paper goods from makers who believe
            writing is still the most intimate form of expression.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 sm:gap-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2.5 px-7 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold rounded-full bg-gold-500 text-forest-800 hover:bg-gold-400 transition-colors shadow-sm active:scale-[0.98]"
            >
              Shop Now
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="#aboutus"
              className="inline-flex items-center px-7 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm rounded-full border border-forest-500 text-forest-300 hover:border-gold-500 hover:text-gold-500 transition-all cursor-pointer active:scale-[0.98]"
            >
              About Us
            </Link>
          </div>
        </div>

        {/* Right: slideshow (hidden on mobile/tablet screens) */}
        <div className="hidden lg:flex lg:col-span-5 justify-center lg:justify-end">
          <HeroSlideshow slides={slides} />
        </div>
      </div>
    </section>
  )
}


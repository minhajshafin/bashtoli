'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  BADGE_COLOR_PRESETS,
  DEFAULT_FALLBACK_SLIDE,
  type HeroSlideItem,
} from '@/lib/constants/hero-slides'
import { BambooPaperWatermark, DriftingBambooLeaf } from '@/components/storefront/bamboo-motifs'


function HeroSlideshow({ slides }: { slides?: HeroSlideItem[] }) {
  const activeSlides = slides && slides.length > 0 ? slides : [DEFAULT_FALLBACK_SLIDE]
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    if (activeSlides.length <= 1) return
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return
      setSlide((s) => (s + 1) % activeSlides.length)
    }, 5500)
    return () => clearInterval(timer)
  }, [activeSlides.length])

  const currentSlide = activeSlides[slide] || activeSlides[0]
  const preset =
    BADGE_COLOR_PRESETS[currentSlide.badge_color_preset] || BADGE_COLOR_PRESETS.gold

  return (
    <div className="relative w-full max-w-[270px] sm:max-w-[320px] lg:max-w-[350px] xl:max-w-[370px] mx-auto">
      {/* Museum-Grade Archival Beveled Frame */}
      <div className="relative p-1.5 sm:p-2 lg:p-2.5 rounded-2xl sm:rounded-[28px] bg-gradient-to-b from-forest-900/90 via-forest-900/60 to-forest-950 border border-gold-500/30 shadow-2xl ring-1 ring-gold-400/10">
        {/* Slides Viewport: unified 4:5 portrait aspect ratio */}
        <div className="relative aspect-[4/5] rounded-[18px] sm:rounded-[22px] overflow-hidden bg-forest-950 shadow-inner border border-forest-800/80">
          {activeSlides.map((s, i) => {
            const isCurrent = i === slide
            const isNext = (slide + 1) % activeSlides.length === i
            const isPrev = (slide - 1 + activeSlides.length) % activeSlides.length === i
            const shouldMountImage = isCurrent || isNext || isPrev

            const content = shouldMountImage ? (
              <Image
                src={s.image_url}
                alt={s.alt_text || 'Bashtoli Stationery'}
                fill
                priority={i === 0}
                quality={75}
                loading={i === 0 ? undefined : 'lazy'}
                fetchPriority={i === 0 ? 'high' : undefined}
                sizes="(max-width: 640px) 300px, (max-width: 1024px) 320px, 370px"
                className="object-cover transition-transform duration-1000 ease-out"
              />
            ) : null

            return (
              <div
                key={s.id}
                className="absolute inset-0 w-full h-full"
                style={{
                  opacity: i === slide ? 1 : 0,
                  pointerEvents: i === slide ? 'auto' : 'none',
                  transition: slide === 0 ? 'none' : 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {s.link_url ? (
                  <Link
                    href={s.link_url}
                    className="block w-full h-full relative"
                    aria-label={s.alt_text || s.badge_text || 'Featured collection'}
                  >
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </div>
            )
          })}

          {/* Floating Curation Pill Badge */}
          <div
            className="absolute top-4 sm:top-5 left-4 sm:left-5 px-3 sm:px-3.5 py-1 sm:py-1.5 type-kicker text-[9px] sm:text-[10px] z-10 pointer-events-none rounded-full transition-colors duration-400 tracking-wider shadow-md backdrop-blur-xs"
            style={{
              backgroundColor: preset.bg,
              color: preset.text,
              border: `1px solid ${preset.border}`,
            }}
          >
            {currentSlide.badge_text}
          </div>

          {/* Minimal Linear Slide Indicators */}
          {activeSlides.length > 1 && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10 bg-forest-950/90 px-2.5 py-1 rounded-full border border-forest-800/80 shadow-md">
              {activeSlides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className="relative min-w-[24px] min-h-[32px] sm:min-h-[36px] flex items-center justify-center cursor-pointer px-1 before:absolute before:inset-x-0 before:-inset-y-1.5"
                >
                  <span
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === slide ? 'w-5 bg-gold-400' : 'w-1.5 bg-cream-100/35 hover:bg-cream-100/80'
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Archival Spec Note (Desktop & Tablet) */}
      <div
        className="absolute -left-3 sm:-left-6 bottom-14 sm:bottom-16 px-3.5 py-2.5 shadow-elevation-3 hidden sm:block z-20 pointer-events-none rounded-xl bg-bg-surface-elevated border border-gold-500/35 max-w-[195px] animate-fade-in ring-1 ring-gold-500/10"
      >
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="type-kicker text-[8px] text-gold-700 tracking-[0.25em]">
            ARCHIVE № {String(slide + 1).padStart(2, '0')}
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-gold-600 animate-pulse" />
        </div>
        <p className="font-display text-[13px] font-semibold text-forest-950 leading-snug tracking-tight">
          {currentSlide.badge_text}
        </p>
        <p className="type-body-sm text-[10px] text-forest-750 font-medium mt-0.5 leading-tight">
          {currentSlide.subtext || 'Handcrafted in Dhaka'}
        </p>
      </div>
    </div>
  )
}

export function Hero({ slides }: { slides?: HeroSlideItem[] } = {}) {
  const containerRef = useRef<HTMLElement>(null)

  return (
    <section ref={containerRef} className="relative flex items-center overflow-hidden bg-forest-950 bg-laid-paper-dark">
      {/* Ambient Gallery Spotlight Glow */}
      <div
        className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-[320px] sm:w-[460px] lg:w-[580px] h-[320px] sm:h-[460px] lg:h-[580px] rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(196, 162, 101, 0.25) 0%, rgba(10, 22, 15, 0) 70%)',
        }}
        aria-hidden="true"
      />

      {/* Blind-Debossed Pulp Watermark + Minimalist Drifting Leaf */}
      <BambooPaperWatermark theme="dark" className="-right-10 top-1/2 -translate-y-1/2 w-72 h-72 sm:w-88 sm:h-88" />
      <DriftingBambooLeaf theme="dark" className="left-8 sm:left-16 bottom-6 hidden sm:block" rotation={24} scale={1.1} />

      <div className="relative z-10 max-w-[1440px] xl:max-w-[1520px] mx-auto px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 2xl:px-28 w-full grid lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 xl:gap-12 items-center pt-8 pb-10 sm:pt-12 sm:pb-14 lg:py-16 xl:py-20">
        {/* Left: Story & Discovery */}
        <div className="lg:col-span-7 max-w-2xl lg:pl-2 xl:pl-6 2xl:pl-8 text-center lg:text-left">
          {/* Stationery Eyebrow */}
          <div className="hero-eyebrow inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <span className="h-px w-4 sm:w-8 bg-gold-400/80" />
            <span className="type-kicker text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-gold-400 font-sans font-medium">
              Bamboo Stationery &middot; Dhaka &middot; Est. 2026
            </span>
            <span className="h-px w-4 sm:w-8 bg-gold-400/80 lg:hidden" />
          </div>

          <h1 className="mb-3.5 sm:mb-5 text-cream-50 font-display font-medium text-[clamp(1.95rem,5.2vw,4.25rem)] leading-[1.15] sm:leading-[1.1] tracking-[-0.02em] sm:tracking-[-0.025em] text-pretty">
            <span className="block pb-0.5 sm:pb-1">
              Craft your{' '}
              <em className="font-editorial text-gold-300 font-normal">story</em>,
            </span>
            <span className="block pb-0.5 sm:pb-1">
              one page at a time.
            </span>
          </h1>

          {/* Subtext: poetically balanced across both mobile and desktop viewports */}
          <p
            className="hero-subtext mb-5 sm:mb-6 text-[13px] sm:text-[15px] lg:text-base leading-relaxed text-forest-200/85 font-light sm:font-normal max-w-sm sm:max-w-xl mx-auto lg:mx-0 text-pretty"
          >
            Handpicked notebooks, artisanal pens, and bamboo paper goods crafted for thoughtful daily rituals.
          </p>

          <div className="hero-cta flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3.5 mb-7 sm:mb-9 lg:mb-0">
            <Link
              href="/products"
              className="btn-accent rounded-full px-5 py-2.5 sm:px-7 sm:py-3 text-xs sm:text-[13px] font-sans font-semibold tracking-wide inline-flex items-center gap-2 group cursor-pointer active:scale-95 shadow-elevation-2 min-h-[44px]"
            >
              <span>Shop Collection</span>
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="#aboutus"
              className="btn-ghost-dark rounded-full px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-[13px] font-sans font-medium tracking-wide border border-border-gold-subtle hover:border-border-gold inline-flex items-center transition-colors min-h-[44px]"
            >
              Our Story
            </Link>
          </div>
        </div>

        {/* Right: slideshow (sculptural gallery frame) */}
        <div className="hero-frame flex lg:col-span-5 justify-center lg:justify-end w-full">
          <HeroSlideshow slides={slides} />
        </div>
      </div>
    </section>
  )
}


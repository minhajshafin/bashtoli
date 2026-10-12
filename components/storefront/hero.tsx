'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import {
  BADGE_COLOR_PRESETS,
  DEFAULT_FALLBACK_SLIDE,
  type HeroSlideItem,
} from '@/lib/validations/hero-slides'
import { BambooPaperWatermark, DriftingBambooLeaf } from '@/components/storefront/bamboo-motifs'


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
    <div className="relative w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[350px] mx-auto">
      {/* Tactile Frame Glint */}
      <div className="relative p-2 rounded-[28px] bg-forest-900/70 border border-gold-500/25 shadow-2xl backdrop-blur-xs">
        {/* Slides Viewport */}
        <div className="relative aspect-[4/5] rounded-[22px] overflow-hidden bg-forest-950 shadow-inner">
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
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : 'low'}
                sizes="(max-width: 640px) 280px, (max-width: 1024px) 320px, 360px"
                className="object-cover transition-transform duration-1000 ease-out"
                style={{
                  filter: 'brightness(0.94) saturate(1.08)',
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
                  transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
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

          {/* Floating Curation Pill Badge */}
          <div
            className="absolute top-3.5 left-3.5 px-3 py-1 text-[10px] sm:text-[11px] font-semibold z-10 pointer-events-none rounded-full backdrop-blur-md shadow-md transition-all duration-400 font-sans tracking-wide"
            style={{
              backgroundColor: preset.bg,
              color: preset.text,
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            {currentSlide.badge_text}
          </div>

          {/* Minimal Linear Slide Indicators */}
          {activeSlides.length > 1 && (
            <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-forest-950/70 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-forest-800/80">
              {activeSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === slide ? 'w-4 bg-gold-400' : 'w-1.5 bg-cream-100/35 hover:bg-cream-100/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Atelier Spec Note (Desktop & Tablet) */}
      <div
        className="absolute -left-4 sm:-left-6 bottom-6 px-3.5 py-2.5 shadow-lifted hidden sm:block z-20 pointer-events-none rounded-xl bg-cream-50/95 backdrop-blur-md border border-gold-500/30 max-w-[190px] animate-fade-in"
      >
        <p className="font-editorial text-xs font-medium text-forest-950 leading-snug">
          {currentSlide.badge_text}
        </p>
        <p className="text-[9px] uppercase tracking-widest text-gold-600 font-semibold font-sans mt-0.5">
          {currentSlide.subtext || 'Now in store & online'}
        </p>
      </div>
    </div>
  )
}

export function Hero({ slides }: { slides?: HeroSlideItem[] } = {}) {
  return (
    <section className="relative flex items-center overflow-hidden bg-forest-950 bg-laid-paper-dark">
      {/* Blind-Debossed Pulp Watermark + Minimalist Drifting Leaf */}
      <BambooPaperWatermark theme="dark" className="-right-10 top-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96" />
      <DriftingBambooLeaf theme="dark" className="left-8 sm:left-16 bottom-8 hidden sm:block" rotation={24} scale={1.2} />

      <div className="relative z-10 max-w-[1440px] xl:max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 w-full grid lg:grid-cols-12 gap-8 lg:gap-14 items-center py-9 sm:py-11 lg:py-14">
        {/* Left: Story & Discovery */}
        <div className="lg:col-span-7 max-w-2xl">
          {/* Stationery Eyebrow */}
          <div className="inline-flex items-center gap-2.5 mb-4">
            <span className="h-px w-6 bg-gold-400/60" />
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-gold-400 font-sans font-medium">
              Bamboo Stationery & Gifts &mdash; Est. 2026
            </span>
          </div>

          <h1
            className="mb-3.5 sm:mb-4 text-cream-50 font-display font-medium"
            style={{
              fontSize: 'clamp(2.35rem, 4.5vw, 4.15rem)',
              letterSpacing: '-0.015em',
              lineHeight: 1.08,
            }}
          >
            Craft your{' '}
            <em className="font-editorial text-gold-300">story,</em>
            <br />
            <span className="font-editorial text-gold-400 font-medium">one page</span>
            <br />
            at a time.
          </h1>

          <p
            className="mb-6 text-sm sm:text-base leading-relaxed text-forest-200/90 font-normal max-w-xl"
          >
            Handpicked notebooks, artisanal pens, and bamboo paper goods from makers who believe
            writing is still the most intimate form of expression.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 sm:px-7 sm:py-3 text-xs sm:text-sm font-semibold rounded-full bg-gold-500 text-forest-950 hover:bg-gold-400 transition-all shadow-md active:scale-98"
            >
              Shop Collection
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="#aboutus"
              className="inline-flex items-center px-6 py-2.5 sm:px-7 sm:py-3 text-xs sm:text-sm rounded-full border border-forest-700/90 text-cream-200 hover:border-gold-400/80 hover:text-gold-300 transition-all active:scale-98"
            >
              Our Story
            </Link>
          </div>
        </div>

        {/* Right: slideshow (accessible across all viewports) */}
        <div className="flex lg:col-span-5 justify-center lg:justify-end w-full">
          <HeroSlideshow slides={slides} />
        </div>
      </div>
    </section>
  )
}


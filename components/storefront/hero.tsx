'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { gsap, isReducedMotion } from '@/lib/motion'

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
    <div className="relative w-full max-w-[320px] sm:max-w-[320px] lg:max-w-[350px] mx-auto">
      {/* Tactile Frame Glint */}
      <div className="relative p-1.5 sm:p-2 rounded-2xl sm:rounded-[28px] bg-forest-900/70 border border-gold-500/25 shadow-sm backdrop-blur-xs">
        {/* Slides Viewport: 16:10 cinematic on mobile, 4:5 on sm+ */}
        <div className="relative aspect-[16/10] sm:aspect-[4/5] rounded-[18px] sm:rounded-[22px] overflow-hidden bg-forest-950 shadow-inner">
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
                sizes="(max-width: 640px) 320px, (max-width: 1024px) 320px, 360px"
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

          {/* Floating Curation Pill Badge (Desktop / Tablet only) */}
          <div
            className="hidden sm:block absolute top-3.5 left-3.5 px-3 py-1 text-[10px] sm:text-[11px] font-semibold z-10 pointer-events-none rounded-full backdrop-blur-md transition-all duration-400 font-sans tracking-wide"
            style={{
              backgroundColor: preset.bg,
              color: preset.text,
              border: '1px solid var(--color-border-dark)',
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
                    i === slide ? 'w-4 bg-btn-accent-bg' : 'w-1.5 bg-cream-100/35 hover:bg-cream-100/80'
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
        <p className="font-display text-[13px] font-semibold text-forest-950 leading-snug tracking-[-0.01em]">
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
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (isReducedMotion() || !containerRef.current) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // Subtle eyebrow entrance
      tl.fromTo(
        '.hero-eyebrow',
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', clearProps: 'opacity,transform' },
        0.05
      )

      // Masked typography lines reveal: slides upward from overflow mask
      tl.fromTo(
        '.hero-title-line',
        { yPercent: 110 },
        { yPercent: 0, duration: 0.85, stagger: 0.12, ease: 'power3.out', clearProps: 'transform' },
        0.12
      )

      // Subtitle paragraph
      tl.fromTo(
        '.hero-subtext',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out', clearProps: 'opacity,transform' },
        0.4
      )

      // CTA buttons
      tl.fromTo(
        '.hero-cta',
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', clearProps: 'opacity,transform' },
        0.55
      )

      // Slideshow frame gentle entrance
      tl.fromTo(
        '.hero-frame',
        { opacity: 0, scale: 0.97 },
        { opacity: 1, scale: 1, duration: 0.85, ease: 'power2.out', clearProps: 'opacity,transform' },
        0.2
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="relative flex items-center overflow-hidden bg-forest-950 bg-laid-paper-dark">
      {/* Blind-Debossed Pulp Watermark + Minimalist Drifting Leaf */}
      <BambooPaperWatermark theme="dark" className="-right-10 top-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96" />
      <DriftingBambooLeaf theme="dark" className="left-8 sm:left-16 bottom-8 hidden sm:block" rotation={24} scale={1.2} />

      <div className="relative z-10 max-w-[1440px] xl:max-w-[1520px] mx-auto px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 2xl:px-28 w-full grid lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-14 items-center py-7 sm:py-12 lg:py-16 xl:py-18">
        {/* Left: Story & Discovery */}
        <div className="lg:col-span-7 max-w-2xl lg:pl-2 xl:pl-6 2xl:pl-8 text-center lg:text-left">
          {/* Stationery Eyebrow */}
          <div className="hero-eyebrow inline-flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <span className="h-px w-4 sm:w-8 bg-gold-400/70" />
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.24em] text-gold-400 font-sans font-medium">
              Bamboo Stationery &middot; Dhaka &middot; Est. 2026
            </span>
            <span className="h-px w-4 sm:w-8 bg-gold-400/70 lg:hidden" />
          </div>

          <h1
            className="mb-3 sm:mb-4 text-cream-50 font-display font-medium"
            style={{
              fontSize: 'clamp(1.75rem, 4.4vw, 4.15rem)',
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
            }}
          >
            <span className="block overflow-hidden py-0.5">
              <span className="hero-title-line block">
                Craft your{' '}
                <em className="font-editorial text-gold-300 font-normal">story</em>,
              </span>
            </span>
            <span className="block overflow-hidden py-0.5">
              <span className="hero-title-line block">
                one page at a time.
              </span>
            </span>
          </h1>

          {/* Subtext: hidden on mobile to eliminate clutter, shown on sm+ */}
          <p
            className="hero-subtext hidden sm:block mb-4 sm:mb-7 text-xs sm:text-[15px] lg:text-base leading-relaxed text-forest-200/90 font-normal max-w-xl text-pretty"
          >
            Handpicked notebooks, artisanal pens, and bamboo paper goods crafted for thoughtful daily rituals.
          </p>

          <div className="hero-cta flex items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-2 lg:mb-0">
            <Link
              href="/products"
              className="btn-accent rounded-full px-6 py-2.5 sm:px-7 sm:py-3.5 text-xs sm:text-[13px] font-sans font-semibold tracking-wide inline-flex items-center gap-2 group cursor-pointer active:scale-95"
            >
              <span>Shop Collection</span>
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="#aboutus"
              className="hidden sm:inline-flex btn-ghost-dark rounded-full px-6 py-3 sm:px-7 sm:py-3.5 text-xs sm:text-[13px] font-sans font-medium tracking-wide border border-border-gold-subtle hover:border-border-gold items-center transition-all"
            >
              Our Story
            </Link>
          </div>
        </div>

        {/* Right: slideshow (compact mobile frame) */}
        <div className="hero-frame flex lg:col-span-5 justify-center lg:justify-end w-full mt-2 sm:mt-0">
          <HeroSlideshow slides={slides} />
        </div>
      </div>
    </section>
  )
}


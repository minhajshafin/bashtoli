'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const heroSlides = [
  {
    img: 'https://images.unsplash.com/photo-1764044371318-c7a7d546859c?w=900&h=1080&fit=crop&auto=format',
    alt: 'Glasses, notebooks, and pencils on a desk',
    badge: 'New Season Collection',
    badgeBg: '#c9a96e',
    badgeColor: '#1a3326',
  },
  {
    img: 'https://images.unsplash.com/photo-1776762249715-525ae7025e0a?w=900&h=1080&fit=crop&auto=format',
    alt: 'Blank notebook with pencils and green leaves',
    badge: 'Bestselling',
    badgeBg: '#3d6e54',
    badgeColor: '#fff',
  },
  {
    img: 'https://images.unsplash.com/photo-1518674660708-0e2c0473e68e?w=900&h=1080&fit=crop&auto=format',
    alt: 'Gold fountain pen with engraved nib',
    badge: 'On Sale — 20% Off',
    badgeBg: '#c94f3d',
    badgeColor: '#fff',
  },
  {
    img: 'https://images.unsplash.com/photo-1785668709724-52ddd2f2c086?w=900&h=1080&fit=crop&auto=format',
    alt: 'Decorative washi tapes with botanical patterns',
    badge: 'Staff Pick',
    badgeBg: '#4a7fa5',
    badgeColor: '#fff',
  },
]

function LeafTopRight() {
  return (
    <svg
      viewBox="0 0 320 320"
      fill="none"
      className="absolute top-0 right-0 w-64 h-64 md:w-80 md:h-80 pointer-events-none"
      style={{ opacity: 0.13 }}
      aria-hidden="true"
    >
      <path d="M300 10 Q260 70 200 110 Q150 145 170 210 Q185 250 230 270" stroke="#c9a96e" strokeWidth="1.5" fill="none" />
      <path d="M200 90 Q182 65 158 82 Q148 100 168 112 Q188 124 200 90Z" fill="#c9a96e" opacity="0.7" />
      <path d="M240 55 Q222 30 198 47 Q188 65 208 77 Q228 89 240 55Z" fill="#c9a96e" opacity="0.5" />
      <path d="M275 25 Q257 5 233 22 Q223 38 243 47 Q263 56 275 25Z" fill="#c9a96e" opacity="0.4" />
      <path d="M310 45 Q320 95 308 145 Q296 185 268 205" stroke="#c9a96e" strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M280 115 Q260 92 245 110 Q240 127 255 133 Q270 139 280 115Z" fill="#c9a96e" opacity="0.4" />
      <path d="M265 160 Q245 137 230 155 Q225 172 240 178 Q255 184 265 160Z" fill="#c9a96e" opacity="0.3" />
    </svg>
  )
}

function LeafBottomLeft() {
  return (
    <svg
      viewBox="0 0 280 280"
      fill="none"
      className="absolute bottom-0 left-0 w-52 h-52 md:w-64 md:h-64 pointer-events-none"
      style={{ opacity: 0.1 }}
      aria-hidden="true"
    >
      <path d="M20 260 Q60 215 80 155 Q100 95 55 45" stroke="#c9a96e" strokeWidth="1.5" fill="none" />
      <path d="M75 120 Q95 95 80 70 Q62 63 57 80 Q52 97 75 120Z" fill="#c9a96e" opacity="0.6" />
      <path d="M55 165 Q78 140 62 115 Q44 108 39 125 Q34 142 55 165Z" fill="#c9a96e" opacity="0.5" />
      <path d="M36 205 Q59 180 43 155 Q25 148 20 165 Q15 182 36 205Z" fill="#c9a96e" opacity="0.4" />
    </svg>
  )
}

function HeroSlideshow() {
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setSlide((s) => (s + 1) % heroSlides.length), 4500)
    return () => clearInterval(timer)
  }, [])

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
      <div style={{ borderRadius: '24px', aspectRatio: '4/5', overflow: 'hidden', position: 'relative', maxHeight: '480px' }}>
        {heroSlides.map((s, i) => (
          <img
            key={s.img}
            src={s.img}
            alt={s.alt}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: 'brightness(0.88) saturate(1.15)',
              opacity: i === slide ? 1 : 0,
              transition: 'opacity 0.9s ease',
            }}
          />
        ))}
        {/* Badge */}
        <div
          className="absolute top-4 left-4 px-4 py-1.5 text-xs font-semibold"
          style={{
            backgroundColor: heroSlides[slide].badgeBg,
            color: heroSlides[slide].badgeColor,
            borderRadius: '100px',
            letterSpacing: '0.06em',
            transition: 'background-color 0.4s, color 0.4s',
            backdropFilter: 'blur(4px)',
          }}
        >
          {heroSlides[slide].badge}
        </div>
        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {heroSlides.map((_, i) => (
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
      </div>
      {/* Floating card */}
      <div
        className="absolute -left-5 bottom-10 px-5 py-4 shadow-2xl hidden md:block"
        style={{ backgroundColor: '#f5ede0', borderRadius: '18px', maxWidth: '190px' }}
      >
        <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '0.98rem', fontWeight: 600, color: '#1a3326', lineHeight: 1.3 }}>
          {heroSlides[slide].badge}
        </p>
        <p style={{ fontSize: '0.72rem', color: '#3d6e54', marginTop: '5px' }}>Now in store &amp; online</p>
      </div>
    </div>
  )
}

export function Hero() {
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
                priority
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
              fontFamily: "'Fraunces', Georgia, serif",
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
          <HeroSlideshow />
        </div>
      </div>
    </section>
  )
}


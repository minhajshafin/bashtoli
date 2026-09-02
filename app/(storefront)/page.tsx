import React from 'react'
import { Hero } from '@/components/storefront/hero'
import { FeaturedProducts } from '@/components/storefront/featured-products'
import { CategoryGrid } from '@/components/storefront/category-grid'
import { AboutSection } from '@/components/storefront/about-section'
import { MarqueeBand } from '@/components/storefront/marquee-band'
import { SuggestAnItem } from '@/components/storefront/suggest-an-item'

export const metadata = {
  title: 'Bashtoli Stationery | Your Neighbourhood Stationery Shop',
  description: 'Pens, pencils, notebooks, pouches, key rings & more. Shop everything you need at Bashtoli Stationery, Dhaka.',
  alternates: {
    canonical: 'https://bashtoli.com',
  },
  openGraph: {
    title: 'Bashtoli Stationery | Your Neighbourhood Stationery Shop',
    description: 'Pens, pencils, notebooks, pouches, key rings & more. Shop everything you need at Bashtoli Stationery, Dhaka.',
    url: 'https://bashtoli.com',
    siteName: 'Bashtoli Stationery',
    locale: 'en_US',
    type: 'website',
  },
}

/**
 * Storefront Homepage Route.
 * Full-bleed layout — sections own their own backgrounds and padding.
 */
export default async function StorefrontHomePage() {
  return (
    <div>
      {/* 1. Hero */}
      <Hero />

      {/* Wave: hero (forest-800) → featured products (cream-50) */}
      <div className="bg-forest-800" style={{ marginBottom: '-1px' }}>
        <svg viewBox="0 0 1440 72" preserveAspectRatio="none" style={{ width: '100%', height: '72px', display: 'block' }}>
          <path d="M0,20 C160,20 280,72 480,72 C680,72 760,0 960,0 C1160,0 1280,56 1440,44 L1440,72 L0,72 Z" fill="#faf6ef" />
        </svg>
      </div>

      {/* 2. Featured Products */}
      <FeaturedProducts />

      {/* Wave: cream-50 → categories (forest-800) */}
      <div className="bg-forest-800">
        <svg viewBox="0 0 1440 72" preserveAspectRatio="none" style={{ width: '100%', height: '72px', display: 'block' }}>
          <path d="M0,72 Q200,0 440,40 Q680,72 900,20 Q1140,0 1440,50 L1440,0 L0,0 Z" fill="#faf6ef" />
        </svg>
      </div>

      {/* 3. Categories */}
      <CategoryGrid />

      {/* Wave: categories (forest-800) → about (cream-100) */}
      <div className="bg-forest-800">
        <svg viewBox="0 0 1440 72" preserveAspectRatio="none" style={{ width: '100%', height: '72px', display: 'block' }}>
          <path d="M0,0 Q360,72 720,32 Q1080,0 1440,56 L1440,72 L0,72 Z" fill="#f5ede0" />
        </svg>
      </div>

      {/* 4. About */}
      <AboutSection />

      {/* 5. Marquee */}
      <MarqueeBand />

      {/* Wave: marquee (gold-500) → suggest (forest-900) */}
      <div className="bg-forest-900">
        <svg viewBox="0 0 1440 72" preserveAspectRatio="none" style={{ width: '100%', height: '72px', display: 'block' }}>
          <path d="M0,72 Q360,0 720,44 Q1080,72 1440,16 L1440,0 L0,0 Z" fill="#c9a96e" />
        </svg>
      </div>

      {/* 6. Suggest an item */}
      <SuggestAnItem />
    </div>
  )
}


import React, { Suspense } from 'react'
import { Hero } from '@/components/storefront/hero'
import { getStorefrontHeroSlides } from '@/lib/queries/hero-slides'
import { getFeaturedCollageCategories } from '@/lib/queries/category-collage'
import { FeaturedProducts } from '@/components/storefront/featured-products'
import { CategoryGrid } from '@/components/storefront/category-grid'
import { AboutSection } from '@/components/storefront/about-section'
import { MarqueeBand } from '@/components/storefront/marquee-band'
import { SuggestAnItem } from '@/components/storefront/suggest-an-item'
import { FeaturedProductsSkeleton } from '@/components/storefront/skeletons'

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
  const [heroSlides, featuredCategories] = await Promise.all([
    getStorefrontHeroSlides(),
    getFeaturedCollageCategories(),
  ])

  return (
    <div className="flex flex-col">
      {/* 1. Hero: Atelier Arrival */}
      <Hero slides={heroSlides} />

      {/* 2. Featured Products: Curated Collection (Alabaster Paper) */}
      <Suspense fallback={<FeaturedProductsSkeleton />}>
        <FeaturedProducts />
      </Suspense>

      {/* 3. Categories: Bento Grid (Atelier Moss) */}
      <CategoryGrid categories={featuredCategories} />

      {/* 4. Marquee: Tactile Washi-Tape Ribbon */}
      <MarqueeBand />

      {/* 5. About: Atelier Heritage & Materiality (Alabaster Cotton) */}
      <AboutSection />

      {/* 6. Suggest an item: Patron Collaboration Form (Deep Forest) */}
      <SuggestAnItem />
    </div>
  )
}


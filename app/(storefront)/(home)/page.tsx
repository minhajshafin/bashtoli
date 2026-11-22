import React, { Suspense } from 'react'
import { Hero } from '@/components/storefront/hero'
import { getStorefrontHeroSlides } from '@/lib/queries/hero-slides'
import { getFeaturedCollageCategories } from '@/lib/queries/category-collage'
import { FeaturedProducts } from '@/components/storefront/featured-products'
import { CategoryGrid } from '@/components/storefront/category-grid'
import { AboutSection } from '@/components/storefront/about-section'
import { SuggestAnItem } from '@/components/storefront/suggest-an-item'
import { FeaturedProductsSkeleton } from '@/components/storefront/skeletons'

export const metadata = {
  title: {
    absolute: 'Bashtoli Stationery',
  },
  description: 'Pens, pencils, notebooks, pouches, key rings & more. Shop everything you need at Bashtoli Stationery, Dhaka.',
  alternates: {
    canonical: 'https://bashtoli.com',
  },
  openGraph: {
    title: 'Bashtoli Stationery',
    description: 'Pens, pencils, notebooks, pouches, key rings & more. Shop everything you need at Bashtoli Stationery, Dhaka.',
    url: 'https://bashtoli.com',
    siteName: 'Bashtoli Stationery',
    locale: 'en_US',
    type: 'website',
  },
}

/**
 * Storefront Homepage Route.
 * Full-bleed layout — Strategy A: The Architectural Rhythm.
 * Alternating cinematic dual-tone blocks (Tone 1: Deep Sumi Forest, Tone 2: Warm Cotton Paper).
 */
export default async function StorefrontHomePage() {
  const [heroSlides, featuredCategories] = await Promise.all([
    getStorefrontHeroSlides(),
    getFeaturedCollageCategories(),
  ])

  return (
    <div className="flex flex-col">
      {/* 1. Hero: Welcome to Bashtoli (Tone 1: Deep Sumi Forest) */}
      <Hero slides={heroSlides} />

      {/* Architectural Hairline: Tone 1 (Forest) → Tone 2 (Cotton Paper) */}
      <div className="w-full h-px bg-forest-800/80 border-b border-gold-500/20" aria-hidden="true" />

      {/* 2. Featured Products: Curated Collection (Tone 2: Warm Cotton Paper Canvas) */}
      <Suspense fallback={<FeaturedProductsSkeleton />}>
        <FeaturedProducts />
      </Suspense>

      {/* 3. Categories: Curated Collections Grid (Tone 2: Warm Cotton Paper Canvas) */}
      <CategoryGrid categories={featuredCategories} />

      {/* 4. About Us: Neighbourhood Heritage & Craft (Tone 1: Deep Sumi Forest Inversion) */}
      <AboutSection />

      {/* 5. Suggest an item: Community Suggestions (Tone 2: Warm Cotton Paper Canvas) */}
      <SuggestAnItem />
    </div>
  )
}


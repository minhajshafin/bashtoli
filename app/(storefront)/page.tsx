import React, { Suspense } from 'react'
import { Hero } from '@/components/storefront/hero'
import { getStorefrontHeroSlides } from '@/lib/queries/hero-slides'
import { getFeaturedCollageCategories } from '@/lib/queries/category-collage'
import { FeaturedProducts } from '@/components/storefront/featured-products'
import { CategoryGrid } from '@/components/storefront/category-grid'
import { AboutSection } from '@/components/storefront/about-section'
import { SuggestAnItem } from '@/components/storefront/suggest-an-item'
import { FeaturedProductsSkeleton } from '@/components/storefront/skeletons'
import { WaveDivider } from '@/components/storefront/wave-divider'

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
 * Full-bleed layout — sections own their own backgrounds and padding,
 * connected harmoniously by Direction 1: The Elevated "Sugeta" Layered Wave Dividers.
 */
export default async function StorefrontHomePage() {
  const [heroSlides, featuredCategories] = await Promise.all([
    getStorefrontHeroSlides(),
    getFeaturedCollageCategories(),
  ])

  return (
    <div className="flex flex-col">
      {/* 1. Hero: Welcome to Bashtoli */}
      <Hero slides={heroSlides} />

      {/* Wave 1: Hero (Forest) → Featured Products (Alabaster Cream) */}
      <WaveDivider variant="hero-to-products" />

      {/* 2. Featured Products: Curated Collection (Streams in behind Suspense) */}
      <Suspense fallback={<FeaturedProductsSkeleton />}>
        <FeaturedProducts />
      </Suspense>

      {/* Wave 2: Featured Products (Alabaster Cream) → Categories (Forest Moss) */}
      <WaveDivider variant="products-to-categories" />

      {/* 3. Categories: Curated Collections Grid */}
      <CategoryGrid categories={featuredCategories} />

      {/* Wave 3: Categories (Forest Moss) → About Us (Alabaster Cream) */}
      <WaveDivider variant="categories-to-about" />

      {/* 4. About Us: Neighbourhood Heritage & Craft */}
      <AboutSection />

      {/* Wave 4: About Us (Alabaster Cream) → Suggest an Item (Deep Forest) */}
      <WaveDivider variant="about-to-suggest" />

      {/* 5. Suggest an item: Community Suggestions */}
      <SuggestAnItem />
    </div>
  )
}


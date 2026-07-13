import React from 'react'
import Link from 'next/link'
import { Hero } from '@/components/storefront/hero'
import { FeaturedProducts } from '@/components/storefront/featured-products'
import { getStorefrontCategories } from '@/lib/queries/products'

export const metadata = {
  title: 'Bashtoli | Premium Bamboo & Cane Handicrafts',
  description: 'Shop organic sustainable handicraft products hand-woven with love in Bangladesh.',
  alternates: {
    canonical: 'https://bashtoli.com',
  },
  openGraph: {
    title: 'Bashtoli | Premium Bamboo & Cane Handicrafts',
    description: 'Shop organic sustainable handicraft products hand-woven with love in Bangladesh.',
    url: 'https://bashtoli.com',
    siteName: 'Bashtoli',
    locale: 'en_US',
    type: 'website',
  },
}

/**
 * Storefront Homepage Route.
 * Server component rendering hero banners, categories lists, and featured items.
 */
export default async function StorefrontHomePage() {
  const categories = await getStorefrontCategories()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
      {/* 1. Hero banner section */}
      <Hero />

      {/* 2. Categories Quick links navigation */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-black text-zinc-900 tracking-tight dark:text-white">
            Browse by Category
          </h2>
          <p className="text-xs text-zinc-500 mt-1 dark:text-zinc-400">
            Explore our curated collections of premium handcrafted goods.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group flex flex-col justify-between p-5 rounded-2xl border border-zinc-200 bg-white hover:border-amber-500 hover:shadow-xs transition-all dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-amber-500"
            >
              <div>
                <h3 className="text-sm font-bold text-zinc-800 group-hover:text-amber-600 transition-colors dark:text-zinc-200 dark:group-hover:text-amber-500">
                  {cat.name}
                </h3>
                <p className="text-[10px] text-zinc-400 mt-1 dark:text-zinc-500">
                  Natural eco-friendly decor
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 flex justify-between items-center text-xs dark:border-zinc-900">
                <span className="text-[10px] rounded-md bg-stone-100 px-2 py-0.5 font-bold text-stone-750 dark:bg-zinc-900 dark:text-zinc-450">
                  {cat.activeProductsCount} Items
                </span>
                <span className="text-[11px] font-bold text-amber-600 group-hover:translate-x-0.5 transition-transform dark:text-amber-500">
                  Explore &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 3. Featured Products dynamic listing */}
      <FeaturedProducts />
    </div>
  )
}

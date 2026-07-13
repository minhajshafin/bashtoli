import React from 'react'
import Link from 'next/link'
import { getFeaturedProducts } from '@/lib/queries/products'
import { ProductCard } from '@/components/storefront/product-card'

/**
 * FeaturedProducts server component.
 * Retrieves featured store items (falling back to new ones) and renders the grid.
 */
export async function FeaturedProducts() {
  const products = await getFeaturedProducts()

  if (products.length === 0) return null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-baseline border-b border-zinc-100 pb-4 dark:border-zinc-900">
        <div>
          <h2 className="text-xl font-black text-zinc-900 tracking-tight dark:text-white">
            Featured Products
          </h2>
          <p className="text-xs text-zinc-500 mt-1 dark:text-zinc-400">
            Artisanal organic handicrafts handpicked just for you.
          </p>
        </div>
        <Link
          id="featured-view-all-link"
          href="/products"
          className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline dark:text-amber-500 dark:hover:text-amber-400"
        >
          View All Products &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

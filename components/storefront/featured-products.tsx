import React from 'react'
import { getFeaturedProducts } from '@/lib/queries/products'
import { ProductCarousel } from '@/components/storefront/product-carousel'

export async function FeaturedProducts() {
  const products = await getFeaturedProducts()

  if (products.length === 0) return null

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-cream-100 border-b border-forest-200/60">
      <div className="max-w-7xl mx-auto">
        <ProductCarousel products={products} />
      </div>
    </section>
  )
}

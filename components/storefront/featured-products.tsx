import React from 'react'
import { getFeaturedProducts } from '@/lib/queries/products'
import { ProductCarousel } from '@/components/storefront/product-carousel'

export async function FeaturedProducts() {
  const products = await getFeaturedProducts()

  if (products.length === 0) return null

  return (
    <section className="relative overflow-hidden py-6 sm:py-8 lg:py-9 px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24 2xl:px-28 bg-cream-100 bg-laid-paper">
      <div className="relative z-10 max-w-[1440px] xl:max-w-[1520px] mx-auto">
        <ProductCarousel products={products} />
      </div>
    </section>
  )
}

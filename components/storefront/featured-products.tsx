import React from 'react'
import { getFeaturedProducts } from '@/lib/queries/products'
import { ProductCarousel } from '@/components/storefront/product-carousel'
import { BambooPaperWatermark, DriftingBambooLeaf } from '@/components/storefront/bamboo-motifs'

export async function FeaturedProducts() {
  const products = await getFeaturedProducts()

  if (products.length === 0) return null

  return (
    <section className="relative overflow-hidden py-14 sm:py-18 px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24 2xl:px-28 bg-cream-100 bg-laid-paper">
      {/* Blind-Debossed Pulp Watermark + Single Drifting Sumi-e Leaf */}
      <BambooPaperWatermark theme="light" className="-left-12 top-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 opacity-60" />
      <DriftingBambooLeaf theme="light" className="right-12 top-8 hidden sm:block" rotation={-16} scale={0.9} />

      <div className="relative z-10 max-w-[1440px] xl:max-w-[1520px] mx-auto">
        <ProductCarousel products={products} />
      </div>
    </section>
  )
}

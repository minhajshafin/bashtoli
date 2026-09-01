import React from 'react'
import Link from 'next/link'
import { getFeaturedProducts } from '@/lib/queries/products'
import { ProductCarousel } from '@/components/storefront/product-carousel'

export async function FeaturedProducts() {
  const products = await getFeaturedProducts()

  if (products.length === 0) return null

  return (
    <section className="py-20 px-5 md:px-8 bg-cream-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
          <div>
            <p
              className="text-[11px] uppercase tracking-[0.28em] mb-3"
              style={{ color: '#c9a96e' }}
            >
              Featured
            </p>
            <h2
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: 'clamp(1.9rem, 4vw, 3rem)',
                color: '#1a3326',
                fontWeight: 400,
                fontStyle: 'italic',
                lineHeight: 1.1,
              }}
            >
              Finest Goods,<br />Thoughtfully Chosen
            </h2>
          </div>
          <Link
            id="featured-view-all-link"
            href="/products"
            className="self-start md:self-auto inline-flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-full bg-forest-800 border border-forest-700 text-gold-400 hover:bg-gold-500 hover:text-forest-800 hover:border-gold-500 transition-all"
          >
            View all products
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <ProductCarousel products={products} />
      </div>
    </section>
  )
}

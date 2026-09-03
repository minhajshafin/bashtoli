import React from 'react'
import Link from 'next/link'
import type { FeaturedCategoryItem } from '@/lib/validations/category-collage'
import { COLLAGE_SLOT_CONFIGS } from '@/lib/validations/category-collage'

interface CategoryGridProps {
  categories?: FeaturedCategoryItem[]
}

function CategoryCard({
  category,
  gridArea,
  style,
}: {
  category: FeaturedCategoryItem
  gridArea?: string
  style?: React.CSSProperties
}) {
  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group relative overflow-hidden cursor-pointer block border border-forest-700/60 transition-all duration-300 hover:border-gold-500/80 shadow-md"
      style={{
        gridArea,
        borderRadius: '20px',
        ...(category.image_url
          ? {
              backgroundImage: `url(${category.image_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : {}),
        ...style,
      }}
    >
      {/* Background gradient if no image */}
      {!category.image_url && (
        <div className="absolute inset-0 bg-gradient-to-br from-forest-800 via-forest-900 to-forest-800 flex items-center justify-center pointer-events-none">
          <svg
            className="w-12 h-12 text-gold-500/20 stroke-[1.2]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
      )}

      {/* Dark tint gradient overlay for text legibility */}
      <div
        className="absolute inset-0 transition-all duration-350"
        style={{
          background:
            'linear-gradient(to top, rgba(13,31,21,0.92) 0%, rgba(13,31,21,0.45) 55%, rgba(13,31,21,0.1) 100%)',
          borderRadius: '20px',
        }}
      />

      {/* Hover gold ring */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-350 pointer-events-none"
        style={{ borderRadius: '20px', border: '1.5px solid rgba(201,169,110,0.8)' }}
      />

      {/* Category Labels */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
        <h3
          className="mb-1 text-cream-100 group-hover:text-gold-300 transition-colors"
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: '1.05rem',
            fontWeight: 500,
          }}
        >
          {category.name}
        </h3>
        <p
          className="text-xs group-hover:text-gold-400 transition-colors"
          style={{
            letterSpacing: '0.08em',
            color: '#a8c4b0',
            fontFamily: "'Source Sans 3', system-ui, sans-serif",
          }}
        >
          {category.product_count !== undefined
            ? `${category.product_count} ${category.product_count === 1 ? 'item' : 'items'}`
            : 'Explore'}
          &nbsp;&rarr;
        </p>
      </div>
    </Link>
  )
}

export function CategoryGrid({ categories = [] }: CategoryGridProps) {
  // If no categories passed, don't crash or render broken section
  if (!categories || categories.length === 0) {
    return null
  }

  return (
    <section className="py-20 px-5 md:px-8 bg-forest-800">
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-12 sm:mb-14">
          <p
            className="text-[11px] uppercase tracking-[0.28em] mb-3 font-semibold"
            style={{ color: '#c9a96e' }}
          >
            Explore
          </p>
          <h2
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 'clamp(1.9rem, 4vw, 3rem)',
              color: '#f5ede0',
              fontWeight: 400,
              fontStyle: 'italic',
              lineHeight: 1.1,
            }}
          >
            Browse by Category
          </h2>
        </div>

        {/* Desktop asymmetric 3-row, 7-slot collage */}
        <div
          className="hidden md:grid gap-4"
          style={{
            gridTemplate: `
              "slot1 slot2 slot3" 210px
              "slot1 slot4 slot3" 185px
              "slot5 slot6 slot7" 180px
            / 1.35fr 1fr 1.2fr`,
          }}
        >
          {COLLAGE_SLOT_CONFIGS.map((slotConfig, index) => {
            const cat = categories[index]
            if (!cat) {
              return (
                <div
                  key={slotConfig.gridArea}
                  style={{ gridArea: slotConfig.gridArea, borderRadius: '20px' }}
                  className="rounded-[20px] border border-dashed border-forest-700/40 bg-forest-900/30 flex items-center justify-center p-4 text-center"
                >
                  <span className="text-xs text-forest-500 font-medium">Coming Soon</span>
                </div>
              )
            }

            return (
              <CategoryCard
                key={cat.id}
                category={cat}
                gridArea={slotConfig.gridArea}
              />
            )
          })}
        </div>

        {/* Mobile 2-column grid */}
        <div className="md:hidden grid grid-cols-2 gap-3">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              style={{ height: '180px' }}
            />
          ))}
        </div>

        {/* Shop Navigation Button */}
        <div className="mt-12 sm:mt-16 flex justify-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 sm:px-9 sm:py-4 rounded-full border border-gold-500/60 bg-forest-900/80 text-xs sm:text-sm font-semibold text-cream-100 hover:bg-gold-500 hover:text-forest-900 hover:border-gold-500 transition-all duration-300 shadow-md active:scale-[0.98] group"
          >
            <span>View All Categories</span>
            <svg
              className="w-4 h-4 text-gold-400 group-hover:text-forest-900 group-hover:translate-x-1 transition-all"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { FeaturedCategoryItem } from '@/lib/validations/category-collage'
import { COLLAGE_SLOT_CONFIGS } from '@/lib/validations/category-collage'

interface CategoryGridProps {
  categories?: FeaturedCategoryItem[]
}

function CategoryCard({
  category,
  gridArea,
  style,
  className = '',
}: {
  category: FeaturedCategoryItem
  gridArea?: string
  style?: React.CSSProperties
  className?: string
}) {
  return (
    <Link
      href={`/products?category=${category.slug}`}
      className={`group relative overflow-hidden cursor-pointer block w-full h-full rounded-2xl sm:rounded-3xl border border-forest-700/60 hover:border-gold-400/70 shadow-md hover:shadow-lifted transition-all duration-500 ${className}`}
      style={{
        gridArea,
        borderRadius: '24px',
        ...style,
      }}
    >
      {category.image_url ? (
        <Image
          src={category.image_url}
          alt={category.name}
          fill
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-106"
        />
      ) : (
        /* Background gradient if no image */
        <div className="absolute inset-0 bg-gradient-to-br from-forest-850 via-forest-900 to-forest-950 flex items-center justify-center pointer-events-none">
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

      {/* Luminous bottom vignette for clean legibility without obscuring photography */}
      <div
        className="absolute inset-0 rounded-2xl sm:rounded-3xl transition-opacity duration-300 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(10,22,15,0.85) 0%, rgba(10,22,15,0.3) 45%, transparent 75%)',
        }}
      />

      {/* Category Labels */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 z-10 flex flex-col items-start">
        {category.product_count !== undefined && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-forest-950/70 backdrop-blur-xs border border-forest-700/70 text-[10px] font-semibold text-gold-300 font-sans mb-1.5 shadow-sm">
            {category.product_count} {category.product_count === 1 ? 'item' : 'items'}
          </span>
        )}
        <h3
          className="text-cream-100 group-hover:text-gold-300 transition-colors font-display text-base sm:text-lg font-medium leading-snug"
        >
          {category.name}
        </h3>
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
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-forest-900 border-t border-forest-800/80">
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-8 sm:mb-10 max-w-xl mx-auto">
          <h2
            className="font-editorial text-cream-100 font-normal leading-tight text-2xl sm:text-3xl md:text-4xl"
          >
            Browse by Category
          </h2>
          <p className="text-xs sm:text-sm text-forest-300 font-light mt-2.5 leading-relaxed font-sans">
            Curated papers, journals, fine instruments, and accessories grouped for thoughtful contemplation.
          </p>
        </div>

        {/* Desktop symmetric 3-row, 7-slot collage */}
        <div
          className="hidden md:grid gap-3.5"
          style={{
            gridTemplate: `
              "slot1 slot2 slot3" 190px
              "slot1 slot4 slot3" 165px
              "slot5 slot6 slot7" 160px
            / 1.2fr 1fr 1.2fr`,
          }}
        >
          {COLLAGE_SLOT_CONFIGS.map((slotConfig, index) => {
            const cat = categories[index]
            if (!cat) {
              return (
                <div
                  key={slotConfig.gridArea}
                  style={{ gridArea: slotConfig.gridArea, borderRadius: '24px' }}
                  className="w-full h-full rounded-3xl border border-dashed border-forest-700/40 bg-forest-900/30 flex items-center justify-center p-4 text-center"
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
          {categories.map((cat, index) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              className={index === categories.length - 1 && categories.length % 2 === 1 ? 'col-span-2' : ''}
              style={{ height: '170px' }}
            />
          ))}
        </div>

        {/* Shop Navigation Button */}
        <div className="mt-8 sm:mt-10 flex justify-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-gold-500/60 bg-forest-900/80 text-xs sm:text-sm font-semibold text-cream-100 hover:bg-gold-500 hover:text-forest-900 hover:border-gold-500 transition-all duration-300 shadow-md active:scale-[0.98] group"
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

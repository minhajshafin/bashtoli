import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { FeaturedCategoryItem } from '@/lib/validations/category-collage'

interface CategoryGridProps {
  categories?: FeaturedCategoryItem[]
}

type CardSize = 'hero' | 'medium' | 'compact'

const SIZE_CONFIGS: Record<CardSize, { padding: string; title: string }> = {
  hero: {
    padding: 'p-4 sm:p-5 lg:p-6',
    title: 'text-base sm:text-lg lg:text-[21px] font-display font-medium tracking-[-0.015em]',
  },
  medium: {
    padding: 'p-3.5 sm:p-4 lg:p-4.5',
    title: 'text-sm sm:text-[15px] lg:text-[17px] font-display font-medium tracking-[-0.01em]',
  },
  compact: {
    padding: 'p-3 sm:p-3.5 lg:p-4',
    title: 'text-xs sm:text-[13px] lg:text-[15px] font-display font-medium tracking-[-0.01em]',
  },
}

function CategoryCard({
  category,
  className = '',
  size = 'medium',
  style,
}: {
  category: FeaturedCategoryItem
  className?: string
  size?: CardSize
  style?: React.CSSProperties
}) {
  const sizeConfig = SIZE_CONFIGS[size] || SIZE_CONFIGS.medium

  return (
    <Link
      href={`/products?category=${category.slug}`}
      className={`group relative overflow-hidden cursor-pointer block w-full rounded-2xl border border-forest-800/60 hover:border-gold-400/80 focus-visible:border-gold-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gold-500/50 shadow-2xs transition-all duration-300 hover:-translate-y-1 ${className}`}
      style={style}
    >
      {/* Background Image / Fallback Gradient */}
      {category.image_url ? (
        <Image
          src={category.image_url}
          alt={category.name}
          fill
          loading="lazy"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 450px"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-forest-800 via-forest-900 to-forest-950 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
          <svg
            className="w-8 h-8 text-gold-500/20 mb-2 stroke-[1.2]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <span className="text-[11px] text-forest-400 font-sans tracking-widest uppercase font-medium">
            {category.name}
          </span>
        </div>
      )}

      {/* Atmospheric Vignette Scrim */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-forest-950/95 via-forest-950/40 to-transparent" />

      {/* Subtle Golden Sheen on Hover */}
      <div className="absolute inset-0 bg-gold-500/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Dynamic Title Hierarchy & Sliding Micro-Cue */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-10 pointer-events-none transition-all duration-300 ${sizeConfig.padding}`}
      >
        <h3
          className={`text-cream-50 group-hover:text-gold-200 transition-colors duration-300 leading-tight ${sizeConfig.title}`}
        >
          {category.name}
        </h3>

        {/* Micro-cue: smoothly slides up into view on hover */}
        <div className="max-h-0 opacity-0 translate-y-2 group-hover:max-h-10 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:max-h-10 group-focus-visible:opacity-100 group-focus-visible:translate-y-0 overflow-hidden transition-all duration-300 ease-out">
          <div className="pt-2 flex items-center gap-1.5">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-sans font-medium text-gold-300/90">
              Explore collection
            </span>
            <span className="text-gold-400 text-xs sm:text-sm font-sans transition-transform duration-300 group-hover:translate-x-1.5">
              →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function EmptySlotCard({
  className = '',
  label = 'In Curation',
}: {
  className?: string
  label?: string
}) {
  return (
    <div
      className={`w-full rounded-2xl border border-dashed border-forest-800/60 bg-forest-950/30 flex items-center justify-center p-4 text-center ${className}`}
    >
      <span className="text-[10px] uppercase tracking-[0.2em] text-forest-400/70 font-sans font-medium">
        {label}
      </span>
    </div>
  )
}

export function CategoryGrid({ categories = [] }: CategoryGridProps) {
  if (!categories || categories.length === 0) {
    return null
  }

  // Map into 3 asymmetrical columns for Concept 2 (Wabi-Sabi Staggered Masonry)
  const [cat1, cat2, cat3, cat4, cat5, cat6, cat7] = categories

  return (
    <section className="relative overflow-hidden py-12 sm:py-14 lg:py-16 px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24 2xl:px-28 bg-forest-900 bg-laid-paper-dark">
      <div className="relative z-10 max-w-[1440px] xl:max-w-[1520px] mx-auto">
        {/* Section Heading — Minimal Editorial Header with Inline Text Link */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 lg:mb-9 gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="h-px w-4 bg-gold-400/60" />
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-gold-400/90 font-sans font-medium">
                Collections &middot; Archive
              </span>
            </div>
            <h2 className="font-display font-medium text-cream-50 leading-tight text-2xl sm:text-[1.85rem] lg:text-[2.25rem] tracking-[-0.015em]">
              Curated Collections
            </h2>
            <p className="text-xs sm:text-[13px] lg:text-sm text-forest-200/80 font-normal mt-1.5 leading-relaxed font-sans max-w-xl">
              Handpicked papers, journals, fine writing instruments, and desk accessories grouped for thoughtful exploration.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 self-start sm:self-end text-[11px] sm:text-xs uppercase tracking-[0.2em] font-sans font-medium text-gold-400 hover:text-gold-200 transition-colors duration-200 group/link pb-1"
          >
            <span className="border-b border-gold-400/40 group-hover/link:border-gold-200 pb-0.5 transition-colors">
              Explore All Collections
            </span>
            <span className="text-sm transition-transform duration-300 group-hover/link:translate-x-1">
              →
            </span>
          </Link>
        </div>

        {/* Desktop Wabi-Sabi Staggered 3-Column Masonry (Increased height & harmonious proportions) */}
        <div className="hidden md:grid md:grid-cols-3 gap-4 lg:gap-5 items-start">
          {/* Column 1 (Left): Tall Portrait (Hero) + Balanced Landscape (Medium) */}
          <div className="flex flex-col gap-4 lg:gap-5 w-full">
            {cat1 ? (
              <CategoryCard category={cat1} size="hero" className="h-[320px] lg:h-[350px] xl:h-[370px]" />
            ) : (
              <EmptySlotCard className="h-[320px] lg:h-[350px] xl:h-[370px]" />
            )}
            {cat2 ? (
              <CategoryCard category={cat2} size="medium" className="h-[190px] lg:h-[210px] xl:h-[225px]" />
            ) : (
              <EmptySlotCard className="h-[190px] lg:h-[210px] xl:h-[225px]" />
            )}
          </div>

          {/* Column 2 (Center): Balanced Landscape (Medium) + Tall Portrait (Hero) */}
          <div className="flex flex-col gap-4 lg:gap-5 w-full">
            {cat3 ? (
              <CategoryCard category={cat3} size="medium" className="h-[190px] lg:h-[210px] xl:h-[225px]" />
            ) : (
              <EmptySlotCard className="h-[190px] lg:h-[210px] xl:h-[225px]" />
            )}
            {cat4 ? (
              <CategoryCard category={cat4} size="hero" className="h-[320px] lg:h-[350px] xl:h-[370px]" />
            ) : (
              <EmptySlotCard className="h-[320px] lg:h-[350px] xl:h-[370px]" />
            )}
          </div>

          {/* Column 3 (Right): Three Artfully Stacked Blocks */}
          <div className="flex flex-col gap-3.5 lg:gap-4 w-full">
            {cat5 ? (
              <CategoryCard category={cat5} size="compact" className="h-[175px] lg:h-[188px] xl:h-[195px]" />
            ) : (
              <EmptySlotCard className="h-[175px] lg:h-[188px] xl:h-[195px]" />
            )}
            {cat6 ? (
              <CategoryCard category={cat6} size="compact" className="h-[175px] lg:h-[188px] xl:h-[195px]" />
            ) : (
              <EmptySlotCard className="h-[175px] lg:h-[188px] xl:h-[195px]" />
            )}
            {cat7 ? (
              <CategoryCard category={cat7} size="compact" className="h-[175px] lg:h-[188px] xl:h-[195px]" />
            ) : (
              <EmptySlotCard className="h-[175px] lg:h-[188px] xl:h-[195px]" />
            )}
          </div>
        </div>

        {/* Mobile / Tablet Asymmetric Rhythmic Grid */}
        <div className="md:hidden grid grid-cols-2 gap-3 sm:gap-4">
          {categories.map((cat, index) => {
            const mobileConfigs: { height: string; size: CardSize; span?: string }[] = [
              { height: 'h-[220px] sm:h-[240px]', size: 'medium' },
              { height: 'h-[175px] sm:h-[190px]', size: 'compact' },
              { height: 'h-[175px] sm:h-[190px]', size: 'compact' },
              { height: 'h-[220px] sm:h-[240px]', size: 'medium' },
              { height: 'h-[175px] sm:h-[190px]', size: 'compact' },
              { height: 'h-[175px] sm:h-[190px]', size: 'compact' },
              { height: 'h-[190px] sm:h-[210px]', size: 'medium', span: 'col-span-2' },
            ]
            const config = mobileConfigs[index] || { height: 'h-[180px]', size: 'compact' }

            return (
              <CategoryCard
                key={cat.id}
                category={cat}
                size={config.size}
                className={`${config.height} ${config.span || ''}`}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}

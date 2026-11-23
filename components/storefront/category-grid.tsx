import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { FeaturedCategoryItem } from '@/lib/validations/category-collage'
import { ScrollReveal } from '@/components/storefront/scroll-reveal'

interface CategoryGridProps {
  categories?: FeaturedCategoryItem[]
}

function CategoryCard({
  category,
  index,
  isHero = false,
  className = '',
}: {
  category: FeaturedCategoryItem
  index: number
  isHero?: boolean
  className?: string
}) {
  const indexLabel = String(index + 1).padStart(2, '0')

  return (
    <Link
      href={`/products?category=${category.slug}`}
      className={`group relative overflow-hidden rounded-2xl border border-forest-900/[0.08] hover:border-gold-500/60 bg-forest-950 shadow-xs hover:shadow-elevation-2 transition-all duration-300 hover:-translate-y-1 block select-none cursor-pointer ${className}`}
    >
      {/* 1. Subtle Gilded Top Hairline (Reveals on hover) */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none" />

      {/* 2. Visual Layer: Photographic or Artisanal Emblem */}
      {category.image_url ? (
        <Image
          src={category.image_url}
          alt={category.name}
          fill
          loading="lazy"
          sizes={isHero ? '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 650px' : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 360px'}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-forest-900 via-forest-950 to-forest-950 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
          {/* Subtle Laid-Paper Texture Lines */}
          <div className="absolute inset-0 bg-laid-paper-dark opacity-40 pointer-events-none" />

          {/* Minimalist Stationery Emblem */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full border border-gold-500/30 flex items-center justify-center text-gold-400/70 mb-2 group-hover:scale-110 group-hover:text-gold-300 group-hover:border-gold-400/50 transition-all duration-300">
              <svg className="w-5 h-5 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <span className="text-[10px] text-forest-400 font-sans tracking-widest uppercase font-medium">
              Bashtoli Atelier
            </span>
          </div>
        </div>
      )}

      {/* 3. Refined Atmospheric Scrim (Ensures text legibility without blackening the entire photo) */}
      <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 via-forest-950/35 to-forest-950/10 group-hover:from-forest-950/95 transition-colors duration-300 pointer-events-none" />

      {/* 4. Subtle Golden Sheen on Hover */}
      <div className="absolute inset-0 bg-gold-500/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* 5. Content Overlay Layer */}
      <div className="relative z-10 h-full w-full flex flex-col justify-between p-3.5 sm:p-5 lg:p-5.5 pointer-events-none">
        {/* Top Tray: Archival Index Pill & Product Count */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 font-mono text-[9px] sm:text-[10px] tracking-[0.16em] uppercase text-gold-300/90 font-medium px-2.5 py-0.5 rounded-full bg-forest-950/60 backdrop-blur-xs border border-gold-500/20 shadow-2xs">
            {indexLabel} &middot; {isHero ? 'Flagship' : 'Archive'}
          </span>

          {typeof category.product_count === 'number' && category.product_count > 0 && (
            <span className="text-[10px] font-sans font-medium text-cream-200/90 px-2 py-0.5 rounded-full bg-forest-950/50 backdrop-blur-xs border border-white/10 shadow-2xs">
              {category.product_count} {category.product_count === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {/* Bottom Tray: Title & Interaction Prompt */}
        <div>
          <h3
            className={`text-cream-50 group-hover:text-gold-200 transition-colors duration-300 leading-snug font-sans font-semibold tracking-tight ${
              isHero
                ? 'text-lg sm:text-2xl lg:text-[24px]'
                : 'text-sm sm:text-base lg:text-[17px]'
            }`}
          >
            {category.name}
          </h3>

          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gold-400 group-hover:text-gold-300 font-sans font-medium transition-colors mt-1 sm:mt-1.5">
            <span>Explore Collection</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
              &rarr;
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function CategoryGrid({ categories = [] }: CategoryGridProps) {
  if (!categories || categories.length === 0) {
    return null
  }

  return (
    <section className="relative overflow-hidden py-10 sm:py-14 lg:py-16 px-4 sm:px-10 md:px-14 lg:px-20 xl:px-24 2xl:px-28 bg-cream-50 bg-laid-paper text-forest-950">
      <div className="relative z-10 max-w-[1440px] xl:max-w-[1520px] mx-auto">
        {/* Section Heading — Minimal Editorial Header with Inline Text Link */}
        <ScrollReveal>
          <div className="flex items-center justify-between mb-4 sm:mb-7 lg:mb-8 gap-2">
            <div className="min-w-0 pr-2">
              <h2 className="type-heading font-medium text-forest-950 truncate">
                Curated Collections
              </h2>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-1 sm:gap-2 shrink-0 type-kicker text-gold-700 hover:text-gold-900 transition-colors duration-200 group/link pb-0.5 sm:pb-1"
            >
              <span className="border-b border-gold-600/40 group-hover/link:border-gold-900 pb-0.5 transition-colors">
                Explore All
              </span>
              <span className="text-xs sm:text-sm transition-transform duration-300 group-hover/link:translate-x-1">
                &rarr;
              </span>
            </Link>
          </div>
        </ScrollReveal>

        {/* Architectural Atelier Bento Grid */}
        <ScrollReveal delay={0.06} y={16}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {categories.map((cat, index) => {
              const isHero = index === 0

              // Bento Proportions:
              // Index 0 (Flagship): Spans 2 columns on mobile, tablet, and desktop
              // Index 1, 2: 1 column each -> completes Row 1 (2 + 1 + 1 = 4 cols) on desktop
              // Index 3, 4, 5, 6: 1 column each -> completes Row 2 (1 + 1 + 1 + 1 = 4 cols) on desktop
              const spanClass = isHero
                ? 'col-span-2 md:col-span-2 lg:col-span-2'
                : 'col-span-1 md:col-span-1 lg:col-span-1'

              const heightClass = isHero
                ? 'h-[200px] sm:h-[270px] lg:h-[310px]'
                : index < 3
                ? 'h-[160px] sm:h-[270px] lg:h-[310px]'
                : 'h-[160px] sm:h-[220px] lg:h-[250px]'

              return (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  index={index}
                  isHero={isHero}
                  className={`${spanClass} ${heightClass}`}
                />
              )
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

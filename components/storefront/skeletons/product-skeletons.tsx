import React from 'react'

/**
 * Single Product Card Skeleton matching ProductCard proportions & colors.
 * Warm cotton paper elevated surface (bg-bg-surface-elevated) with aspect 4:5 image canvas on top
 * and external metadata/action area below.
 */
export function ProductCardSkeleton() {
  return (
    <div
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-bg-surface-elevated/90 border border-forest-900/[0.08] shadow-xs select-none"
      aria-hidden="true"
    >
      {/* 1. 4:5 Image Canvas Placeholder */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream-100/40 skeleton-shimmer">
        {/* Wishlist Button Pill Placeholder */}
        <div className="absolute top-2 right-2 z-10">
          <div className="h-7 w-7 rounded-full bg-cream-200/80 skeleton-shimmer shadow-2xs" />
        </div>
      </div>

      {/* 2. Metadata & Action Area */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between gap-2.5 bg-bg-surface-elevated/90">
        <div>
          {/* Category placeholder */}
          <div className="h-2.5 w-16 rounded-md bg-cream-200/70 skeleton-shimmer mb-1.5" />
          {/* Title placeholder (two lines) */}
          <div className="space-y-1">
            <div className="h-3.5 w-4/5 rounded-md bg-cream-200/90 skeleton-shimmer" />
            <div className="h-3.5 w-3/5 rounded-md bg-cream-200/70 skeleton-shimmer" />
          </div>
        </div>

        {/* Price & Buy Now Row */}
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-1">
            <div className="h-4 w-16 rounded-md bg-cream-200/90 skeleton-shimmer" />
            <div className="h-3 w-12 rounded-md bg-cream-200/60 skeleton-shimmer" />
          </div>
          {/* Buy Now Button Placeholder */}
          <div className="h-7 sm:h-7.5 w-full rounded-lg bg-forest-950/15 skeleton-shimmer" />
        </div>
      </div>
    </div>
  )
}

/**
 * Full Products / Shop Catalog Skeleton with Horizontal Ribbon & Delayed Reveal.
 * Exactly matches the Ginza Itoya Archival Canvas architecture in app/(storefront)/products/page.tsx.
 */
export function ProductsPageSkeleton() {
  return (
    <div className="animate-delayed-fade-in relative min-h-screen bg-cream-50 bg-laid-paper flex flex-col">
      {/* 1. Gallery Header Banner Skeleton (Deep Sumi Forest) */}
      <div className="w-full bg-forest-950 text-cream-50 border-b border-forest-800/80 bg-laid-paper-dark">
        <div className="max-w-[1440px] xl:max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-6 pb-5 sm:pt-8 sm:pb-7 lg:pt-10 lg:pb-8">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 mb-2 sm:mb-2.5">
            <span className="h-px w-3 sm:w-3.5 bg-gold-400/80" />
            <div className="h-3 w-36 rounded-md skeleton-shimmer-dark opacity-70" />
          </div>

          {/* Main Title Row: Title on Left, Sort on Right */}
          <div className="flex items-center justify-between gap-3">
            <div className="h-7 sm:h-9 w-60 sm:w-80 rounded-xl skeleton-shimmer-dark" />
            {/* Sort Dropdown Pill */}
            <div className="h-8 sm:h-8.5 w-36 sm:w-40 rounded-full skeleton-shimmer-dark shrink-0" />
          </div>

          {/* Subtitle */}
          <div className="hidden sm:block h-3.5 w-96 rounded-md skeleton-shimmer-dark opacity-50 mt-2" />
        </div>
      </div>

      {/* 2. Collection Filter Ribbon Skeleton (Sticky Deep Forest Ribbon) */}
      <div className="w-full bg-forest-950/95 border-b border-forest-800/80 sticky top-11 sm:top-16 z-30 backdrop-blur-md">
        <div className="max-w-[1440px] xl:max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-2 sm:py-2.5 flex items-center gap-1.5 sm:gap-2 overflow-hidden">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-7 sm:h-7.5 w-20 sm:w-24 rounded-full skeleton-shimmer-dark shrink-0"
            />
          ))}
        </div>
      </div>

      {/* 3. Main Full-Width Product Gallery Canvas Skeleton */}
      <div className="flex-1 max-w-[1440px] xl:max-w-[1520px] w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-7 lg:py-9 pb-24 sm:pb-16">
        {/* Status bar */}
        <div className="flex items-center justify-between mb-3.5 sm:mb-6 pb-2 sm:pb-3 border-b border-forest-900/10">
          <div className="h-3.5 w-36 rounded-md skeleton-shimmer" />
        </div>

        {/* 5-Column Responsive Product Grid */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Minimal Single-Viewport Product Detail Page Skeleton with Delayed Reveal.
 * Aligns with the 2-column split of ProductDetailClient.
 */
export function ProductDetailSkeleton() {
  return (
    <div className="animate-delayed-fade-in relative w-full overflow-hidden bg-cream-50 bg-laid-paper">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-[1360px] relative z-10 pt-0 sm:pt-4 pb-24 sm:pb-8 lg:min-h-[calc(100dvh-4.5rem)] flex flex-col justify-center">
        {/* Back to shop placeholder (Desktop) */}
        <div className="hidden sm:block mb-2 sm:mb-3">
          <div className="h-6 w-28 rounded-full skeleton-shimmer" />
        </div>

        {/* 2-Column Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12 pb-6 md:pb-0 items-center">
          {/* Left: Product Image Canvas & Thumbnails */}
          <div className="flex justify-center md:justify-start">
            <div className="-mx-4 sm:mx-0 w-[calc(100%+2rem)] sm:w-full flex flex-col gap-2.5 max-w-none sm:max-w-[460px] lg:max-w-[480px]">
              {/* Primary frame */}
              <div className="aspect-[4/3] sm:aspect-square w-full rounded-b-2xl sm:rounded-2xl border-b sm:border border-forest-200/80 bg-cream-100/70 skeleton-shimmer shadow-xs" />
              {/* Thumbnail row */}
              <div className="hidden sm:flex gap-2 overflow-x-auto pt-0.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl border border-forest-200/60 bg-cream-100/50 skeleton-shimmer shrink-0"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Buy Box */}
          <div className="flex flex-col max-w-xl space-y-3 sm:space-y-4">
            {/* Category */}
            <div className="flex items-center gap-2 mb-1 mt-2 sm:mt-0">
              <div className="h-3 w-20 rounded-md skeleton-shimmer" />
              <div className="h-4 w-16 rounded-full skeleton-shimmer opacity-70" />
            </div>

            {/* Title */}
            <div className="h-8 sm:h-10 w-4/5 rounded-xl skeleton-shimmer" />

            {/* Price & Stock Row */}
            <div className="my-1.5 pb-2.5 border-b border-forest-200/70 flex items-center justify-between gap-3">
              <div className="flex items-baseline gap-2">
                <div className="h-6 sm:h-7 w-28 rounded-md skeleton-shimmer" />
                <div className="h-3 w-16 rounded-md skeleton-shimmer opacity-60" />
              </div>
              <div className="h-5 w-20 rounded-full skeleton-shimmer opacity-70" />
            </div>

            {/* Description placeholder */}
            <div className="space-y-1.5 py-1">
              <div className="h-3.5 w-full rounded-md skeleton-shimmer opacity-70" />
              <div className="h-3.5 w-5/6 rounded-md skeleton-shimmer opacity-60" />
            </div>

            {/* Variant selector placeholder */}
            <div className="space-y-2 pt-1">
              <div className="h-3 w-16 rounded-md skeleton-shimmer" />
              <div className="flex gap-2">
                <div className="h-8.5 w-20 rounded-lg skeleton-shimmer" />
                <div className="h-8.5 w-20 rounded-lg skeleton-shimmer" />
                <div className="h-8.5 w-20 rounded-lg skeleton-shimmer" />
              </div>
            </div>

            {/* Add to Cart row placeholder */}
            <div className="mt-2.5 flex items-end gap-3">
              <div className="h-11 flex-1 rounded-xl skeleton-shimmer" />
              <div className="hidden sm:block h-11 w-11 rounded-xl skeleton-shimmer shrink-0" />
            </div>

            {/* Collapsible accordion placeholders */}
            <div className="mt-4 pt-2 border-t border-forest-200/60 divide-y divide-forest-200/50">
              <div className="py-2.5 flex items-center justify-between">
                <div className="h-3.5 w-48 rounded-md skeleton-shimmer opacity-70" />
                <div className="h-3.5 w-3.5 rounded-md skeleton-shimmer opacity-50" />
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <div className="h-3.5 w-44 rounded-md skeleton-shimmer opacity-70" />
                <div className="h-3.5 w-3.5 rounded-md skeleton-shimmer opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Featured Products Section Skeleton for Suspense streaming.
 * Matches ProductCarousel card sizing: w-[140px] sm:w-[180px] md:w-[195px] lg:w-[205px].
 */
export function FeaturedProductsSkeleton() {
  return (
    <section
      className="relative overflow-hidden pt-8 pb-3 sm:pt-10 sm:pb-4 lg:pt-12 lg:pb-5 px-0 sm:px-10 md:px-14 lg:px-20 xl:px-24 2xl:px-28 bg-cream-50 bg-laid-paper"
      aria-busy="true"
      aria-label="Loading featured products"
    >
      <div className="relative z-10 max-w-[1440px] xl:max-w-[1520px] mx-auto">
        {/* Header: Title on Left, Controls + View All on Right */}
        <div className="flex items-center justify-between mb-3 sm:mb-4.5 gap-2 px-4 sm:px-0">
          <div className="min-w-0 pr-2">
            <div className="h-6 sm:h-7 w-44 sm:w-56 rounded-xl skeleton-shimmer" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5">
              <div className="h-8 w-8 sm:h-8.5 sm:w-8.5 rounded-full skeleton-shimmer" />
              <div className="h-8 w-8 sm:h-8.5 sm:w-8.5 rounded-full skeleton-shimmer" />
            </div>
            <div className="h-4 w-16 rounded-md skeleton-shimmer sm:pl-3.5 sm:border-l sm:border-forest-900/15" />
          </div>
        </div>

        {/* Carousel Track with Proper Proportions */}
        <div className="flex gap-3 sm:gap-4 lg:gap-5 overflow-hidden px-4 sm:px-0 py-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="carousel-card-item shrink-0 w-[140px] sm:w-[180px] md:w-[195px] lg:w-[205px]"
            >
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

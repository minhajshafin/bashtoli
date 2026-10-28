import React from 'react'

/**
 * Single Product Card Skeleton matching ProductCard proportions & colors.
 */
export function ProductCardSkeleton() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl aspect-[3/4] bg-forest-950/90 border border-forest-800/40 p-3 sm:p-3.5 flex flex-col justify-end"
      aria-hidden="true"
    >
      {/* Top wishlist button shimmer */}
      <div className="absolute top-3 right-3 flex justify-end">
        <div className="h-8 w-8 rounded-full skeleton-shimmer-dark" />
      </div>

      {/* Lower Scrim Section Shimmer */}
      <div className="relative z-10 w-full pt-4 space-y-2">
        {/* Title & Price row placeholder */}
        <div className="flex items-center justify-between gap-2">
          <div className="h-4 w-3/5 rounded-md skeleton-shimmer-dark" />
          <div className="h-4 w-1/4 rounded-md skeleton-shimmer-dark shrink-0" />
        </div>
        {/* Subtitle placeholder */}
        <div className="h-3 w-2/5 rounded-md skeleton-shimmer-dark" />
        {/* Full-width Buy button placeholder */}
        <div className="h-8 sm:h-8.5 w-full rounded-xl skeleton-shimmer-dark mt-2.5 sm:mt-3" />
      </div>
    </div>
  )
}

/**
 * Grid of product card skeletons.
 */
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Category Sidebar Filter Skeleton.
 */
export function CategorySidebarSkeleton() {
  return (
    <div
      className="w-full rounded-3xl border border-forest-700 bg-forest-800 p-5 space-y-3"
      aria-hidden="true"
    >
      {/* Eyebrow header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-forest-700/80">
        <div className="h-3 w-20 rounded-md skeleton-shimmer-dark" />
      </div>

      {/* Category items list */}
      <div className="space-y-1.5 pt-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-forest-700/40"
          >
            <div className="h-3.5 w-28 rounded-md skeleton-shimmer-dark" />
            <div className="h-4 w-6 rounded-full skeleton-shimmer-dark" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Full Products / Shop Catalog Skeleton with Horizontal Ribbon & Delayed Reveal.
 */
export function ProductsPageSkeleton() {
  return (
    <div className="animate-delayed-fade-in relative min-h-screen bg-cream-100 bg-laid-paper flex flex-col">
      {/* 1. Gallery Header Banner Skeleton (Deep Forest) */}
      <div className="w-full bg-forest-950 bg-laid-paper-dark border-b border-forest-800/80">
        <div className="max-w-[1440px] xl:max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-8 pb-6 sm:pt-10 sm:pb-8 lg:pt-11 lg:pb-8 flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="h-3 w-28 rounded-md skeleton-shimmer-dark opacity-60" />
            <div className="h-8 sm:h-10 w-64 rounded-xl skeleton-shimmer-dark" />
            <div className="h-3.5 w-80 rounded-md skeleton-shimmer-dark opacity-50" />
          </div>
          {/* Sort placeholder */}
          <div className="h-9 w-40 rounded-xl skeleton-shimmer-dark" />
        </div>
      </div>

      {/* 2. Collection Filter Ribbon Skeleton */}
      <div className="w-full bg-forest-950/98 bg-laid-paper-dark border-b border-forest-800/80 sticky top-14 sm:top-16 z-30">
        <div className="max-w-[1440px] xl:max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-2.5 sm:py-3 flex gap-2 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-24 rounded-xl skeleton-shimmer-dark shrink-0" />
          ))}
        </div>
      </div>

      {/* 3. Main Full-Width Product Gallery Canvas Skeleton */}
      <div className="flex-1 max-w-[1440px] xl:max-w-[1520px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-7 sm:py-9 lg:py-12">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-forest-900/10">
          <div className="h-3.5 w-32 rounded-md skeleton-shimmer" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
 */
export function ProductDetailSkeleton() {
  return (
    <div className="animate-delayed-fade-in relative min-h-[calc(100dvh-5rem)] bg-cream-50 bg-laid-paper px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-6 sm:pb-8 flex flex-col justify-center">
      <div className="max-w-[1360px] w-full mx-auto">
        {/* Back to shop placeholder */}
        <div className="mb-3">
          <div className="h-6 w-28 rounded-full skeleton-shimmer" />
        </div>

        {/* 2-Column Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12 items-center">
          {/* Left: Product Image Canvas */}
          <div className="flex justify-center md:justify-start">
            <div
              className="w-full max-w-md md:max-w-none rounded-3xl skeleton-shimmer border border-forest-200/70 shadow-xs"
              style={{ aspectRatio: '1/1' }}
            />
          </div>

          {/* Right: Buy Box */}
          <div className="flex flex-col max-w-xl space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-24 rounded-md skeleton-shimmer" />
              <div className="h-4 w-16 rounded-full skeleton-shimmer opacity-70" />
            </div>

            <div className="h-8 sm:h-9 w-4/5 rounded-xl skeleton-shimmer" />

            <div className="h-7 w-36 rounded-md skeleton-shimmer" />

            <div className="space-y-1.5 py-1">
              <div className="h-3.5 w-full rounded-md skeleton-shimmer opacity-70" />
              <div className="h-3.5 w-5/6 rounded-md skeleton-shimmer opacity-60" />
            </div>

            {/* Variant pills placeholder */}
            <div className="space-y-2 pt-1">
              <div className="h-3 w-16 rounded-md skeleton-shimmer" />
              <div className="flex gap-2">
                <div className="h-9 w-20 rounded-xl skeleton-shimmer" />
                <div className="h-9 w-20 rounded-xl skeleton-shimmer" />
              </div>
            </div>

            {/* Add to Cart row placeholder */}
            <div className="pt-2 flex items-center gap-3">
              <div className="h-11 w-28 rounded-xl skeleton-shimmer shrink-0" />
              <div className="h-11 flex-1 rounded-xl skeleton-shimmer" />
              <div className="h-11 w-11 rounded-xl skeleton-shimmer shrink-0" />
            </div>

            {/* Reassurance micro-badges placeholder */}
            <div className="pt-3 border-t border-forest-200/60 flex items-center gap-4">
              <div className="h-3.5 w-24 rounded-md skeleton-shimmer opacity-60" />
              <div className="h-3.5 w-28 rounded-md skeleton-shimmer opacity-60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Featured Products Section Skeleton for Suspense streaming.
 */
export function FeaturedProductsSkeleton() {
  return (
    <section
      className="relative overflow-hidden py-6 sm:py-8 lg:py-9 px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24 2xl:px-28 bg-cream-100 bg-laid-paper"
      aria-busy="true"
      aria-label="Loading featured products"
    >
      <div className="relative z-10 max-w-[1440px] xl:max-w-[1520px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 sm:mb-5 lg:mb-6 gap-4">
          <div className="space-y-1.5">
            <div className="h-7 sm:h-8 w-52 sm:w-64 rounded-xl skeleton-shimmer" />
            <div className="h-3.5 w-72 sm:w-96 rounded-md skeleton-shimmer opacity-70" />
          </div>
          <div className="flex items-center gap-3.5 self-start sm:self-auto">
            <div className="flex items-center gap-1.5">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full skeleton-shimmer" />
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full skeleton-shimmer" />
            </div>
            <div className="h-4 w-16 rounded-md skeleton-shimmer pl-3 border-l border-forest-900/15" />
          </div>
        </div>
        <div className="flex gap-3 sm:gap-4 lg:gap-5 overflow-hidden pb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="shrink-0 w-[220px] sm:w-[250px] md:w-[270px]">
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

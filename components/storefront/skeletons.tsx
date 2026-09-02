import React from 'react'

/**
 * Single Product Card Skeleton matching ProductCard proportions & colors.
 */
export function ProductCardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-2xl sm:rounded-[20px] bg-cream-100/90 shadow-xs border border-forest-200/40"
      aria-hidden="true"
    >
      {/* 4/5 Aspect Ratio Image Shimmer */}
      <div className="relative w-full skeleton-shimmer" style={{ aspectRatio: '4/5' }} />

      {/* Info Section */}
      <div className="p-3 sm:p-4 space-y-2">
        {/* Title placeholder */}
        <div className="h-4 w-3/4 rounded-md skeleton-shimmer" />
        {/* Price placeholder */}
        <div className="h-4 w-1/3 rounded-md skeleton-shimmer" />
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
      className="w-full rounded-3xl border border-forest-700 bg-forest-800 p-5 shadow-xl space-y-3"
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
 * Full Products / Shop Catalog Skeleton with Delayed Reveal.
 */
export function ProductsPageSkeleton() {
  return (
    <div className="animate-delayed-fade-in relative min-h-screen bg-cream-50">
      {/* Header Banner Skeleton */}
      <div className="bg-forest-800 px-5 md:px-8 py-10 md:py-14">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="space-y-2">
            <div className="h-9 sm:h-12 w-48 sm:w-64 rounded-xl skeleton-shimmer-dark" />
            <div className="h-4 w-32 rounded-md skeleton-shimmer-dark opacity-60" />
          </div>
          {/* Sort dropdown placeholder */}
          <div className="h-10 w-44 rounded-full skeleton-shimmer-dark" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-10 items-start">
          {/* Desktop Aside */}
          <aside className="hidden md:block w-64 shrink-0 sticky top-24 self-start">
            <CategorySidebarSkeleton />
          </aside>

          {/* Products Grid */}
          <main className="flex-1 min-w-0 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-forest-200">
              <div className="h-4 w-36 rounded-md skeleton-shimmer" />
            </div>
            <ProductGridSkeleton count={6} />
          </main>
        </div>
      </div>
    </div>
  )
}

/**
 * Product Detail Page Skeleton with Delayed Reveal.
 */
export function ProductDetailSkeleton() {
  return (
    <div className="animate-delayed-fade-in relative min-h-[calc(100dvh-4rem)] bg-cream-50 px-5 md:px-8 py-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left Column: Image Gallery Skeleton */}
        <div className="lg:col-span-7 space-y-4">
          <div
            className="w-full rounded-3xl skeleton-shimmer shadow-xs border border-forest-200/50"
            style={{ aspectRatio: '1/1' }}
          />
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="w-20 h-20 rounded-2xl skeleton-shimmer border border-forest-200/40"
              />
            ))}
          </div>
        </div>

        {/* Right Column: Details Skeleton */}
        <div className="lg:col-span-5 space-y-6">
          <div className="h-4 w-24 rounded-full skeleton-shimmer" />
          <div className="h-10 w-3/4 rounded-xl skeleton-shimmer" />
          <div className="h-8 w-32 rounded-lg skeleton-shimmer" />
          <div className="h-24 w-full rounded-2xl skeleton-shimmer opacity-80" />

          {/* Variant pills placeholder */}
          <div className="space-y-2 pt-2">
            <div className="h-3 w-16 rounded-md skeleton-shimmer" />
            <div className="flex gap-2">
              <div className="h-10 w-24 rounded-full skeleton-shimmer" />
              <div className="h-10 w-24 rounded-full skeleton-shimmer" />
            </div>
          </div>

          {/* CTA buttons placeholder */}
          <div className="pt-4 space-y-3">
            <div className="h-14 w-full rounded-full skeleton-shimmer" />
            <div className="h-12 w-full rounded-full skeleton-shimmer opacity-70" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Shopping Bag Skeleton with Delayed Reveal.
 */
export function BagPageSkeleton() {
  return (
    <div className="animate-delayed-fade-in relative min-h-[calc(100dvh-4rem)] bg-cream-50 px-5 md:px-8 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-2 border-b border-forest-200 pb-5">
          <div className="h-9 w-48 rounded-xl skeleton-shimmer" />
          <div className="h-4 w-32 rounded-md skeleton-shimmer opacity-70" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items list skeleton */}
          <div className="lg:col-span-8 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex gap-4 p-4 rounded-2xl bg-cream-100/80 border border-forest-200/50"
              >
                <div className="w-24 h-28 rounded-xl skeleton-shimmer shrink-0" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-5 w-1/2 rounded-md skeleton-shimmer" />
                  <div className="h-4 w-24 rounded-md skeleton-shimmer" />
                  <div className="h-8 w-28 rounded-full skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary skeleton */}
          <div className="lg:col-span-4 p-6 rounded-3xl bg-cream-100/90 border border-forest-200 space-y-4">
            <div className="h-6 w-32 rounded-md skeleton-shimmer" />
            <div className="space-y-2 py-2">
              <div className="flex justify-between">
                <div className="h-4 w-20 rounded-md skeleton-shimmer" />
                <div className="h-4 w-16 rounded-md skeleton-shimmer" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-24 rounded-md skeleton-shimmer" />
                <div className="h-4 w-16 rounded-md skeleton-shimmer" />
              </div>
            </div>
            <div className="h-12 w-full rounded-full skeleton-shimmer" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Account Overview & Subpages Skeleton with Delayed Reveal.
 */
export function AccountPageSkeleton() {
  return (
    <div className="animate-delayed-fade-in relative min-h-[calc(100dvh-4rem)] bg-cream-50 px-5 md:px-8 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-forest-200 pb-6">
          <div className="space-y-2">
            <div className="h-8 w-44 rounded-xl skeleton-shimmer" />
            <div className="h-4 w-60 rounded-md skeleton-shimmer opacity-70" />
          </div>
          <div className="h-10 w-24 rounded-full skeleton-shimmer" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Navigation Sidebar */}
          <div className="md:col-span-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 w-full rounded-2xl skeleton-shimmer" />
            ))}
          </div>

          {/* Content area */}
          <div className="md:col-span-8 p-6 rounded-3xl bg-cream-100/80 border border-forest-200 space-y-5">
            <div className="h-6 w-40 rounded-md skeleton-shimmer" />
            <div className="space-y-3">
              <div className="h-16 w-full rounded-2xl skeleton-shimmer" />
              <div className="h-16 w-full rounded-2xl skeleton-shimmer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

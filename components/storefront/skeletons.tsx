import React from 'react'
import { WaveDivider } from '@/components/storefront/wave-divider'

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
 * Bespoke Checkout Page Skeleton with Delayed Reveal & Dual-Tone Form Architecture.
 */
export function CheckoutPageSkeleton() {
  return (
    <div className="animate-delayed-fade-in relative min-h-[calc(100dvh-5rem)] bg-cream-50 overflow-hidden">
      <div className="mx-auto max-w-[1440px] xl:max-w-[1520px] px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 lg:py-10">
        {/* 3-Step Visual Progress Track Skeleton */}
        <div className="mb-6 pb-5 border-b border-forest-200/60 max-w-xl mx-auto flex items-center justify-between gap-3">
          <div className="h-7 w-28 rounded-full skeleton-shimmer" />
          <div className="h-px flex-1 bg-forest-200/60" />
          <div className="h-7 w-32 rounded-full skeleton-shimmer" />
          <div className="h-px flex-1 bg-forest-200/60" />
          <div className="h-7 w-28 rounded-full skeleton-shimmer opacity-60" />
        </div>

        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-4 border-b border-forest-200/80 gap-3">
          <div className="space-y-1.5">
            <div className="h-3 w-32 rounded-md skeleton-shimmer opacity-70" />
            <div className="h-8 w-48 sm:w-56 rounded-xl skeleton-shimmer" />
          </div>
          <div className="h-4 w-40 rounded-md skeleton-shimmer opacity-60" />
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* Left 2 Columns: Information & Delivery Cards */}
          <div className="lg:col-span-2 space-y-5">
            {/* Card 1: Contact Details */}
            <div className="p-5 sm:p-7 rounded-2xl border border-forest-200/80 bg-cream-100/60 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-forest-200/60">
                <div className="h-4 w-44 rounded-md skeleton-shimmer" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="h-3 w-20 rounded-md skeleton-shimmer" />
                  <div className="h-10 w-full rounded-xl skeleton-shimmer" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 w-24 rounded-md skeleton-shimmer" />
                  <div className="h-10 w-full rounded-xl skeleton-shimmer" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="h-3 w-28 rounded-md skeleton-shimmer" />
                <div className="h-16 w-full rounded-xl skeleton-shimmer" />
              </div>
            </div>

            {/* Card 2: Fulfillment & Destination */}
            <div className="p-5 sm:p-7 rounded-2xl border border-forest-200/80 bg-cream-100/60 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-forest-200/60">
                <div className="h-4 w-48 rounded-md skeleton-shimmer" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="h-20 w-full rounded-xl skeleton-shimmer" />
                <div className="h-20 w-full rounded-xl skeleton-shimmer" />
              </div>
            </div>
          </div>

          {/* Right 1 Column: Sticky Order Breakdown */}
          <div className="lg:col-span-1 space-y-4">
            <div className="p-5 sm:p-6 rounded-2xl border border-forest-200/80 bg-cream-100/95 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-forest-200/80">
                <div className="h-4 w-32 rounded-md skeleton-shimmer" />
                <div className="h-4 w-12 rounded-full skeleton-shimmer" />
              </div>
              {/* Item thumbnails */}
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl skeleton-shimmer shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 w-3/4 rounded-md skeleton-shimmer" />
                      <div className="h-3 w-1/2 rounded-md skeleton-shimmer opacity-70" />
                    </div>
                    <div className="h-4 w-12 rounded-md skeleton-shimmer" />
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-forest-200/80 space-y-2">
                <div className="flex justify-between">
                  <div className="h-3.5 w-20 rounded-md skeleton-shimmer" />
                  <div className="h-3.5 w-16 rounded-md skeleton-shimmer" />
                </div>
                <div className="flex justify-between">
                  <div className="h-3.5 w-24 rounded-md skeleton-shimmer" />
                  <div className="h-3.5 w-14 rounded-md skeleton-shimmer" />
                </div>
                <div className="flex justify-between pt-2 border-t border-forest-200/60">
                  <div className="h-4 w-16 rounded-md skeleton-shimmer" />
                  <div className="h-5 w-20 rounded-md skeleton-shimmer" />
                </div>
              </div>
              <div className="h-12 w-full rounded-xl skeleton-shimmer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Customer Account Portal Skeleton with Monogram Identity & Tab Nav.
 */
export function AccountPageSkeleton() {
  return (
    <div className="animate-delayed-fade-in relative min-h-[calc(100dvh-5rem)] bg-cream-50 px-4 sm:px-6 lg:px-8 xl:px-10 py-8 sm:py-12 lg:py-16">
      <div className="max-w-[1440px] xl:max-w-[1520px] mx-auto">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10 xl:gap-12 items-start">
          {/* Left Column: Monogram & Nav Tabs */}
          <aside className="lg:col-span-4 pb-6 lg:pb-0 border-b lg:border-b-0 lg:border-r border-forest-200/80 lg:pr-8 xl:pr-10 space-y-6">
            <div className="flex items-center gap-3.5 p-4 rounded-2xl border border-forest-200/80 bg-cream-100/60">
              <div className="h-12 w-12 rounded-xl skeleton-shimmer shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-16 rounded-md skeleton-shimmer opacity-60" />
                <div className="h-4 w-32 rounded-md skeleton-shimmer" />
              </div>
            </div>
            <div className="space-y-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 w-full rounded-xl skeleton-shimmer" />
              ))}
            </div>
          </aside>

          {/* Right Column: Content Card */}
          <main className="lg:col-span-8 pt-6 lg:pt-0 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-cream-100/80 border border-forest-200/80 shadow-xs space-y-6">
              <div className="space-y-1.5 pb-4 border-b border-forest-200/70">
                <div className="h-3 w-28 rounded-md skeleton-shimmer opacity-70" />
                <div className="h-6 w-48 rounded-xl skeleton-shimmer" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-28 rounded-2xl skeleton-shimmer" />
                <div className="h-28 rounded-2xl skeleton-shimmer" />
              </div>
            </div>
          </main>
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

/**
 * Bespoke Landing Page Skeleton matching Hero, Waves, Carousel, and Category collage.
 */
export function LandingPageSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-cream-50" aria-busy="true" aria-label="Loading homepage">
      {/* 1. Hero Skeleton (Deep Forest) */}
      <section className="relative flex items-center overflow-hidden bg-forest-950 bg-laid-paper-dark py-10 sm:py-14 lg:py-16 xl:py-18">
        <div className="relative z-10 max-w-[1440px] xl:max-w-[1520px] mx-auto px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24 2xl:px-28 w-full grid lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left: Eyebrow, Title & CTAs */}
          <div className="lg:col-span-7 max-w-2xl lg:pl-2 xl:pl-6 2xl:pl-8 space-y-4 sm:space-y-5">
            <div className="flex items-center gap-3">
              <span className="h-px w-7 sm:w-8 bg-gold-400/40" />
              <div className="h-3 w-48 rounded-md skeleton-shimmer-dark" />
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="h-10 sm:h-12 lg:h-14 w-4/5 rounded-xl skeleton-shimmer-dark" />
              <div className="h-10 sm:h-12 lg:h-14 w-3/5 rounded-xl skeleton-shimmer-dark" />
            </div>

            <div className="space-y-2 pt-1 pb-2">
              <div className="h-3.5 sm:h-4 w-full max-w-lg rounded-md skeleton-shimmer-dark opacity-80" />
              <div className="h-3.5 sm:h-4 w-3/4 max-w-lg rounded-md skeleton-shimmer-dark opacity-60" />
            </div>

            <div className="flex items-center gap-3.5 sm:gap-4 pt-1">
              <div className="h-11 sm:h-12 w-36 sm:w-40 rounded-full skeleton-shimmer-dark" />
              <div className="h-11 sm:h-12 w-28 sm:w-32 rounded-full skeleton-shimmer-dark" />
            </div>
          </div>

          {/* Right: Hero Card Placeholder */}
          <div className="flex lg:col-span-5 justify-center lg:justify-end w-full">
            <div className="w-full max-w-[380px] aspect-[4/5] rounded-3xl skeleton-shimmer-dark border border-forest-800/60 p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="h-6 w-24 rounded-full skeleton-shimmer-dark opacity-60" />
                <div className="h-7 w-7 rounded-full skeleton-shimmer-dark opacity-40" />
              </div>
              <div className="space-y-2 pt-12">
                <div className="h-5 w-3/4 rounded-md skeleton-shimmer-dark" />
                <div className="h-4 w-1/2 rounded-md skeleton-shimmer-dark opacity-70" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wave 1: Hero (Deep Forest) → Featured Products (Alabaster Cream) */}
      <WaveDivider variant="hero-to-products" />

      {/* 2. Featured Products Carousel Skeleton */}
      <FeaturedProductsSkeleton />

      {/* Wave 2: Featured Products (Alabaster Cream) → Categories (Forest Moss) */}
      <WaveDivider variant="products-to-categories" />

      {/* 3. Categories Collage Skeleton (Forest Moss) */}
      <section className="relative overflow-hidden py-8 sm:py-12 lg:py-14 px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24 2xl:px-28 bg-forest-800 bg-laid-paper-dark">
        <div className="relative z-10 max-w-[1440px] xl:max-w-[1520px] mx-auto space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="h-3 w-32 rounded-md skeleton-shimmer-dark opacity-60" />
              <div className="h-7 sm:h-8 w-56 rounded-xl skeleton-shimmer-dark" />
            </div>
            <div className="h-4 w-36 rounded-md skeleton-shimmer-dark opacity-50" />
          </div>

          {/* Desktop 3-Column Collage Layout */}
          <div className="hidden md:grid md:grid-cols-3 gap-4 lg:gap-5 items-start">
            <div className="flex flex-col gap-4 lg:gap-5 w-full">
              <div className="h-[320px] lg:h-[350px] xl:h-[370px] rounded-2xl skeleton-shimmer-dark" />
              <div className="h-[190px] lg:h-[210px] xl:h-[225px] rounded-2xl skeleton-shimmer-dark" />
            </div>
            <div className="flex flex-col gap-4 lg:gap-5 w-full">
              <div className="h-[190px] lg:h-[210px] xl:h-[225px] rounded-2xl skeleton-shimmer-dark" />
              <div className="h-[320px] lg:h-[350px] xl:h-[370px] rounded-2xl skeleton-shimmer-dark" />
            </div>
            <div className="flex flex-col gap-3.5 lg:gap-4 w-full">
              <div className="h-[175px] lg:h-[188px] xl:h-[195px] rounded-2xl skeleton-shimmer-dark" />
              <div className="h-[175px] lg:h-[188px] xl:h-[195px] rounded-2xl skeleton-shimmer-dark" />
              <div className="h-[175px] lg:h-[188px] xl:h-[195px] rounded-2xl skeleton-shimmer-dark" />
            </div>
          </div>

          {/* Mobile Collage Layout */}
          <div className="md:hidden grid grid-cols-2 gap-3 sm:gap-4">
            <div className="h-[220px] rounded-2xl skeleton-shimmer-dark" />
            <div className="h-[175px] rounded-2xl skeleton-shimmer-dark" />
            <div className="h-[175px] rounded-2xl skeleton-shimmer-dark" />
            <div className="h-[220px] rounded-2xl skeleton-shimmer-dark" />
            <div className="h-[175px] rounded-2xl skeleton-shimmer-dark" />
            <div className="h-[175px] rounded-2xl skeleton-shimmer-dark" />
            <div className="h-[190px] col-span-2 rounded-2xl skeleton-shimmer-dark" />
          </div>
        </div>
      </section>

      {/* Wave 3: Categories (Forest Moss) → About Us (Alabaster Cream) */}
      <WaveDivider variant="categories-to-about" />
    </div>
  )
}


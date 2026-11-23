import React from 'react'
import { FeaturedProductsSkeleton } from './product-skeletons'

/**
 * Bespoke Landing Page Skeleton matching Hero, Product Carousel, and Atelier Bento Grid.
 */
export function LandingPageSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-cream-50" aria-busy="true" aria-label="Loading homepage">
      {/* 1. Hero Skeleton (Deep Sumi Forest) */}
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

      {/* Architectural Transition: Tone 1 (Deep Forest) → Tone 2 (Cotton Paper Canvas) */}
      <div className="w-full h-px bg-forest-800/80 border-b border-gold-500/20" aria-hidden="true" />

      {/* 2. Featured Products Carousel Skeleton */}
      <FeaturedProductsSkeleton />

      {/* 3. Categories Architectural Atelier Bento Grid Skeleton */}
      <section className="relative overflow-hidden pt-3 pb-10 sm:pt-4 sm:pb-12 lg:pt-5 lg:pb-14 px-4 sm:px-10 md:px-14 lg:px-20 xl:px-24 2xl:px-28 bg-cream-50 bg-laid-paper text-forest-950">
        <div className="relative z-10 max-w-[1440px] xl:max-w-[1520px] mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-7 lg:mb-8 gap-2">
            <div className="min-w-0 pr-2">
              <div className="h-6 sm:h-7 w-48 sm:w-60 rounded-xl skeleton-shimmer" />
            </div>
            <div className="h-4 w-20 rounded-md skeleton-shimmer shrink-0" />
          </div>

          {/* Bento Grid (2 cols mobile, 3 cols tablet, 4 cols desktop) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {/* Slot 0: Hero / Flagship Card (spans 2 cols on mobile/tablet/desktop) */}
            <div className="col-span-2 md:col-span-2 lg:col-span-2 h-[200px] sm:h-[270px] lg:h-[310px] rounded-2xl bg-forest-950 border border-forest-900/[0.08] p-3.5 sm:p-5 flex flex-col justify-between overflow-hidden relative shadow-xs">
              <div className="flex justify-end">
                <div className="h-4 w-14 rounded-full skeleton-shimmer-dark opacity-70" />
              </div>
              <div className="space-y-2">
                <div className="h-5 sm:h-6 w-48 rounded-md skeleton-shimmer-dark" />
                <div className="h-3.5 w-28 rounded-md skeleton-shimmer-dark opacity-60" />
              </div>
            </div>

            {/* Slot 1: Row 1 Single Card */}
            <div className="col-span-1 md:col-span-1 lg:col-span-1 h-[160px] sm:h-[270px] lg:h-[310px] rounded-2xl bg-forest-950 border border-forest-900/[0.08] p-3.5 sm:p-5 flex flex-col justify-between overflow-hidden relative shadow-xs">
              <div className="flex justify-end">
                <div className="h-4 w-12 rounded-full skeleton-shimmer-dark opacity-70" />
              </div>
              <div className="space-y-1.5">
                <div className="h-4 sm:h-5 w-32 rounded-md skeleton-shimmer-dark" />
                <div className="h-3 w-24 rounded-md skeleton-shimmer-dark opacity-60" />
              </div>
            </div>

            {/* Slot 2: Row 1 Single Card (completes Row 1 on desktop: 2 + 1 + 1 = 4 cols) */}
            <div className="col-span-1 md:col-span-1 lg:col-span-1 h-[160px] sm:h-[270px] lg:h-[310px] rounded-2xl bg-forest-950 border border-forest-900/[0.08] p-3.5 sm:p-5 flex flex-col justify-between overflow-hidden relative shadow-xs">
              <div className="flex justify-end">
                <div className="h-4 w-12 rounded-full skeleton-shimmer-dark opacity-70" />
              </div>
              <div className="space-y-1.5">
                <div className="h-4 sm:h-5 w-32 rounded-md skeleton-shimmer-dark" />
                <div className="h-3 w-24 rounded-md skeleton-shimmer-dark opacity-60" />
              </div>
            </div>

            {/* Slots 3, 4, 5, 6: Row 2 Single Cards (1 + 1 + 1 + 1 = 4 cols on desktop) */}
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="col-span-1 md:col-span-1 lg:col-span-1 h-[160px] sm:h-[220px] lg:h-[250px] rounded-2xl bg-forest-950 border border-forest-900/[0.08] p-3.5 sm:p-5 flex flex-col justify-between overflow-hidden relative shadow-xs"
              >
                <div className="flex justify-end">
                  <div className="h-4 w-12 rounded-full skeleton-shimmer-dark opacity-70" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-4 sm:h-5 w-28 rounded-md skeleton-shimmer-dark" />
                  <div className="h-3 w-20 rounded-md skeleton-shimmer-dark opacity-60" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

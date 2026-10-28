import React from 'react'
import { WaveDivider } from '@/components/storefront/wave-divider'
import { FeaturedProductsSkeleton } from './product-skeletons'

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

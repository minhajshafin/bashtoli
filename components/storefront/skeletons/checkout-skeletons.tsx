import React from 'react'

/**
 * Shopping Bag Skeleton with Delayed Reveal (Green Background + Cream Cards).
 */
export function BagPageSkeleton() {
  return (
    <div className="animate-delayed-fade-in relative min-h-[calc(100dvh-5rem)] bg-forest-950 bg-laid-paper-dark text-cream-100 px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-8 lg:py-10 pb-40 sm:pb-16">
      <div className="max-w-[1440px] xl:max-w-[1520px] mx-auto space-y-6">
        {/* Top utility row placeholder */}
        <div className="flex items-center justify-between pb-3 border-b border-forest-800/60">
          <div className="h-3.5 w-28 rounded-md skeleton-shimmer-dark opacity-60" />
          <div className="h-3.5 w-16 rounded-md skeleton-shimmer-dark opacity-40" />
        </div>

        {/* Masthead & Progress row placeholder */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 pb-5 border-b border-forest-800/80">
          <div className="space-y-2">
            <div className="h-3 w-32 rounded-md skeleton-shimmer-dark opacity-50" />
            <div className="h-8 w-48 rounded-xl skeleton-shimmer-dark" />
            <div className="h-3 w-64 rounded-md skeleton-shimmer-dark opacity-40" />
          </div>

          <div className="grid grid-cols-3 gap-2 w-full md:w-72">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-1 sm:h-1.5 rounded-full skeleton-shimmer-dark opacity-60" />
                <div className="h-3 w-12 rounded-md skeleton-shimmer-dark opacity-40" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* Items list skeleton (Cream cards) */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-3.5">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-cream-50 border border-forest-200/90 shadow-md"
              >
                <div className="w-20 h-20 rounded-xl skeleton-shimmer shrink-0" />
                <div className="flex-1 space-y-2.5 py-1">
                  <div className="h-4 w-1/2 rounded-md skeleton-shimmer" />
                  <div className="h-3.5 w-24 rounded-md skeleton-shimmer opacity-70" />
                  <div className="h-6 w-28 rounded-md skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary skeleton (Cream card) */}
          <div className="lg:col-span-1 p-5 sm:p-6 rounded-2xl bg-cream-50 border border-forest-200/90 shadow-md space-y-4">
            <div className="h-4 w-32 rounded-md skeleton-shimmer" />
            <div className="h-10 w-full rounded-xl skeleton-shimmer opacity-80" />
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
            <div className="h-11 w-full rounded-xl skeleton-shimmer" />
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
    <div className="animate-delayed-fade-in relative min-h-[calc(100dvh-5rem)] bg-forest-950 bg-laid-paper-dark text-cream-100 overflow-hidden">
      <div className="mx-auto max-w-[1440px] xl:max-w-[1520px] px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-8 lg:py-10 pb-40 sm:pb-24">
        {/* 3-Step Visual Progress Track Skeleton */}
        <div className="mb-6 pb-5 border-b border-forest-800/80 max-w-xl mx-auto flex items-center gap-3">
          <div className="h-1 flex-1 rounded-full skeleton-shimmer" />
          <div className="h-1 flex-1 rounded-full skeleton-shimmer opacity-70" />
          <div className="h-1 flex-1 rounded-full skeleton-shimmer opacity-40" />
        </div>

        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-5 border-b border-forest-800/80 gap-3">
          <div className="space-y-2">
            <div className="h-3 w-32 rounded-md skeleton-shimmer opacity-70" />
            <div className="h-8 w-56 sm:w-64 rounded-xl skeleton-shimmer" />
            <div className="h-3.5 w-72 sm:w-80 rounded-md skeleton-shimmer opacity-60" />
          </div>
          <div className="h-5 w-32 rounded-full skeleton-shimmer opacity-50" />
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* Left 2 Columns: Information & Delivery Cards */}
          <div className="lg:col-span-2 space-y-5">
            {/* Card 1: Contact Details */}
            <div className="p-5 sm:p-7 rounded-2xl border border-forest-200/90 bg-cream-50 shadow-md space-y-4">
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
            <div className="p-5 sm:p-7 rounded-2xl border border-forest-200/90 bg-cream-50 shadow-md space-y-4">
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
            <div className="p-5 sm:p-6 rounded-2xl border border-forest-200/90 bg-cream-50 shadow-md space-y-4">
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

import React from 'react'

/**
 * Shopping Bag Skeleton with Delayed Reveal (Laid paper canvas + elevated cards).
 */
export function BagPageSkeleton() {
  return (
    <div className="animate-delayed-fade-in relative min-h-[calc(100dvh-5rem)] bg-cream-50 bg-laid-paper text-forest-950 px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-8 lg:py-10 pb-40 sm:pb-16">
      <div className="max-w-[1440px] xl:max-w-[1520px] mx-auto space-y-6">
        {/* Top utility row placeholder */}
        <div className="flex items-center justify-between pb-3 border-b border-forest-900/10">
          <div className="h-3.5 w-28 rounded-md skeleton-shimmer opacity-60" />
          <div className="h-3.5 w-16 rounded-md skeleton-shimmer opacity-40" />
        </div>

        {/* Masthead & Progress row placeholder */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 pb-5 border-b border-forest-900/10">
          <div className="space-y-2">
            <div className="h-3 w-32 rounded-md skeleton-shimmer opacity-50" />
            <div className="h-8 w-48 rounded-xl skeleton-shimmer" />
            <div className="h-3 w-64 rounded-md skeleton-shimmer opacity-40" />
          </div>

          <div className="grid grid-cols-3 gap-2 w-full md:w-72">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-1 sm:h-1.5 rounded-full skeleton-shimmer opacity-60" />
                <div className="h-3 w-12 rounded-md skeleton-shimmer opacity-40" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* Items list skeleton (Clean white elevated cards matching BagClient) */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-3.5">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 sm:p-5 rounded-md bg-white border border-forest-900/10 shadow-elevation-1"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-md skeleton-shimmer shrink-0" />
                <div className="flex-1 space-y-2.5 py-1">
                  <div className="h-4 w-3/5 rounded-md skeleton-shimmer" />
                  <div className="h-3.5 w-24 rounded-md skeleton-shimmer opacity-70" />
                  <div className="h-5 w-20 rounded-md skeleton-shimmer mt-2" />
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary skeleton (White elevated card matching CartSummary) */}
          <div className="lg:col-span-1 p-5 sm:p-6 rounded-md bg-white border border-forest-900/10 shadow-elevation-1 space-y-4">
            <div className="h-4 w-32 rounded-md skeleton-shimmer" />
            <div className="h-10 w-full rounded-md skeleton-shimmer opacity-80" />
            <div className="space-y-2.5 py-2">
              <div className="flex justify-between">
                <div className="h-4 w-20 rounded-md skeleton-shimmer" />
                <div className="h-4 w-16 rounded-md skeleton-shimmer" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-24 rounded-md skeleton-shimmer" />
                <div className="h-4 w-16 rounded-md skeleton-shimmer" />
              </div>
            </div>
            <div className="h-12 w-full rounded-md skeleton-shimmer" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Bespoke Checkout Page Skeleton with Delayed Reveal & Dual-Tone Form Architecture.
 * Matches CheckoutForm container, 3-step progress bar, and white elevated cards.
 */
export function CheckoutPageSkeleton() {
  return (
    <div className="checkout-page-root animate-delayed-fade-in relative min-h-screen bg-cream-50 bg-laid-paper text-forest-950 py-5 sm:py-8 lg:py-10 pb-36 sm:pb-24 overflow-hidden">
      <div className="mx-auto max-w-[1440px] xl:max-w-[1520px] px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-col justify-start">
        {/* 3-Step Visual Progress Track Skeleton */}
        <div className="mb-6 max-w-xl mx-auto w-full flex items-center gap-3">
          <div className="h-1 flex-1 rounded-full skeleton-shimmer" />
          <div className="h-1 flex-1 rounded-full skeleton-shimmer opacity-70" />
          <div className="h-1 flex-1 rounded-full skeleton-shimmer opacity-40" />
        </div>

        {/* Masthead Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-5 border-b border-forest-900/10 gap-4">
          <div className="space-y-2">
            <div className="h-3.5 w-36 rounded-md skeleton-shimmer" />
            <div className="flex items-center gap-2">
              <span className="h-px w-5 bg-gold-700/40" />
              <div className="h-3 w-40 rounded-md skeleton-shimmer opacity-70" />
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="h-8 sm:h-9 w-64 sm:w-80 rounded-xl skeleton-shimmer" />
              <div className="h-6 w-32 rounded-full skeleton-shimmer opacity-80" />
            </div>
            <div className="h-3.5 w-80 sm:w-96 rounded-md skeleton-shimmer opacity-60" />
          </div>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* Left 2 Columns: Information & Delivery Cards */}
          <div className="lg:col-span-2 space-y-5">
            {/* Card 1: Recipient Details (White elevated card matching CheckoutForm) */}
            <div className="p-5 sm:p-6 rounded-md border border-forest-900/10 bg-white shadow-elevation-1 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-forest-900/10">
                <div className="h-4 w-44 rounded-md skeleton-shimmer" />
                <div className="h-3 w-28 rounded-md skeleton-shimmer opacity-60" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="h-3 w-20 rounded-md skeleton-shimmer" />
                  <div className="h-11 w-full rounded-md skeleton-shimmer" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 w-24 rounded-md skeleton-shimmer" />
                  <div className="h-11 w-full rounded-md skeleton-shimmer" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="h-3 w-28 rounded-md skeleton-shimmer" />
                <div className="h-18 w-full rounded-md skeleton-shimmer" />
              </div>
            </div>

            {/* Card 2: Fulfillment & Delivery Zone (White elevated card) */}
            <div className="p-5 sm:p-6 rounded-md border border-forest-900/10 bg-white shadow-elevation-1 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-forest-900/10">
                <div className="h-4 w-48 rounded-md skeleton-shimmer" />
                <div className="h-3 w-24 rounded-md skeleton-shimmer opacity-60" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="h-20 w-full rounded-md skeleton-shimmer" />
                <div className="h-20 w-full rounded-md skeleton-shimmer" />
              </div>
            </div>
          </div>

          {/* Right 1 Column: Sticky Order Breakdown (White elevated card) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="p-5 sm:p-6 rounded-md border border-forest-900/10 bg-white shadow-elevation-1 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-forest-900/10">
                <div className="h-4 w-32 rounded-md skeleton-shimmer" />
                <div className="h-4 w-12 rounded-full skeleton-shimmer" />
              </div>
              {/* Item thumbnails */}
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-md skeleton-shimmer shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 w-3/4 rounded-md skeleton-shimmer" />
                      <div className="h-3 w-1/2 rounded-md skeleton-shimmer opacity-70" />
                    </div>
                    <div className="h-4 w-12 rounded-md skeleton-shimmer" />
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-forest-900/10 space-y-2">
                <div className="flex justify-between">
                  <div className="h-3.5 w-20 rounded-md skeleton-shimmer" />
                  <div className="h-3.5 w-16 rounded-md skeleton-shimmer" />
                </div>
                <div className="flex justify-between">
                  <div className="h-3.5 w-24 rounded-md skeleton-shimmer" />
                  <div className="h-3.5 w-14 rounded-md skeleton-shimmer" />
                </div>
                <div className="flex justify-between pt-2 border-t border-forest-900/10">
                  <div className="h-4 w-16 rounded-md skeleton-shimmer" />
                  <div className="h-5 w-20 rounded-md skeleton-shimmer" />
                </div>
              </div>
              <div className="h-12 w-full rounded-md skeleton-shimmer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Order Confirmation & Status Page Skeleton.
 * Matches FullOrderView with 3-step progress, celebratory badge, and receipt cards.
 */
export function OrderConfirmationSkeleton() {
  return (
    <div className="animate-delayed-fade-in relative min-h-[calc(100dvh-5rem)] px-4 py-6 sm:py-8 sm:px-6 lg:px-8 xl:px-10 pb-20 sm:pb-16 overflow-hidden bg-cream-50 bg-laid-paper">
      <div className="relative z-10 mx-auto max-w-3xl space-y-6 sm:space-y-8">
        {/* 3-Step Progress Track */}
        <div className="max-w-xl mx-auto w-full flex items-center gap-3">
          <div className="h-1 flex-1 rounded-full skeleton-shimmer" />
          <div className="h-1 flex-1 rounded-full skeleton-shimmer" />
          <div className="h-1 flex-1 rounded-full skeleton-shimmer" />
        </div>

        {/* Celebratory Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-forest-900/20 skeleton-shimmer" />
          <div className="h-4 w-32 rounded-full skeleton-shimmer opacity-70" />
          <div className="h-8 w-64 rounded-xl skeleton-shimmer" />
          <div className="h-3.5 w-80 rounded-md skeleton-shimmer opacity-60" />
        </div>

        {/* Status & Delivery Receipt Cards */}
        <div className="p-5 sm:p-6 rounded-md bg-white border border-forest-900/10 shadow-elevation-1 space-y-4">
          <div className="h-4 w-44 rounded-md skeleton-shimmer" />
          <div className="space-y-3">
            <div className="h-14 w-full rounded-md skeleton-shimmer opacity-80" />
            <div className="h-14 w-full rounded-md skeleton-shimmer opacity-80" />
          </div>
        </div>

        {/* Order Items Breakdown Card */}
        <div className="p-5 sm:p-6 rounded-md bg-white border border-forest-900/10 shadow-elevation-1 space-y-4">
          <div className="h-4 w-36 rounded-md skeleton-shimmer" />
          <div className="space-y-3 pt-2 border-t border-forest-900/10">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 w-48 rounded-md skeleton-shimmer" />
                <div className="h-4 w-16 rounded-md skeleton-shimmer" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Order Lookup Page Skeleton.
 * Matches OrderLookupPage with centered parcel tracker card.
 */
export function OrderLookupSkeleton() {
  return (
    <div className="animate-delayed-fade-in relative min-h-[calc(100dvh-5rem)] flex items-center justify-center bg-cream-50 bg-laid-paper px-4 py-8 sm:py-16 pb-32 sm:pb-20 overflow-hidden">
      <div className="relative z-10 w-full max-w-md bg-white/95 border border-forest-900/10 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-atelier space-y-6 text-center">
        {/* Icon Badge */}
        <div className="mx-auto h-14 w-14 rounded-2xl bg-forest-900/20 skeleton-shimmer" />

        {/* Heading */}
        <div className="space-y-2">
          <div className="h-3 w-28 mx-auto rounded-md skeleton-shimmer opacity-70" />
          <div className="h-8 w-48 mx-auto rounded-xl skeleton-shimmer" />
          <div className="h-3.5 w-72 mx-auto rounded-md skeleton-shimmer opacity-60" />
        </div>

        {/* Form Input Placeholders */}
        <div className="space-y-4 pt-2">
          <div className="h-11 w-full rounded-md skeleton-shimmer" />
          <div className="h-11 w-full rounded-md skeleton-shimmer" />
          <div className="h-11 w-full rounded-md bg-forest-950/20 skeleton-shimmer" />
        </div>

        {/* Support hint placeholder */}
        <div className="pt-2 border-t border-forest-900/10 flex justify-center">
          <div className="h-3.5 w-60 rounded-md skeleton-shimmer opacity-50" />
        </div>
      </div>
    </div>
  )
}

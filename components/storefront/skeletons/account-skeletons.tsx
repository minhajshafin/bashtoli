import React from 'react'

/**
 * Customer Account Portal Skeleton with Monogram Identity & Tab Nav.
 * Tailored precisely to Bashtoli's deep sumi forest architecture with zero white flashes.
 */
export function AccountPageSkeleton() {
  return (
    <div className="animate-delayed-fade-in relative min-h-[calc(100dvh-5rem)] bg-forest-950 bg-laid-paper-dark px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-8 lg:py-16 pb-36 sm:pb-24">
      <div className="relative z-10 max-w-[1440px] xl:max-w-[1520px] mx-auto w-full">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10 xl:gap-12 items-start">
          {/* Left Column: Monogram & Nav Tabs */}
          <aside className="lg:col-span-4 pb-4 lg:pb-0 border-b lg:border-b-0 lg:border-r border-forest-800/80 lg:pr-8 xl:pr-10 space-y-3 sm:space-y-6">
            {/* Identity Card Skeleton */}
            <div className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border border-forest-800/90 bg-forest-900/90 shadow-xl">
              <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl skeleton-shimmer-dark shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-16 rounded-md skeleton-shimmer-dark opacity-60" />
                <div className="h-4 w-32 rounded-md skeleton-shimmer-dark" />
              </div>
            </div>

            {/* Navigation Rail Skeleton */}
            {/* Mobile Horizontal Rail */}
            <div className="flex lg:hidden gap-2 overflow-x-auto pb-2 scrollbar-none">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-9 w-24 rounded-xl skeleton-shimmer-dark shrink-0" />
              ))}
            </div>
            {/* Desktop Vertical List */}
            <div className="hidden lg:flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 w-full rounded-xl skeleton-shimmer-dark" />
              ))}
            </div>
          </aside>

          {/* Right Column: Main Content Area */}
          <main className="lg:col-span-8 pt-5 lg:pt-0 min-w-0 space-y-6">
            {/* Header Skeleton */}
            <div className="border-b border-forest-800 pb-5">
              <div className="h-7 sm:h-8 w-48 sm:w-64 rounded-xl skeleton-shimmer-dark" />
            </div>

            {/* Quick Links Grid Skeleton */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 sm:h-32 rounded-2xl border border-forest-800/80 bg-forest-900/90 p-4 sm:p-5 flex flex-col justify-between shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl skeleton-shimmer-dark shrink-0" />
                    <div className="h-4 w-4 rounded-md skeleton-shimmer-dark opacity-50" />
                  </div>
                  <div className="space-y-1.5 mt-2">
                    <div className="h-3.5 w-24 rounded-md skeleton-shimmer-dark" />
                    <div className="h-2.5 w-16 rounded-md skeleton-shimmer-dark opacity-60" />
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Orders Skeleton */}
            <div className="space-y-3 pt-2">
              <div className="h-5 w-32 rounded-md skeleton-shimmer-dark" />
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-20 rounded-2xl border border-forest-800/80 bg-forest-900/90 p-4 sm:p-5 flex items-center justify-between shadow-xs"
                  >
                    <div className="space-y-1.5">
                      <div className="h-4 w-28 rounded-md skeleton-shimmer-dark" />
                      <div className="h-3 w-36 rounded-md skeleton-shimmer-dark opacity-60" />
                    </div>
                    <div className="h-9 w-24 rounded-xl skeleton-shimmer-dark" />
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

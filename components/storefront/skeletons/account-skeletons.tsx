import React from 'react'

/**
 * Customer Account Portal Skeleton with Monogram Identity & Tab Nav.
 */
export function AccountPageSkeleton() {
  return (
    <div className="animate-delayed-fade-in relative min-h-[calc(100dvh-5rem)] bg-forest-950 bg-laid-paper-dark px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-10 lg:py-16">
      <div className="max-w-[1440px] xl:max-w-[1520px] mx-auto">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10 xl:gap-12 items-start">
          {/* Left Column: Monogram & Nav Tabs */}
          <aside className="lg:col-span-4 pb-6 lg:pb-0 border-b lg:border-b-0 lg:border-r border-forest-800/80 lg:pr-8 xl:pr-10 space-y-6">
            <div className="flex items-center gap-3.5 p-4 rounded-2xl border border-forest-800/90 bg-forest-900/80">
              <div className="h-12 w-12 rounded-xl skeleton-shimmer-dark shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-16 rounded-md skeleton-shimmer-dark opacity-60" />
                <div className="h-4 w-32 rounded-md skeleton-shimmer-dark" />
              </div>
            </div>
            <div className="space-y-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 w-full rounded-xl skeleton-shimmer-dark" />
              ))}
            </div>
          </aside>

          {/* Right Column: Content Card */}
          <main className="lg:col-span-8 pt-6 lg:pt-0 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-cream-50 border border-forest-200/90 shadow-md space-y-6">
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

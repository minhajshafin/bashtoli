import React from 'react'

export default function StorefrontLoading() {
  return (
    <div className="animate-delayed-fade-in min-h-[calc(100dvh-5rem)] w-full bg-cream-50 bg-laid-paper">
      <div className="h-0.5 bg-gradient-to-r from-forest-900/40 via-gold-400 to-forest-900/40 opacity-50" />
      <div className="max-w-[1440px] xl:max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 sm:py-12 space-y-6">
        <div className="h-4 w-32 rounded-md skeleton-shimmer opacity-70" />
        <div className="h-9 w-60 rounded-xl skeleton-shimmer" />
        <div className="h-4 w-80 rounded-md skeleton-shimmer opacity-50 max-w-full" />
      </div>
    </div>
  )
}

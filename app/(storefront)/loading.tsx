import React from 'react'

export default function StorefrontLoading() {
  return (
    <div className="min-h-[calc(100dvh-5rem)] w-full bg-cream-50 animate-pulse">
      <div className="h-0.5 bg-gradient-to-r from-forest-900 via-gold-400 to-forest-900 opacity-50" />
      <div className="max-w-[1440px] xl:max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 sm:py-12 space-y-6">
        <div className="h-5 w-32 rounded-md bg-forest-900/10" />
        <div className="h-9 w-60 rounded-xl bg-forest-900/10" />
        <div className="h-4 w-80 rounded-md bg-forest-900/5 max-w-full" />
      </div>
    </div>
  )
}

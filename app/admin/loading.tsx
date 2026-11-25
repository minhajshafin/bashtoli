import React from 'react'

export default function AdminLoading() {
  return (
    <div className="animate-delayed-fade-in space-y-8" aria-busy="true" aria-label="Loading admin panel">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-paper-300 pb-5">
        <div className="space-y-2">
          <div className="h-3 w-28 rounded bg-paper-200 skeleton-shimmer-mono" />
          <div className="h-8 w-52 rounded-lg bg-paper-200 skeleton-shimmer-mono" />
        </div>
        <div className="flex gap-2">
          <div className="h-11 w-28 rounded-xl bg-paper-200 skeleton-shimmer-mono" />
          <div className="h-11 w-32 rounded-xl bg-ink-950/15 skeleton-shimmer-mono" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="h-36 rounded-2xl bg-ink-950 border border-ink-800 p-5 flex flex-col justify-between">
          <div className="h-9 w-9 rounded-xl bg-ink-800" />
          <div className="space-y-2">
            <div className="h-3 w-24 rounded bg-ink-800" />
            <div className="h-7 w-32 rounded bg-ink-800" />
          </div>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-36 rounded-2xl bg-paper-50 skeleton-shimmer-mono border border-paper-300"
          />
        ))}
      </div>

      <div className="h-96 w-full rounded-2xl bg-paper-50 skeleton-shimmer-mono border border-paper-300" />
    </div>
  )
}

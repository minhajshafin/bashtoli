import React from 'react'

export default function AdminLoading() {
  return (
    <div className="animate-delayed-fade-in p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div className="h-8 w-44 rounded-lg bg-slate-200 skeleton-shimmer" />
        <div className="h-10 w-28 rounded-lg bg-slate-200 skeleton-shimmer" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-slate-100 skeleton-shimmer border border-slate-200" />
        ))}
      </div>
      <div className="h-96 w-full rounded-2xl bg-slate-100 skeleton-shimmer border border-slate-200" />
    </div>
  )
}

import React from 'react'

export default function AdminLoading() {
  return (
    <div className="animate-delayed-fade-in space-y-6" aria-busy="true" aria-label="Loading admin panel">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-adm-border pb-5">
        <div className="h-8 w-44 rounded-lg bg-adm-surface-2 admin-skeleton" />
        <div className="flex gap-2">
          <div className="h-11 w-24 rounded-xl bg-adm-surface-2 admin-skeleton" />
          <div className="h-11 w-32 rounded-xl bg-adm-surface-2 admin-skeleton" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-adm-surface admin-skeleton border border-adm-border p-5"
          />
        ))}
      </div>

      <div className="h-96 w-full rounded-2xl bg-adm-surface admin-skeleton border border-adm-border" />
    </div>
  )
}

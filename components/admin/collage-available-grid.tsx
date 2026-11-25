'use client'

import React from 'react'
import {
  MAX_FEATURED_CATEGORIES,
  type FeaturedCategoryItem,
} from '@/lib/validations/category-collage'

interface CollageAvailableGridProps {
  available: FeaturedCategoryItem[]
  canAddMore: boolean
  isPending: boolean
  onAdd: (cat: FeaturedCategoryItem) => void
}

export function CollageAvailableGrid({
  available,
  canAddMore,
  isPending,
  onAdd,
}: CollageAvailableGridProps) {
  return (
    <div className="rounded-2xl border border-adm-border bg-adm-surface p-6 shadow-subtle space-y-4">
      <h3 className="text-base font-semibold text-adm-fg">Available Categories</h3>

      {!canAddMore ? (
        <div className="rounded-xl border border-adm-warning-border bg-adm-warning-bg p-4 text-xs font-semibold text-adm-warning">
          All {MAX_FEATURED_CATEGORIES} slots are filled. Remove an existing slot to add another.
        </div>
      ) : available.length === 0 ? (
        <p className="text-xs text-adm-muted">All categories are currently in the collage.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {available.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-adm-border bg-adm-surface-2/60 hover:bg-adm-surface hover:border-adm-input-border transition-colors"
            >
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-adm-fg truncate">{cat.name}</h4>
                <p className="font-mono text-[11px] text-adm-muted">{cat.product_count ?? 0} items</p>
              </div>

              <button
                type="button"
                disabled={isPending}
                onClick={() => onAdd(cat)}
                className="min-h-[36px] rounded-xl bg-adm-accent px-3 py-1.5 text-xs font-semibold text-adm-accent-fg hover:bg-adm-accent-hover disabled:opacity-50 transition-colors cursor-pointer shrink-0"
              >
                + Add
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

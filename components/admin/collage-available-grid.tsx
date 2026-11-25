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
    <div className="rounded-2xl border border-paper-300 bg-paper-50 p-6 shadow-subtle space-y-4">
      <div>
        <h3 className="text-base font-bold text-ink-950">Available Categories</h3>
        <p className="text-xs text-ink-600 mt-0.5">
          Add any of your remaining store categories into the homepage collage.
        </p>
      </div>

      {!canAddMore ? (
        <div className="rounded-xl border border-signal-warning-border bg-signal-warning-bg p-4 text-xs font-semibold text-signal-warning">
          All {MAX_FEATURED_CATEGORIES} slots are occupied in the collage. To feature a different category, click &ldquo;Remove&rdquo; on an existing slot above.
        </div>
      ) : available.length === 0 ? (
        <p className="text-xs text-ink-600 italic">
          All existing categories are currently featured in the collage.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {available.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-paper-300 bg-paper-100/70 hover:bg-paper-50 hover:border-ink-950 transition-colors"
            >
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-ink-950 truncate">{cat.name}</h4>
                <p className="font-mono text-[11px] text-ink-600">{cat.product_count ?? 0} items</p>
              </div>

              <button
                type="button"
                disabled={isPending}
                onClick={() => onAdd(cat)}
                className="min-h-[38px] rounded-xl bg-ink-950 px-3.5 py-1.5 text-xs font-bold text-paper-50 hover:bg-ink-800 disabled:opacity-50 transition-colors cursor-pointer shrink-0"
              >
                + Add to Collage
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

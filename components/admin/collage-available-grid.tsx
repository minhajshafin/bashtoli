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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-900">Available Categories</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Add any of your remaining store categories into the homepage collage.
        </p>
      </div>

      {!canAddMore ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-800">
          All {MAX_FEATURED_CATEGORIES} slots are occupied in the collage. To feature a different category, click &ldquo;Remove&rdquo; on an existing slot above.
        </div>
      ) : available.length === 0 ? (
        <p className="text-xs text-slate-400 italic">
          All existing categories are currently featured in the collage.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {available.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all"
            >
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">{cat.name}</h4>
                <p className="text-[11px] text-slate-500">{cat.product_count ?? 0} items</p>
              </div>

              <button
                type="button"
                disabled={isPending}
                onClick={() => onAdd(cat)}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer shrink-0"
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

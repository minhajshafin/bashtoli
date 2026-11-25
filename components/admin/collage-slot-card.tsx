'use client'

import React from 'react'
import Image from 'next/image'
import {
  COLLAGE_SLOT_CONFIGS,
  type FeaturedCategoryItem,
} from '@/lib/validations/category-collage'

interface CollageSlotCardProps {
  category: FeaturedCategoryItem
  index: number
  totalFeatured: number
  isUploadingThis: boolean
  isPending: boolean
  onMove: (index: number, direction: 'up' | 'down') => void
  onUploadTrigger: (catId: string) => void
  onRemove: (cat: FeaturedCategoryItem) => void
}

export function CollageSlotCard({
  category,
  index,
  totalFeatured,
  isUploadingThis,
  isPending,
  onMove,
  onUploadTrigger,
  onRemove,
}: CollageSlotCardProps) {
  const slotConfig = COLLAGE_SLOT_CONFIGS[index] || {
    slot: index + 1,
    name: `Slot ${index + 1}`,
    desc: '',
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition-all hover:border-slate-300">
      {/* Left: Slot position & Category info */}
      <div className="flex items-center gap-4 min-w-0">
        {/* Thumbnail */}
        <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          {category.image_url ? (
            <Image
              src={category.image_url}
              alt={category.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-2 text-center text-[10px] text-slate-400">
              <span>No cover</span>
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-forest-800 text-gold-400">
              Slot {index + 1}: {slotConfig.name}
            </span>
            {slotConfig.desc && (
              <span className="text-[10px] text-slate-400">({slotConfig.desc})</span>
            )}
          </div>

          <h4 className="text-sm font-bold text-slate-900 truncate">{category.name}</h4>
          <p className="text-xs text-slate-500">
            {category.product_count ?? 0} active products · Slug: <code>{category.slug}</code>
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex flex-wrap items-center gap-2 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        <button
          type="button"
          disabled={index === 0 || isPending}
          onClick={() => onMove(index, 'up')}
          aria-label="Move slot up"
          title="Move slot up"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          type="button"
          disabled={index === totalFeatured - 1 || isPending}
          onClick={() => onMove(index, 'down')}
          aria-label="Move slot down"
          title="Move slot down"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <button
          type="button"
          disabled={isUploadingThis || isPending}
          onClick={() => onUploadTrigger(category.id)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          {isUploadingThis
            ? 'Uploading...'
            : category.image_url
            ? 'Change Photo'
            : 'Upload Photo'}
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={() => onRemove(category)}
          className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
        >
          Remove
        </button>
      </div>
    </div>
  )
}

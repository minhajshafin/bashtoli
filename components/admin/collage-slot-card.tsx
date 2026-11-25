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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-paper-300 bg-paper-50 p-4 shadow-subtle transition-colors hover:border-ink-400">
      <div className="flex items-center gap-4 min-w-0">
        <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border border-paper-300 bg-paper-200">
          {category.image_url ? (
            <Image
              src={category.image_url}
              alt={category.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-2 text-center font-mono text-[10px] text-ink-500">
              <span>No cover</span>
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold bg-ink-950 text-paper-50">
              Slot {index + 1}: {slotConfig.name}
            </span>
            {slotConfig.desc && (
              <span className="font-mono text-[10px] text-ink-500">({slotConfig.desc})</span>
            )}
          </div>

          <h4 className="text-sm font-bold text-ink-950 truncate">{category.name}</h4>
          <p className="text-xs text-ink-600">
            {category.product_count ?? 0} active products · Slug:{' '}
            <code className="font-mono">{category.slug}</code>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-paper-200 shrink-0">
        <button
          type="button"
          disabled={index === 0 || isPending}
          onClick={() => onMove(index, 'up')}
          aria-label={`Move ${category.name} slot up`}
          title="Move slot up"
          className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-paper-300 bg-paper-50 text-ink-800 hover:bg-paper-200 disabled:opacity-30 disabled:hover:bg-paper-50 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          type="button"
          disabled={index === totalFeatured - 1 || isPending}
          onClick={() => onMove(index, 'down')}
          aria-label={`Move ${category.name} slot down`}
          title="Move slot down"
          className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-paper-300 bg-paper-50 text-ink-800 hover:bg-paper-200 disabled:opacity-30 disabled:hover:bg-paper-50 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <button
          type="button"
          disabled={isUploadingThis || isPending}
          onClick={() => onUploadTrigger(category.id)}
          className="min-h-[40px] rounded-xl border border-ink-400/70 bg-paper-50 px-3.5 py-1.5 text-xs font-bold text-ink-950 hover:bg-ink-950 hover:text-paper-50 hover:border-ink-950 transition-colors cursor-pointer"
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
          className="min-h-[40px] rounded-xl border border-signal-danger-border bg-paper-50 px-3.5 py-1.5 text-xs font-bold text-signal-danger hover:bg-signal-danger hover:text-paper-50 transition-colors cursor-pointer"
        >
          Remove
        </button>
      </div>
    </div>
  )
}

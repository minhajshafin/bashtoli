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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-adm-border bg-adm-surface p-4 shadow-subtle transition-colors hover:border-adm-input-border">
      <div className="flex items-center gap-4 min-w-0">
        <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border border-adm-border bg-adm-surface-2">
          {category.image_url ? (
            <Image
              src={category.image_url}
              alt={category.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-2 text-center font-mono text-[10px] text-adm-muted">
              <span>No cover</span>
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-adm-accent-tint text-adm-accent-text border border-adm-accent-border">
              Slot {index + 1}: {slotConfig.name}
            </span>
          </div>

          <h4 className="text-sm font-semibold text-adm-fg truncate">{category.name}</h4>
          <p className="text-xs text-adm-muted">
            {category.product_count ?? 0} active products · <code className="font-mono">{category.slug}</code>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-adm-border shrink-0">
        <button
          type="button"
          disabled={index === 0 || isPending}
          onClick={() => onMove(index, 'up')}
          aria-label={`Move ${category.name} slot up`}
          title="Move slot up"
          className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-adm-border bg-adm-surface text-adm-fg-2 hover:bg-adm-surface-2 disabled:opacity-30 transition-colors cursor-pointer"
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
          className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-adm-border bg-adm-surface text-adm-fg-2 hover:bg-adm-surface-2 disabled:opacity-30 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <button
          type="button"
          disabled={isUploadingThis || isPending}
          onClick={() => onUploadTrigger(category.id)}
          className="min-h-[40px] rounded-xl border border-adm-border bg-adm-surface px-3.5 py-1.5 text-xs font-semibold text-adm-fg hover:border-adm-accent-border hover:bg-adm-accent-tint hover:text-adm-accent-text transition-colors cursor-pointer"
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
          className="min-h-[40px] rounded-xl border border-adm-danger-border bg-adm-surface px-3.5 py-1.5 text-xs font-semibold text-adm-danger hover:bg-adm-danger hover:text-adm-danger-fg transition-colors cursor-pointer"
        >
          Remove
        </button>
      </div>
    </div>
  )
}

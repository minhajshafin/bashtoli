'use client'

import React from 'react'
import Image from 'next/image'
import type { HeroSlideRow } from '@/lib/queries/hero-slides'
import {
  BADGE_COLOR_PRESETS,
  type BadgeColorPresetKey,
} from '@/lib/validations/hero-slides'

export interface HeroSlideEditDraft {
  badgeText: string
  badgePreset: BadgeColorPresetKey
  linkUrl: string
  subtext: string
  altText: string
}

interface HeroSlideCardProps {
  slide: HeroSlideRow
  index: number
  totalSlides: number
  isEditing: boolean
  isPending: boolean
  canDelete: boolean
  draft: HeroSlideEditDraft
  onDraftChange: (patch: Partial<HeroSlideEditDraft>) => void
  onStartEdit: (slide: HeroSlideRow) => void
  onCancelEdit: () => void
  onSaveEdit: (slide: HeroSlideRow) => void
  onDelete: (slideId: string) => void
  onMove: (index: number, direction: 'up' | 'down') => void
}

export function HeroSlideCard({
  slide,
  index,
  totalSlides,
  isEditing,
  isPending,
  canDelete,
  draft,
  onDraftChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onMove,
}: HeroSlideCardProps) {
  const preset = BADGE_COLOR_PRESETS[slide.badge_color_preset] || BADGE_COLOR_PRESETS.gold

  return (
    <div className="flex flex-col md:flex-row md:flex-wrap md:items-center justify-between gap-5 rounded-2xl border border-paper-300 bg-paper-50 p-4 sm:p-5 shadow-subtle transition-colors hover:border-ink-400">
      {/* Left: Thumbnail & Badge Preview */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-xl border border-paper-300 bg-paper-200">
          {slide.image_url ? (
            <Image
              src={slide.image_url}
              alt={slide.alt_text || 'Hero slide'}
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-mono text-xs text-ink-500">
              No Image
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-ink-500">
              #{String(index + 1).padStart(2, '0')}
            </span>
            <span
              className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold tracking-wide border"
              style={{
                backgroundColor: preset.bg,
                color: preset.text,
                borderColor: preset.border,
              }}
            >
              {slide.badge_text}
            </span>
          </div>

          <p className="text-xs text-ink-600 truncate max-w-xs sm:max-w-md">
            <span className="font-semibold text-ink-950">Subtext:</span>{' '}
            <span className="italic text-ink-700">&ldquo;{slide.subtext || 'Now in store & online'}&rdquo;</span>
          </p>
          <p className="text-xs text-ink-600 truncate max-w-xs sm:max-w-md font-mono">
            <span className="font-sans font-semibold text-ink-950">Links to:</span> {slide.link_url}
          </p>
          {slide.alt_text && (
            <p className="text-[11px] text-ink-500 truncate max-w-xs sm:max-w-md">
              Alt: {slide.alt_text}
            </p>
          )}
        </div>
      </div>

      {/* Right: Controls & Edit */}
      <div className="flex flex-wrap items-center gap-2 justify-end pt-3 md:pt-0 border-t md:border-t-0 border-paper-200 shrink-0">
        <button
          type="button"
          disabled={index === 0 || isPending}
          onClick={() => onMove(index, 'up')}
          aria-label={`Move slide ${index + 1} up`}
          title="Move slide up"
          className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-paper-300 bg-paper-50 text-ink-800 hover:bg-paper-200 disabled:opacity-30 disabled:hover:bg-paper-50 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          type="button"
          disabled={index === totalSlides - 1 || isPending}
          onClick={() => onMove(index, 'down')}
          aria-label={`Move slide ${index + 1} down`}
          title="Move slide down"
          className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-paper-300 bg-paper-50 text-ink-800 hover:bg-paper-200 disabled:opacity-30 disabled:hover:bg-paper-50 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => (isEditing ? onCancelEdit() : onStartEdit(slide))}
          className="min-h-[40px] rounded-xl border border-ink-400/70 bg-paper-50 px-3.5 py-1.5 text-xs font-bold text-ink-950 hover:bg-ink-950 hover:text-paper-50 hover:border-ink-950 transition-colors cursor-pointer"
        >
          {isEditing ? 'Close' : 'Edit Badge / Text'}
        </button>

        <button
          type="button"
          disabled={!canDelete || isPending}
          onClick={() => onDelete(slide.id)}
          title={!canDelete ? 'Cannot delete the only slide (min 1 required)' : 'Delete slide'}
          className="min-h-[40px] rounded-xl border border-signal-danger-border bg-paper-50 px-3.5 py-1.5 text-xs font-bold text-signal-danger hover:bg-signal-danger hover:text-paper-50 disabled:opacity-40 disabled:hover:bg-paper-50 disabled:hover:text-signal-danger transition-colors cursor-pointer"
        >
          Delete
        </button>
      </div>

      {/* Inline Edit Form Drawer — preserves `label:has-text("Badge Text") + input` */}
      {isEditing && (
        <div className="w-full md:basis-full mt-2 pt-5 border-t border-paper-300 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label
              htmlFor={`edit-badge-${slide.id}`}
              className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-700 mb-1.5"
            >
              Badge Text
            </label>
            <input
              id={`edit-badge-${slide.id}`}
              type="text"
              maxLength={40}
              value={draft.badgeText}
              onChange={(e) => onDraftChange({ badgeText: e.target.value })}
              className="w-full min-h-[44px] rounded-xl border border-ink-400/80 bg-paper-50 px-3 py-2 text-xs font-medium text-ink-950 focus-visible:outline-2 focus-visible:outline-ink-950 focus-visible:outline-offset-1"
            />
          </div>

          <div>
            <label
              htmlFor={`edit-subtext-${slide.id}`}
              className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-700 mb-1.5"
            >
              Subtext (Card Caption)
            </label>
            <input
              id={`edit-subtext-${slide.id}`}
              type="text"
              maxLength={60}
              value={draft.subtext}
              onChange={(e) => onDraftChange({ subtext: e.target.value })}
              placeholder="Now in store & online"
              className="w-full min-h-[44px] rounded-xl border border-ink-400/80 bg-paper-50 px-3 py-2 text-xs font-medium text-ink-950 focus-visible:outline-2 focus-visible:outline-ink-950 focus-visible:outline-offset-1"
            />
          </div>

          <div>
            <label
              htmlFor={`edit-preset-${slide.id}`}
              className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-700 mb-1.5"
            >
              Badge Color Preset
            </label>
            <select
              id={`edit-preset-${slide.id}`}
              value={draft.badgePreset}
              onChange={(e) =>
                onDraftChange({ badgePreset: e.target.value as BadgeColorPresetKey })
              }
              className="w-full min-h-[44px] rounded-xl border border-ink-400/80 px-3 py-2 text-xs font-semibold text-ink-950 focus-visible:outline-2 focus-visible:outline-ink-950 focus-visible:outline-offset-1 bg-paper-50 cursor-pointer"
            >
              {Object.entries(BADGE_COLOR_PRESETS).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor={`edit-link-${slide.id}`}
              className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-700 mb-1.5"
            >
              Destination Link
            </label>
            <input
              id={`edit-link-${slide.id}`}
              type="text"
              value={draft.linkUrl}
              onChange={(e) => onDraftChange({ linkUrl: e.target.value })}
              placeholder="/products or /products?category=..."
              className="w-full min-h-[44px] rounded-xl border border-ink-400/80 bg-paper-50 px-3 py-2 font-mono text-xs text-ink-950 focus-visible:outline-2 focus-visible:outline-ink-950 focus-visible:outline-offset-1"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={onCancelEdit}
              className="min-h-[44px] rounded-xl border border-ink-400/70 bg-paper-50 px-4 py-2 text-xs font-bold text-ink-900 hover:bg-paper-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => onSaveEdit(slide)}
              className="min-h-[44px] rounded-xl bg-ink-950 px-5 py-2 text-xs font-bold text-paper-50 hover:bg-ink-800 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

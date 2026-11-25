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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs transition-all hover:border-slate-300">
      {/* Left: Thumbnail & Badge Preview */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          {slide.image_url ? (
            <Image
              src={slide.image_url}
              alt={slide.alt_text || 'Hero slide'}
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
              No Image
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
            <span
              className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold tracking-wide"
              style={{
                backgroundColor: preset.bg,
                color: preset.text,
                borderColor: preset.border,
              }}
            >
              {slide.badge_text}
            </span>
          </div>

          <p className="text-xs text-slate-500 truncate max-w-xs sm:max-w-md">
            <span className="font-medium text-slate-700">Subtext:</span>{' '}
            <span className="italic text-slate-600">&ldquo;{slide.subtext || 'Now in store & online'}&rdquo;</span>
          </p>
          <p className="text-xs text-slate-500 truncate max-w-xs sm:max-w-md">
            <span className="font-medium text-slate-700">Links to:</span> {slide.link_url}
          </p>
          {slide.alt_text && (
            <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
              Alt: {slide.alt_text}
            </p>
          )}
        </div>
      </div>

      {/* Right: Controls & Edit */}
      <div className="flex flex-wrap items-center gap-2 justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
        <button
          type="button"
          disabled={index === 0 || isPending}
          onClick={() => onMove(index, 'up')}
          aria-label="Move slide up"
          title="Move slide up"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          type="button"
          disabled={index === totalSlides - 1 || isPending}
          onClick={() => onMove(index, 'down')}
          aria-label="Move slide down"
          title="Move slide down"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => (isEditing ? onCancelEdit() : onStartEdit(slide))}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          {isEditing ? 'Close' : 'Edit Badge / Text'}
        </button>

        <button
          type="button"
          disabled={!canDelete || isPending}
          onClick={() => onDelete(slide.id)}
          title={!canDelete ? 'Cannot delete the only slide (min 1 required)' : 'Delete slide'}
          className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
        >
          Delete
        </button>
      </div>

      {/* Inline Edit Form Drawer */}
      {isEditing && (
        <div className="w-full md:basis-full mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label
              htmlFor={`edit-badge-${slide.id}`}
              className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1"
            >
              Badge Text
            </label>
            <input
              id={`edit-badge-${slide.id}`}
              type="text"
              maxLength={40}
              value={draft.badgeText}
              onChange={(e) => onDraftChange({ badgeText: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor={`edit-subtext-${slide.id}`}
              className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1"
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
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor={`edit-preset-${slide.id}`}
              className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1"
            >
              Badge Color Preset
            </label>
            <select
              id={`edit-preset-${slide.id}`}
              value={draft.badgePreset}
              onChange={(e) =>
                onDraftChange({ badgePreset: e.target.value as BadgeColorPresetKey })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 bg-white"
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
              className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1"
            >
              Destination Link
            </label>
            <input
              id={`edit-link-${slide.id}`}
              type="text"
              value={draft.linkUrl}
              onChange={(e) => onDraftChange({ linkUrl: e.target.value })}
              placeholder="/products or /products?category=..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2 pt-1">
            <button
              type="button"
              disabled={isPending}
              onClick={() => onSaveEdit(slide)}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

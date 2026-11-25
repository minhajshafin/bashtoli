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
    <div className="flex flex-col md:flex-row md:flex-wrap md:items-center justify-between gap-5 rounded-2xl border border-adm-border bg-adm-surface p-4 sm:p-5 shadow-subtle transition-colors hover:border-adm-input-border">
      {/* Left: Thumbnail & Badge Preview */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-xl border border-adm-border bg-adm-surface-2">
          {slide.image_url ? (
            <Image
              src={slide.image_url}
              alt={slide.alt_text || 'Hero slide'}
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-mono text-xs text-adm-muted">
              No Image
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold text-adm-muted">
              #{index + 1}
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

          <p className="text-xs text-adm-fg-2 truncate max-w-xs sm:max-w-md">
            {slide.subtext || 'Now in store & online'}
          </p>
          <p className="text-xs text-adm-muted truncate max-w-xs sm:max-w-md font-mono">
            {slide.link_url}
          </p>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex flex-wrap items-center gap-2 justify-end pt-3 md:pt-0 border-t md:border-t-0 border-adm-border shrink-0">
        <button
          type="button"
          disabled={index === 0 || isPending}
          onClick={() => onMove(index, 'up')}
          aria-label={`Move slide ${index + 1} up`}
          title="Move slide up"
          className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-adm-border bg-adm-surface text-adm-fg-2 hover:bg-adm-surface-2 disabled:opacity-30 transition-colors cursor-pointer"
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
          className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-adm-border bg-adm-surface text-adm-fg-2 hover:bg-adm-surface-2 disabled:opacity-30 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => (isEditing ? onCancelEdit() : onStartEdit(slide))}
          className="min-h-[40px] rounded-xl border border-adm-border bg-adm-surface px-3.5 py-1.5 text-xs font-semibold text-adm-fg hover:border-adm-accent-border hover:bg-adm-accent-tint hover:text-adm-accent-text transition-colors cursor-pointer"
        >
          {isEditing ? 'Close' : 'Edit Badge / Text'}
        </button>

        <button
          type="button"
          disabled={!canDelete || isPending}
          onClick={() => onDelete(slide.id)}
          title={!canDelete ? 'At least 1 slide required' : 'Delete slide'}
          className="min-h-[40px] rounded-xl border border-adm-danger-border bg-adm-surface px-3.5 py-1.5 text-xs font-semibold text-adm-danger hover:bg-adm-danger hover:text-adm-danger-fg disabled:opacity-40 transition-colors cursor-pointer"
        >
          Delete
        </button>
      </div>

      {/* Inline Edit Form Drawer — preserves `label:has-text("Badge Text") + input` */}
      {isEditing && (
        <div className="w-full md:basis-full mt-2 pt-5 border-t border-adm-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label
              htmlFor={`edit-badge-${slide.id}`}
              className="block text-xs font-semibold text-adm-fg-2 mb-1.5"
            >
              Badge Text
            </label>
            <input
              id={`edit-badge-${slide.id}`}
              type="text"
              maxLength={40}
              value={draft.badgeText}
              onChange={(e) => onDraftChange({ badgeText: e.target.value })}
              className="w-full min-h-[44px] rounded-xl border border-adm-input-border bg-adm-surface px-3 py-2 text-xs font-medium text-adm-fg focus-visible:outline-2 focus-visible:outline-adm-accent focus-visible:outline-offset-1"
            />
          </div>

          <div>
            <label
              htmlFor={`edit-subtext-${slide.id}`}
              className="block text-xs font-semibold text-adm-fg-2 mb-1.5"
            >
              Subtext
            </label>
            <input
              id={`edit-subtext-${slide.id}`}
              type="text"
              maxLength={60}
              value={draft.subtext}
              onChange={(e) => onDraftChange({ subtext: e.target.value })}
              placeholder="Now in store & online"
              className="w-full min-h-[44px] rounded-xl border border-adm-input-border bg-adm-surface px-3 py-2 text-xs font-medium text-adm-fg focus-visible:outline-2 focus-visible:outline-adm-accent focus-visible:outline-offset-1"
            />
          </div>

          <div>
            <label
              htmlFor={`edit-preset-${slide.id}`}
              className="block text-xs font-semibold text-adm-fg-2 mb-1.5"
            >
              Badge Color
            </label>
            <select
              id={`edit-preset-${slide.id}`}
              value={draft.badgePreset}
              onChange={(e) =>
                onDraftChange({ badgePreset: e.target.value as BadgeColorPresetKey })
              }
              className="w-full min-h-[44px] rounded-xl border border-adm-input-border px-3 py-2 text-xs font-semibold text-adm-fg focus-visible:outline-2 focus-visible:outline-adm-accent focus-visible:outline-offset-1 bg-adm-surface cursor-pointer"
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
              className="block text-xs font-semibold text-adm-fg-2 mb-1.5"
            >
              Link URL
            </label>
            <input
              id={`edit-link-${slide.id}`}
              type="text"
              value={draft.linkUrl}
              onChange={(e) => onDraftChange({ linkUrl: e.target.value })}
              placeholder="/products"
              className="w-full min-h-[44px] rounded-xl border border-adm-input-border bg-adm-surface px-3 py-2 font-mono text-xs text-adm-fg focus-visible:outline-2 focus-visible:outline-adm-accent focus-visible:outline-offset-1"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={onCancelEdit}
              className="min-h-[42px] rounded-xl border border-adm-border bg-adm-surface px-4 py-2 text-xs font-semibold text-adm-fg-2 hover:bg-adm-surface-2 hover:text-adm-fg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => onSaveEdit(slide)}
              className="min-h-[42px] rounded-xl bg-adm-accent px-5 py-2 text-xs font-semibold text-adm-accent-fg hover:bg-adm-accent-hover disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import React from 'react'
import { Plus } from 'lucide-react'
import {
  BADGE_COLOR_PRESETS,
  HERO_SLIDE_MAX_COUNT,
  type BadgeColorPresetKey,
} from '@/lib/validations/hero-slides'
import { ADMIN_IMAGE_MAX_SIZE_MB } from '@/lib/utils/admin-upload'

interface HeroSlideCreateFormProps {
  canAddMore: boolean
  isUploading: boolean
  fileInputRef: React.RefObject<HTMLInputElement | null>
  badgeText: string
  badgePreset: BadgeColorPresetKey
  linkUrl: string
  subtext: string
  onBadgeTextChange: (val: string) => void
  onBadgePresetChange: (val: BadgeColorPresetKey) => void
  onLinkUrlChange: (val: string) => void
  onSubtextChange: (val: string) => void
  onUploadFile: (file: File) => void
}

export function HeroSlideCreateForm({
  canAddMore,
  isUploading,
  fileInputRef,
  badgeText,
  badgePreset,
  linkUrl,
  subtext,
  onBadgeTextChange,
  onBadgePresetChange,
  onLinkUrlChange,
  onSubtextChange,
  onUploadFile,
}: HeroSlideCreateFormProps) {
  return (
    <div className="rounded-2xl border border-adm-border bg-adm-surface p-6 shadow-subtle">
      <h3 className="text-base font-semibold text-adm-fg mb-4">Add Slide</h3>

      {!canAddMore ? (
        <div className="rounded-xl border border-adm-warning-border bg-adm-warning-bg p-4 text-xs font-semibold text-adm-warning">
          Maximum {HERO_SLIDE_MAX_COUNT} slides reached. Delete an existing slide first.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="new-hero-badge-text"
                className="block text-xs font-semibold text-adm-fg-2 mb-1.5"
              >
                Badge Text
              </label>
              <input
                id="new-hero-badge-text"
                type="text"
                maxLength={40}
                value={badgeText}
                onChange={(e) => onBadgeTextChange(e.target.value)}
                placeholder="e.g. New Arrival"
                className="w-full min-h-[44px] rounded-xl border border-adm-input-border bg-adm-surface px-3 py-2 text-xs font-medium text-adm-fg focus-visible:outline-2 focus-visible:outline-adm-accent focus-visible:outline-offset-1"
              />
            </div>

            <div>
              <label
                htmlFor="new-hero-subtext"
                className="block text-xs font-semibold text-adm-fg-2 mb-1.5"
              >
                Subtext
              </label>
              <input
                id="new-hero-subtext"
                type="text"
                maxLength={60}
                value={subtext}
                onChange={(e) => onSubtextChange(e.target.value)}
                placeholder="Now in store & online"
                className="w-full min-h-[44px] rounded-xl border border-adm-input-border bg-adm-surface px-3 py-2 text-xs font-medium text-adm-fg focus-visible:outline-2 focus-visible:outline-adm-accent focus-visible:outline-offset-1"
              />
            </div>

            <div>
              <label
                htmlFor="new-hero-badge-preset"
                className="block text-xs font-semibold text-adm-fg-2 mb-1.5"
              >
                Badge Color
              </label>
              <select
                id="new-hero-badge-preset"
                value={badgePreset}
                onChange={(e) => onBadgePresetChange(e.target.value as BadgeColorPresetKey)}
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
                htmlFor="new-hero-link-url"
                className="block text-xs font-semibold text-adm-fg-2 mb-1.5"
              >
                Link URL
              </label>
              <input
                id="new-hero-link-url"
                type="text"
                value={linkUrl}
                onChange={(e) => onLinkUrlChange(e.target.value)}
                placeholder="/products"
                className="w-full min-h-[44px] rounded-xl border border-adm-input-border bg-adm-surface px-3 py-2 font-mono text-xs text-adm-fg focus-visible:outline-2 focus-visible:outline-adm-accent focus-visible:outline-offset-1"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              aria-hidden="true"
              tabIndex={-1}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onUploadFile(file)
              }}
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                  fileInputRef.current.click()
                }
              }}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-adm-accent px-5 py-2 text-xs font-semibold text-adm-accent-fg shadow-elevation-1 hover:bg-adm-accent-hover disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isUploading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  <span>Upload Image</span>
                </>
              )}
            </button>
            <span className="font-mono text-xs text-adm-muted">
              JPG, PNG, WebP up to {ADMIN_IMAGE_MAX_SIZE_MB}MB
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

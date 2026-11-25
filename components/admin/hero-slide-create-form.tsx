'use client'

import React from 'react'
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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <h3 className="text-base font-bold text-slate-900 mb-1">Add New Hero Slide</h3>
      <p className="text-xs text-slate-500 mb-6">
        Upload a high-resolution vertical photo (recommended aspect ratio: 4:5 or portrait, e.g. 900×1100px). Max size {ADMIN_IMAGE_MAX_SIZE_MB}MB.
      </p>

      {!canAddMore ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-800">
          Maximum limit of {HERO_SLIDE_MAX_COUNT} slides reached. To add a new photo, please delete an existing slide first.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="new-hero-badge-text"
                className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1"
              >
                Badge Text
              </label>
              <input
                id="new-hero-badge-text"
                type="text"
                maxLength={40}
                value={badgeText}
                onChange={(e) => onBadgeTextChange(e.target.value)}
                placeholder="e.g. New Season Collection"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="new-hero-subtext"
                className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1"
              >
                Subtext (Card Caption)
              </label>
              <input
                id="new-hero-subtext"
                type="text"
                maxLength={60}
                value={subtext}
                onChange={(e) => onSubtextChange(e.target.value)}
                placeholder="Now in store & online"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="new-hero-badge-preset"
                className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1"
              >
                Badge Color Preset
              </label>
              <select
                id="new-hero-badge-preset"
                value={badgePreset}
                onChange={(e) => onBadgePresetChange(e.target.value as BadgeColorPresetKey)}
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
                htmlFor="new-hero-link-url"
                className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1"
              >
                Destination Link
              </label>
              <input
                id="new-hero-link-url"
                type="text"
                value={linkUrl}
                onChange={(e) => onLinkUrlChange(e.target.value)}
                placeholder="/products"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
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
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isUploading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Uploading Photo...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Choose Image &amp; Add Slide</span>
                </>
              )}
            </button>
            <span className="text-xs text-slate-400">
              Supported formats: JPG, PNG, WebP (Max {ADMIN_IMAGE_MAX_SIZE_MB}MB)
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

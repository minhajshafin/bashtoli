'use client'

import React, { useState, useTransition, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { HeroSlideRow } from '@/lib/queries/hero-slides'
import {
  BADGE_COLOR_PRESETS,
  HERO_SLIDE_MIN_COUNT,
  HERO_SLIDE_MAX_COUNT,
  type BadgeColorPresetKey,
} from '@/lib/validations/hero-slides'
import {
  createHeroSlideAction,
  updateHeroSlideAction,
  deleteHeroSlideAction,
  reorderHeroSlidesAction,
} from '@/lib/actions/hero-slides'

interface HeroSlidesManagerProps {
  initialSlides: HeroSlideRow[]
  dbError?: string | null
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_MB = 3
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

export function HeroSlidesManager({ initialSlides, dbError }: HeroSlidesManagerProps) {
  const router = useRouter()
  const [slides, setSlides] = useState<HeroSlideRow[]>(initialSlides)
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  )

  // Upload state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [newBadgeText, setNewBadgeText] = useState('New Collection')
  const [newBadgePreset, setNewBadgePreset] = useState<BadgeColorPresetKey>('gold')
  const [newLinkUrl, setNewLinkUrl] = useState('/products')
  const [newSubtext, setNewSubtext] = useState('Now in store & online')
  const [newAltText, setNewAltText] = useState('')

  // Editing state
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null)
  const [editBadgeText, setEditBadgeText] = useState('')
  const [editBadgePreset, setEditBadgePreset] = useState<BadgeColorPresetKey>('gold')
  const [editLinkUrl, setEditLinkUrl] = useState('')
  const [editSubtext, setEditSubtext] = useState('Now in store & online')
  const [editAltText, setEditAltText] = useState('')

  const canAddMore = slides.length < HERO_SLIDE_MAX_COUNT
  const canDelete = slides.length > HERO_SLIDE_MIN_COUNT

  function startEdit(slide: HeroSlideRow) {
    setEditingSlideId(slide.id)
    setEditBadgeText(slide.badge_text)
    setEditBadgePreset(slide.badge_color_preset)
    setEditLinkUrl(slide.link_url)
    setEditSubtext(slide.subtext || 'Now in store & online')
    setEditAltText(slide.alt_text || '')
  }

  function cancelEdit() {
    setEditingSlideId(null)
  }

  async function handleSaveEdit(slide: HeroSlideRow) {
    setFeedback(null)
    startTransition(async () => {
      const res = await updateHeroSlideAction(slide.id, {
        image_url: slide.image_url,
        badge_text: editBadgeText,
        badge_color_preset: editBadgePreset,
        link_url: editLinkUrl,
        subtext: editSubtext,
        alt_text: editAltText,
        active: slide.active,
      })

      if (res.success) {
        setSlides((prev) =>
          prev.map((s) =>
            s.id === slide.id
              ? {
                  ...s,
                  badge_text: editBadgeText,
                  badge_color_preset: editBadgePreset,
                  link_url: editLinkUrl,
                  subtext: editSubtext,
                  alt_text: editAltText,
                }
              : s
          )
        )
        setEditingSlideId(null)
        setFeedback({ type: 'success', message: 'Slide updated successfully.' })
        router.refresh()
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to update slide.' })
      }
    })
  }

  async function handleDelete(slideId: string) {
    if (!canDelete) return
    if (!window.confirm('Are you sure you want to remove this slide from the hero carousel?')) {
      return
    }

    setFeedback(null)
    startTransition(async () => {
      const res = await deleteHeroSlideAction(slideId)
      if (res.success) {
        setSlides((prev) => prev.filter((s) => s.id !== slideId))
        setFeedback({ type: 'success', message: 'Slide deleted successfully.' })
        router.refresh()
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to delete slide.' })
      }
    })
  }

  async function handleMove(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= slides.length) return

    const reordered = [...slides]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, moved)

    setSlides(reordered)
    setFeedback(null)

    startTransition(async () => {
      const res = await reorderHeroSlidesAction(reordered.map((s) => s.id))
      if (res.success) {
        setFeedback({ type: 'success', message: 'Slide order updated.' })
        router.refresh()
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to reorder slides.' })
        setSlides(slides) // rollback
      }
    })
  }

  async function handleUpload(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFeedback({
        type: 'error',
        message: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.',
      })
      return
    }

    if (file.size > MAX_SIZE_BYTES) {
      setFeedback({
        type: 'error',
        message: `Image too large. Maximum file size is ${MAX_SIZE_MB}MB.`,
      })
      return
    }

    setIsUploading(true)
    setFeedback(null)

    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)
      const filePath = `hero-slides/${Date.now()}_${cleanFileName}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw new Error(uploadError.message)

      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(filePath)
      const publicUrl = urlData.publicUrl

      const res = await createHeroSlideAction({
        image_url: publicUrl,
        badge_text: newBadgeText,
        badge_color_preset: newBadgePreset,
        link_url: newLinkUrl,
        subtext: newSubtext,
        alt_text: newAltText || 'Hero slide image',
        active: true,
      })

      if (res.success) {
        setFeedback({ type: 'success', message: 'Hero slide uploaded and added!' })
        setNewAltText('')
        if (fileInputRef.current) fileInputRef.current.value = ''
        router.refresh()
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to save slide details.' })
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Upload failed. Please try again.',
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* DB Error Notice */}
      {dbError && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900 shadow-xs">
          <p className="font-semibold text-amber-950">Database Setup Notice</p>
          <p className="mt-1">
            The <code>hero_slides</code> table needs to be created in Supabase. Please run migration{' '}
            <code>supabase/migrations/014_hero_slides.sql</code> in your Supabase SQL Editor.
          </p>
        </div>
      )}

      {/* Feedback Toast Banner */}
      {feedback && (
        <div
          className={`rounded-xl border p-4 text-sm font-medium transition-all ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-rose-200 bg-rose-50 text-rose-900'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Header & Counter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hero Carousel Slides</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage images, promotional badges, and destination links shown in the homepage header slideshow.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              slides.length >= HERO_SLIDE_MAX_COUNT
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {slides.length} / {HERO_SLIDE_MAX_COUNT} Slides (Min: {HERO_SLIDE_MIN_COUNT})
          </span>
        </div>
      </div>

      {/* Slide List */}
      <div className="space-y-4">
        {slides.map((slide, index) => {
          const isEditing = editingSlideId === slide.id
          const preset = BADGE_COLOR_PRESETS[slide.badge_color_preset] || BADGE_COLOR_PRESETS.gold

          return (
            <div
              key={slide.id}
              className="flex flex-col md:flex-row md:items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs transition-all hover:border-slate-300"
            >
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
                {/* Reordering */}
                <button
                  type="button"
                  disabled={index === 0 || isPending}
                  onClick={() => handleMove(index, 'up')}
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
                  disabled={index === slides.length - 1 || isPending}
                  onClick={() => handleMove(index, 'down')}
                  aria-label="Move slide down"
                  title="Move slide down"
                  className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Edit Toggle */}
                <button
                  type="button"
                  onClick={() => (isEditing ? cancelEdit() : startEdit(slide))}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {isEditing ? 'Close' : 'Edit Badge / Text'}
                </button>

                {/* Delete */}
                <button
                  type="button"
                  disabled={!canDelete || isPending}
                  onClick={() => handleDelete(slide.id)}
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
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      maxLength={40}
                      value={editBadgeText}
                      onChange={(e) => setEditBadgeText(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      Subtext (Card Caption)
                    </label>
                    <input
                      type="text"
                      maxLength={60}
                      value={editSubtext}
                      onChange={(e) => setEditSubtext(e.target.value)}
                      placeholder="Now in store & online"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      Badge Color Preset
                    </label>
                    <select
                      value={editBadgePreset}
                      onChange={(e) => setEditBadgePreset(e.target.value as BadgeColorPresetKey)}
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
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      Destination Link
                    </label>
                    <input
                      type="text"
                      value={editLinkUrl}
                      onChange={(e) => setEditLinkUrl(e.target.value)}
                      placeholder="/products or /products?category=..."
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleSaveEdit(slide)}
                      className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Upload New Slide Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-1">Add New Hero Slide</h3>
        <p className="text-xs text-slate-500 mb-6">
          Upload a high-resolution vertical photo (recommended aspect ratio: 4:5 or portrait, e.g. 900×1100px). Max size {MAX_SIZE_MB}MB.
        </p>

        {!canAddMore ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-800">
            Maximum limit of {HERO_SLIDE_MAX_COUNT} slides reached. To add a new photo, please delete an existing slide first.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Badge Text
                </label>
                <input
                  type="text"
                  maxLength={40}
                  value={newBadgeText}
                  onChange={(e) => setNewBadgeText(e.target.value)}
                  placeholder="e.g. New Season Collection"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Subtext (Card Caption)
                </label>
                <input
                  type="text"
                  maxLength={60}
                  value={newSubtext}
                  onChange={(e) => setNewSubtext(e.target.value)}
                  placeholder="Now in store & online"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Badge Color Preset
                </label>
                <select
                  value={newBadgePreset}
                  onChange={(e) => setNewBadgePreset(e.target.value as BadgeColorPresetKey)}
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
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Destination Link
                </label>
                <input
                  type="text"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
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
                  if (file) handleUpload(file)
                }}
              />
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
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
              <span className="text-xs text-slate-400">Supported formats: JPG, PNG, WebP (Max 3MB)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

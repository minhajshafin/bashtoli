'use client'

import React, { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { HeroSlideRow } from '@/lib/queries/hero-slides'
import {
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
import { useAdminConfirm } from '@/components/admin/admin-confirm-dialog'
import { uploadAdminImageFile } from '@/lib/utils/admin-upload'
import { HeroSlideCard, type HeroSlideEditDraft } from '@/components/admin/hero-slide-card'
import { HeroSlideCreateForm } from '@/components/admin/hero-slide-create-form'

interface HeroSlidesManagerProps {
  initialSlides: HeroSlideRow[]
  dbError?: string | null
}

export function HeroSlidesManager({ initialSlides, dbError }: HeroSlidesManagerProps) {
  const router = useRouter()
  const confirm = useAdminConfirm()
  const [slides, setSlides] = useState<HeroSlideRow[]>(initialSlides)
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  )

  const [prevInitialSlides, setPrevInitialSlides] = useState(initialSlides)
  if (initialSlides !== prevInitialSlides) {
    setPrevInitialSlides(initialSlides)
    setSlides(initialSlides)
  }

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
  const [editDraft, setEditDraft] = useState<HeroSlideEditDraft>({
    badgeText: '',
    badgePreset: 'gold',
    linkUrl: '',
    subtext: 'Now in store & online',
    altText: '',
  })

  const canAddMore = slides.length < HERO_SLIDE_MAX_COUNT
  const canDelete = slides.length > HERO_SLIDE_MIN_COUNT

  function startEdit(slide: HeroSlideRow) {
    setEditingSlideId(slide.id)
    setEditDraft({
      badgeText: slide.badge_text,
      badgePreset: slide.badge_color_preset,
      linkUrl: slide.link_url,
      subtext: slide.subtext || 'Now in store & online',
      altText: slide.alt_text || '',
    })
  }

  function handleSaveEdit(slide: HeroSlideRow) {
    setFeedback(null)
    startTransition(async () => {
      const res = await updateHeroSlideAction(slide.id, {
        image_url: slide.image_url,
        badge_text: editDraft.badgeText,
        badge_color_preset: editDraft.badgePreset,
        link_url: editDraft.linkUrl,
        subtext: editDraft.subtext,
        alt_text: editDraft.altText,
        active: slide.active,
      })

      if (res.success) {
        setSlides((prev) =>
          prev.map((s) =>
            s.id === slide.id
              ? {
                  ...s,
                  badge_text: editDraft.badgeText,
                  badge_color_preset: editDraft.badgePreset,
                  link_url: editDraft.linkUrl,
                  subtext: editDraft.subtext,
                  alt_text: editDraft.altText,
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
    const ok = await confirm({
      title: 'Remove Hero Slide?',
      description:
        'Are you sure you want to remove this slide from the hero carousel? This will update the live storefront banner immediately.',
      confirmText: 'Remove Slide',
      cancelText: 'Cancel',
      variant: 'danger',
    })
    if (!ok) return

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

  function handleMove(index: number, direction: 'up' | 'down') {
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
        setSlides(slides)
      }
    })
  }

  async function handleUpload(file: File) {
    setIsUploading(true)
    setFeedback(null)

    try {
      const publicUrl = await uploadAdminImageFile({
        folder: 'hero-slides',
        file,
      })

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
        if (res.slide) {
          setSlides((prev) => [...prev, res.slide!])
        }
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
      {dbError && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900 shadow-xs">
          <p className="font-semibold text-amber-950">Database Setup Notice</p>
          <p className="mt-1">
            The <code>hero_slides</code> table needs to be created in Supabase. Please run migration{' '}
            <code>supabase/migrations/014_hero_slides.sql</code> in your Supabase SQL Editor.
          </p>
        </div>
      )}

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

      <div className="space-y-4">
        {slides.map((slide, index) => (
          <HeroSlideCard
            key={slide.id}
            slide={slide}
            index={index}
            totalSlides={slides.length}
            isEditing={editingSlideId === slide.id}
            isPending={isPending}
            canDelete={canDelete}
            draft={editDraft}
            onDraftChange={(patch) => setEditDraft((prev) => ({ ...prev, ...patch }))}
            onStartEdit={startEdit}
            onCancelEdit={() => setEditingSlideId(null)}
            onSaveEdit={handleSaveEdit}
            onDelete={handleDelete}
            onMove={handleMove}
          />
        ))}
      </div>

      <HeroSlideCreateForm
        canAddMore={canAddMore}
        isUploading={isUploading}
        fileInputRef={fileInputRef}
        badgeText={newBadgeText}
        badgePreset={newBadgePreset}
        linkUrl={newLinkUrl}
        subtext={newSubtext}
        onBadgeTextChange={setNewBadgeText}
        onBadgePresetChange={setNewBadgePreset}
        onLinkUrlChange={setNewLinkUrl}
        onSubtextChange={setNewSubtext}
        onUploadFile={handleUpload}
      />
    </div>
  )
}

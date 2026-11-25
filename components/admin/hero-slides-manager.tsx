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

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [newBadgeText, setNewBadgeText] = useState('New Collection')
  const [newBadgePreset, setNewBadgePreset] = useState<BadgeColorPresetKey>('gold')
  const [newLinkUrl, setNewLinkUrl] = useState('/products')
  const [newSubtext, setNewSubtext] = useState('Now in store & online')
  const [newAltText, setNewAltText] = useState('')

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
    <section className="space-y-6" aria-labelledby="hero-slides-heading">
      {dbError && (
        <div
          role="alert"
          className="rounded-2xl border border-adm-warning-border bg-adm-warning-bg p-5 text-sm text-adm-warning shadow-subtle"
        >
          <p className="font-semibold">Database Setup Notice</p>
          <p className="mt-1">
            The <code>hero_slides</code> table needs to be created in Supabase. Run migration{' '}
            <code>supabase/migrations/014_hero_slides.sql</code>.
          </p>
        </div>
      )}

      {feedback && (
        <div
          role={feedback.type === 'error' ? 'alert' : 'status'}
          className={`rounded-2xl border p-4 text-sm font-medium transition-colors ${
            feedback.type === 'success'
              ? 'border-adm-success-border bg-adm-success-bg text-adm-success'
              : 'border-adm-danger-border bg-adm-danger-bg text-adm-danger'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-adm-border pb-4">
        <h2 id="hero-slides-heading" className="admin-section-title text-adm-fg">
          Hero Slides
        </h2>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-mono text-xs font-semibold border ${
              slides.length >= HERO_SLIDE_MAX_COUNT
                ? 'bg-adm-warning-bg text-adm-warning border-adm-warning-border'
                : 'bg-adm-info-bg text-adm-info border-adm-info-border'
            }`}
          >
            {slides.length} / {HERO_SLIDE_MAX_COUNT} Slides
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
    </section>
  )
}

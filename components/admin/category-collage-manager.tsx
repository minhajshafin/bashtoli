'use client'

import React, { useState, useEffect, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  MAX_FEATURED_CATEGORIES,
  type FeaturedCategoryItem,
} from '@/lib/validations/category-collage'
import {
  toggleCategoryFeaturedAction,
  updateCategoryCoverImageAction,
  reorderFeaturedCategoriesAction,
} from '@/lib/actions/category-collage'
import { uploadAdminImageFile } from '@/lib/utils/admin-upload'
import { CollageSlotCard } from '@/components/admin/collage-slot-card'
import { CollageAvailableGrid } from '@/components/admin/collage-available-grid'

interface CategoryCollageManagerProps {
  initialFeatured: FeaturedCategoryItem[]
  initialAvailable: FeaturedCategoryItem[]
}

export function CategoryCollageManager({
  initialFeatured,
  initialAvailable,
}: CategoryCollageManagerProps) {
  const router = useRouter()
  const [featured, setFeatured] = useState<FeaturedCategoryItem[]>(initialFeatured)
  const [available, setAvailable] = useState<FeaturedCategoryItem[]>(initialAvailable)
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  )

  const [prevInitialFeatured, setPrevInitialFeatured] = useState(initialFeatured)
  if (initialFeatured !== prevInitialFeatured) {
    setPrevInitialFeatured(initialFeatured)
    setFeatured(initialFeatured)
  }

  const [prevInitialAvailable, setPrevInitialAvailable] = useState(initialAvailable)
  if (initialAvailable !== prevInitialAvailable) {
    setPrevInitialAvailable(initialAvailable)
    setAvailable(initialAvailable)
  }

  const [uploadingCatId, setUploadingCatId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const activeUploadCatIdRef = useRef<string | null>(null)

  useEffect(() => {
    const input = fileInputRef.current
    if (!input) return
    const handleCancel = () => {
      activeUploadCatIdRef.current = null
      setUploadingCatId(null)
    }
    input.addEventListener('cancel', handleCancel)
    return () => {
      input.removeEventListener('cancel', handleCancel)
    }
  }, [])

  const canAddMore = featured.length < MAX_FEATURED_CATEGORIES

  function handleToggle(cat: FeaturedCategoryItem, makeFeatured: boolean) {
    if (makeFeatured && !canAddMore) {
      setFeedback({
        type: 'error',
        message: `Maximum of ${MAX_FEATURED_CATEGORIES} categories can be featured in the collage.`,
      })
      return
    }

    setFeedback(null)
    startTransition(async () => {
      const res = await toggleCategoryFeaturedAction(cat.id, makeFeatured)
      if (res.success) {
        if (makeFeatured) {
          const updatedCat = { ...cat, is_featured: true, featured_order: featured.length + 1 }
          setFeatured([...featured, updatedCat])
          setAvailable(available.filter((c) => c.id !== cat.id))
          setFeedback({ type: 'success', message: `Added "${cat.name}" to homepage collage!` })
        } else {
          const updatedCat = { ...cat, is_featured: false, featured_order: 0 }
          setAvailable([...available, updatedCat])
          setFeatured(featured.filter((c) => c.id !== cat.id))
          setFeedback({ type: 'success', message: `Removed "${cat.name}" from homepage collage.` })
        }
        router.refresh()
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to update category.' })
      }
    })
  }

  function handleMove(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= featured.length) return

    const reordered = [...featured]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, moved)

    setFeatured(reordered)
    setFeedback(null)

    startTransition(async () => {
      const res = await reorderFeaturedCategoriesAction(reordered.map((c) => c.id))
      if (res.success) {
        setFeedback({ type: 'success', message: 'Category slot positions updated.' })
        router.refresh()
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to reorder categories.' })
        setFeatured(featured)
      }
    })
  }

  function triggerImageUpload(catId: string) {
    activeUploadCatIdRef.current = catId
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      fileInputRef.current.click()
    }
  }

  async function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    const catId = activeUploadCatIdRef.current

    if (!file || !catId) {
      setUploadingCatId(null)
      return
    }

    setUploadingCatId(catId)
    setFeedback(null)

    try {
      const publicUrl = await uploadAdminImageFile({
        folder: 'category-covers',
        filePrefix: `${catId}_`,
        file,
      })

      const res = await updateCategoryCoverImageAction(catId, publicUrl)
      if (res.success) {
        setFeatured((prev) =>
          prev.map((c) => (c.id === catId ? { ...c, image_url: publicUrl } : c))
        )
        setAvailable((prev) =>
          prev.map((c) => (c.id === catId ? { ...c, image_url: publicUrl } : c))
        )
        setFeedback({ type: 'success', message: 'Category cover photo updated!' })
        router.refresh()
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to save cover photo.' })
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Cover upload failed.',
      })
    } finally {
      setUploadingCatId(null)
      activeUploadCatIdRef.current = null
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <section
      className="space-y-6 pt-8 border-t border-adm-border"
      aria-labelledby="category-collage-heading"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleImageFileChange}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-adm-border pb-4">
        <h2 id="category-collage-heading" className="admin-section-title text-adm-fg">
          Category Collage
        </h2>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-mono text-xs font-semibold border ${
              featured.length >= MAX_FEATURED_CATEGORIES
                ? 'bg-adm-warning-bg text-adm-warning border-adm-warning-border'
                : 'bg-adm-info-bg text-adm-info border-adm-info-border'
            }`}
          >
            {featured.length} / {MAX_FEATURED_CATEGORIES} Slots
          </span>
        </div>
      </div>

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

      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-adm-muted uppercase tracking-wider">
          Active Slots
        </h3>

        {featured.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-adm-border bg-adm-surface p-8 text-center text-xs text-adm-muted">
            No featured collage categories selected.
          </div>
        ) : (
          <div className="space-y-3">
            {featured.map((cat, index) => (
              <CollageSlotCard
                key={cat.id}
                category={cat}
                index={index}
                totalFeatured={featured.length}
                isUploadingThis={uploadingCatId === cat.id}
                isPending={isPending}
                onMove={handleMove}
                onUploadTrigger={triggerImageUpload}
                onRemove={(c) => handleToggle(c, false)}
              />
            ))}
          </div>
        )}
      </div>

      <CollageAvailableGrid
        available={available}
        canAddMore={canAddMore}
        isPending={isPending}
        onAdd={(c) => handleToggle(c, true)}
      />
    </section>
  )
}

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
    <div className="space-y-8 pt-6 border-t border-slate-200">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleImageFileChange}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Category Grid Collage</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select up to 7 categories to showcase in the asymmetric homepage collage. Slots #1 &amp; #3 are prominent tall vertical cards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              featured.length >= MAX_FEATURED_CATEGORIES
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {featured.length} / {MAX_FEATURED_CATEGORIES} Slots Filled
          </span>
        </div>
      </div>

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

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          Current Collage Slots
        </h3>

        {featured.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-xs text-slate-500">
            No categories are currently featured on the homepage collage. Select categories from the list below to populate the 7 slots.
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
    </div>
  )
}

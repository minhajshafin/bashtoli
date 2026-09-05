'use client'

import React, { useState, useEffect, useTransition, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  COLLAGE_SLOT_CONFIGS,
  MAX_FEATURED_CATEGORIES,
  type FeaturedCategoryItem,
} from '@/lib/validations/category-collage'
import {
  toggleCategoryFeaturedAction,
  updateCategoryCoverImageAction,
  reorderFeaturedCategoriesAction,
} from '@/lib/actions/category-collage'

interface CategoryCollageManagerProps {
  initialFeatured: FeaturedCategoryItem[]
  initialAvailable: FeaturedCategoryItem[]
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_MB = 3
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

function generateCoverFilePath(catId: string, fileName: string): string {
  const fileExt = fileName.split('.').pop()
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)
  return `category-covers/${catId}_${Date.now()}_${cleanFileName}.${fileExt}`
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

  // Uploading cover state
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

  async function handleToggle(cat: FeaturedCategoryItem, makeFeatured: boolean) {
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

  async function handleMove(index: number, direction: 'up' | 'down') {
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
        setFeatured(featured) // rollback
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

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFeedback({
        type: 'error',
        message: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.',
      })
      setUploadingCatId(null)
      return
    }

    if (file.size > MAX_SIZE_BYTES) {
      setFeedback({
        type: 'error',
        message: `Image too large. Maximum file size is ${MAX_SIZE_MB}MB.`,
      })
      setUploadingCatId(null)
      return
    }

    setUploadingCatId(catId)
    setFeedback(null)

    try {
      const supabase = createClient()
      const filePath = generateCoverFilePath(catId, file.name)

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw new Error(uploadError.message)

      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(filePath)
      const publicUrl = urlData.publicUrl

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
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleImageFileChange}
      />

      {/* Header & Status */}
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

      {/* Featured Slots List */}
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
            {featured.map((cat, index) => {
              const slotConfig = COLLAGE_SLOT_CONFIGS[index] || {
                slot: index + 1,
                name: `Slot ${index + 1}`,
                desc: '',
              }

              const isUploadingThis = uploadingCatId === cat.id

              return (
                <div
                  key={cat.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition-all hover:border-slate-300"
                >
                  {/* Left: Slot position & Category info */}
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Thumbnail */}
                    <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                      {cat.image_url ? (
                        <Image
                          src={cat.image_url}
                          alt={cat.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center p-2 text-center text-[10px] text-slate-400">
                          <span>No cover</span>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-forest-800 text-gold-400">
                          Slot {index + 1}: {slotConfig.name}
                        </span>
                        {slotConfig.desc && (
                          <span className="text-[10px] text-slate-400">({slotConfig.desc})</span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 truncate">{cat.name}</h4>
                      <p className="text-xs text-slate-500">
                        {cat.product_count ?? 0} active products · Slug: <code>{cat.slug}</code>
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {/* Reordering */}
                    <button
                      type="button"
                      disabled={index === 0 || isPending}
                      onClick={() => handleMove(index, 'up')}
                      aria-label="Move slot up"
                      title="Move slot up"
                      className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      disabled={index === featured.length - 1 || isPending}
                      onClick={() => handleMove(index, 'down')}
                      aria-label="Move slot down"
                      title="Move slot down"
                      className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Change Cover Photo */}
                    <button
                      type="button"
                      disabled={isUploadingThis || isPending}
                      onClick={() => triggerImageUpload(cat.id)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      {isUploadingThis ? 'Uploading...' : cat.image_url ? 'Change Photo' : 'Upload Photo'}
                    </button>

                    {/* Remove from Homepage */}
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleToggle(cat, false)}
                      className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Available Categories Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Available Categories</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Add any of your remaining store categories into the homepage collage.
          </p>
        </div>

        {!canAddMore ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-800">
            All {MAX_FEATURED_CATEGORIES} slots are occupied in the collage. To feature a different category, click &ldquo;Remove&rdquo; on an existing slot above.
          </div>
        ) : available.length === 0 ? (
          <p className="text-xs text-slate-400 italic">
            All existing categories are currently featured in the collage.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {available.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all"
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{cat.name}</h4>
                  <p className="text-[11px] text-slate-500">{cat.product_count ?? 0} items</p>
                </div>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleToggle(cat, true)}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer shrink-0"
                >
                  + Add to Collage
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

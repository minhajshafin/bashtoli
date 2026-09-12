'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import {
  deleteProductImage,
  updateProductImageAlt,
  saveProductImageOrder,
} from '@/lib/actions/product-images'
import { useAdminConfirm } from '@/components/admin/admin-confirm-dialog'
import type { Database } from '@/lib/supabase/database.types'

type ImageRow = Database['public']['Tables']['product_images']['Row']

export function ImageGalleryAdmin({
  images,
}: {
  images: ImageRow[]
}) {
  const router = useRouter()
  const confirm = useAdminConfirm()
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Sort local images array to ensure order matches sort_order
  const sortedImages = [...images].sort((a, b) => a.sort_order - b.sort_order)

  async function handleDelete(imageId: string) {
    const ok = await confirm({
      title: 'Delete Product Image?',
      description:
        'Are you sure you want to delete this image? It will be permanently removed from the product gallery.',
      confirmText: 'Delete Image',
      cancelText: 'Cancel',
      variant: 'danger',
    })
    if (!ok) return

    setError(null)
    setDeletingId(imageId)
    startTransition(async () => {
      try {
        const res = await deleteProductImage(imageId)
        if (res.error) {
          setError(res.error)
        } else {
          router.refresh()
        }
      } finally {
        setDeletingId(null)
      }
    })
  }

  async function handleAltSave(imageId: string, altText: string) {
    const current = images.find((i) => i.id === imageId)
    if (current && (current.alt_text ?? '') === altText.trim()) {
      return
    }

    setError(null)
    setSuccessMsg(null)
    const res = await updateProductImageAlt(imageId, altText.trim())
    if (res.error) {
      setError(res.error)
    } else {
      // Replace blocking alert() with inline feedback (BUG-4)
      setSuccessMsg('Alt text saved.')
      setTimeout(() => setSuccessMsg(null), 3000)
      router.refresh()
    }
  }

  async function moveImage(currentIndex: number, direction: 'left' | 'right') {
    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= sortedImages.length) {
      return
    }

    setError(null)

    // Swap sort_order between the two items
    const updatedImages = [...sortedImages]
    const currentSort = updatedImages[currentIndex].sort_order
    const targetSort = updatedImages[targetIndex].sort_order

    // Optimistically update positions locally or submit
    startTransition(async () => {
      const res = await saveProductImageOrder([
        { id: updatedImages[currentIndex].id, sort_order: targetSort },
        { id: updatedImages[targetIndex].id, sort_order: currentSort },
      ])

      if (res.error) {
        setError(res.error)
      } else {
        router.refresh()
      }
    })
  }

  if (images.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-400 bg-white p-6 shadow-sm">
        No images uploaded yet. Use the uploader below to add product photos.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-900">Product Gallery</h2>
        <p className="text-xs text-slate-500">
          Manage product images, update alt texts, and adjust display ordering.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {error}
        </div>
      )}

      {successMsg && (
        <div
          role="status"
          className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sortedImages.map((img, index) => {
          return (
            <div
              key={img.id}
              className="flex flex-col rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs group"
            >
              {/* Image Preview Container */}
              <div className="relative aspect-square w-full bg-slate-50 border-b border-slate-100 flex items-center justify-center overflow-hidden">
                <Image
                  src={img.url}
                  alt={img.alt_text ?? 'Product Image'}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain p-2"
                  unoptimized // avoid next image optimization limits on external storage domains
                />

                {/* Badge showing index / order */}
                <span className="absolute top-2 left-2 rounded-md bg-slate-950/75 px-2 py-0.5 text-xs font-semibold text-white">
                  Pos {index + 1}
                </span>

                {/* Delete overlay button */}
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDelete(img.id)}
                  aria-label="Delete image"
                  title="Delete image"
                  className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-white hover:bg-rose-700 hover:scale-105 active:scale-95 transition-all shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingId === img.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Image Actions & Alt Text Edit */}
              <div className="flex-1 p-3 space-y-3 flex flex-col justify-between">
                {/* Alt Text input */}
                <div className="space-y-1">
                  <label
                    htmlFor={`alt-${img.id}`}
                    className="text-[10px] font-bold uppercase tracking-wider text-slate-400"
                  >
                    Alt Text
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      id={`alt-${img.id}`}
                      type="text"
                      maxLength={150}
                      defaultValue={img.alt_text ?? ''}
                      placeholder="e.g. Fine Bamboo Chair angle view"
                      onBlur={(e) => handleAltSave(img.id, e.target.value)}
                      className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Move Actions */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                  <button
                    type="button"
                    disabled={index === 0 || isPending}
                    onClick={() => moveImage(index, 'left')}
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white"
                  >
                    ← Move Left
                  </button>

                  <button
                    type="button"
                    disabled={index === sortedImages.length - 1 || isPending}
                    onClick={() => moveImage(index, 'right')}
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white"
                  >
                    Move Right →
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

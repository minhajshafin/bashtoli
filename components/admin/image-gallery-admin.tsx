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
      setSuccessMsg('Alt text saved.')
      setTimeout(() => setSuccessMsg(null), 3000)
      router.refresh()
    }
  }

  function moveImage(currentIndex: number, direction: 'left' | 'right') {
    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= sortedImages.length) {
      return
    }

    setError(null)

    const updatedImages = [...sortedImages]
    const currentSort = updatedImages[currentIndex].sort_order
    const targetSort = updatedImages[targetIndex].sort_order

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
      <div className="rounded-xl border border-dashed border-ink-400/70 py-10 text-center text-sm text-ink-600 bg-paper-100/70 p-6">
        No images uploaded yet. Use the uploader below to add product photos.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-signal-danger-border bg-signal-danger-bg px-4 py-3 text-sm font-medium text-signal-danger"
        >
          {error}
        </div>
      )}

      {successMsg && (
        <div
          role="status"
          className="rounded-xl border border-ink-800 bg-ink-950 px-4 py-3 text-sm font-medium text-paper-50"
        >
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sortedImages.map((img, index) => (
          <div
            key={img.id}
            className="flex flex-col rounded-2xl border border-paper-300 bg-paper-50 overflow-hidden shadow-subtle group"
          >
            {/* Image Preview Container */}
            <div className="relative aspect-square w-full bg-paper-200/70 border-b border-paper-300 flex items-center justify-center overflow-hidden">
              <Image
                src={img.url}
                alt={img.alt_text ?? 'Product Image'}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-contain p-2"
                unoptimized
              />

              <span className="absolute top-2.5 left-2.5 rounded-lg bg-ink-950 px-2.5 py-1 font-mono text-[11px] font-bold text-paper-50">
                POS {index + 1}
              </span>

              <button
                type="button"
                disabled={isPending}
                onClick={() => handleDelete(img.id)}
                aria-label={`Delete image ${index + 1}`}
                title="Delete image"
                className="absolute top-2.5 right-2.5 flex min-h-[38px] min-w-[38px] items-center justify-center rounded-xl bg-signal-danger text-paper-50 hover:bg-signal-danger-hover active:scale-95 transition-[transform,opacity,background-color] shadow-elevation-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingId === img.id ? (
                  <Loader2 className="h-4 w-4 animate-spin text-paper-50" aria-hidden="true" />
                ) : (
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>

            {/* Image Actions & Alt Text Edit */}
            <div className="flex-1 p-3.5 space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <label
                  htmlFor={`alt-${img.id}`}
                  className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-600"
                >
                  Alt Text
                </label>
                <input
                  id={`alt-${img.id}`}
                  type="text"
                  maxLength={150}
                  defaultValue={img.alt_text ?? ''}
                  placeholder="e.g. Fine Bamboo Chair angle view"
                  onBlur={(e) => handleAltSave(img.id, e.target.value)}
                  className="w-full min-h-[38px] rounded-lg border border-ink-400/80 bg-paper-50 px-2.5 py-1.5 text-xs text-ink-950 placeholder:text-ink-500 focus-visible:outline-2 focus-visible:outline-ink-950 focus-visible:outline-offset-1"
                />
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-paper-200 pt-2.5">
                <button
                  type="button"
                  disabled={index === 0 || isPending}
                  onClick={() => moveImage(index, 'left')}
                  className="min-h-[36px] rounded-lg border border-paper-300 bg-paper-50 px-2.5 py-1 text-xs font-semibold text-ink-900 hover:bg-paper-200 disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  ← Move Left
                </button>

                <button
                  type="button"
                  disabled={index === sortedImages.length - 1 || isPending}
                  onClick={() => moveImage(index, 'right')}
                  className="min-h-[36px] rounded-lg border border-paper-300 bg-paper-50 px-2.5 py-1 text-xs font-semibold text-ink-900 hover:bg-paper-200 disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Move Right →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

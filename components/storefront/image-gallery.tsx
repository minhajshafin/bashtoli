'use client'

import Image from 'next/image'
import React, { useState } from 'react'

interface ProductImage {
  id: string
  url: string
  alt_text: string | null
  sort_order: number
}

interface ImageGalleryProps {
  images: ProductImage[]
  fallbackName: string
}

export function ImageGallery({ images, fallbackName }: ImageGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const minSwipeDistance = 50

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      setActiveIdx((prev) => (prev + 1) % images.length)
    } else if (isRightSwipe) {
      setActiveIdx((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  if (images.length === 0) {
    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-zinc-50 border border-zinc-200 flex items-center justify-center dark:bg-zinc-900 dark:border-zinc-800">
        <div className="flex flex-col items-center justify-center text-zinc-400">
          <svg
            className="h-16 w-16 stroke-[1.2]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="mt-2 text-xs font-medium">No images available</span>
        </div>
      </div>
    )
  }

  const activeImage = images[activeIdx]

  return (
    <div className="flex flex-col gap-4">
      {/* Primary Display */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative aspect-square w-full overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <Image
          src={activeImage.url}
          alt={activeImage.alt_text || fallbackName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-all duration-300"
        />
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
          {images.map((img, idx) => {
            const isActive = idx === activeIdx
            return (
              <button
                key={img.id}
                onClick={() => setActiveIdx(idx)}
                className={`relative h-20 w-20 flex-none overflow-hidden rounded-2xl border transition-all duration-200 ${
                  isActive
                    ? 'border-amber-600 ring-2 ring-amber-600/20 scale-95 opacity-100'
                    : 'border-zinc-200 opacity-60 hover:opacity-100 dark:border-zinc-800'
                }`}
                aria-label={`View image ${idx + 1}`}
              >
                <Image
                  src={img.url}
                  alt={img.alt_text || `Thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

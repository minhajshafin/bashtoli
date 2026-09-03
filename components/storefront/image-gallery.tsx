'use client'

import Image from 'next/image'
import React, { useState } from 'react'
import { ProductImageSkeleton } from '@/components/storefront/product-image-skeleton'

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
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})

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
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-forest-200">
        <ProductImageSkeleton size="lg" />
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
        className="relative aspect-square w-full overflow-hidden rounded-3xl border border-forest-200 bg-cream-100"
      >
        <Image
          src={failedImages[activeImage.url] ? '/placeholder-product.svg' : activeImage.url}
          alt={activeImage.alt_text || fallbackName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-all duration-300"
          onError={() => setFailedImages((prev) => ({ ...prev, [activeImage.url]: true }))}
        />
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {images.map((img, idx) => {
            const isActive = idx === activeIdx
            return (
              <button
                key={img.id}
                onClick={() => setActiveIdx(idx)}
                className={`relative h-20 w-20 flex-none overflow-hidden rounded-2xl border transition-all duration-200 ${
                  isActive
                    ? 'border-gold-500 ring-2 ring-gold-500/20 scale-95 opacity-100'
                    : 'border-forest-200 opacity-60 hover:opacity-100'
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


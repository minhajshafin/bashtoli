'use client'

import Image from 'next/image'
import React, { useState, useEffect } from 'react'
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const minSwipeDistance = 50

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false)
      if (e.key === 'ArrowRight') setActiveIdx((prev) => (prev + 1) % images.length)
      if (e.key === 'ArrowLeft') setActiveIdx((prev) => (prev - 1 + images.length) % images.length)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLightboxOpen, images.length])

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

    if (isLeftSwipe && images.length > 1) {
      setActiveIdx((prev) => (prev + 1) % images.length)
    } else if (isRightSwipe && images.length > 1) {
      setActiveIdx((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  if (images.length === 0) {
    return (
      <div className="relative aspect-square w-full max-w-[460px] lg:max-w-[480px] max-h-[calc(100dvh-12rem)] overflow-hidden rounded-2xl border border-forest-200/80 bg-cream-100/70">
        <ProductImageSkeleton size="lg" />
      </div>
    )
  }

  const activeImage = images[activeIdx]

  return (
    <>
      <div className="flex flex-col gap-2.5 w-full max-w-[460px] lg:max-w-[480px]">
        {/* Primary Display Frame */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={() => setIsLightboxOpen(true)}
          className="group relative aspect-square w-full max-h-[calc(100dvh-12rem)] overflow-hidden rounded-2xl border border-forest-200/80 bg-cream-100/70 shadow-xs cursor-zoom-in"
          title="Click to inspect high-resolution view"
        >
          <Image
            src={failedImages[activeImage.url] ? '/placeholder-product.svg' : activeImage.url}
            alt={activeImage.alt_text || fallbackName}
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 500px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            onError={() => setFailedImages((prev) => ({ ...prev, [activeImage.url]: true }))}
          />

          {/* Floating Slides / Counter Indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 z-10 rounded-full bg-forest-950/75 backdrop-blur-xs px-2.5 py-1 text-[10px] font-mono font-medium text-cream-100 tracking-wider shadow-sm border border-forest-800/80 select-none">
              {String(activeIdx + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
            </div>
          )}

          {/* Hover Zoom Prompt Badge (Desktop) */}
          <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 hidden sm:flex items-center gap-1.5 rounded-full bg-forest-950/65 backdrop-blur-xs px-2.5 py-1 text-[11px] font-sans font-medium text-cream-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-forest-800/60 select-none">
            <svg className="h-3.5 w-3.5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
            </svg>
            <span>Inspect</span>
          </div>
        </div>

        {/* Thumbnails Row */}
        {images.length > 1 && (
          <div
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
            style={{ overflowAnchor: 'none' }}
          >
            {images.map((img, idx) => {
              const isActive = idx === activeIdx
              return (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  className={`relative h-14 w-14 sm:h-16 sm:w-16 flex-none overflow-hidden rounded-xl border transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'border-gold-500 ring-2 ring-gold-500/30 scale-[0.97] opacity-100 shadow-xs'
                      : 'border-forest-200/80 bg-cream-100/50 opacity-65 hover:opacity-100 hover:border-gold-400/60'
                  }`}
                  aria-label={`View image ${idx + 1}`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt_text || `Thumbnail ${idx + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="High-resolution image inspection"
          className="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/95 backdrop-blur-md p-4 sm:p-8 animate-fade-in"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-forest-900/80 text-cream-100 hover:text-gold-400 border border-forest-700/80 transition-colors cursor-pointer"
            aria-label="Close image inspection"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous / Next buttons */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveIdx((prev) => (prev - 1 + images.length) % images.length)
                }}
                className="absolute left-4 sm:left-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-forest-900/80 text-cream-100 hover:text-gold-400 border border-forest-700/80 transition-colors cursor-pointer"
                aria-label="Previous image"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveIdx((prev) => (prev + 1) % images.length)
                }}
                className="absolute right-4 sm:right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-forest-900/80 text-cream-100 hover:text-gold-400 border border-forest-700/80 transition-colors cursor-pointer"
                aria-label="Next image"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </>
          )}

          {/* Large image preview */}
          <div
            className="relative h-full max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={failedImages[activeImage.url] ? '/placeholder-product.svg' : activeImage.url}
              alt={activeImage.alt_text || fallbackName}
              fill
              sizes="(max-width: 1200px) 90vw, 1200px"
              className="object-contain"
            />
          </div>

          {/* Lightbox footer caption */}
          <div className="absolute bottom-4 inset-x-0 text-center text-xs font-mono text-cream-200/80">
            {activeImage.alt_text || fallbackName} &bull; {activeIdx + 1} of {images.length}
          </div>
        </div>
      )}
    </>
  )
}


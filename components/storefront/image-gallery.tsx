'use client'

import Image from 'next/image'
import Link from 'next/link'
import React, { useState, useEffect, useRef } from 'react'
import { ProductImageSkeleton } from '@/components/storefront/product-image-skeleton'
import { WishlistButton } from '@/components/storefront/wishlist-button'

interface ProductImage {
  id: string
  url: string
  alt_text: string | null
  sort_order: number
}

interface ImageGalleryProps {
  images: ProductImage[]
  fallbackName: string
  productId?: string
  productName?: string
  isLoggedIn?: boolean
  initialIsWishlisted?: boolean
}

export function ImageGallery({
  images,
  fallbackName,
  productId,
  productName,
  isLoggedIn,
  initialIsWishlisted,
}: ImageGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const isSwiping = useRef(false)

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
    isSwiping.current = false
    touchStartX.current = e.targetTouches[0].clientX
    touchStartY.current = e.targetTouches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const diffX = Math.abs(e.targetTouches[0].clientX - touchStartX.current)
    const diffY = Math.abs(e.targetTouches[0].clientY - touchStartY.current)
    if (diffX > 10 && diffX > diffY) {
      isSwiping.current = true
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const endX = e.changedTouches[0].clientX
    const endY = e.changedTouches[0].clientY
    const diffX = touchStartX.current - endX
    const diffY = touchStartY.current !== null ? Math.abs(touchStartY.current - endY) : 0

    if (Math.abs(diffX) > diffY && Math.abs(diffX) > minSwipeDistance && images.length > 1) {
      if (diffX > 0) {
        // Swipe left -> next image
        setActiveIdx((prev) => (prev + 1) % images.length)
      } else {
        // Swipe right -> previous image
        setActiveIdx((prev) => (prev - 1 + images.length) % images.length)
      }
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  if (images.length === 0) {
    return (
      <div className="-mx-4 sm:mx-0 w-[calc(100%+2rem)] sm:w-full relative aspect-[4/3] sm:aspect-square max-w-none sm:max-w-[460px] lg:max-w-[480px] max-h-[calc(100dvh-12rem)] overflow-hidden rounded-b-2xl sm:rounded-2xl border-b sm:border border-forest-200/80 bg-cream-100/70">
        <Link
          href="/products"
          className="sm:hidden absolute top-3 left-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-forest-950/70 backdrop-blur-md text-cream-100 border border-white/10 active:scale-90 transition-transform shadow-sm"
          aria-label="Back to all products"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </Link>
        {productId && (
          <div className="sm:hidden absolute top-3 right-3 z-20">
            <WishlistButton
              productId={productId}
              productName={productName || fallbackName}
              isLoggedIn={isLoggedIn}
              initialIsWishlisted={initialIsWishlisted}
              variant="card"
            />
          </div>
        )}
        <ProductImageSkeleton size="lg" />
      </div>
    )
  }

  const activeImage = images[activeIdx]

  return (
    <>
      <div className="-mx-4 sm:mx-0 w-[calc(100%+2rem)] sm:w-full flex flex-col gap-2.5 max-w-none sm:max-w-[460px] lg:max-w-[480px]">
        {/* Primary Display Frame */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={() => {
            if (!isSwiping.current) setIsLightboxOpen(true)
          }}
          className="group relative aspect-[4/3] sm:aspect-square w-full max-h-[calc(100dvh-12rem)] overflow-hidden rounded-b-2xl sm:rounded-2xl border-b sm:border border-forest-200/80 bg-cream-100/70 shadow-xs cursor-zoom-in select-none"
          title="Click to inspect high-resolution view"
        >
          {/* Mobile Floating Back Button */}
          <Link
            href="/products"
            onClick={(e) => e.stopPropagation()}
            className="sm:hidden absolute top-3 left-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-forest-950/70 backdrop-blur-md text-cream-100 border border-white/10 active:scale-90 transition-transform shadow-sm"
            aria-label="Back to all products"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </Link>

          {/* Mobile Floating Wishlist Button */}
          {productId && (
            <div
              className="sm:hidden absolute top-3 right-3 z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <WishlistButton
                productId={productId}
                productName={productName || fallbackName}
                isLoggedIn={isLoggedIn}
                initialIsWishlisted={initialIsWishlisted}
                variant="card"
              />
            </div>
          )}

          <Image
            key={activeImage.id || activeIdx}
            src={failedImages[activeImage.url] ? '/placeholder-product.svg' : activeImage.url}
            alt={activeImage.alt_text || fallbackName}
            fill
            priority={activeIdx === 0}
            loading={activeIdx === 0 ? undefined : 'lazy'}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 500px"
            className="object-cover transition-all duration-300 group-hover:scale-[1.02]"
            onError={() => setFailedImages((prev) => ({ ...prev, [activeImage.url]: true }))}
          />

          {/* Mobile Centered Carousel Indicator Dots */}
          {images.length > 1 && (
            <div className="sm:hidden absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-forest-950/70 backdrop-blur-md border border-forest-800/60 shadow-xs">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveIdx(idx)
                  }}
                  aria-label={`Go to image ${idx + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    idx === activeIdx
                      ? 'w-4 h-1.5 bg-gold-400'
                      : 'w-1.5 h-1.5 bg-cream-100/40 hover:bg-cream-100/70'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Desktop Floating Slides / Counter Indicator */}
          {images.length > 1 && (
            <div className="hidden sm:block absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 z-10 rounded-full bg-forest-950/75 backdrop-blur-xs px-2.5 py-1 text-[10px] font-mono font-medium text-cream-100 tracking-wider shadow-sm border border-forest-800/80 select-none">
              {String(activeIdx + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
            </div>
          )}

          {/* Hover Zoom Prompt Badge (Desktop) */}
          <div
            aria-hidden="true"
            className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 hidden sm:flex items-center gap-1.5 rounded-full bg-forest-950/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-sans font-medium text-cream-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-forest-800/80 select-none pointer-events-none"
          >
            <svg className="h-3.5 w-3.5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
            </svg>
            <span>Inspect</span>
          </div>
        </div>

        {/* Thumbnails Row */}
        {images.length > 1 && (
          <div
            className="flex gap-2 overflow-x-auto px-4 sm:px-0 pb-1 scrollbar-none pt-1"
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


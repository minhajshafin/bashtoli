'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ProductWithDetails } from '@/lib/queries/products'
import { WishlistButton } from '@/components/storefront/wishlist-button'
import { useCart } from '@/lib/cart/cart-context'
import { useToast } from '@/components/ui/toast'
import { startRouteProgress } from '@/components/storefront/route-progress-bar'
import { formatPrice } from '@/lib/utils/format-price'

interface ProductCardProps {
  product: ProductWithDetails
  loading?: 'lazy' | 'eager'
  priority?: boolean
}

export const ProductCard = React.memo(function ProductCard({ product, loading = 'lazy', priority = false }: ProductCardProps) {
  const router = useRouter()
  const [hovered, setHovered] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [isJustAdded, setIsJustAdded] = useState(false)
  const { addItem } = useCart()
  const { toast } = useToast()

  const hasPrefetchedRef = React.useRef(false)
  const handleIntentPrefetch = React.useCallback(() => {
    if (!hasPrefetchedRef.current) {
      hasPrefetchedRef.current = true
      router.prefetch(`/products/${product.slug}`)
    }
  }, [router, product.slug])

  const activeVariants = product.product_variants.filter((v) => v.active)

  const lowestPrice =
    activeVariants.length > 0
      ? Math.min(...activeVariants.map((v) => v.price))
      : product.base_price

  const isSoldOut =
    activeVariants.length > 0 && activeVariants.every((v) => v.stock_qty === 0)

  const primaryImage =
    product.product_images?.find((img) => (img as { is_primary?: boolean }).is_primary) ||
    product.product_images?.[0]
  const secondaryImage =
    product.product_images && product.product_images.length > 1
      ? product.product_images.find((img) => img.id !== primaryImage?.id) || product.product_images[1]
      : null

  const imageUrl = primaryImage?.url || null
  const altText = primaryImage?.alt_text || product.name
  const secondaryImageUrl = secondaryImage?.url || null
  const secondaryAltText = secondaryImage?.alt_text || `${product.name} alternate view`

  // Helper to resolve target variant for cart operations
  const getTargetVariant = () => {
    return activeVariants.find((v) => v.stock_qty > 0) || activeVariants[0]
  }

  // Quick Add to Bag (keeps user on current page and shows toast memo)
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isSoldOut) {
      toast('This product is currently sold out.', 'info')
      return
    }

    const targetVariant = getTargetVariant()
    if (!targetVariant) {
      toast('No available variants for this item.', 'error')
      return
    }

    const variantLabel =
      targetVariant.option_values && Object.keys(targetVariant.option_values).length > 0
        ? Object.values(targetVariant.option_values).join(' / ')
        : 'Standard'

    addItem(
      {
        variant_id: targetVariant.id,
        product_id: product.id,
        name: product.name,
        variant_name: variantLabel,
        price: targetVariant.price,
        image_url: imageUrl,
      },
      1
    )

    setIsJustAdded(true)
    setTimeout(() => setIsJustAdded(false), 1300)

    toast(`Added "${product.name}" to your bag!`, 'success')
  }

  // Direct Buy / Purchase (adds to bag and redirects immediately to checkout)
  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isSoldOut) {
      toast('This product is currently sold out.', 'info')
      return
    }

    const targetVariant = getTargetVariant()
    if (!targetVariant) {
      toast('No available variants for this item.', 'error')
      return
    }

    const variantLabel =
      targetVariant.option_values && Object.keys(targetVariant.option_values).length > 0
        ? Object.values(targetVariant.option_values).join(' / ')
        : 'Standard'

    addItem(
      {
        variant_id: targetVariant.id,
        product_id: product.id,
        name: product.name,
        variant_name: variantLabel,
        price: targetVariant.price,
        image_url: imageUrl,
      },
      1
    )

    setIsNavigating(true)
    startRouteProgress()
    router.push('/checkout')
  }

  return (
    <div
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-bg-surface-elevated/90 hover:bg-bg-surface-elevated border border-forest-900/[0.08] hover:border-gold-500/40 transition-[border-color,box-shadow,transform] duration-300 ease-out shadow-xs hover:shadow-elevation-2 hover:-translate-y-0.5 select-none"
      onMouseEnter={() => {
        setHovered(true)
        handleIntentPrefetch()
      }}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={handleIntentPrefetch}
    >
      {/* 1. Product Image Canvas (Aspect 4:5 for stationery goods) */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream-100/30">
        <Link
          href={`/products/${product.slug}`}
          prefetch={false}
          className="absolute inset-0 block w-full h-full overflow-hidden"
          tabIndex={-1}
          aria-hidden="true"
          onMouseEnter={handleIntentPrefetch}
          onTouchStart={handleIntentPrefetch}
        >
          {imageUrl ? (
            <>
              <Image
                src={imageUrl}
                alt={altText}
                fill
                priority={priority ? true : undefined}
                quality={75}
                loading={priority ? undefined : loading}
                fetchPriority={priority ? 'high' : undefined}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                style={{
                  filter: isSoldOut ? 'grayscale(0.4) opacity(0.8)' : 'none',
                }}
              />
              {secondaryImageUrl && (
                <Image
                  src={secondaryImageUrl}
                  alt={secondaryAltText}
                  fill
                  quality={70}
                  loading="lazy"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
                  className="object-cover transition-opacity duration-500 ease-out"
                  style={{
                    opacity: hovered ? 1 : 0,
                    filter: isSoldOut ? 'grayscale(0.4) opacity(0.8)' : 'none',
                  }}
                />
              )}
            </>
          ) : (
            <div className="relative flex h-full w-full flex-col items-center justify-center bg-cream-100/50 text-forest-700/40">
              <svg
                className="h-9 w-9 stroke-[1.2] opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                />
              </svg>
              <span className="text-[9px] tracking-widest uppercase mt-2 opacity-60 font-sans">
                Handcrafted
              </span>
            </div>
          )}
        </Link>

        {/* 2. Top Badges & Floating Actions */}
        <div className="absolute top-2 inset-x-2 z-20 flex items-center justify-between pointer-events-none">
          <div>
            {isSoldOut ? (
              <span className="inline-flex items-center rounded-full bg-terracotta-100/95 text-terracotta-800 border border-terracotta-300/60 px-2 py-0.5 text-[9px] font-sans font-medium tracking-wider uppercase shadow-2xs pointer-events-auto">
                Sold Out
              </span>
            ) : (
              <div className="relative flex items-center">
                {/* Resting Curation Badge */}
                <span
                  className={`inline-flex items-center rounded-full bg-cream-50/95 text-forest-800/90 border border-forest-900/10 px-2 py-0.5 text-[9px] font-sans font-medium tracking-wider uppercase shadow-2xs transition-opacity duration-200 truncate max-w-[110px] ${
                    hovered || isJustAdded ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
                  }`}
                >
                  {product.featured ? 'Featured' : (product.categories?.name || 'Artisanal')}
                </span>

                {/* Hover Quick Add to Bag Action */}
                <div
                  className="absolute top-0 left-0 transition-[opacity,transform] duration-200 pointer-events-none"
                  style={{
                    opacity: hovered || isJustAdded ? 1 : 0,
                    transform: hovered || isJustAdded ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(-2px)',
                    pointerEvents: hovered || isJustAdded ? 'auto' : 'none',
                  }}
                >
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    aria-label={`Add ${product.name} to bag`}
                    title={isJustAdded ? 'Added to Bag' : '+ Add to Bag'}
                    className={`h-6.5 px-2.5 rounded-full text-[10px] font-sans font-semibold tracking-wide flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer pointer-events-auto whitespace-nowrap shadow-xs ${
                      isJustAdded
                        ? 'bg-forest-900 text-gold-300 border border-gold-400/70'
                        : 'bg-forest-950 text-cream-50 hover:bg-gold-700 border border-forest-800'
                    }`}
                  >
                    {isJustAdded ? (
                      <>
                        <svg className="h-3 w-3 text-gold-300" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Added ✓</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        <span>+ Add</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Wishlist Button Pill */}
          <div className="pointer-events-auto ml-auto">
            <WishlistButton
              productId={product.id}
              productName={product.name}
              variant="card"
              theme="light"
            />
          </div>
        </div>
      </div>

      {/* 3. Card Info & Actions Content Layer */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between gap-2.5 bg-bg-surface-elevated/90">
        <div>
          {/* Category line */}
          <p className="text-[10px] font-sans font-medium tracking-[0.08em] uppercase text-forest-500/80 truncate mb-1">
            {product.categories?.name || 'Artisanal Goods'}
          </p>

          {/* Product Title (Plus Jakarta Sans, crisp and legible) */}
          <h3 className="font-sans font-medium text-xs sm:text-[13px] text-forest-950 leading-snug tracking-[-0.01em] line-clamp-2">
            <Link
              href={`/products/${product.slug}`}
              prefetch={false}
              onMouseEnter={handleIntentPrefetch}
              onTouchStart={handleIntentPrefetch}
              className="hover:text-gold-700 transition-colors"
            >
              {product.name}
            </Link>
          </h3>
        </div>

        {/* Price & Action Row */}
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-1">
            <span className="font-sans font-semibold text-xs sm:text-[14px] text-forest-950 tracking-tight tabular-nums">
              {formatPrice(lowestPrice)}
            </span>
            {activeVariants.length > 1 && (
              <span className="text-[10px] sm:text-[11px] text-forest-500 font-sans font-normal">
                {activeVariants.length} options
              </span>
            )}
          </div>

          {/* Buy Now Button */}
          {!isSoldOut ? (
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isNavigating}
              aria-label={`Buy ${product.name} now`}
              className="w-full h-7 sm:h-7.5 rounded-lg bg-forest-950 hover:bg-forest-900 text-cream-50 font-sans text-[11px] font-medium tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs"
            >
              <span>{isNavigating ? 'Wait…' : 'Buy Now'}</span>
              <svg
                className="h-2.5 w-2.5 sm:h-3 sm:w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="w-full h-7 sm:h-7.5 rounded-lg bg-cream-200/60 text-forest-400 font-sans text-[10px] sm:text-[11px] font-medium tracking-wider uppercase cursor-not-allowed text-center border border-forest-900/5"
            >
              Sold Out
            </button>
          )}
        </div>
      </div>
    </div>
  )
})

ProductCard.displayName = 'ProductCard'

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
      className="group relative flex flex-col justify-between overflow-hidden rounded-md sm:rounded-lg bg-bg-surface-elevated border border-forest-900/10 hover:border-gold-500/60 transition-[border-color,box-shadow,transform] duration-normal ease-smooth shadow-elevation-1 hover:shadow-elevation-2 hover:-translate-y-1 select-none"
      onMouseEnter={() => {
        setHovered(true)
        handleIntentPrefetch()
      }}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={handleIntentPrefetch}
    >
      {/* 1. Full-Bleed Product Image Canvas with Light Linen Background */}
      <div className="relative aspect-[4/5] sm:aspect-square w-full overflow-hidden bg-cream-50/70 border-b border-forest-900/6">
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
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 280px"
                className="object-cover transition-transform duration-500 ease-smooth group-hover:scale-[1.03]"
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
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 280px"
                  className="object-cover transition-opacity duration-500 ease-smooth"
                  style={{
                    opacity: hovered ? 1 : 0,
                    filter: isSoldOut ? 'grayscale(0.4) opacity(0.8)' : 'none',
                  }}
                />
              )}
            </>
          ) : (
            <div className="relative flex h-full w-full flex-col items-center justify-center bg-cream-100/60 text-forest-700/40">
              <svg
                className="h-10 w-10 stroke-[1.2] opacity-50"
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
              <span className="text-[10px] tracking-widest uppercase mt-2 opacity-60 font-sans">
                Handcrafted
              </span>
            </div>
          )}
        </Link>

        {/* 2. Top Badges & Floating Actions */}
        <div className="absolute top-2 sm:top-2.5 inset-x-2 sm:inset-x-2.5 z-20 flex items-center justify-between pointer-events-none">
          <div>
            {isSoldOut ? (
              <span className="inline-flex items-center rounded-pill bg-terracotta-100 text-terracotta-800 border border-terracotta-300 px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase shadow-xs font-sans pointer-events-auto truncate max-w-[100px] sm:max-w-none">
                Sold Out
              </span>
            ) : (
              <div className="relative flex items-center">
                {/* Resting Curation Badge (Featured or Category) */}
                <span
                  className={`inline-flex items-center rounded-pill bg-cream-100/90 text-forest-800 border border-forest-900/10 px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-medium tracking-wide uppercase shadow-2xs font-sans transition-opacity duration-normal truncate max-w-[95px] sm:max-w-[130px] ${
                    hovered || isJustAdded ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
                  }`}
                >
                  {product.featured ? 'Featured' : (product.categories?.name || 'Artisanal')}
                </span>

                {/* Hover Quick Add to Bag Action */}
                <div
                  className="absolute top-0 left-0 transition-[opacity,transform] duration-normal pointer-events-none"
                  style={{
                    opacity: hovered || isJustAdded ? 1 : 0,
                    transform: hovered || isJustAdded ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(-2px)',
                    pointerEvents: hovered || isJustAdded ? 'auto' : 'none',
                  }}
                >
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    aria-label={`Add ${product.name} to bag`}
                    title={isJustAdded ? 'Added to Bag' : '+ Add to Bag'}
                    className={`h-7 sm:h-7.5 px-2.5 sm:px-3 rounded-pill text-[10px] sm:text-[11px] font-semibold tracking-wide flex items-center justify-center gap-1 active:scale-95 transition-transform cursor-pointer pointer-events-auto whitespace-nowrap shadow-elevation-1 ${
                      isJustAdded
                        ? 'bg-forest-900 text-gold-300 border border-gold-400/70'
                        : 'bg-forest-950 text-cream-50 hover:bg-forest-900 border border-forest-800'
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
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
      <div className="p-2.5 sm:p-3.5 flex flex-col flex-1 justify-between gap-1.5 bg-bg-surface-elevated">
        <div>
          {/* Category line */}
          <p className="type-kicker text-[9px] text-forest-750 truncate mb-0.5">
            {product.categories?.name || 'Artisanal Goods'}
          </p>

          {/* Product Title */}
          <h3 className="type-subheading font-medium text-xs sm:text-[15px] text-forest-950 tracking-tight leading-snug line-clamp-2">
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
        <div className="pt-1.5 sm:pt-2 border-t border-forest-900/6 flex flex-col gap-1.5 sm:gap-2">
          <div className="flex items-baseline justify-between gap-1">
            <span className="type-price text-xs sm:text-[15px] font-bold text-forest-950">
              {formatPrice(lowestPrice)}
            </span>
            {activeVariants.length > 1 && (
              <span className="text-[9px] sm:text-[10px] text-forest-750 font-medium font-sans">
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
              className="w-full h-7 sm:h-8 rounded-sm sm:rounded-md bg-forest-950 hover:bg-forest-900 text-cream-50 type-kicker text-[10px] sm:text-[11px] font-bold tracking-wider transition-transform active:scale-95 flex items-center justify-center gap-1 cursor-pointer shadow-elevation-1"
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
              className="w-full h-7 sm:h-8 rounded-sm sm:rounded-md bg-forest-100 text-forest-700/50 text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase cursor-not-allowed text-center border border-forest-900/10"
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

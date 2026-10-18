'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ProductWithDetails } from '@/lib/queries/products'
import { WishlistButton } from '@/components/storefront/wishlist-button'
import { ProductImageSkeleton } from '@/components/storefront/product-image-skeleton'
import { useCart } from '@/lib/cart/cart-context'
import { useToast } from '@/components/ui/toast'
import { startRouteProgress } from '@/components/storefront/route-progress-bar'

interface ProductCardProps {
  product: ProductWithDetails
  loading?: 'lazy' | 'eager'
}

export function ProductCard({ product, loading = 'lazy' }: ProductCardProps) {
  const router = useRouter()
  const [hovered, setHovered] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [isJustAdded, setIsJustAdded] = useState(false)
  const { addItem } = useCart()
  const { toast } = useToast()

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
      className="group relative flex flex-col justify-end overflow-hidden rounded-xl sm:rounded-3xl aspect-[3/4] bg-forest-950 border border-forest-800/50 hover:border-gold-500/60 transition-all duration-300 hover:-translate-y-1"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 1. Full-Bleed Product Image Canvas */}
      <Link
        href={`/products/${product.slug}`}
        className="absolute inset-0 block w-full h-full overflow-hidden"
        tabIndex={-1}
        aria-hidden="true"
      >
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={altText}
              fill
              loading={loading}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 20vw, 320px"
              className="object-cover transition-all duration-700 ease-out"
              style={{
                filter: isSoldOut ? 'grayscale(0.4) opacity(0.8)' : 'none',
                transform: hovered && !secondaryImageUrl ? 'scale(1.08)' : 'scale(1)',
              }}
            />
            {secondaryImageUrl && (
              <Image
                src={secondaryImageUrl}
                alt={secondaryAltText}
                fill
                loading="lazy"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 20vw, 320px"
                className="object-cover transition-opacity duration-500 ease-out"
                style={{
                  opacity: hovered ? 1 : 0,
                  filter: isSoldOut ? 'grayscale(0.4) opacity(0.8)' : 'none',
                }}
              />
            )}
          </>
        ) : (
          <div className="relative flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-forest-900 via-forest-950 to-forest-900 text-cream-200/30">
            <svg
              className="h-12 w-12 stroke-[1.2] opacity-40"
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
            <span className="text-[10px] tracking-widest uppercase mt-2 opacity-50 font-sans">
              Handcrafted
            </span>
          </div>
        )}
      </Link>

      {/* 2. Top Bar: Status Badge (Sold Out) / Hover Action ("+ Add to Bag") & Wishlist Button */}
      <div className="absolute top-2.5 sm:top-3 inset-x-2.5 sm:inset-x-3 z-25 flex items-center justify-between pointer-events-none">
        <div>
          {isSoldOut ? (
            <span className="inline-flex items-center rounded-full bg-terracotta-600/95 backdrop-blur-md px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-semibold tracking-wider text-cream-50 uppercase shadow-sm border border-terracotta-400/30 font-sans pointer-events-auto truncate max-w-[100px] sm:max-w-none">
              Sold Out
            </span>
          ) : (
            <div className="relative flex items-center">
              {/* Resting Curation Badge (visible when not hovered / on mobile touch) */}
              <span
                className={`inline-flex items-center rounded-full bg-forest-950/80 backdrop-blur-md px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-semibold tracking-wider text-gold-300 uppercase shadow-xs border border-gold-400/30 font-sans transition-opacity duration-300 truncate max-w-[95px] sm:max-w-[140px] ${
                  hovered || isJustAdded ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
                }`}
              >
                {product.featured ? 'Featured' : (product.categories?.name || 'Artisanal')}
              </span>

              {/* Hover Action ("+ Add to Bag") */}
              <div
                className="absolute top-0 left-0 transition-all duration-300 pointer-events-none"
                style={{
                  opacity: hovered || isJustAdded ? 1 : 0,
                  transform: hovered || isJustAdded ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(-4px)',
                  pointerEvents: hovered || isJustAdded ? 'auto' : 'none',
                }}
              >
                <button
                  type="button"
                  onClick={handleAddToCart}
                  aria-label={`Add ${product.name} to bag`}
                  title={isJustAdded ? 'Added to Bag' : '+ Add to Bag'}
                  className={`h-8 sm:h-8.5 px-3 sm:px-3.5 rounded-full backdrop-blur-md text-[11px] sm:text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer pointer-events-auto whitespace-nowrap ${
                    isJustAdded
                      ? 'bg-forest-900 text-gold-300 border border-gold-400/70 shadow-2xs'
                      : 'bg-forest-950/90 hover:bg-btn-accent-bg hover:text-btn-accent-text hover:border-btn-accent-border text-cream-50 border border-border-gold'
                  }`}
                >
                  {isJustAdded ? (
                    <>
                      <svg className="h-3.5 w-3.5 text-gold-300" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Added ✓</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                        />
                      </svg>
                      <span>+ Add to Bag</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="pointer-events-auto ml-auto">
          <WishlistButton
            productId={product.id}
            productName={product.name}
            variant="card"
          />
        </div>
      </div>

      {/* 4. Feathered Progressive Blur Layer (Smooth transition from sharp to blur) */}
      <div
        className="absolute inset-x-0 bottom-0 top-[28%] pointer-events-none z-10"
        style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,1) 75%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,1) 75%)',
        }}
      />

      {/* 5. Atmospheric Dark Gradient Scrim (Smooth fade from transparent to forest-950) */}
      <div className="absolute inset-x-0 bottom-0 top-[25%] pointer-events-none z-11 bg-gradient-to-t from-forest-950 via-forest-950/80 to-transparent" />

      {/* 6. Card Info & Actions Content Layer */}
      <div className="relative z-15 w-full mt-auto pb-2 sm:pb-3 px-2 sm:px-3.5">
        {/* Title & Price Row */}
        <div className="flex items-baseline justify-between gap-1">
          <h3 className="font-display font-semibold text-xs sm:text-[15px] text-cream-50 tracking-tight leading-snug truncate flex-1">
            <Link
              href={`/products/${product.slug}`}
              className="hover:text-text-accent transition-colors"
            >
              {product.name}
            </Link>
          </h3>
          <span className="font-price text-[11px] sm:text-[14px] font-bold text-gold-400 tabular-nums shrink-0 ml-0.5">
            ৳{lowestPrice.toLocaleString()}
          </span>
        </div>

        {/* Subtitle / Category Line */}
        <p className="hidden sm:block text-[9px] sm:text-[11px] text-cream-200/65 font-sans truncate mt-0.5">
          {product.categories?.name || 'Artisanal Stationery'}
        </p>

        {/* Action Footer: Resting Buy Now Button */}
        <div className="mt-1.5 sm:mt-3">
          {!isSoldOut ? (
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isNavigating}
              aria-label={`Buy ${product.name} now`}
              className="w-full h-7 sm:h-8.5 rounded-lg sm:rounded-xl btn-dark font-sans text-[11px] sm:text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
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
              className="w-full h-7 sm:h-8.5 rounded-lg sm:rounded-xl bg-forest-900/60 text-cream-200/40 text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase cursor-not-allowed text-center border border-white/5"
            >
              Sold Out
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

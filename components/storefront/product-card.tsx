'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { ProductWithDetails } from '@/lib/queries/products'
import { WishlistButton } from '@/components/storefront/wishlist-button'
import { ProductImageSkeleton } from '@/components/storefront/product-image-skeleton'
import { useCart } from '@/lib/cart/cart-context'
import { useToast } from '@/components/ui/toast'

interface ProductCardProps {
  product: ProductWithDetails
  loading?: 'lazy' | 'eager'
}

export function ProductCard({ product, loading = 'lazy' }: ProductCardProps) {
  const [hovered, setHovered] = useState(false)
  const { addItem } = useCart()
  const { toast } = useToast()

  const activeVariants = product.product_variants.filter((v) => v.active)

  const lowestPrice =
    activeVariants.length > 0
      ? Math.min(...activeVariants.map((v) => v.price))
      : product.base_price

  const isSoldOut =
    activeVariants.length > 0 && activeVariants.every((v) => v.stock_qty === 0)

  const primaryImage = product.product_images?.[0]
  const imageUrl = primaryImage?.url || null
  const altText = primaryImage?.alt_text || product.name

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isSoldOut) {
      toast('This product is currently sold out.', 'info')
      return
    }

    const targetVariant = activeVariants.find((v) => v.stock_qty > 0) || activeVariants[0]
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

    toast(`Added "${product.name}" to your bag!`, 'success')
  }

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-cream-50 border border-forest-900/10 transition-all duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        boxShadow: hovered ? '0 16px 40px rgba(13,31,21,0.1)' : '0 1px 4px rgba(13,31,21,0.04)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
      }}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-cream-100/80" style={{ aspectRatio: '4/5' }}>
        <Link href={`/products/${product.slug}`} className="relative block w-full h-full">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={altText}
              fill
              loading={loading}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
              className="object-cover"
              style={{
                transition: 'transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)',
                transform: hovered ? 'scale(1.05)' : 'scale(1)',
              }}
            />
          ) : (
            <ProductImageSkeleton size="md" />
          )}
        </Link>

        {/* Sold out overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-forest-900/60 flex items-center justify-center z-20 pointer-events-none">
            <span className="rounded-full bg-rose-600 px-2.5 py-0.5 sm:px-3 sm:py-0.5 text-[10px] sm:text-xs font-bold tracking-wide text-white uppercase shadow-md">
              Sold Out
            </span>
          </div>
        )}

        {/* Minimal Category Chip (desktop only) */}
        {product.categories && (
          <span
            className="hidden sm:inline-block absolute top-2.5 left-2.5 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em] font-semibold z-10 pointer-events-none rounded-full bg-cream-50/90 backdrop-blur-xs text-forest-900/80 border border-forest-900/10 shadow-xs font-sans"
          >
            {product.categories.name}
          </span>
        )}

        {/* Wishlist toggle heart button */}
        <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-30">
          <WishlistButton
            productId={product.id}
            productName={product.name}
            variant="card"
          />
        </div>

        {/* Desktop: Add to bag bar (revealed on hover) */}
        {!isSoldOut && (
          <button
            type="button"
            onClick={handleAddToCart}
            className="hidden sm:block absolute inset-x-0 bottom-0 py-2.5 text-center cursor-pointer active:scale-98 transition-all z-20 bg-forest-950 text-cream-100 hover:bg-gold-500 hover:text-forest-950 font-sans text-[11px] uppercase tracking-widest font-semibold"
            style={{
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease',
              transform: hovered ? 'translateY(0)' : 'translateY(100%)',
            }}
          >
            + Add to Bag
          </button>
        )}

        {/* Mobile: Quick Add to Bag floating button */}
        {!isSoldOut && (
          <button
            type="button"
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to bag`}
            title={`Add ${product.name} to bag`}
            className="sm:hidden absolute bottom-2 right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-forest-900/80 backdrop-blur-xs text-cream-100 hover:bg-forest-900 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <svg
              className="h-4 w-4"
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
          </button>
        )}
      </div>

      {/* Info Section */}
      <Link href={`/products/${product.slug}`} className="p-3 sm:p-3.5 block flex-1 bg-cream-50">
        <h3
          className="font-editorial text-sm sm:text-base font-normal text-forest-950 line-clamp-1 group-hover:text-gold-700 transition-colors mb-0.5"
        >
          {product.name}
        </h3>
        <p
          className="font-price text-xs sm:text-sm font-semibold text-forest-900"
        >
          ৳{lowestPrice.toLocaleString()}
          {activeVariants.length > 1 && (
            <span className="text-[10px] font-normal text-forest-500 ml-1 font-sans">onwards</span>
          )}
        </p>
      </Link>
    </div>
  )
}

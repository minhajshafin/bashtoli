'use client'

import React, { useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ProductImageSkeleton } from '@/components/storefront/product-image-skeleton'
import { removeFromWishlistAction } from '@/lib/actions/wishlist'

interface WishlistItemProps {
  product: {
    id: string
    name: string
    slug: string
    base_price: number
    imageUrl: string | null
    categoryName: string | null
  }
}

/**
 * Wishlist Item Card.
 * Renders product overview cards inside the customer wishlist grid with click-to-delete toggles.
 */
export function WishlistItem({ product }: WishlistItemProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault() // prevent click routing to details page
    e.stopPropagation()
    startTransition(async () => {
      await removeFromWishlistAction(product.id)
      router.refresh()
    })
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-forest-200/80 bg-cream-100/60 shadow-2xs hover:border-gold-500/60 hover:bg-cream-100/90 transition-all"
    >
      {/* Product Image container */}
      <div className="relative aspect-square w-full overflow-hidden bg-cream-200/40">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <ProductImageSkeleton size="md" />
        )}

        {/* Remove wishlist entry close button */}
        <button
          type="button"
          onClick={handleRemove}
          disabled={isPending}
          className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-cream-50/95 backdrop-blur-xs text-forest-600 hover:text-btn-danger-bg hover:bg-terracotta-100 hover:border-terracotta-500/30 border border-forest-200/60 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Remove from Wishlist"
        >
          {isPending ? (
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-forest-400 border-t-transparent" />
          ) : (
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Product Information details */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          {product.categoryName && (
            <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.16em] text-text-accent">
              {product.categoryName}
            </span>
          )}
          <h3 className="mt-1 text-sm font-medium text-forest-950 truncate group-hover:text-text-accent transition-colors font-display">
            {product.name}
          </h3>
        </div>
        <p className="mt-2 text-sm sm:text-base font-bold text-forest-950 font-price">
          ৳{product.base_price.toLocaleString()}
        </p>
      </div>
    </Link>
  )
}


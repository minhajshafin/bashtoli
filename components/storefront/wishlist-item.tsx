'use client'

import React, { useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { removeFromWishlistAction } from '@/lib/actions/wishlist'
import { ProductImageSkeleton } from '@/components/storefront/product-image-skeleton'

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
  const [isPending, startTransition] = useTransition()

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault() // prevent click routing to details page
    startTransition(async () => {
      const res = await removeFromWishlistAction(product.id)
      if (res.error) {
        alert(res.error)
      }
    })
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-forest-200 bg-cream-50 shadow-xs hover:border-gold-500 transition-all"
    >
      {/* Product Image container */}
      <div className="relative aspect-square w-full overflow-hidden bg-cream-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <ProductImageSkeleton size="md" />
        )}

        {/* Remove wishlist entry close button */}
        <button
          type="button"
          onClick={handleRemove}
          disabled={isPending}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-xs text-forest-500 hover:text-rose-600 shadow-xs hover:scale-105 active:scale-95 transition-all"
          title="Remove from Wishlist"
        >
          {isPending ? (
            <div className="h-3.5 w-3.5 animate-spin rounded-full border border-current border-t-transparent" />
          ) : (
            <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-gold-600">
              {product.categoryName}
            </span>
          )}
          <h3
            className="mt-1 text-sm font-bold text-forest-900 truncate group-hover:text-gold-600 transition-colors"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            {product.name}
          </h3>
        </div>
        <p className="mt-2 text-sm font-bold text-forest-900">
          ৳{product.base_price.toLocaleString()}
        </p>
      </div>
    </Link>
  )
}


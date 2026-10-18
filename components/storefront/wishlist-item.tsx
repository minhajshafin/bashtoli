'use client'

import React, { useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ProductImageSkeleton } from '@/components/storefront/product-image-skeleton'
import { removeFromWishlistAction } from '@/lib/actions/wishlist'
import { Trash2 } from 'lucide-react'

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
 * Renders product overview cards inside the customer wishlist 2-column grid.
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
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-forest-200/80 bg-cream-100/70 shadow-2xs hover:border-gold-500/60 hover:bg-cream-100/90 active:scale-[0.98] transition-all"
    >
      {/* Product Image container */}
      <div className="relative aspect-square w-full overflow-hidden bg-cream-200/40">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <ProductImageSkeleton size="md" />
        )}

        {/* Remove wishlist entry button with 44px touch area */}
        <button
          type="button"
          onClick={handleRemove}
          disabled={isPending}
          aria-label={`Remove ${product.name} from wishlist`}
          className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-cream-50/95 backdrop-blur-xs text-forest-600 hover:text-terracotta-700 hover:bg-terracotta-100/80 border border-forest-200/60 active:scale-90 transition-all cursor-pointer shadow-2xs z-10"
          title="Remove from Wishlist"
        >
          {isPending ? (
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-forest-400 border-t-transparent" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Product Information details */}
      <div className="p-3 sm:p-4 flex flex-col justify-between flex-1">
        <div>
          {product.categoryName && (
            <span className="text-[9px] sm:text-[10px] font-sans font-semibold uppercase tracking-[0.16em] text-text-accent block truncate">
              {product.categoryName}
            </span>
          )}
          <h3 className="mt-0.5 text-xs sm:text-sm font-medium text-forest-950 truncate group-hover:text-gold-600 transition-colors font-display">
            {product.name}
          </h3>
        </div>
        <p className="mt-2 text-xs sm:text-base font-bold text-forest-950 font-price">
          ৳{product.base_price.toLocaleString()}
        </p>
      </div>
    </Link>
  )
}

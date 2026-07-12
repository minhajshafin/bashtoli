'use client'

import React, { useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xs hover:border-zinc-300 transition-all dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
    >
      {/* Product Image container */}
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-50 dark:bg-zinc-900">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-400 dark:text-zinc-650">
            No Image
          </div>
        )}

        {/* Remove wishlist entry close button */}
        <button
          type="button"
          onClick={handleRemove}
          disabled={isPending}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-xs text-zinc-500 hover:text-rose-600 shadow-xs hover:scale-105 active:scale-95 transition-all dark:bg-zinc-900/90 dark:text-zinc-400 dark:hover:text-rose-500"
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-500">
              {product.categoryName}
            </span>
          )}
          <h3 className="mt-1 text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate group-hover:text-amber-600 transition-colors">
            {product.name}
          </h3>
        </div>
        <p className="mt-2 text-sm font-black text-zinc-900 dark:text-zinc-50">
          ৳{product.base_price.toLocaleString()}
        </p>
      </div>
    </Link>
  )
}

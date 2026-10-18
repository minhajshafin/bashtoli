'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ProductImageSkeleton } from '@/components/storefront/product-image-skeleton'
import { removeFromWishlistAction } from '@/lib/actions/wishlist'
import { useCart } from '@/lib/cart/cart-context'
import { useToast } from '@/components/ui/toast'
import { Trash2, ShoppingBag, Check } from 'lucide-react'

export interface MappedWishlistItem {
  id: string
  name: string
  slug: string
  base_price: number
  imageUrl: string | null
  categoryName: string | null
  defaultVariant: {
    id: string
    name: string
    price: number
    stock_qty: number
  } | null
  isSoldOut: boolean
  stockQty: number
}

interface WishlistItemProps {
  product: MappedWishlistItem
}

/**
 * Customer Wishlist Item Card.
 * Renders a tactile, thumb-friendly horizontal card on mobile (< 640px)
 * and an expansive artisanal vertical card on desktop (>= 640px).
 */
export function WishlistItem({ product }: WishlistItemProps) {
  const router = useRouter()
  const { addItem } = useCart()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [isJustAdded, setIsJustAdded] = useState(false)

  const activePrice = product.defaultVariant?.price ?? product.base_price
  const priceFormatted = activePrice.toLocaleString()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (product.isSoldOut || !product.defaultVariant) {
      toast('This product is currently out of stock.', 'info')
      return
    }

    addItem(
      {
        variant_id: product.defaultVariant.id,
        product_id: product.id,
        name: product.name,
        variant_name: product.defaultVariant.name,
        price: product.defaultVariant.price,
        image_url: product.imageUrl,
      },
      1
    )

    setIsJustAdded(true)
    setTimeout(() => setIsJustAdded(false), 1500)
    toast(`Added "${product.name}" to your bag!`, 'success')
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    startTransition(async () => {
      await removeFromWishlistAction(product.id)
      toast(`Removed "${product.name}" from your wishlist.`, 'info')
      router.refresh()
    })
  }

  return (
    <div className="w-full">
      {/* 1. MOBILE VIEW: Dedicated Touch Card (< 640px) */}
      <div className="sm:hidden relative flex flex-col rounded-2xl border border-forest-200/80 bg-cream-100/70 p-3.5 shadow-2xs space-y-3">
        <div className="flex items-start gap-3">
          {/* Square Image Thumbnail */}
          <Link
            href={`/products/${product.slug}`}
            className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-cream-200/40 border border-forest-200/60 block active:scale-95 transition-transform"
          >
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="96px"
                className="object-cover object-center"
              />
            ) : (
              <ProductImageSkeleton size="sm" />
            )}
          </Link>

          {/* Details Column */}
          <div className="min-w-0 flex-1 flex flex-col justify-between self-stretch py-0.5">
            <div>
              <div className="flex items-center justify-between gap-1.5 mb-1">
                {product.categoryName && (
                  <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-text-accent block truncate">
                    {product.categoryName}
                  </span>
                )}
                {/* Stock badge */}
                {product.isSoldOut ? (
                  <span className="inline-flex items-center rounded-full bg-terracotta-100/90 px-2 py-0.2 text-[9px] font-sans font-semibold text-terracotta-800 border border-terracotta-400/30 shrink-0">
                    Sold Out
                  </span>
                ) : product.stockQty <= 5 ? (
                  <span className="inline-flex items-center rounded-full bg-amber-100/90 px-2 py-0.2 text-[9px] font-sans font-semibold text-amber-900 border border-amber-400/30 shrink-0">
                    Only {product.stockQty} left
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-2 py-0.2 text-[9px] font-sans font-semibold text-emerald-800 border border-emerald-400/30 shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 inline-block" />
                    In Stock
                  </span>
                )}
              </div>

              <Link
                href={`/products/${product.slug}`}
                className="text-sm font-semibold font-display text-forest-950 leading-snug line-clamp-2 hover:text-gold-600 transition-colors"
              >
                {product.name}
              </Link>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-sm font-bold font-price text-forest-950">
                ৳{priceFormatted}
              </span>
              {product.defaultVariant?.name && product.defaultVariant.name !== 'Standard' && (
                <span className="text-[10px] font-mono text-forest-500 truncate max-w-[120px]">
                  {product.defaultVariant.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center gap-2 pt-2 border-t border-forest-200/60">
          {!product.isSoldOut ? (
            <button
              type="button"
              onClick={handleAddToCart}
              className={`flex-1 h-11 rounded-xl text-xs font-sans font-semibold tracking-wide flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-2xs cursor-pointer ${
                isJustAdded
                  ? 'bg-forest-900 text-gold-300 border border-gold-400/60'
                  : 'btn-primary'
              }`}
            >
              {isJustAdded ? (
                <>
                  <Check className="h-4 w-4 text-gold-300" />
                  <span>Added to Bag ✓</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-3.5 w-3.5 text-gold-400" />
                  <span>+ Add to Bag</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="flex-1 h-11 rounded-xl bg-cream-200/60 text-forest-400 text-xs font-sans font-medium flex items-center justify-center cursor-not-allowed border border-forest-200/60"
            >
              Currently Sold Out
            </button>
          )}

          <button
            type="button"
            onClick={handleRemove}
            disabled={isPending}
            aria-label={`Remove ${product.name} from wishlist`}
            className="h-11 w-11 shrink-0 rounded-xl border border-forest-200/80 bg-cream-50/80 flex items-center justify-center text-forest-500 hover:text-terracotta-700 hover:bg-terracotta-100/70 hover:border-terracotta-400/50 active:scale-90 transition-all cursor-pointer"
            title="Remove from Wishlist"
          >
            {isPending ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-forest-400 border-t-transparent" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* 2. DESKTOP VIEW: Vertical Card (>= 640px) */}
      <div className="hidden sm:flex flex-col overflow-hidden rounded-2xl border border-forest-200/80 bg-cream-100/70 shadow-2xs hover:border-gold-500/60 hover:bg-cream-100/90 transition-all h-full">
        {/* Product Image container */}
        <div className="relative aspect-square w-full overflow-hidden bg-cream-200/40">
          <Link href={`/products/${product.slug}`} className="block w-full h-full">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 1200px) 33vw, 25vw"
                className="object-cover object-center hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <ProductImageSkeleton size="md" />
            )}
          </Link>

          {/* Remove button at top right */}
          <button
            type="button"
            onClick={handleRemove}
            disabled={isPending}
            aria-label={`Remove ${product.name} from wishlist`}
            className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-cream-50/95 backdrop-blur-xs text-forest-600 hover:text-terracotta-700 hover:bg-terracotta-100/80 border border-forest-200/60 active:scale-90 transition-all cursor-pointer shadow-2xs z-10"
            title="Remove from Wishlist"
          >
            {isPending ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-forest-400 border-t-transparent" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Stock badge top left */}
          <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
            {product.isSoldOut ? (
              <span className="inline-flex items-center rounded-full bg-terracotta-600/95 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-cream-50 uppercase shadow-xs">
                Sold Out
              </span>
            ) : product.stockQty <= 5 ? (
              <span className="inline-flex items-center rounded-full bg-amber-600/95 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-cream-50 uppercase shadow-xs">
                Only {product.stockQty} left
              </span>
            ) : null}
          </div>
        </div>

        {/* Product Information details */}
        <div className="p-4 flex flex-col justify-between flex-1">
          <div>
            {product.categoryName && (
              <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.16em] text-text-accent block truncate">
                {product.categoryName}
              </span>
            )}
            <h3 className="mt-1 text-sm font-medium text-forest-950 truncate hover:text-gold-600 transition-colors font-display">
              <Link href={`/products/${product.slug}`}>{product.name}</Link>
            </h3>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-base font-bold text-forest-950 font-price">
              ৳{priceFormatted}
            </p>
            {product.defaultVariant?.name && product.defaultVariant.name !== 'Standard' && (
              <span className="text-[11px] font-mono text-forest-500 truncate max-w-[140px]">
                {product.defaultVariant.name}
              </span>
            )}
          </div>

          <div className="mt-3.5 pt-3 border-t border-forest-200/60">
            {!product.isSoldOut ? (
              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-full h-10 rounded-xl text-xs font-sans font-semibold tracking-wide flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-2xs cursor-pointer ${
                  isJustAdded
                    ? 'bg-forest-900 text-gold-300 border border-gold-400/60'
                    : 'btn-primary'
                }`}
              >
                {isJustAdded ? (
                  <>
                    <Check className="h-4 w-4 text-gold-300" />
                    <span>Added to Bag ✓</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-3.5 w-3.5 text-gold-400" />
                    <span>+ Add to Bag</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="w-full h-10 rounded-xl bg-cream-200/60 text-forest-400 text-xs font-sans font-medium flex items-center justify-center cursor-not-allowed border border-forest-200/60"
              >
                Sold Out
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

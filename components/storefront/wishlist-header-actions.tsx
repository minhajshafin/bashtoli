'use client'

import React, { useState } from 'react'
import { useCart } from '@/lib/cart/cart-context'
import { useToast } from '@/components/ui/toast'
import { ShoppingBag, Check } from 'lucide-react'
import type { MappedWishlistItem } from './wishlist-item'

interface WishlistHeaderActionsProps {
  products: MappedWishlistItem[]
}

/**
 * Top action bar for customer wishlist.
 * Enables 1-tap bulk movement of all in-stock saved items into active cart.
 */
export function WishlistHeaderActions({ products }: WishlistHeaderActionsProps) {
  const { addItem } = useCart()
  const { toast } = useToast()
  const [isAddingAll, setIsAddingAll] = useState(false)
  const [isDone, setIsDone] = useState(false)

  const inStockItems = products.filter((p) => !p.isSoldOut && p.defaultVariant)

  if (inStockItems.length === 0) return null

  const handleAddAll = () => {
    setIsAddingAll(true)
    let addedCount = 0

    for (const item of inStockItems) {
      if (item.defaultVariant) {
        addItem(
          {
            variant_id: item.defaultVariant.id,
            product_id: item.id,
            name: item.name,
            variant_name: item.defaultVariant.name,
            price: item.defaultVariant.price,
            image_url: item.imageUrl,
          },
          1
        )
        addedCount++
      }
    }

    setIsAddingAll(false)
    setIsDone(true)
    setTimeout(() => setIsDone(false), 2000)
    toast(`Added ${addedCount} ${addedCount === 1 ? 'item' : 'items'} to your bag!`, 'success')
  }

  return (
    <div className="w-full sm:w-auto shrink-0">
      <button
        type="button"
        onClick={handleAddAll}
        disabled={isAddingAll || isDone}
        className="w-full sm:w-auto inline-flex h-11 sm:h-10 items-center justify-center gap-2 rounded-xl btn-accent px-5 text-xs font-sans font-bold active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDone ? (
          <>
            <Check className="h-4 w-4 text-forest-950 stroke-[2.5]" />
            <span>All Items in Bag ✓</span>
          </>
        ) : (
          <>
            <ShoppingBag className="h-4 w-4 text-forest-950 stroke-[2.2]" />
            <span>Add All In-Stock to Bag ({inStockItems.length})</span>
          </>
        )}
      </button>
    </div>
  )
}

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import React from 'react'
import { WishlistItem } from '@/components/storefront/wishlist-item'

export async function generateMetadata() {
  return {
    title: 'My Wishlist',
    description: 'View products you have saved for later in your Bashtoli wishlist.',
  }
}

export const instant = false

/**
 * Customer Wishlist Page.
 * Server component that retrieves and lists all saved product listings.
 */
export default async function WishlistPage() {
  const supabase = await createClient()

  // Verify auth session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/account/wishlist')
  }

  let dbClient = supabase
  try {
    dbClient = createAdminClient()
  } catch {
    // Fall back to user client
  }

  // 1. Fetch wishlist item product IDs
  const { data: wishlistEntries, error: wishError } = await dbClient
    .from('wishlist')
    .select('product_id')
    .eq('user_id', user.id)

  if (wishError) {
    console.error('Error fetching wishlist entries:', wishError)
  }

  const productIds = (wishlistEntries || []).map((entry) => entry.product_id)

  interface MappedWishlistItem {
    id: string
    name: string
    slug: string
    base_price: number
    imageUrl: string | null
    categoryName: string | null
  }

  let wishlistProducts: MappedWishlistItem[] = []

  if (productIds.length > 0) {
    // 2. Fetch products details sequentially for maximum type-safety
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)

    if (prodError) {
      console.error('Error fetching products:', prodError)
    }

    // 3. Fetch images for these products
    const { data: images } = await supabase
      .from('product_images')
      .select('*')
      .in('product_id', productIds)

    // 4. Fetch all categories to map category names
    const { data: categories } = await supabase
      .from('categories')
      .select('*')

    // Map database structures in memory
    wishlistProducts = (products || []).map((prod) => {
      const prodImages = (images || []).filter((img) => img.product_id === prod.id)
      const primaryImage = prodImages.sort((a, b) => a.sort_order - b.sort_order)[0]
      const category = (categories || []).find((cat) => cat.id === prod.category_id)

      return {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        base_price: Number(prod.base_price),
        imageUrl: primaryImage?.url || null,
        categoryName: category?.name || null,
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-forest-200/80 pb-5">
        <p className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-forest-600/90 mb-1">
          Saved Items
        </p>
        <h1 className="text-2xl sm:text-3xl font-medium text-forest-950 tracking-tight font-display">
          My Wishlist
        </h1>
        <p className="text-xs sm:text-[13px] text-forest-600 mt-1 font-sans leading-relaxed">
          Handcrafted notebooks and stationeries you have saved to purchase or review later.
        </p>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="text-center py-12 sm:py-16 border border-dashed border-forest-200/80 rounded-2xl sm:rounded-3xl bg-cream-100/40 space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-cream-200/70 text-forest-500 mb-2 border border-forest-200/60">
            <svg className="h-6 w-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-forest-950">Your wishlist is currently empty.</p>
          <p className="text-xs text-forest-600 max-w-sm mx-auto">Explore our catalog and save items you want to keep in mind for future orders.</p>
          <div className="pt-2">
            <a
              href="/products"
              className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold uppercase tracking-wider text-gold-600 hover:text-gold-500 transition-colors"
            >
              Explore Stationery Goods &rarr;
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
          {wishlistProducts.map((product) => (
            <WishlistItem key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}


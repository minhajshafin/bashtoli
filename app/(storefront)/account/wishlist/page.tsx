import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import React from 'react'
import Link from 'next/link'
import { WishlistItem } from '@/components/storefront/wishlist-item'
import { Heart, ArrowRight } from 'lucide-react'

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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-medium text-forest-950 tracking-tight font-display">
            My Wishlist
          </h1>
          {wishlistProducts.length > 0 && (
            <span className="text-xs font-mono font-bold text-gold-600 bg-gold-400/20 px-2.5 py-0.5 rounded-full border border-gold-500/30">
              {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>
        <p className="text-xs sm:text-[13px] text-forest-600 mt-1 font-sans leading-relaxed">
          Handcrafted notebooks and stationeries you have saved to purchase or review later.
        </p>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="text-center py-12 sm:py-16 border border-dashed border-forest-200/80 rounded-2xl sm:rounded-3xl bg-cream-100/40 space-y-2.5">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-cream-200/70 text-forest-500 mb-1 border border-forest-200/60">
            <Heart className="h-6 w-6 stroke-[1.75]" />
          </div>
          <p className="text-sm font-semibold text-forest-950">Your wishlist is currently empty.</p>
          <p className="text-xs text-forest-600 max-w-sm mx-auto">
            Explore our catalog and save items you want to keep in mind for future orders.
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold uppercase tracking-wider text-gold-600 hover:text-gold-500 transition-colors"
            >
              <span>Explore Stationery Goods</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {wishlistProducts.map((product) => (
            <WishlistItem key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

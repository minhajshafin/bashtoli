import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import React from 'react'
import { WishlistItem } from '@/components/storefront/wishlist-item'

export async function generateMetadata() {
  return {
    title: 'My Wishlist | Bashtoli',
    description: 'View products you have saved for later in your Bashtoli wishlist.',
  }
}

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

  // 1. Fetch wishlist item product IDs
  const { data: wishlistEntries, error: wishError } = await supabase
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
      <div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
          My Wishlist
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Items you have saved to purchase or review later.
        </p>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-zinc-200 rounded-3xl dark:border-zinc-800">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-650 mb-3">
            <svg className="h-6 w-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-zinc-400">Your wishlist is currently empty.</p>
          <p className="text-xs text-zinc-405 mt-1">Explore our catalog and click the heart icon to save products.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlistProducts.map((product) => (
            <WishlistItem key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

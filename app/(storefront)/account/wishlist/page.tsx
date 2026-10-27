import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import React from 'react'
import Link from 'next/link'
import { WishlistItem, type MappedWishlistItem } from '@/components/storefront/wishlist-item'
import { WishlistHeaderActions } from '@/components/storefront/wishlist-header-actions'
import { Heart, ArrowRight, BookOpen, PenTool, Feather, Compass } from 'lucide-react'

export async function generateMetadata() {
  return {
    title: 'My Wishlist',
    description: 'View and manage handcrafted stationery goods you have saved for later in your Bashtoli wishlist.',
  }
}

export const instant = false

const QUICK_CATEGORIES = [
  { label: 'Notebooks', href: '/products?category=notebooks', icon: BookOpen },
  { label: 'Writing Tools', href: '/products?category=writing-tools', icon: PenTool },
  { label: 'Calligraphy Ink', href: '/products?category=calligraphy-ink', icon: Feather },
  { label: 'Desk Goods', href: '/products', icon: Compass },
]

/**
 * Customer Wishlist Page.
 * Server component that retrieves saved product listings, maps active default variants
 * with live stock levels, and renders mobile-first cards with 1-tap Add to Bag capability.
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

  let wishlistProducts: MappedWishlistItem[] = []

  if (productIds.length > 0) {
    // 2. Fetch products details sequentially
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

    // 4. Fetch variants for stock checks and 1-tap Add to Bag
    const { data: variants } = await supabase
      .from('product_variants')
      .select('*')
      .in('product_id', productIds)

    // 5. Fetch all categories to map category names
    const { data: categories } = await supabase
      .from('categories')
      .select('*')

    // Map database structures in memory
    wishlistProducts = (products || []).map((prod) => {
      const prodImages = (images || []).filter((img) => img.product_id === prod.id)
      const primaryImage = prodImages.sort((a, b) => a.sort_order - b.sort_order)[0]
      const category = (categories || []).find((cat) => cat.id === prod.category_id)

      const prodVariants = (variants || []).filter((v) => v.product_id === prod.id && v.active)
      const inStockVariant = prodVariants.find((v) => v.stock_qty > 0)
      const defaultVariantRow = inStockVariant || prodVariants[0] || null
      const isSoldOut = prodVariants.length > 0 ? prodVariants.every((v) => v.stock_qty === 0) : false
      const totalStock = prodVariants.reduce((sum, v) => sum + (v.stock_qty || 0), 0)

      let variantLabel = 'Standard'
      if (
        defaultVariantRow?.option_values &&
        typeof defaultVariantRow.option_values === 'object' &&
        Object.keys(defaultVariantRow.option_values).length > 0
      ) {
        variantLabel = Object.values(defaultVariantRow.option_values).join(' / ')
      }

      const defaultVariant = defaultVariantRow
        ? {
            id: defaultVariantRow.id,
            name: variantLabel,
            price: Number(defaultVariantRow.price),
            stock_qty: Number(defaultVariantRow.stock_qty),
          }
        : null

      return {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        base_price: Number(prod.base_price),
        imageUrl: primaryImage?.url || null,
        categoryName: category?.name || null,
        defaultVariant,
        isSoldOut,
        stockQty: totalStock,
      }
    })
  }

  return (
    <div className="w-full">
      {/* Top Utility Navigation Row */}
      <div className="mb-4 flex items-center justify-between pb-3 sm:pb-4 border-b border-forest-800/80">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-gold-400 hover:text-gold-300 transition-colors uppercase tracking-wider group cursor-pointer"
        >
          <svg
            className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          <span>Back to Shop</span>
        </Link>
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-forest-400">
          CURATED ARCHIVE
        </span>
      </div>

      {/* Masthead Header */}
      <section className="mb-6 pb-5 border-b border-forest-800/80">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-1.5">
              <span className="h-px w-5 bg-gold-400/60" />
              <p className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-gold-400/90">
                Saved Items · Bashtoli Stationery
              </p>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-cream-50 tracking-tight font-display">
                My Wishlist
              </h1>
              {wishlistProducts.length > 0 && (
                <span className="rounded-full bg-gold-400/15 border border-gold-400/35 px-2.5 py-0.5 text-xs font-bold text-gold-300 font-price">
                  {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-[13px] text-cream-200/70 mt-1 font-sans leading-relaxed max-w-xl">
              Handcrafted notebooks and stationeries you have saved to purchase or review later.
            </p>
          </div>

          {wishlistProducts.length > 0 && (
            <WishlistHeaderActions products={wishlistProducts} />
          )}
        </div>
      </section>

      {/* List Canvas (Populated Cards or Artisanal Empty State) */}
      <section>
        {wishlistProducts.length === 0 ? (
          /* Elevated Cream Empty State Card */
          <div className="text-center py-12 sm:py-16 px-6 border border-forest-200/90 rounded-2xl sm:rounded-3xl bg-cream-50 text-forest-950 shadow-md space-y-5 max-w-2xl mx-auto">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-100 text-gold-600 border border-forest-200/80 shadow-2xs">
              <Heart className="h-7 w-7 stroke-[1.6]" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h2 className="text-lg sm:text-xl font-medium text-forest-950 font-display">
                Your wishlist is currently empty
              </h2>
              <p className="text-xs sm:text-sm text-forest-600 font-sans leading-relaxed">
                Explore our handcrafted journals, writing tools, and botanical inks to curate your personal collection.
              </p>
            </div>

            {/* Category Exploration Pills */}
            <div className="pt-2">
              <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.18em] text-forest-500 mb-2.5">
                Explore by category
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto">
                {QUICK_CATEGORIES.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={label}
                    href={href}
                    className="inline-flex items-center gap-1.5 rounded-full border border-forest-200/90 bg-white px-3.5 py-2 text-xs font-sans font-medium text-forest-800 hover:border-gold-500/60 hover:text-gold-700 active:scale-95 transition-all shadow-2xs"
                  >
                    <Icon className="h-3.5 w-3.5 text-gold-600" />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-forest-200/70 max-w-xs mx-auto">
              <Link
                href="/products"
                className="w-full inline-flex h-12 items-center justify-center gap-2 rounded-xl btn-primary text-xs font-sans font-semibold tracking-wide active:scale-95 transition-all shadow-xs"
              >
                <span>Explore All Stationery Goods</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Populated Items */
          <div className="space-y-3.5 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
            {wishlistProducts.map((product, idx) => (
              <WishlistItem key={product.id} product={product} priority={idx === 0} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

import { getStorefrontProducts, getStorefrontCategories } from '@/lib/queries/products'
import { ProductCard } from '@/components/storefront/product-card'
import { CategoryFilter } from '@/components/storefront/category-filter'
import { SearchInput } from '@/components/storefront/search-input'
import { Pagination } from '@/components/storefront/pagination'

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string
    q?: string
    page?: string
  }>
}

export const metadata = {
  title: 'Organic Handicraft Products | Bashtoli',
  description: 'Browse our premium collection of sustainable, hand-crafted bamboo and cane items woven in Bangladesh.',
  alternates: {
    canonical: 'https://bashtoli.com/products',
  },
  openGraph: {
    title: 'Organic Handicraft Products | Bashtoli',
    description: 'Browse our premium collection of sustainable, hand-crafted bamboo and cane items woven in Bangladesh.',
    url: 'https://bashtoli.com/products',
    siteName: 'Bashtoli',
    locale: 'en_US',
    type: 'website',
  },
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = await searchParams
  const activeCategorySlug = resolvedSearchParams.category
  const searchQuery = resolvedSearchParams.q
  const currentPage = Math.max(1, parseInt(resolvedSearchParams.page || '1', 10))

  const limit = 12

  // Fetch products and categories concurrently
  const [{ products, totalCount }, categories] = await Promise.all([
    getStorefrontProducts({
      categorySlug: activeCategorySlug,
      search: searchQuery,
      page: currentPage,
      limit,
    }),
    getStorefrontCategories(),
  ])

  const totalPages = Math.ceil(totalCount / limit)
  const activeCategory = categories.find((cat) => cat.slug === activeCategorySlug)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header / Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-100 to-amber-50/50 p-6 sm:p-10 mb-8 dark:from-zinc-900/60 dark:to-zinc-900/10 dark:border dark:border-zinc-800">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500">
            Handcrafted Collections
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            {activeCategory ? activeCategory.name : 'All Collections'}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Explore our curated range of authentic, premium-quality products. Lovingly made, ethically sourced, and designed to bring warm natural accents to your home.
          </p>
        </div>
        {/* Subtle decorative mesh background */}
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none hidden md:block" />
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filter - Desktop only */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-20 bg-white border border-zinc-200 rounded-2xl p-5 dark:bg-zinc-950 dark:border-zinc-800">
            <CategoryFilter
              categories={categories}
              activeCategorySlug={activeCategorySlug}
            />
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="flex-1">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
            <div className="order-2 sm:order-1">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Showing{' '}
                <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                  {products.length}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                  {totalCount}
                </span>{' '}
                products
                {searchQuery && (
                  <>
                    {' '}
                    for &ldquo;
                    <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                      {searchQuery}
                    </span>
                    &rdquo;
                  </>
                )}
              </p>
            </div>
            <div className="order-1 sm:order-2 w-full sm:w-auto">
              <SearchInput />
            </div>
          </div>

          {/* Mobile Categories pills - shown only on mobile */}
          <div className="md:hidden mb-6">
            <CategoryFilter
              categories={categories}
              activeCategorySlug={activeCategorySlug}
            />
          </div>

          {/* Grid view */}
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination controls */}
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            </>
          ) : (
            /* Empty State Container */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white py-16 px-4 text-center dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-500">
                <svg
                  className="h-8 w-8 stroke-[1.5]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-zinc-50">
                No products found
              </h3>
              <p className="mt-2 text-sm text-zinc-500 max-w-sm dark:text-zinc-400">
                We couldn&apos;t find any active products matching your filters or search terms. Try clearing search or selecting a different category.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

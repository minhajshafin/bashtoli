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
    <div className="relative min-h-screen bg-cream-50 overflow-hidden">
      {/* Botanical corner accents */}
      <svg
        viewBox="0 0 320 320"
        fill="none"
        className="absolute top-16 right-0 w-64 h-64 md:w-72 md:h-72 pointer-events-none"
        style={{ opacity: 0.16 }}
        aria-hidden="true"
      >
        <path d="M300 10 Q260 70 200 110 Q150 145 170 210 Q185 250 230 270" stroke="#c9a96e" strokeWidth="1.5" fill="none" />
        <path d="M200 90 Q182 65 158 82 Q148 100 168 112 Q188 124 200 90Z" fill="#c9a96e" opacity="0.7" />
        <path d="M240 55 Q222 30 198 47 Q188 65 208 77 Q228 89 240 55Z" fill="#c9a96e" opacity="0.5" />
        <path d="M275 25 Q257 5 233 22 Q223 38 243 47 Q263 56 275 25Z" fill="#c9a96e" opacity="0.4" />
        <path d="M310 45 Q320 95 308 145 Q296 185 268 205" stroke="#c9a96e" strokeWidth="1" fill="none" opacity="0.5" />
        <path d="M280 115 Q260 92 245 110 Q240 127 255 133 Q270 139 280 115Z" fill="#c9a96e" opacity="0.4" />
        <path d="M265 160 Q245 137 230 155 Q225 172 240 178 Q255 184 265 160Z" fill="#c9a96e" opacity="0.3" />
      </svg>
      <svg
        viewBox="0 0 280 280"
        fill="none"
        className="absolute bottom-20 left-0 w-56 h-56 md:w-60 md:h-60 pointer-events-none"
        style={{ opacity: 0.12 }}
        aria-hidden="true"
      >
        <path d="M20 260 Q60 215 80 155 Q100 95 55 45" stroke="#c9a96e" strokeWidth="1.5" fill="none" />
        <path d="M75 120 Q95 95 80 70 Q62 63 57 80 Q52 97 75 120Z" fill="#c9a96e" opacity="0.6" />
        <path d="M55 165 Q78 140 62 115 Q44 108 39 125 Q34 142 55 165Z" fill="#c9a96e" opacity="0.5" />
        <path d="M36 205 Q59 180 43 155 Q25 148 20 165 Q15 182 36 205Z" fill="#c9a96e" opacity="0.4" />
      </svg>

      {/* Page Header Banner */}
      <div className="bg-forest-800 px-5 md:px-8 py-10 md:py-14">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <h1
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: 'clamp(1.9rem, 4vw, 3rem)',
                color: '#f5ede0',
                fontWeight: 300,
                fontStyle: 'italic',
                lineHeight: 1.1,
              }}
            >
              {activeCategory ? activeCategory.name : 'All Products'}
            </h1>
            <p
              style={{
                color: '#a8c4b0',
                fontSize: '0.85rem',
                marginTop: '6px',
                fontFamily: "'Source Sans 3', system-ui, sans-serif",
              }}
            >
              {totalCount} items across all categories
            </p>
          </div>
          <div className="w-full md:w-72">
            <SearchInput />
          </div>
        </div>
      </div>

      {/* Main Catalog Content */}
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
        {/* Mobile Categories pills */}
        <div className="md:hidden mb-6">
          <CategoryFilter
            categories={categories}
            activeCategorySlug={activeCategorySlug}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Sidebar Filter - Desktop only */}
          <aside className="hidden md:block w-56 shrink-0 sticky top-20">
            <CategoryFilter
              categories={categories}
              activeCategorySlug={activeCategorySlug}
            />
          </aside>

          {/* Product Grid Area */}
          <main className="flex-1 min-w-0">
            {/* Controls / Result info */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-forest-200">
              <p className="text-xs font-medium text-forest-600">
                Showing{' '}
                <span className="font-semibold text-forest-900">
                  {products.length}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-forest-900">
                  {totalCount}
                </span>{' '}
                products
                {searchQuery && (
                  <>
                    {' '}
                    for &ldquo;
                    <span className="font-semibold text-forest-900">
                      {searchQuery}
                    </span>
                    &rdquo;
                  </>
                )}
              </p>
            </div>

            {/* Grid view */}
            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination controls */}
                <div className="mt-12">
                  <Pagination currentPage={currentPage} totalPages={totalPages} />
                </div>
              </>
            ) : (
              /* Empty State Container */
              <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-forest-200 bg-cream-100 py-20 px-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-forest-100 text-forest-500 mb-4">
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
                <h3
                  className="text-xl font-bold text-forest-900"
                  style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                >
                  Nothing here yet
                </h3>
                <p className="mt-2 text-sm text-forest-600 max-w-sm">
                  We couldn&apos;t find any active products matching your filters or search terms. Try clearing search or selecting a different category.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}


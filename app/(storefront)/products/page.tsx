import { Suspense } from 'react'
import { getStorefrontProducts, getStorefrontCategories } from '@/lib/queries/products'
import { ProductCard } from '@/components/storefront/product-card'
import { CategoryFilter } from '@/components/storefront/category-filter'
import { SortDropdown } from '@/components/storefront/sort-dropdown'
import { Pagination } from '@/components/storefront/pagination'
import { LeafDownfacing, LeafUprising } from '@/components/storefront/leaf-decorations'

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string
    q?: string
    sort?: string
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
  const sortParam = resolvedSearchParams.sort
  const validSorts = ['featured', 'price-asc', 'price-desc', 'new'] as const
  type SortValue = typeof validSorts[number]
  const sort: SortValue = (validSorts as readonly string[]).includes(sortParam ?? '') ? sortParam as SortValue : 'new'
  const currentPage = Math.max(1, parseInt(resolvedSearchParams.page || '1', 10))

  const limit = 12

  // Fetch products and categories concurrently
  const [{ products, totalCount }, categories] = await Promise.all([
    getStorefrontProducts({
      categorySlug: activeCategorySlug,
      search: searchQuery,
      sort,
      page: currentPage,
      limit,
    }),
    getStorefrontCategories(),
  ])

  const totalPages = Math.ceil(totalCount / limit)
  const activeCategory = categories.find((cat) => cat.slug === activeCategorySlug)

  return (
    <div className="relative min-h-screen bg-cream-50">
      {/* Botanical corner accents */}
      <LeafDownfacing
        className="absolute top-16 right-0 w-56 h-auto md:w-72 lg:w-80 pointer-events-none text-forest-800"
        style={{ opacity: 0.14 }}
      />
      <LeafUprising
        className="absolute bottom-20 left-0 w-52 h-auto md:w-64 lg:w-72 pointer-events-none text-forest-800"
        style={{ opacity: 0.12 }}
      />

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
          <Suspense>
            <SortDropdown />
          </Suspense>
        </div>
      </div>

      {/* Main Catalog Content */}
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
        {/* Mobile Categories pills */}
        <div className="md:hidden mb-6">
          <Suspense>
            <CategoryFilter
              categories={categories}
              activeCategorySlug={activeCategorySlug}
            />
          </Suspense>
        </div>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-10 items-start">
          {/* Sidebar Filter - Desktop only */}
          <aside className="hidden md:block w-64 shrink-0 sticky top-24 self-start">
            <Suspense>
              <CategoryFilter
                categories={categories}
                activeCategorySlug={activeCategorySlug}
              />
            </Suspense>
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
                <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product, idx) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      loading={idx < 4 ? 'eager' : 'lazy'}
                    />
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


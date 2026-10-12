import { Suspense } from 'react'
import Link from 'next/link'
import { getStorefrontProducts, getStorefrontCategories } from '@/lib/queries/products'
import { ProductCard } from '@/components/storefront/product-card'
import { CategoryFilter } from '@/components/storefront/category-filter'
import { SortDropdown } from '@/components/storefront/sort-dropdown'
import { Pagination } from '@/components/storefront/pagination'
import { WaveDivider } from '@/components/storefront/wave-divider'
import { BambooPaperWatermark, DriftingBambooLeaf } from '@/components/storefront/bamboo-motifs'

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string
    q?: string
    sort?: string
    page?: string
  }>
}

export const metadata = {
  title: 'Stationery Catalog & Goods | Bashtoli',
  description: 'Explore handpicked notebooks, artisanal pens, and paper goods crafted with care at Bashtoli Stationery, Dhaka.',
  alternates: {
    canonical: 'https://bashtoli.com/products',
  },
  openGraph: {
    title: 'Stationery Catalog & Goods | Bashtoli',
    description: 'Explore handpicked notebooks, artisanal pens, and paper goods crafted with care at Bashtoli Stationery, Dhaka.',
    url: 'https://bashtoli.com/products',
    siteName: 'Bashtoli Stationery',
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
  type SortValue = (typeof validSorts)[number]
  const sort: SortValue = (validSorts as readonly string[]).includes(sortParam ?? '')
    ? (sortParam as SortValue)
    : 'new'
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
    <div className="relative min-h-screen bg-cream-100 flex flex-col">
      {/* 1. Gallery Header Banner (Atelier Moss Canvas) */}
      <div className="relative overflow-hidden bg-forest-950 bg-laid-paper-dark px-4 sm:px-6 lg:px-8 xl:px-10 pt-10 pb-6 sm:pt-14 sm:pb-8 lg:pt-18 lg:pb-10">
        {/* Blind-Debossed Pulp Watermark + Minimalist Sumi-e Leaf */}
        <BambooPaperWatermark
          theme="dark"
          className="-right-10 top-1/2 -translate-y-1/2 w-72 h-72 sm:w-88 sm:h-88 opacity-50"
        />
        <DriftingBambooLeaf
          theme="dark"
          className="left-8 bottom-4 hidden sm:block opacity-60"
          rotation={22}
          scale={0.9}
        />

        <div className="relative z-10 max-w-[1440px] xl:max-w-[1520px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            {/* Stationery Eyebrow Kicker */}
            <div className="inline-flex items-center gap-2 mb-2.5">
              <span className="h-px w-5 bg-gold-400/60" />
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.26em] text-gold-400 font-sans font-medium">
                {activeCategory ? 'Collection Archive' : 'All Collections'} &middot; Dhaka
              </span>
            </div>

            <h1 className="font-display font-medium text-cream-50 leading-tight text-3xl sm:text-4xl md:text-5xl tracking-[-0.015em]">
              {activeCategory ? activeCategory.name : 'Writing & Paper Goods'}
            </h1>

            <p className="text-forest-200/90 text-sm sm:text-base mt-2 font-sans font-normal leading-relaxed">
              {activeCategory
                ? `Showing ${totalCount} handcrafted piece${totalCount === 1 ? '' : 's'} in ${activeCategory.name}.`
                : `Handpicked notebooks, artisanal pens, and bamboo paper goods for thoughtful writing.`}
            </p>
          </div>

          <div className="self-start md:self-end">
            <Suspense>
              <SortDropdown />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Signature Sugeta Layered Wave Divider: Forest Header → Cream Catalog */}
      <WaveDivider variant="hero-to-products" />

      {/* 2. Main Catalog Canvas (Warm Alabaster Laid Paper) */}
      <div className="relative z-10 flex-1 max-w-[1440px] xl:max-w-[1520px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 sm:py-12 lg:py-14">
        {/* Mobile Category Filter Pills */}
        <div className="md:hidden mb-6">
          <Suspense>
            <CategoryFilter categories={categories} activeCategorySlug={activeCategorySlug} />
          </Suspense>
        </div>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
          {/* Desktop Gallery Index Sidebar */}
          <aside className="hidden md:block w-64 lg:w-72 shrink-0 sticky top-24 self-start">
            <Suspense>
              <CategoryFilter categories={categories} activeCategorySlug={activeCategorySlug} />
            </Suspense>
          </aside>

          {/* Product Grid Area */}
          <main className="flex-1 min-w-0 w-full">
            {/* Results status bar */}
            <div className="flex items-center justify-between mb-6 pb-3.5 border-b border-forest-900/10">
              <p className="text-xs font-sans text-forest-700">
                Showing{' '}
                <span className="font-semibold text-forest-950">{products.length}</span> of{' '}
                <span className="font-semibold text-forest-950">{totalCount}</span> pieces
                {searchQuery && (
                  <>
                    {' '}
                    for &ldquo;
                    <span className="font-semibold text-forest-950">{searchQuery}</span>
                    &rdquo;
                  </>
                )}
              </p>

              {(activeCategorySlug || searchQuery) && (
                <Link
                  href="/products"
                  className="text-xs font-sans font-medium text-forest-600 hover:text-gold-700 transition-colors"
                >
                  Clear all filters
                </Link>
              )}
            </div>

            {/* Grid view */}
            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-3.5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product, idx) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      loading={idx < 4 ? 'eager' : 'lazy'}
                    />
                  ))}
                </div>

                {/* Pagination controls */}
                <div className="mt-12 sm:mt-16">
                  <Pagination currentPage={currentPage} totalPages={totalPages} />
                </div>
              </>
            ) : (
              /* Tactile Stationery Empty State */
              <div className="relative overflow-hidden flex flex-col items-center justify-center rounded-3xl border border-forest-900/15 bg-cream-50/80 py-18 px-6 text-center shadow-subtle">
                <BambooPaperWatermark
                  theme="light"
                  className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 opacity-30"
                />

                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-cream-200 border border-gold-500/30 text-gold-700 mb-4 shadow-xs">
                  <svg
                    className="h-7 w-7 stroke-[1.5]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                    />
                  </svg>
                </div>

                <h3 className="relative z-10 font-display font-medium text-2xl text-forest-950 mb-2">
                  No items in this collection
                </h3>

                <p className="relative z-10 text-sm text-forest-700 max-w-sm mb-6 leading-relaxed font-sans">
                  We could not find any active stationery pieces matching your current filters.
                </p>

                <div className="relative z-10 flex flex-wrap gap-2.5 justify-center">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-forest-950 text-cream-100 text-xs font-sans font-medium hover:bg-gold-500 hover:text-forest-950 transition-colors shadow-sm"
                  >
                    View All Products
                  </Link>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

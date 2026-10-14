import { Suspense } from 'react'
import Link from 'next/link'
import { getStorefrontProducts, getStorefrontCategories } from '@/lib/queries/products'
import { ProductCard } from '@/components/storefront/product-card'
import { CategoryFilter } from '@/components/storefront/category-filter'
import { SortDropdown } from '@/components/storefront/sort-dropdown'
import { Pagination } from '@/components/storefront/pagination'
import { BambooPaperWatermark } from '@/components/storefront/bamboo-motifs'

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string
    q?: string
    sort?: string
    page?: string
  }>
}

export const metadata = {
  title: 'Stationery Catalog & Goods',
  description: 'Explore handpicked notebooks, artisanal pens, and paper goods crafted with care at Bashtoli Stationery, Dhaka.',
  alternates: {
    canonical: 'https://bashtoli.com/products',
  },
  openGraph: {
    title: 'Stationery Catalog & Goods',
    description: 'Explore handpicked notebooks, artisanal pens, and paper goods crafted with care at Bashtoli Stationery, Dhaka.',
    url: 'https://bashtoli.com/products',
    siteName: 'Bashtoli Stationery',
    locale: 'en_US',
    type: 'website',
  },
}

/**
 * Direction A: The "Ginza Itoya" Unified Archival Canvas.
 * 100% seamless warm alabaster laid paper canvas with an airy gallery masthead,
 * horizontal collection ribbon, and full-bleed 4-column product grid.
 */
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
    <div className="relative min-h-screen bg-cream-100 bg-laid-paper flex flex-col">
      {/* 1. Gallery Header (Deep Forest Canvas) */}
      <div className="w-full bg-forest-950 bg-laid-paper-dark border-b border-forest-800/80">
        <div className="max-w-[1440px] xl:max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-6 pb-5 sm:pt-8 sm:pb-7 lg:pt-9 lg:pb-8">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 mb-2 sm:mb-2.5">
            <span className="h-px w-3.5 bg-gold-400/60" />
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.24em] text-gold-400/90 font-sans font-medium">
              Catalogue
            </span>
          </div>

          {/* Main Title Row: Title on Left, Sort on Right */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6">
            <h1 className="font-display font-medium text-cream-50 leading-tight text-2xl sm:text-[1.85rem] lg:text-[2.25rem] tracking-[-0.015em]">
              {activeCategory ? activeCategory.name : 'Writing & Paper Goods'}
            </h1>

            <div className="self-start sm:self-auto shrink-0">
              <Suspense>
                <SortDropdown />
              </Suspense>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-forest-200/75 text-xs sm:text-[13px] mt-2 font-sans font-normal leading-relaxed max-w-2xl lg:max-w-3xl text-pretty">
            {activeCategory
              ? `Selected pieces in our ${activeCategory.name.toLowerCase()} collection, crafted for daily writing and\u00A0reflection.`
              : `Handpicked notebooks, artisanal pens, and paper goods crafted with care for thoughtful daily\u00A0use.`}
          </p>
        </div>
      </div>

      {/* 2. Collection Filter Ribbon (Deep Forest Ribbon — flush below sticky navbar) */}
      <div className="w-full bg-forest-950/98 bg-laid-paper-dark border-b border-forest-800/80 backdrop-blur-md sticky top-14 sm:top-16 z-30 shadow-sm">
        <div className="max-w-[1440px] xl:max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-2.5 sm:py-3">
          <Suspense>
            <CategoryFilter categories={categories} activeCategorySlug={activeCategorySlug} />
          </Suspense>
        </div>
      </div>

      {/* 3. Main Full-Width Product Gallery Canvas */}
      <div className="flex-1 max-w-[1440px] xl:max-w-[1520px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-7 sm:py-9 lg:py-12">
        {/* Results status bar */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-forest-900/10">
          <p className="text-xs font-sans text-forest-700">
            Showing <span className="font-semibold text-forest-950">{products.length}</span> of{' '}
            <span className="font-semibold text-forest-950">{totalCount}</span> pieces
            {searchQuery && (
              <>
                {' '}
                for &ldquo;<span className="font-semibold text-forest-950">{searchQuery}</span>&rdquo;
              </>
            )}
          </p>

          {(activeCategorySlug || searchQuery) && (
            <Link
              href="/products"
              className="text-xs font-sans font-medium text-forest-600 hover:text-gold-700 transition-colors"
            >
              Reset filters &rarr;
            </Link>
          )}
        </div>

        {/* Gallery Grid (2-col mobile, 3-col tablet, 4-col laptop, 5-col desktop) */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  loading={idx < 4 ? 'eager' : 'lazy'}
                />
              ))}
            </div>

            {/* Tactile Pagination */}
            <div className="mt-12 sm:mt-16">
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            </div>
          </>
        ) : (
          /* Tactile Stationery Empty State */
          <div className="relative overflow-hidden flex flex-col items-center justify-center rounded-3xl border border-forest-900/15 bg-cream-50/80 py-18 px-6 text-center shadow-subtle my-6">
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

            <h3 className="relative z-10 font-display font-medium text-xl sm:text-[1.35rem] text-forest-950 mb-2">
              No items in this collection
            </h3>

            <p className="relative z-10 text-xs sm:text-[13px] text-forest-700 max-w-sm mb-6 leading-relaxed font-sans">
              We could not find any active stationery pieces matching your current filters.
            </p>

            <div className="relative z-10 flex flex-wrap gap-2.5 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-forest-950 text-cream-100 text-xs font-sans font-medium hover:bg-gold-500 hover:text-forest-950 transition-colors shadow-sm"
              >
                View All Collections
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

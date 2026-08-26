import type { Metadata } from 'next'
import Link from 'next/link'
import {
  fetchAdminProducts,
  ADMIN_PRODUCTS_PAGE_SIZE,
  type AdminProductListItem,
} from '@/lib/queries/admin-products'
import { ProductList } from '@/components/admin/product-list'

export const metadata: Metadata = {
  title: 'Products',
}

interface PageProps {
  searchParams: Promise<{
    status?: string
    search?: string
    page?: string
  }>
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const { status = 'all', search = '', page: pageParam = '1' } = await searchParams

  const parsedPage = Math.max(1, parseInt(pageParam, 10) || 1)

  let products: AdminProductListItem[] = []
  let totalCount = 0

  try {
    const result = await fetchAdminProducts({ status, search, page: parsedPage })
    products = result.products
    totalCount = result.totalCount
  } catch (err) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        Failed to load products:{' '}
        {err instanceof Error ? err.message : 'Unknown error'}
      </div>
    )
  }

  const safeTotal = totalCount
  const totalPages = Math.ceil(safeTotal / ADMIN_PRODUCTS_PAGE_SIZE)
  const offset = (parsedPage - 1) * ADMIN_PRODUCTS_PAGE_SIZE

  /** Builds a URL for a given page number, preserving search and status params. */
  const pageUrl = (p: number) => {
    const params = new URLSearchParams()
    if (status && status !== 'all') params.set('status', status)
    if (search.trim()) params.set('search', search.trim())
    params.set('page', String(p))
    return `/admin/products?${params.toString()}`
  }

  const filterTabs = [
    { label: 'All Products', value: 'all' },
    { label: 'Published / Active', value: 'active' },
    { label: 'Drafts / Inactive', value: 'draft' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your catalog, prices, and status.
          </p>
        </div>
        <Link
          id="new-product-btn"
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 shadow-xs"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* Search bar — plain GET form so it works without JS */}
      <form
        method="get"
        action="/admin/products"
        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
      >
        {status && status !== 'all' && (
          <input type="hidden" name="status" value={status} />
        )}
        <input type="hidden" name="page" value="1" />

        <div className="relative flex-1">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search products by name…"
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-slate-300 bg-white text-sm placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {search.trim() && (
          <Link
            href={`/admin/products?status=${status}&page=1`}
            className="h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-500 hover:bg-slate-50 flex items-center transition-colors"
          >
            Clear
          </Link>
        )}

        <button
          type="submit"
          className="h-10 px-4 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Status filter tabs */}
      <div className="flex border-b border-slate-200">
        <nav className="-mb-px flex gap-6" aria-label="Product status filter">
          {filterTabs.map((tab) => {
            const isActive = status === tab.value || (tab.value === 'all' && !status)
            const tabSearch = search.trim()
              ? `&search=${encodeURIComponent(search.trim())}`
              : ''
            return (
              <Link
                key={tab.value}
                href={`/admin/products?status=${tab.value}${tabSearch}&page=1`}
                className={`border-b-2 py-4 px-1 text-sm font-medium transition-all ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Product list */}
      <ProductList products={products} />

      {/* Empty state */}
      {products.length === 0 && (
        <p className="py-4 text-center text-sm text-slate-400">
          {search.trim()
            ? `No products matched "${search.trim()}".`
            : 'No products found for the selected filter.'}
        </p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <p className="text-sm text-slate-500">
            Showing{' '}
            <span className="font-semibold text-slate-700">
              {offset + 1}–{Math.min(offset + ADMIN_PRODUCTS_PAGE_SIZE, safeTotal)}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-slate-700">{safeTotal.toLocaleString()}</span>{' '}
            products
          </p>

          <div className="flex items-center gap-2">
            {parsedPage > 1 ? (
              <Link
                href={pageUrl(parsedPage - 1)}
                className="inline-flex h-9 items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                ← Previous
              </Link>
            ) : (
              <span className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-400 cursor-not-allowed select-none">
                ← Previous
              </span>
            )}

            <span className="text-sm font-medium text-slate-600">
              Page {parsedPage} of {totalPages}
            </span>

            {parsedPage < totalPages ? (
              <Link
                href={pageUrl(parsedPage + 1)}
                className="inline-flex h-9 items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Next →
              </Link>
            ) : (
              <span className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-400 cursor-not-allowed select-none">
                Next →
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

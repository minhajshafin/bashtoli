import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Plus,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Package,
} from 'lucide-react'
import {
  fetchAdminProducts,
  ADMIN_PRODUCTS_PAGE_SIZE,
  type AdminProductListItem,
} from '@/lib/queries/admin-products'
import { ProductList } from '@/components/admin/product-list'

export const metadata: Metadata = {
  title: 'Products | Bashtoli Admin',
  description: 'Manage store catalog, prices, and status.',
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
    { label: 'Active', value: 'active' },
    { label: 'Draft', value: 'draft' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Products
            </h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 border border-slate-200">
              {safeTotal.toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Manage your store catalog, pricing, inventory status, and visibility.
          </p>
        </div>

        <Link
          id="new-product-btn"
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-bold text-white transition hover:bg-indigo-700 shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Filter Toolbar: Search Bar + Filter Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status filter tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80 shrink-0">
          {filterTabs.map((tab) => {
            const isActive = status === tab.value || (tab.value === 'all' && !status)
            const tabSearch = search.trim()
              ? `&search=${encodeURIComponent(search.trim())}`
              : ''
            return (
              <Link
                key={tab.value}
                href={`/admin/products?status=${tab.value}${tabSearch}&page=1`}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>

        {/* Search Bar */}
        <form
          method="get"
          action="/admin/products"
          className="flex items-center gap-2 flex-1 max-w-md"
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
              className="w-full h-9 pl-9 pr-8 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none shadow-2xs"
            />
            <div
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            >
              <Search className="h-4 w-4" />
            </div>

            {search.trim() && (
              <Link
                href={`/admin/products?status=${status}&page=1`}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          <button
            type="submit"
            className="h-9 px-3.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {/* Product List Table */}
      <ProductList products={products} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <p className="text-xs sm:text-sm text-slate-500">
            Showing{' '}
            <span className="font-bold text-slate-800">
              {offset + 1}–{Math.min(offset + ADMIN_PRODUCTS_PAGE_SIZE, safeTotal)}
            </span>{' '}
            of{' '}
            <span className="font-bold text-slate-800">
              {safeTotal.toLocaleString()}
            </span>{' '}
            products
          </p>

          <div className="flex items-center gap-2">
            {parsedPage > 1 ? (
              <Link
                href={pageUrl(parsedPage - 1)}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </Link>
            ) : (
              <span className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-400 cursor-not-allowed select-none">
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </span>
            )}

            <span className="text-xs font-semibold text-slate-600 px-2">
              {parsedPage} / {totalPages}
            </span>

            {parsedPage < totalPages ? (
              <Link
                href={pageUrl(parsedPage + 1)}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <span className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-400 cursor-not-allowed select-none">
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'
import { Plus, Search, X, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  fetchAdminProducts,
  ADMIN_PRODUCTS_PAGE_SIZE,
  type AdminProductListItem,
} from '@/lib/queries/admin-products'
import { ProductList } from '@/components/admin/product-list'

export const metadata: Metadata = {
  title: 'Products',
  description: 'Manage store catalog, prices, and status.',
}

export const instant = false

interface PageProps {
  searchParams: Promise<{
    status?: string
    search?: string
    page?: string
  }>
}

export default async function ProductsPage({ searchParams }: PageProps) {
  await connection()
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
      <div
        role="alert"
        className="rounded-2xl border border-signal-danger-border bg-signal-danger-bg p-6 text-sm font-medium text-signal-danger"
      >
        Failed to load products:{' '}
        {err instanceof Error ? err.message : 'Unknown error'}
      </div>
    )
  }

  const safeTotal = totalCount
  const totalPages = Math.ceil(safeTotal / ADMIN_PRODUCTS_PAGE_SIZE)
  const offset = (parsedPage - 1) * ADMIN_PRODUCTS_PAGE_SIZE

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pb-5 border-b border-paper-300">
        <div className="space-y-1.5">
          <p className="admin-kicker text-ink-500">02 / Catalog Ledger</p>
          <div className="flex items-center gap-3">
            <h1 className="admin-page-title text-ink-950">Products</h1>
            <span className="rounded-full bg-ink-950 px-2.5 py-0.5 font-mono text-xs font-bold text-paper-50">
              {safeTotal.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-ink-600">
            Manage store catalog, pricing, inventory status, and visibility.
          </p>
        </div>

        <Link
          id="new-product-btn"
          href="/admin/products/new"
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-ink-950 px-4 py-2 text-xs sm:text-sm font-bold text-paper-50 transition-colors hover:bg-ink-800 shadow-elevation-1 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Filter Toolbar: Status Tabs + Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <nav
          aria-label="Product status filter"
          className="flex items-center gap-1 p-1 bg-paper-200 rounded-xl border border-paper-300 shrink-0 overflow-x-auto"
        >
          {filterTabs.map((tab) => {
            const isActive = status === tab.value || (tab.value === 'all' && !status)
            const tabSearch = search.trim()
              ? `&search=${encodeURIComponent(search.trim())}`
              : ''
            return (
              <Link
                key={tab.value}
                href={`/admin/products?status=${tab.value}${tabSearch}&page=1`}
                className={`inline-flex min-h-[38px] items-center justify-center px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-ink-950 text-paper-50 shadow-subtle'
                    : 'text-ink-700 hover:text-ink-950 hover:bg-paper-50/70'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>

        <search className="flex-1 max-w-md">
          <form
            method="get"
            action="/admin/products"
            className="flex items-center gap-2"
          >
            {status && status !== 'all' && (
              <input type="hidden" name="status" value={status} />
            )}
            <input type="hidden" name="page" value="1" />

            <div className="relative flex-1">
              <label htmlFor="admin-products-search" className="sr-only">
                Search products by name
              </label>
              <input
                id="admin-products-search"
                type="search"
                name="search"
                defaultValue={search}
                placeholder="Search products by name…"
                className="w-full min-h-[44px] pl-10 pr-9 rounded-xl border border-ink-400/70 bg-paper-50 text-sm text-ink-950 placeholder:text-ink-500 focus-visible:outline-2 focus-visible:outline-ink-950 focus-visible:outline-offset-1"
              />
              <div
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none"
                aria-hidden="true"
              >
                <Search className="h-4 w-4" />
              </div>

              {search.trim() && (
                <Link
                  href={`/admin/products?status=${status}&page=1`}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-ink-500 hover:text-ink-950 rounded-lg"
                  aria-label="Clear search"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              )}
            </div>

            <button
              type="submit"
              className="min-h-[44px] px-4 rounded-xl bg-ink-950 text-paper-50 text-xs font-bold hover:bg-ink-800 transition-colors cursor-pointer shrink-0"
            >
              Search
            </button>
          </form>
        </search>
      </div>

      {/* Product List Ledger */}
      <ProductList products={products} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-paper-300 pt-4">
          <p className="font-mono text-xs text-ink-600">
            Showing{' '}
            <span className="font-bold text-ink-950">
              {offset + 1}–{Math.min(offset + ADMIN_PRODUCTS_PAGE_SIZE, safeTotal)}
            </span>{' '}
            of{' '}
            <span className="font-bold text-ink-950">
              {safeTotal.toLocaleString()}
            </span>{' '}
            products
          </p>

          <div className="flex items-center gap-2">
            {parsedPage > 1 ? (
              <Link
                href={pageUrl(parsedPage - 1)}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-ink-400/70 bg-paper-50 px-4 text-xs font-bold text-ink-950 hover:bg-paper-200 transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Previous
              </Link>
            ) : (
              <span className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-paper-300 bg-paper-100 px-4 text-xs font-semibold text-ink-400 cursor-not-allowed select-none">
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Previous
              </span>
            )}

            <span className="font-mono text-xs font-bold text-ink-700 px-2">
              {parsedPage} / {totalPages}
            </span>

            {parsedPage < totalPages ? (
              <Link
                href={pageUrl(parsedPage + 1)}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-ink-400/70 bg-paper-50 px-4 text-xs font-bold text-ink-950 hover:bg-paper-200 transition-colors"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            ) : (
              <span className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-paper-300 bg-paper-100 px-4 text-xs font-semibold text-ink-400 cursor-not-allowed select-none">
                Next
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductList } from '@/components/admin/product-list'

export const metadata: Metadata = {
  title: 'Products',
}

interface PageProps {
  searchParams: Promise<{
    status?: string
  }>
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const { status = 'all' } = await searchParams

  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select('*, categories(*)')
    .order('created_at', { ascending: false })

  if (status === 'active') {
    query = query.eq('active', true)
  } else if (status === 'draft' || status === 'inactive') {
    query = query.eq('active', false)
  }

  const { data: products = [], error } = await query

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        Failed to load products: {error.message}
      </div>
    )
  }

  // Safe cast since categories is selected as a single joined object
  const typedProducts = (products ?? []).map((product) => ({
    ...product,
    categories: Array.isArray(product.categories)
      ? product.categories[0] ?? null
      : product.categories ?? null,
  }))

  const filterTabs = [
    { label: 'All Products', value: 'all', count: null },
    { label: 'Published / Active', value: 'active', count: null },
    { label: 'Drafts / Inactive', value: 'draft', count: null },
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* Filters bar */}
      <div className="flex border-b border-slate-200">
        <nav className="-mb-px flex gap-6" aria-label="Tabs">
          {filterTabs.map((tab) => {
            const isActive =
              status === tab.value || (tab.value === 'all' && !status)
            return (
              <Link
                key={tab.value}
                href={`/admin/products?status=${tab.value}`}
                className={`border-b-2 py-4 px-1 text-sm font-medium transition-all ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* List */}
      <ProductList products={typedProducts} />
    </div>
  )
}

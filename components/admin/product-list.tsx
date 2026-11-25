'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Edit2, Copy, Check, Package } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import {
  SmartStatusToggle,
  FeaturedToggle,
  DeleteProductButton,
} from '@/components/admin/product-row-controls'
import type { Database } from '@/lib/supabase/database.types'

type ProductRow = Database['public']['Tables']['products']['Row']
type CategoryRow = Database['public']['Tables']['categories']['Row']

export type ProductWithCategory = ProductRow & {
  categories: CategoryRow | null
}

export function ProductList({ products }: { products: ProductWithCategory[] }) {
  const { toast } = useToast()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    try {
      const msg = sessionStorage.getItem('admin_product_toast')
      if (msg) {
        sessionStorage.removeItem('admin_product_toast')
        toast(msg, 'success')
      }
    } catch {
      // Ignore
    }
  }, [toast])

  const handleCopy = (slug: string) => {
    navigator.clipboard.writeText(slug)
    setCopiedId(slug)
    setTimeout(() => setCopiedId(null), 1800)
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-400/70 bg-paper-50 py-16 px-4 text-center shadow-subtle">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-ink-950 text-paper-50">
          <Package className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="text-base font-bold text-ink-950">No products found</p>
        <p className="mt-1 text-xs text-ink-600 max-w-sm">
          Try updating your filters or search query, or create a new product to populate your catalog.
        </p>
        <Link
          href="/admin/products/new"
          className="mt-5 inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-ink-950 px-5 py-2 text-xs font-bold text-paper-50 transition-colors hover:bg-ink-800"
        >
          Add Product
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-paper-300 bg-paper-50 shadow-subtle">
      <div
        tabIndex={0}
        role="region"
        aria-labelledby="products-table-caption"
        className="admin-table-region focus-visible:outline-2 focus-visible:outline-ink-950 focus-visible:outline-inset"
      >
        <table className="admin-responsive-table w-full text-sm text-ink-700">
          <caption id="products-table-caption" className="sr-only">
            Store catalog products
          </caption>
          <thead>
            <tr className="border-b border-paper-300 bg-paper-200/70 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-600">
              <th scope="col" className="px-6 py-3.5">Product</th>
              <th scope="col" className="px-6 py-3.5">Category</th>
              <th scope="col" className="px-6 py-3.5 text-right">Price</th>
              <th scope="col" className="px-6 py-3.5 text-center">Status</th>
              <th scope="col" className="px-6 py-3.5 text-center">Featured</th>
              <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-paper-200 bg-paper-50">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-paper-100/80 transition-colors">
                <th scope="row" className="px-6 py-4 font-medium text-ink-950 text-left">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paper-200 border border-paper-300 text-ink-700">
                      <Package className="h-4.5 w-4.5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-ink-950 text-sm">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-xs text-ink-500 truncate max-w-[170px]">
                          /{product.slug}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(product.slug)}
                          aria-label={`Copy slug ${product.slug}`}
                          title="Copy product slug"
                          className="p-1 -m-1 text-ink-500 hover:text-ink-950 transition-colors cursor-pointer"
                        >
                          {copiedId === product.slug ? (
                            <Check className="h-3 w-3 text-signal-success" aria-hidden="true" />
                          ) : (
                            <Copy className="h-3 w-3" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </th>

                <td data-label="Category" className="px-6 py-4">
                  {product.categories ? (
                    <span className="inline-flex items-center rounded-lg bg-paper-200 px-2.5 py-1 text-xs font-semibold text-ink-900 border border-paper-300">
                      {product.categories.name}
                    </span>
                  ) : (
                    <span className="text-ink-500 italic text-xs">Uncategorized</span>
                  )}
                </td>

                <td data-label="Price" className="px-6 py-4 text-right font-mono font-bold text-ink-950 whitespace-nowrap tabular-nums">
                  Tk {product.base_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>

                <td data-label="Status" className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center">
                    <SmartStatusToggle
                      id={product.id}
                      name={product.name}
                      active={product.active}
                    />
                  </div>
                </td>

                <td data-label="Featured" className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center">
                    <FeaturedToggle
                      id={product.id}
                      name={product.name}
                      featured={product.featured}
                    />
                  </div>
                </td>

                <td data-label="Actions" className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      id={`edit-product-${product.id}`}
                      href={`/admin/products/${product.id}`}
                      aria-label={`Edit ${product.name}`}
                      title="Edit product"
                      className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] rounded-xl text-ink-700 hover:text-paper-50 hover:bg-ink-950 transition-colors border border-transparent hover:border-ink-950"
                    >
                      <Edit2 className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <DeleteProductButton id={product.id} name={product.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

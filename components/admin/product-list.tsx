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
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-adm-border bg-adm-surface py-14 px-4 text-center shadow-subtle">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-adm-surface-2 border border-adm-border text-adm-muted">
          <Package className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold text-adm-fg">No products found</p>
        <Link
          href="/admin/products/new"
          className="mt-4 inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-adm-accent px-5 py-2 text-xs font-semibold text-adm-accent-fg transition-colors hover:bg-adm-accent-hover"
        >
          Add Product
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-adm-border bg-adm-surface shadow-subtle">
      <div
        tabIndex={0}
        role="region"
        aria-labelledby="products-table-caption"
        className="admin-table-region"
      >
        <table className="admin-responsive-table w-full text-sm text-adm-fg-2">
          <caption id="products-table-caption" className="sr-only">
            Store catalog products
          </caption>
          <thead>
            <tr className="border-b border-adm-border bg-adm-surface-2/70 text-left text-xs font-medium text-adm-muted">
              <th scope="col" className="px-6 py-3">Product</th>
              <th scope="col" className="px-6 py-3">Category</th>
              <th scope="col" className="px-6 py-3 text-right">Price</th>
              <th scope="col" className="px-6 py-3 text-center">Status</th>
              <th scope="col" className="px-6 py-3 text-center">Featured</th>
              <th scope="col" className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-adm-border bg-adm-surface">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-adm-surface-2/60 transition-colors">
                <th scope="row" className="px-6 py-3.5 font-medium text-adm-fg text-left">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-adm-surface-2 border border-adm-border text-adm-muted">
                      <Package className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-adm-fg text-sm">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-xs text-adm-muted truncate max-w-[170px]">
                          /{product.slug}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(product.slug)}
                          aria-label={`Copy slug ${product.slug}`}
                          title="Copy product slug"
                          className="p-1 -m-1 text-adm-muted hover:text-adm-fg transition-colors cursor-pointer"
                        >
                          {copiedId === product.slug ? (
                            <Check className="h-3 w-3 text-adm-success" aria-hidden="true" />
                          ) : (
                            <Copy className="h-3 w-3" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </th>

                <td data-label="Category" className="px-6 py-3.5">
                  {product.categories ? (
                    <span className="inline-flex items-center rounded-lg bg-adm-surface-2 px-2.5 py-1 text-xs font-medium text-adm-fg border border-adm-border">
                      {product.categories.name}
                    </span>
                  ) : (
                    <span className="text-adm-muted text-xs">Uncategorized</span>
                  )}
                </td>

                <td data-label="Price" className="px-6 py-3.5 text-right font-mono font-semibold text-adm-fg whitespace-nowrap tabular-nums">
                  Tk {product.base_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>

                <td data-label="Status" className="px-6 py-3.5 text-center">
                  <div className="flex items-center justify-center">
                    <SmartStatusToggle
                      id={product.id}
                      name={product.name}
                      active={product.active}
                    />
                  </div>
                </td>

                <td data-label="Featured" className="px-6 py-3.5 text-center">
                  <div className="flex items-center justify-center">
                    <FeaturedToggle
                      id={product.id}
                      name={product.name}
                      featured={product.featured}
                    />
                  </div>
                </td>

                <td data-label="Actions" className="px-6 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      id={`edit-product-${product.id}`}
                      href={`/admin/products/${product.id}`}
                      aria-label={`Edit ${product.name}`}
                      title="Edit product"
                      className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] rounded-xl text-adm-muted hover:text-adm-accent-text hover:bg-adm-accent-tint transition-colors border border-transparent hover:border-adm-accent-border"
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

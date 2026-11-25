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
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center shadow-xs">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 border border-slate-200">
          <Package className="h-6 w-6" />
        </div>
        <p className="text-base font-bold text-slate-800">No products found</p>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">
          Try updating your filters or search query, or create a new product to populate your catalog.
        </p>
        <Link
          href="/admin/products/new"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-700 shadow-xs"
        >
          Add Product
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-slate-600">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-6 py-3.5">Product</th>
              <th className="px-6 py-3.5">Category</th>
              <th className="px-6 py-3.5 text-right">Price</th>
              <th className="px-6 py-3.5 text-center">Status</th>
              <th className="px-6 py-3.5 text-center">Featured</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-slate-400">
                      <Package className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-900 text-sm">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-xs text-slate-400 truncate max-w-[160px]">
                          /{product.slug}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(product.slug)}
                          title="Copy product slug"
                          className="text-slate-400 hover:text-slate-700 transition-colors"
                        >
                          {copiedId === product.slug ? (
                            <Check className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  {product.categories ? (
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                      {product.categories.name}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic text-xs">Uncategorized</span>
                  )}
                </td>

                <td className="px-6 py-4 text-right font-black text-slate-900 whitespace-nowrap">
                  Tk {product.base_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>

                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center">
                    <SmartStatusToggle
                      id={product.id}
                      name={product.name}
                      active={product.active}
                    />
                  </div>
                </td>

                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center">
                    <FeaturedToggle
                      id={product.id}
                      name={product.name}
                      featured={product.featured}
                    />
                  </div>
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      id={`edit-product-${product.id}`}
                      href={`/admin/products/${product.id}`}
                      title="Edit product"
                      className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100"
                    >
                      <Edit2 className="h-4 w-4" />
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

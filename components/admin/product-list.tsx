'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Star,
  Edit2,
  Trash2,
  Copy,
  Check,
  Package,
  ExternalLink,
} from 'lucide-react'
import {
  toggleProductActive,
  toggleProductFeatured,
  deleteProduct,
} from '@/lib/actions/products'
import { useAdminConfirm } from '@/components/admin/admin-confirm-dialog'
import { useToast } from '@/components/ui/toast'
import type { Database } from '@/lib/supabase/database.types'

type ProductRow = Database['public']['Tables']['products']['Row']
type CategoryRow = Database['public']['Tables']['categories']['Row']

export type ProductWithCategory = ProductRow & {
  categories: CategoryRow | null
}

/**
 * Smart Status Control.
 * Replaces the duplicate "Published" toggle + "Status" badge columns
 * with a single interactive, accessible status control.
 */
function SmartStatusToggle({
  id,
  name,
  active,
}: {
  id: string
  name: string
  active: boolean
}) {
  const { toast } = useToast()
  const [isActive, setIsActive] = useState(active)
  const [isPending, setIsPending] = useState(false)

  async function handleToggle() {
    setIsPending(true)
    const prevVal = isActive
    const nextVal = !isActive
    setIsActive(nextVal) // optimistic update
    const res = await toggleProductActive(id, nextVal)
    if (res.error) {
      toast(res.error, 'error')
      setIsActive(prevVal) // rollback
    }
    setIsPending(false)
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      aria-label={`Toggle ${name} status`}
      onClick={handleToggle}
      disabled={isPending}
      title={isActive ? 'Click to set as Draft' : 'Click to publish as Active'}
      className={`group inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-bold transition-all border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        isActive
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 hover:border-slate-300'
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full transition-colors ${
          isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
        }`}
        aria-hidden="true"
      />
      <span>{isPending ? 'Updating…' : isActive ? 'Active' : 'Draft'}</span>
    </button>
  )
}

/**
 * Featured Star Toggle.
 * Compact and clean star toggle button.
 */
function FeaturedToggle({
  id,
  name,
  featured,
}: {
  id: string
  name: string
  featured: boolean
}) {
  const { toast } = useToast()
  const [isFeatured, setIsFeatured] = useState(featured)
  const [isPending, setIsPending] = useState(false)

  async function handleToggle() {
    setIsPending(true)
    const prevVal = isFeatured
    const nextVal = !isFeatured
    setIsFeatured(nextVal)
    const res = await toggleProductFeatured(id, nextVal)
    if (res.error) {
      toast(res.error, 'error')
      setIsFeatured(prevVal)
    }
    setIsPending(false)
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isFeatured}
      aria-label={`Toggle ${name} featured`}
      onClick={handleToggle}
      disabled={isPending}
      title={isFeatured ? 'Featured product (click to unfeature)' : 'Mark as featured product'}
      className={`inline-flex items-center justify-center h-8 w-8 rounded-lg transition-colors border cursor-pointer ${
        isFeatured
          ? 'bg-amber-50 text-amber-500 border-amber-200 hover:bg-amber-100'
          : 'bg-white text-slate-300 border-slate-200 hover:text-slate-500 hover:bg-slate-50'
      }`}
    >
      <Star
        className={`h-4 w-4 ${isFeatured ? 'fill-amber-400 text-amber-500' : ''}`}
      />
    </button>
  )
}

function DeleteButton({ id, name }: { id: string; name: string }) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const confirm = useAdminConfirm()

  async function handleDelete() {
    const ok = await confirm({
      title: `Delete product "${name}"?`,
      description:
        'This action is protected. If this product has existing customer orders, the deletion will be safely blocked to preserve financial history. Otherwise, it will be soft-deleted from the store catalog.',
      confirmText: 'Delete Product',
      cancelText: 'Keep Product',
      variant: 'danger',
    })

    if (!ok) return

    setIsPending(true)
    setError(null)
    const res = await deleteProduct(id)
    if (res.error) {
      setError(res.error)
    }
    setIsPending(false)
  }

  return (
    <div className="text-right">
      <button
        id={`delete-product-${id}`}
        type="button"
        disabled={isPending}
        onClick={handleDelete}
        title="Delete product"
        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      {error && (
        <p className="mt-1 text-[11px] text-rose-600 break-words max-w-[180px] ml-auto">
          {error}
        </p>
      )}
    </div>
  )
}

export function ProductList({ products }: { products: ProductWithCategory[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

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
                {/* Product Name & Slug */}
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

                {/* Category */}
                <td className="px-6 py-4">
                  {product.categories ? (
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                      {product.categories.name}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic text-xs">Uncategorized</span>
                  )}
                </td>

                {/* Price */}
                <td className="px-6 py-4 text-right font-black text-slate-900 whitespace-nowrap">
                  ৳{product.base_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>

                {/* Smart Status Toggle (Consolidated Published + Status) */}
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center">
                    <SmartStatusToggle
                      id={product.id}
                      name={product.name}
                      active={product.active}
                    />
                  </div>
                </td>

                {/* Featured Star Toggle */}
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center">
                    <FeaturedToggle
                      id={product.id}
                      name={product.name}
                      featured={product.featured}
                    />
                  </div>
                </td>

                {/* Actions */}
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
                    <DeleteButton id={product.id} name={product.name} />
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

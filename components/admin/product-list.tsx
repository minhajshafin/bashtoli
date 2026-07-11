'use client'

import { startTransition, useActionState, useState } from 'react'
import Link from 'next/link'
import {
  toggleProductActive,
  toggleProductFeatured,
  deleteProduct,
} from '@/lib/actions/products'
import type { Database } from '@/lib/supabase/database.types'

type ProductRow = Database['public']['Tables']['products']['Row']
type CategoryRow = Database['public']['Tables']['categories']['Row']

type ProductWithCategory = ProductRow & {
  categories: CategoryRow | null
}

function ActiveToggle({ id, initialActive }: { id: string; initialActive: boolean }) {
  const [active, setActive] = useState(initialActive)
  const [isPending, setIsPending] = useState(false)

  async function handleToggle() {
    setIsPending(true)
    const nextVal = !active
    setActive(nextVal)
    const res = await toggleProductActive(id, nextVal)
    if (res.error) {
      alert(res.error)
      setActive(active) // rollback
    }
    setIsPending(false)
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
        active ? 'bg-indigo-600' : 'bg-slate-200'
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          active ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

function FeaturedToggle({ id, initialFeatured }: { id: string; initialFeatured: boolean }) {
  const [featured, setFeatured] = useState(initialFeatured)
  const [isPending, setIsPending] = useState(false)

  async function handleToggle() {
    setIsPending(true)
    const nextVal = !featured
    setFeatured(nextVal)
    const res = await toggleProductFeatured(id, nextVal)
    if (res.error) {
      alert(res.error)
      setFeatured(featured) // rollback
    }
    setIsPending(false)
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
        featured ? 'bg-indigo-600' : 'bg-slate-200'
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          featured ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

function DeleteButton({ id, name }: { id: string; name: string }) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?\nIf it has order history, it will be blocked. Otherwise, it will be soft-deleted.`)) {
      return
    }
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
        className="rounded-md px-2.5 py-1 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isPending ? 'Deleting...' : 'Delete'}
      </button>
      {error && (
        <p className="mt-1 text-xs text-rose-600 break-words max-w-[180px] ml-auto">
          {error}
        </p>
      )}
    </div>
  )
}

export function ProductList({
  products,
}: {
  products: ProductWithCategory[]
}) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center shadow-sm">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-slate-400"
          >
            <path d="m7.5 4.27 9 5.15" />
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-700">No products found</p>
        <p className="mt-1 text-sm text-slate-400">
          Try updating your filters or add a new product.
        </p>
        <Link
          href="/admin/products/new"
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Add Product
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-slate-500">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-right">Price</th>
              <th className="px-6 py-4 text-center">Published</th>
              <th className="px-6 py-4 text-center">Featured</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {products.map((product) => {
              return (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  {/* Thumbnail & Name */}
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 border border-slate-200">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-5 w-5 text-slate-400"
                        >
                          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">
                          {product.name}
                        </p>
                        <p className="truncate font-mono text-xs text-slate-400">
                          /{product.slug}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    {product.categories ? (
                      <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                        {product.categories.name}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-xs">
                        Uncategorised
                      </span>
                    )}
                  </td>

                  {/* Base Price */}
                  <td className="px-6 py-4 text-right font-medium text-slate-900">
                    ৳{product.base_price.toFixed(2)}
                  </td>

                  {/* Published Toggle */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <ActiveToggle id={product.id} initialActive={product.active} />
                    </div>
                  </td>

                  {/* Featured Toggle */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <FeaturedToggle id={product.id} initialFeatured={product.featured} />
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        product.active
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10'
                          : 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/10'
                      }`}
                    >
                      {product.active ? 'Active' : 'Draft'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        id={`edit-product-${product.id}`}
                        href={`/admin/products/${product.id}`}
                        className="rounded-md px-2.5 py-1 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
                      >
                        Edit
                      </Link>
                      <DeleteButton id={product.id} name={product.name} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

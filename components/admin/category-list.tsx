import React from 'react'
import Link from 'next/link'
import { FolderTree, Edit2 } from 'lucide-react'
import { DeleteCategoryButton } from './delete-category-button'
import type { Database } from '@/lib/supabase/database.types'

type CategoryRow = Database['public']['Tables']['categories']['Row']

export type CategoryWithCount = CategoryRow & {
  products: { count: number }[]
}

export function CategoryList({
  categories,
  editingId,
}: {
  categories: CategoryWithCount[]
  editingId?: string
}) {
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-400/70 bg-paper-50 py-16 px-4 text-center shadow-subtle">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-ink-950 text-paper-50">
          <FolderTree className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="text-base font-bold text-ink-950">No categories yet</p>
        <p className="mt-1 text-xs text-ink-600 max-w-sm">
          Create your first store category to start grouping and organizing your products.
        </p>
        <Link
          href="/admin/categories?action=new"
          className="mt-5 inline-flex min-h-[44px] items-center rounded-xl bg-ink-950 px-5 py-2 text-xs font-bold text-paper-50 transition-colors hover:bg-ink-800 cursor-pointer"
        >
          Create Category
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-paper-300 bg-paper-50 shadow-subtle">
      <div
        tabIndex={0}
        role="region"
        aria-labelledby="categories-table-caption"
        className="admin-table-region focus-visible:outline-2 focus-visible:outline-ink-950 focus-visible:outline-inset"
      >
        <table className="admin-responsive-table w-full text-sm text-ink-700">
          <caption id="categories-table-caption" className="sr-only">
            Product categories directory
          </caption>
          <thead>
            <tr className="border-b border-paper-300 bg-paper-200/70 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-600">
              <th scope="col" className="px-6 py-3.5">Name</th>
              <th scope="col" className="px-6 py-3.5">Slug</th>
              <th scope="col" className="px-6 py-3.5 text-center">Sort Order</th>
              <th scope="col" className="px-6 py-3.5 text-center">Products</th>
              <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-paper-200">
            {categories.map((cat) => {
              const productCount = cat.products[0]?.count ?? 0
              const isEditing = cat.id === editingId

              return (
                <tr
                  key={cat.id}
                  className={`transition-colors ${
                    isEditing ? 'bg-paper-200' : 'hover:bg-paper-100/80'
                  }`}
                >
                  <th scope="row" className="px-6 py-4 font-bold text-ink-950 text-left">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-paper-200 border border-paper-300 text-ink-800">
                        <FolderTree className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <span>{cat.name}</span>
                    </div>
                  </th>

                  <td data-label="Slug" className="px-6 py-4">
                    <code className="rounded-lg bg-paper-200 px-2.5 py-1 font-mono text-xs text-ink-900 border border-paper-300">
                      {cat.slug}
                    </code>
                  </td>

                  <td data-label="Sort Order" className="px-6 py-4 text-center font-mono text-xs text-ink-700 font-bold">
                    {cat.sort_order}
                  </td>

                  <td data-label="Products" className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold border ${
                        productCount > 0
                          ? 'bg-ink-950 text-paper-50 border-ink-950'
                          : 'bg-paper-100 text-ink-600 border-paper-300'
                      }`}
                    >
                      {productCount} {productCount === 1 ? 'item' : 'items'}
                    </span>
                  </td>

                  <td data-label="Actions" className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        id={`edit-category-${cat.id}`}
                        href={`/admin/categories?action=edit&id=${cat.id}`}
                        aria-label={`Edit ${cat.name}`}
                        title="Edit category"
                        className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] rounded-xl text-ink-700 hover:text-paper-50 hover:bg-ink-950 transition-colors border border-transparent hover:border-ink-950 cursor-pointer"
                      >
                        <Edit2 className="h-4 w-4" aria-hidden="true" />
                      </Link>
                      <DeleteCategoryButton
                        id={cat.id}
                        name={cat.name}
                        productCount={productCount}
                      />
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

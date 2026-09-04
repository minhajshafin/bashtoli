import React from 'react'
import Link from 'next/link'
import { FolderTree, Edit2 } from 'lucide-react'
import { DeleteCategoryButton } from './delete-category-button'
import type { Database } from '@/lib/supabase/database.types'

type CategoryRow = Database['public']['Tables']['categories']['Row']

export type CategoryWithCount = CategoryRow & {
  /** Embedded count from Supabase */
  products: { count: number }[]
}

/**
 * Category table — server component.
 * Renders the full list of categories with product counts,
 * edit links, and secure delete buttons.
 */
export function CategoryList({
  categories,
  editingId,
}: {
  categories: CategoryWithCount[]
  /** The id of the category currently being edited (to highlight the row). */
  editingId?: string
}) {
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center shadow-xs">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 border border-slate-200">
          <FolderTree className="h-6 w-6" />
        </div>
        <p className="text-base font-bold text-slate-800">No categories yet</p>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">
          Create your first store category to start grouping and organizing your products.
        </p>
        <Link
          href="/admin/categories?action=new"
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-700 shadow-xs cursor-pointer"
        >
          Create Category
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
              <th className="px-6 py-3.5">Name</th>
              <th className="px-6 py-3.5">Slug</th>
              <th className="px-6 py-3.5 text-center">Sort Order</th>
              <th className="px-6 py-3.5 text-center">Products</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((cat) => {
              const productCount = cat.products[0]?.count ?? 0
              const isEditing = cat.id === editingId

              return (
                <tr
                  key={cat.id}
                  className={[
                    'transition-colors',
                    isEditing ? 'bg-indigo-50/70' : 'hover:bg-slate-50/70',
                  ].join(' ')}
                >
                  {/* Name */}
                  <td className="px-6 py-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-slate-500">
                        <FolderTree className="h-4 w-4" />
                      </div>
                      <span>{cat.name}</span>
                    </div>
                  </td>

                  {/* Slug */}
                  <td className="px-6 py-4">
                    <code className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700 border border-slate-200">
                      {cat.slug}
                    </code>
                  </td>

                  {/* Sort order */}
                  <td className="px-6 py-4 text-center font-mono text-xs text-slate-500 font-semibold">
                    {cat.sort_order}
                  </td>

                  {/* Product count */}
                  <td className="px-6 py-4 text-center">
                    <span
                      className={[
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border',
                        productCount > 0
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200',
                      ].join(' ')}
                    >
                      {productCount} {productCount === 1 ? 'item' : 'items'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        id={`edit-category-${cat.id}`}
                        href={`/admin/categories?action=edit&id=${cat.id}`}
                        title="Edit category"
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100 cursor-pointer"
                      >
                        <Edit2 className="h-4 w-4" />
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

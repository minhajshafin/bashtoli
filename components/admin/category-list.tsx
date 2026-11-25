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
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-adm-border bg-adm-surface py-14 px-4 text-center shadow-subtle">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-adm-surface-2 border border-adm-border text-adm-muted">
          <FolderTree className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold text-adm-fg">No categories yet</p>
        <Link
          href="/admin/categories?action=new"
          className="mt-4 inline-flex min-h-[42px] items-center rounded-xl bg-adm-accent px-5 py-2 text-xs font-semibold text-adm-accent-fg transition-colors hover:bg-adm-accent-hover cursor-pointer"
        >
          New Category
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-adm-border bg-adm-surface shadow-subtle">
      <div
        tabIndex={0}
        role="region"
        aria-labelledby="categories-table-caption"
        className="admin-table-region"
      >
        <table className="admin-responsive-table w-full text-sm text-adm-fg-2">
          <caption id="categories-table-caption" className="sr-only">
            Product categories directory
          </caption>
          <thead>
            <tr className="border-b border-adm-border bg-adm-surface-2/70 text-left text-xs font-medium text-adm-muted">
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3">Slug</th>
              <th scope="col" className="px-6 py-3 text-center">Order</th>
              <th scope="col" className="px-6 py-3 text-center">Products</th>
              <th scope="col" className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-adm-border">
            {categories.map((cat) => {
              const productCount = cat.products[0]?.count ?? 0
              const isEditing = cat.id === editingId

              return (
                <tr
                  key={cat.id}
                  className={`transition-colors ${
                    isEditing ? 'bg-adm-accent-tint/50' : 'hover:bg-adm-surface-2/60'
                  }`}
                >
                  <th scope="row" className="px-6 py-3.5 font-semibold text-adm-fg text-left">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-adm-surface-2 border border-adm-border text-adm-muted">
                        <FolderTree className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <span>{cat.name}</span>
                    </div>
                  </th>

                  <td data-label="Slug" className="px-6 py-3.5">
                    <code className="rounded-lg bg-adm-surface-2 px-2.5 py-1 font-mono text-xs text-adm-fg-2 border border-adm-border">
                      {cat.slug}
                    </code>
                  </td>

                  <td data-label="Order" className="px-6 py-3.5 text-center font-mono text-xs text-adm-fg-2 font-semibold">
                    {cat.sort_order}
                  </td>

                  <td data-label="Products" className="px-6 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold border ${
                        productCount > 0
                          ? 'bg-adm-info-bg text-adm-info border-adm-info-border'
                          : 'bg-adm-surface-2 text-adm-muted border-adm-border'
                      }`}
                    >
                      {productCount} {productCount === 1 ? 'item' : 'items'}
                    </span>
                  </td>

                  <td data-label="Actions" className="px-6 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        id={`edit-category-${cat.id}`}
                        href={`/admin/categories?action=edit&id=${cat.id}`}
                        aria-label={`Edit ${cat.name}`}
                        title="Edit category"
                        className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] rounded-xl text-adm-muted hover:text-adm-accent-text hover:bg-adm-accent-tint transition-colors border border-transparent hover:border-adm-accent-border cursor-pointer"
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

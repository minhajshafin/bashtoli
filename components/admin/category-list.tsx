import Link from 'next/link'
import { DeleteCategoryButton } from './delete-category-button'
import type { Database } from '@/lib/supabase/database.types'

type CategoryRow = Database['public']['Tables']['categories']['Row']

export type CategoryWithCount = CategoryRow & {
  /** Embedded count from Supabase .select('*, products(count)') */
  products: { count: number }[]
}

/**
 * Category table — server component.
 * Renders the full list of categories with their product counts,
 * edit links, and delete buttons.
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
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-6 w-6 text-slate-400"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75Zm0 10.5a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75ZM2 10a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 2 10Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-700">No categories yet</p>
        <p className="mt-1 text-sm text-slate-400">
          Create your first category to get started.
        </p>
        <Link
          href="/admin/categories?action=new"
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Create category
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-5 py-3">Name</th>
            <th className="px-5 py-3">Slug</th>
            <th className="px-5 py-3 text-center">Sort</th>
            <th className="px-5 py-3 text-center">Products</th>
            <th className="px-5 py-3 text-right">Actions</th>
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
                  isEditing ? 'bg-indigo-50' : 'hover:bg-slate-50',
                ].join(' ')}
              >
                {/* Name */}
                <td className="px-5 py-3 font-medium text-slate-900">
                  {cat.name}
                </td>

                {/* Slug */}
                <td className="px-5 py-3">
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                    {cat.slug}
                  </code>
                </td>

                {/* Sort order */}
                <td className="px-5 py-3 text-center text-slate-500">
                  {cat.sort_order}
                </td>

                {/* Product count */}
                <td className="px-5 py-3 text-center">
                  <span
                    className={[
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                      productCount > 0
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-slate-100 text-slate-500',
                    ].join(' ')}
                  >
                    {productCount}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      id={`edit-category-${cat.id}`}
                      href={`/admin/categories?action=edit&id=${cat.id}`}
                      className="rounded-md px-2.5 py-1 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
                    >
                      Edit
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
  )
}

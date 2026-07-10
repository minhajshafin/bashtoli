import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CategoryList, type CategoryWithCount } from '@/components/admin/category-list'
import { CategoryForm } from '@/components/admin/category-form'
import type { Database } from '@/lib/supabase/database.types'

export const metadata: Metadata = {
  title: 'Categories',
}

type CategoryRow = Database['public']['Tables']['categories']['Row']

/**
 * Admin categories page.
 *
 * URL patterns:
 *   /admin/categories              → list only
 *   /admin/categories?action=new   → list + create form
 *   /admin/categories?action=edit&id=<uuid> → list + edit form (pre-filled)
 */
export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; id?: string }>
}) {
  const { action, id } = await searchParams

  const supabase = await createClient()

  // Fetch categories and their product counts as two separate queries
  // (the auto-generated types don't support embedded counts, so we merge manually).
  const [{ data: rawCategories, error }, { data: countRows }] =
    await Promise.all([
      supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true }),
      supabase
        .from('products')
        .select('category_id')
        .not('category_id', 'is', null),
    ])

  if (error) {
    // Surface a user-friendly error rather than crashing.
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        Failed to load categories: {error.message}
      </div>
    )
  }

  // Build a count map: category_id → product count
  const countMap = new Map<string, number>()
  for (const row of countRows ?? []) {
    if (row.category_id) {
      countMap.set(row.category_id, (countMap.get(row.category_id) ?? 0) + 1)
    }
  }

  const categories: CategoryWithCount[] = (rawCategories ?? []).map((cat) => ({
    ...cat,
    products: [{ count: countMap.get(cat.id) ?? 0 }],
  }))


  // Determine form mode from search params
  const showCreate = action === 'new'
  const showEdit = action === 'edit' && !!id

  // If editing, find the category to pre-fill the form
  let editingCategory: CategoryRow | undefined
  if (showEdit && id) {
    editingCategory = categories.find((c) => c.id === id)
  }

  const showForm = showCreate || (showEdit && !!editingCategory)

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="mt-1 text-sm text-slate-500">
            Organise your products into categories.
          </p>
        </div>
        {!showForm && (
          <Link
            id="new-category-btn"
            href="/admin/categories?action=new"
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
            New Category
          </Link>
        )}
      </div>

      {/* Two-column layout when form is open; full-width list otherwise */}
      <div
        className={
          showForm
            ? 'grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]'
            : 'block'
        }
      >
        {/* Category table */}
        <CategoryList
          categories={categories}
          editingId={showEdit ? id : undefined}
        />

        {/* Form panel — create or edit */}
        {showForm && (
          <div>
            <CategoryForm
              mode={showCreate ? 'create' : 'edit'}
              category={editingCategory}
            />
          </div>
        )}
      </div>
    </div>
  )
}

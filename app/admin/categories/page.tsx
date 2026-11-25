import type { Metadata } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CategoryList, type CategoryWithCount } from '@/components/admin/category-list'
import { CategoryForm } from '@/components/admin/category-form'
import type { Database } from '@/lib/supabase/database.types'

export const metadata: Metadata = {
  title: 'Categories',
}

export const instant = false

type CategoryRow = Database['public']['Tables']['categories']['Row']

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; id?: string }>
}) {
  await connection()
  const { action, id } = await searchParams

  const supabase = await createClient()

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
    return (
      <div
        role="alert"
        className="rounded-2xl border border-adm-danger-border bg-adm-danger-bg p-6 text-sm font-medium text-adm-danger"
      >
        Failed to load categories: {error.message}
      </div>
    )
  }

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

  const showCreate = action === 'new'
  const showEdit = action === 'edit' && !!id

  let editingCategory: CategoryRow | undefined
  if (showEdit && id) {
    editingCategory = categories.find((c) => c.id === id)
  }

  const showForm = showCreate || (showEdit && !!editingCategory)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-adm-border">
        <div className="flex items-center gap-3">
          <h1 className="admin-page-title text-adm-fg">Categories</h1>
          <span className="rounded-full bg-adm-surface-2 border border-adm-border px-2.5 py-0.5 font-mono text-xs font-semibold text-adm-muted">
            {categories.length}
          </span>
        </div>

        {!showForm && (
          <Link
            id="new-category-btn"
            href="/admin/categories?action=new"
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-adm-accent px-4 py-2 text-xs sm:text-sm font-semibold text-adm-accent-fg transition-colors hover:bg-adm-accent-hover shadow-elevation-1 shrink-0"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>New Category</span>
          </Link>
        )}
      </div>

      <div
        className={
          showForm
            ? 'grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px] items-start'
            : 'block'
        }
      >
        <CategoryList
          categories={categories}
          editingId={showEdit ? id : undefined}
        />

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

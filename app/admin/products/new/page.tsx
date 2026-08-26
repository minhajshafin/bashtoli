import type { Metadata } from 'next'
import { fetchAdminCategories } from '@/lib/queries/admin-products'
import { ProductForm } from '@/components/admin/product-form'

export const metadata: Metadata = {
  title: 'New Product',
}

export default async function NewProductPage() {
  let categories: Awaited<ReturnType<typeof fetchAdminCategories>> = []

  try {
    categories = await fetchAdminCategories()
  } catch (err) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        Failed to load categories:{' '}
        {err instanceof Error ? err.message : 'Unknown error'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900">Create Product</h1>
        <p className="mt-1 text-sm text-slate-500">
          Add a new product to your catalog.
        </p>
      </div>

      <ProductForm mode="create" categories={categories} />
    </div>
  )
}

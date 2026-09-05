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
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 max-w-7xl mx-auto">
        Failed to load categories:{' '}
        {err instanceof Error ? err.message : 'Unknown error'}
      </div>
    )
  }

  return <ProductForm mode="create" categories={categories} />
}

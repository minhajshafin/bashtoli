import type { Metadata } from 'next'
import { connection } from 'next/server'
import { fetchAdminCategories } from '@/lib/queries/admin-products'
import { ProductForm } from '@/components/admin/product-form'

export const metadata: Metadata = {
  title: 'New Product',
}

export const instant = false

export default async function NewProductPage() {
  await connection()
  let categories: Awaited<ReturnType<typeof fetchAdminCategories>> = []

  try {
    categories = await fetchAdminCategories()
  } catch (err) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-adm-danger-border bg-adm-danger-bg p-6 text-sm font-medium text-adm-danger max-w-7xl mx-auto"
      >
        Failed to load categories:{' '}
        {err instanceof Error ? err.message : 'Unknown error'}
      </div>
    )
  }

  return <ProductForm mode="create" categories={categories} />
}

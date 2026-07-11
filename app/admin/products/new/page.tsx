import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/admin/product-form'

export const metadata: Metadata = {
  title: 'New Product',
}

export default async function NewProductPage() {
  const supabase = await createClient()

  const { data: categories = [], error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        Failed to load categories: {error.message}
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

      <ProductForm mode="create" categories={categories ?? []} />
    </div>
  )
}

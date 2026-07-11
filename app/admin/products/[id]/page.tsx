import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/admin/product-form'

export const metadata: Metadata = {
  title: 'Edit Product',
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params

  const supabase = await createClient()

  // Fetch product and categories in parallel
  const [productResult, categoriesResult] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true }),
  ])

  if (productResult.error || !productResult.data) {
    notFound()
  }

  if (categoriesResult.error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        Failed to load categories: {categoriesResult.error.message}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900">Edit Product</h1>
        <p className="mt-1 text-sm text-slate-500">
          Modify the details of {productResult.data.name}.
        </p>
      </div>

      <ProductForm
        mode="edit"
        product={productResult.data}
        categories={categoriesResult.data ?? []}
      />
    </div>
  )
}

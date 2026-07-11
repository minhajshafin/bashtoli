import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/admin/product-form'
import { OptionManager } from '@/components/admin/option-manager'
import { VariantTable } from '@/components/admin/variant-table'
import { ImageUploader } from '@/components/admin/image-uploader'
import { ImageGalleryAdmin } from '@/components/admin/image-gallery-admin'
import type { Database } from '@/lib/supabase/database.types'

type OptionValueRow = Database['public']['Tables']['product_option_values']['Row']

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

  // Fetch product, categories, options, variants, and images in parallel
  const [productRes, categoriesRes, optionsRes, variantsRes, imagesRes] =
    await Promise.all([
      supabase.from('products').select('*').eq('id', id).single(),
      supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true }),
      supabase
        .from('product_options')
        .select('*')
        .eq('product_id', id)
        .order('sort_order', { ascending: true }),
      supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', id)
        .order('created_at', { ascending: true }),
      supabase
        .from('product_images')
        .select('*')
        .eq('product_id', id)
        .order('sort_order', { ascending: true }),
    ])

  if (productRes.error || !productRes.data) {
    notFound()
  }

  if (categoriesRes.error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        Failed to load categories: {categoriesRes.error.message}
      </div>
    )
  }

  if (optionsRes.error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        Failed to load product options: {optionsRes.error.message}
      </div>
    )
  }

  if (variantsRes.error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        Failed to load product variants: {variantsRes.error.message}
      </div>
    )
  }

  if (imagesRes.error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        Failed to load product images: {imagesRes.error.message}
      </div>
    )
  }

  // Fetch option values separately using option IDs
  const optionIds = (optionsRes.data ?? []).map((opt) => opt.id)
  let optionValues: OptionValueRow[] = []

  if (optionIds.length > 0) {
    const { data: valData, error: valError } = await supabase
      .from('product_option_values')
      .select('*')
      .in('option_id', optionIds)
      .order('sort_order', { ascending: true })

    if (valError) {
      return (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          Failed to load product option values: {valError.message}
        </div>
      )
    }
    optionValues = valData ?? []
  }

  // Format database options into OptionManager shape
  const formattedOptions = (optionsRes.data ?? []).map((opt) => {
    const optValues = optionValues
      .filter((val) => val.option_id === opt.id)
      .map((val) => val.value)

    return {
      name: opt.name,
      values: optValues,
    }
  })

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900">Edit Product</h1>
        <p className="mt-1 text-sm text-slate-500">
          Modify details, manage product option axes, edit variants, and manage image gallery.
        </p>
      </div>

      {/* Main product metadata form */}
      <ProductForm
        mode="edit"
        product={productRes.data}
        categories={categoriesRes.data ?? []}
      />

      <div className="mx-auto max-w-2xl border-t border-slate-200 my-8" />

      {/* Options manager section */}
      <div className="mx-auto max-w-2xl">
        <OptionManager
          productId={id}
          initialOptions={formattedOptions}
        />
      </div>

      <div className="mx-auto max-w-2xl border-t border-slate-200 my-8" />

      {/* Variants inventory editor */}
      <div className="mx-auto max-w-2xl">
        <VariantTable
          productId={id}
          variants={variantsRes.data ?? []}
        />
      </div>

      <div className="mx-auto max-w-2xl border-t border-slate-200 my-8" />

      {/* Image Gallery management */}
      <div className="mx-auto max-w-2xl space-y-6">
        <ImageGalleryAdmin images={imagesRes.data ?? []} />
        <ImageUploader productId={id} />
      </div>
    </div>
  )
}


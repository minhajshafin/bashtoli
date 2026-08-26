import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  fetchAdminProductDetail,
  type AdminProductDetail,
} from '@/lib/queries/admin-products'
import { ProductForm } from '@/components/admin/product-form'
import { OptionManager } from '@/components/admin/option-manager'
import { VariantTable } from '@/components/admin/variant-table'
import { ImageUploader } from '@/components/admin/image-uploader'
import { ImageGalleryAdmin } from '@/components/admin/image-gallery-admin'

export const metadata: Metadata = {
  title: 'Edit Product',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params

  let detail: AdminProductDetail | null = null

  try {
    detail = await fetchAdminProductDetail(id)
  } catch (err) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        Failed to load product data.{' '}
        {err instanceof Error ? err.message : 'Unknown error'}
      </div>
    )
  }

  if (!detail) notFound()

  const { product, categories, options, variants, images } = detail

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
      <ProductForm mode="edit" product={product} categories={categories} />

      <div className="mx-auto max-w-2xl border-t border-slate-200 my-8" />

      {/* Options manager section */}
      <div className="mx-auto max-w-2xl">
        <OptionManager productId={id} initialOptions={options} />
      </div>

      <div className="mx-auto max-w-2xl border-t border-slate-200 my-8" />

      {/* Variants inventory editor */}
      <div className="mx-auto max-w-2xl">
        <VariantTable productId={id} variants={variants} />
      </div>

      <div className="mx-auto max-w-2xl border-t border-slate-200 my-8" />

      {/* Image Gallery management */}
      <div className="mx-auto max-w-2xl space-y-6">
        <ImageGalleryAdmin images={images} />
        <ImageUploader productId={id} />
      </div>
    </div>
  )
}

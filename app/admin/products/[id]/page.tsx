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
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 max-w-7xl mx-auto">
        Failed to load product data.{' '}
        {err instanceof Error ? err.message : 'Unknown error'}
      </div>
    )
  }

  if (!detail) notFound()

  const { product, categories, options, variants, images } = detail

  return (
    <ProductForm mode="edit" product={product} categories={categories}>
      {/* Media & Image Studio */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">Product Media & Gallery</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage product images, update alt descriptions, and upload high-resolution photos.
          </p>
        </div>
        <ImageGalleryAdmin images={images} />
        <ImageUploader productId={id} />
      </div>

      {/* Options & Variants Inventory Studio */}
      <div className="space-y-6">
        <OptionManager productId={id} initialOptions={options} />
        <VariantTable productId={id} variants={variants} />
      </div>
    </ProductForm>
  )
}

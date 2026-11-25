import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
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

export const instant = false

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: PageProps) {
  await connection()
  const { id } = await params

  let detail: AdminProductDetail | null = null

  try {
    detail = await fetchAdminProductDetail(id)
  } catch (err) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-adm-danger-border bg-adm-danger-bg p-6 text-sm font-medium text-adm-danger max-w-7xl mx-auto"
      >
        Failed to load product data.{' '}
        {err instanceof Error ? err.message : 'Unknown error'}
      </div>
    )
  }

  if (!detail) notFound()

  const { product, categories, options, variants, images } = detail

  return (
    <ProductForm mode="edit" product={product} categories={categories}>
      <div className="rounded-2xl border border-adm-border bg-adm-surface p-6 shadow-subtle space-y-6">
        <h2 className="admin-section-title text-adm-fg">Images</h2>
        <ImageGalleryAdmin images={images} />
        <ImageUploader productId={id} />
      </div>

      <div className="space-y-6">
        <OptionManager productId={id} initialOptions={options} />
        <VariantTable productId={id} variants={variants} />
      </div>
    </ProductForm>
  )
}

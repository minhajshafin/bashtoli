import { getProductDetail } from '@/lib/queries/product-detail'
import { notFound } from 'next/navigation'
import { Breadcrumb } from '@/components/storefront/breadcrumb'
import { ProductDetailClient } from './product-client'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: ProductPageProps) {
  const resolvedParams = await params
  const data = await getProductDetail(resolvedParams.slug)
  if (!data) return { title: 'Product Not Found' }

  return {
    title: `${data.product.name} | Bashtoli Storefront`,
    description: data.product.description || 'View details and purchase this premium handcrafted item.',
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params
  const data = await getProductDetail(resolvedParams.slug)

  if (!data) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <Breadcrumb
        category={data.product.categories}
        productName={data.product.name}
      />

      {/* Main product view split */}
      <ProductDetailClient detailData={data} />
    </div>
  )
}

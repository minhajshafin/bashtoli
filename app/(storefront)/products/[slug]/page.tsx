import { getProductDetail } from '@/lib/queries/product-detail'
import { notFound } from 'next/navigation'
import { Breadcrumb } from '@/components/storefront/breadcrumb'
import { ProductDetailClient } from './product-client'
import { createClient } from '@/lib/supabase/server'
import React from 'react'

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

/**
 * Product details route wrapper.
 * Server component resolving product data and customer wishlist states.
 */
export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params
  const data = await getProductDetail(resolvedParams.slug)

  if (!data) {
    notFound()
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isLoggedIn = !!user
  let isWishlisted = false

  if (user) {
    const { data: wishlistEntry } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', data.product.id)
      .maybeSingle()

    isWishlisted = !!wishlistEntry
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <Breadcrumb
        category={data.product.categories}
        productName={data.product.name}
      />

      {/* Main product view split */}
      <ProductDetailClient
        detailData={data}
        isLoggedIn={isLoggedIn}
        initialIsWishlisted={isWishlisted}
      />
    </div>
  )
}

import { getProductDetail } from '@/lib/queries/product-detail'
import { notFound } from 'next/navigation'
import { Breadcrumb } from '@/components/storefront/breadcrumb'
import { ProductDetailClient } from './product-client'
import { createClient } from '@/lib/supabase/server'
import React from 'react'
import { ProductJsonLd } from '@/components/storefront/json-ld'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: ProductPageProps) {
  const resolvedParams = await params
  const data = await getProductDetail(resolvedParams.slug)
  if (!data) return { title: 'Product Not Found' }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bashtoli.com'
  const primaryImage = data.images?.[0]
  const imageUrl = primaryImage?.url || `${baseUrl}/og-fallback.png`
  const title = `${data.product.name} | Bashtoli`
  const description = data.product.description || 'Premium sustainable organic handicraft.'

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/products/${data.product.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/products/${data.product.slug}`,
      siteName: 'Bashtoli',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: data.product.name,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
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
      {/* JSON-LD Schema Structured Data */}
      <ProductJsonLd
        product={data.product}
        images={data.images}
        variants={data.variants}
      />

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

import { getProductDetail } from '@/lib/queries/product-detail'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ProductDetailClient } from './product-client'
import { createPublicClient } from '@/lib/supabase/server'
import React from 'react'
import { ProductJsonLd } from '@/components/storefront/json-ld'
import { ProductBackgroundArt } from '@/components/storefront/product-background-art'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

/**
 * Pre-render all active product pages at build time.
 */
export async function generateStaticParams() {
  try {
    const supabase = createPublicClient()
    const { data: products } = await supabase
      .from('products')
      .select('slug')
      .eq('active', true)

    if (products && products.length > 0) {
      return products.map((p) => ({
        slug: p.slug,
      }))
    }

    // Next.js 16 Cache Components requires generateStaticParams to return >= 1 result
    // to validate the static shell at build time when the catalog is initially empty.
    return [{ slug: '_placeholder' }]
  } catch (err) {
    console.warn('[ProductPage] Error generating static params:', err)
    return [{ slug: '_placeholder' }]
  }
}

export async function generateMetadata({ params }: ProductPageProps) {
  const resolvedParams = await params
  const data = await getProductDetail(resolvedParams.slug)
  if (!data) return { title: 'Product Not Found' }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bashtoli.com'
  const primaryImage = data.images?.[0]
  const imageUrl = primaryImage?.url || `${baseUrl}/og-fallback.png`
  const title = `${data.product.name} | Bashtoli`
  const description = data.product.description || 'Quality handcrafted stationery and paper goods.'

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

  return (
    <div className="relative w-full overflow-hidden bg-cream-50 bg-laid-paper">
      {/* Edge-to-edge Handcrafted Botanical Background Art */}
      <ProductBackgroundArt />

      <div className="relative z-10 mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-6 sm:pb-8 lg:min-h-[calc(100dvh-4.5rem)] flex flex-col justify-center">
        {/* JSON-LD Schema Structured Data */}
        <ProductJsonLd
          product={data.product}
          images={data.images}
          variants={data.variants}
        />

        {/* Back to shop navigation */}
        <div className="mb-2 sm:mb-3">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 -ml-2.5 rounded-full text-xs font-sans font-medium text-forest-750 hover:text-forest-950 hover:bg-forest-900/5 transition-all group"
          >
            <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            <span>Back to shop</span>
          </Link>
        </div>

        {/* Main product view split */}
        <ProductDetailClient detailData={data} />
      </div>
    </div>
  )
}

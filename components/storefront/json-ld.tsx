import React from 'react'

interface ProductJsonLdProps {
  product: {
    name: string
    slug: string
    description: string | null
    base_price: number
  }
  images: Array<{
    url: string
  }>
  variants: Array<{
    price: number
    stock_qty: number
    active: boolean
  }>
}

/**
 * ProductJsonLd component.
 * Outputs a script injection tag containing stringified structured schema definitions.
 */
export function ProductJsonLd({ product, images, variants }: ProductJsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bashtoli.com'
  
  // Filter active variants
  const activeVariants = variants.filter((v) => v.active)
  
  // Find lowest price
  const lowestPrice =
    activeVariants.length > 0
      ? Math.min(...activeVariants.map((v) => v.price))
      : product.base_price

  // Stock status checks
  const inStock = activeVariants.length > 0 && activeVariants.some((v) => v.stock_qty > 0)
  const availability = inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'

  // Image resolving
  const primaryImage = images?.[0]?.url || `${baseUrl}/og-fallback.png`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: primaryImage,
    description: product.description || 'Premium sustainable organic handicraft.',
    offers: {
      '@type': 'Offer',
      price: lowestPrice,
      priceCurrency: 'BDT',
      availability: availability,
      url: `${baseUrl}/products/${product.slug}`,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

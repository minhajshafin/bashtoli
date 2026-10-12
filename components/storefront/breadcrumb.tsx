import Link from 'next/link'
import React from 'react'

interface BreadcrumbProps {
  category?: {
    name: string
    slug: string
  } | null
  productName: string
}

export function Breadcrumb({ category, productName }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-[11px] sm:text-xs font-sans uppercase tracking-[0.14em] text-forest-600/80 py-3 sm:py-4 mb-1">
      {/* Home */}
      <Link
        href="/products"
        className="hover:text-gold-600 transition-colors cursor-pointer"
      >
        Shop
      </Link>

      {/* Separator */}
      <svg
        className="h-3 w-3 shrink-0 text-gold-500/60"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>

      {/* Category */}
      {category ? (
        <>
          <Link
            href={`/products?category=${category.slug}`}
            className="hover:text-gold-600 transition-colors whitespace-nowrap cursor-pointer"
          >
            {category.name}
          </Link>
          {/* Separator */}
          <svg
            className="h-3 w-3 shrink-0 text-gold-500/60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </>
      ) : null}

      {/* Current Product */}
      <span className="text-forest-950 font-medium normal-case tracking-normal truncate" aria-current="page">
        {productName}
      </span>
    </nav>
  )
}


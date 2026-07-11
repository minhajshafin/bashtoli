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
    <nav className="flex items-center space-x-2 text-xs md:text-sm font-medium text-zinc-500 dark:text-zinc-400 py-4 mb-2">
      {/* Home */}
      <Link
        href="/products"
        className="hover:text-amber-600 transition-colors"
      >
        Shop
      </Link>

      {/* Separator */}
      <svg
        className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>

      {/* Category */}
      {category ? (
        <>
          <Link
            href={`/products?category=${category.slug}`}
            className="hover:text-amber-600 transition-colors whitespace-nowrap"
          >
            {category.name}
          </Link>
          {/* Separator */}
          <svg
            className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </>
      ) : null}

      {/* Current Product */}
      <span className="text-zinc-900 font-semibold truncate dark:text-zinc-50" aria-current="page">
        {productName}
      </span>
    </nav>
  )
}

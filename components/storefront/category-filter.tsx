'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import React from 'react'

interface Category {
  id: string
  name: string
  slug: string
  activeProductsCount: number
}

interface CategoryFilterProps {
  categories: Category[]
  activeCategorySlug?: string
}

export function CategoryFilter({ categories, activeCategorySlug }: CategoryFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleCategorySelect = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (slug) {
      params.set('category', slug)
    } else {
      params.delete('category')
    }
    params.delete('page') // Reset page on filter change
    router.push(`${pathname}?${params.toString()}`)
  }

  // Calculate total active products count across all categories
  const totalProductsCount = categories.reduce((sum, cat) => sum + cat.activeProductsCount, 0)

  return (
    <div className="w-full">
      {/* Mobile Horizontal Pills (Visible on mobile/tablet) */}
      <div className="flex md:hidden w-full overflow-x-auto pb-4 scrollbar-none gap-2">
        <button
          onClick={() => handleCategorySelect(null)}
          className={`flex-none rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all border ${
            !activeCategorySlug
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
              : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-950 dark:text-zinc-400 dark:border-zinc-800'
          }`}
        >
          All Products ({totalProductsCount})
        </button>
        {categories.map((category) => {
          const isActive = category.slug === activeCategorySlug
          return (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.slug)}
              className={`flex-none rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-950 dark:text-zinc-400 dark:border-zinc-800'
              }`}
            >
              {category.name} ({category.activeProductsCount})
            </button>
          )
        })}
      </div>

      {/* Desktop Vertical Sidebar (Visible on desktop) */}
      <div className="hidden md:block">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">
          Categories
        </h2>
        <ul className="space-y-1.5">
          <li>
            <button
              onClick={() => handleCategorySelect(null)}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                !activeCategorySlug
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-200'
              }`}
            >
              <span>All Products</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  !activeCategorySlug
                    ? 'bg-amber-200/60 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                    : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
              >
                {totalProductsCount}
              </span>
            </button>
          </li>
          {categories.map((category) => {
            const isActive = category.slug === activeCategorySlug
            return (
              <li key={category.id}>
                <button
                  onClick={() => handleCategorySelect(category.slug)}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                      : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-200'
                  }`}
                >
                  <span>{category.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      isActive
                        ? 'bg-amber-200/60 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                        : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    {category.activeProductsCount}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

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
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  const totalProductsCount = categories.reduce((sum, cat) => sum + cat.activeProductsCount, 0)

  return (
    <div className="w-full">
      {/* Mobile Horizontal Filter Chips */}
      <div className="flex md:hidden w-full overflow-x-auto pb-2 scrollbar-none gap-2">
        <button
          type="button"
          onClick={() => handleCategorySelect(null)}
          className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            !activeCategorySlug
              ? 'bg-gold-500 text-forest-900 shadow-sm'
              : 'bg-forest-800 text-cream-100 border border-forest-700 hover:border-gold-500/50 hover:text-gold-400'
          }`}
        >
          <span>All Products</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              !activeCategorySlug
                ? 'bg-forest-900/20 text-forest-900'
                : 'bg-forest-700 text-forest-300'
            }`}
          >
            {totalProductsCount}
          </span>
        </button>

        {categories.map((category) => {
          const isActive = category.slug === activeCategorySlug
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategorySelect(category.slug)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-gold-500 text-forest-900 shadow-sm'
                  : 'bg-forest-800 text-cream-100 border border-forest-700 hover:border-gold-500/50 hover:text-gold-400'
              }`}
            >
              <span>{category.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive
                    ? 'bg-forest-900/20 text-forest-900'
                    : 'bg-forest-700 text-forest-300'
                }`}
              >
                {category.activeProductsCount}
              </span>
            </button>
          )
        })}
      </div>

      {/* Desktop Deep Forest Sidebar */}
      <div className="hidden md:block rounded-3xl border border-forest-700 bg-forest-800 p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3.5 mb-2 border-b border-forest-700/80">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold-400">
              Categories
            </p>
          </div>
          {activeCategorySlug && (
            <button
              type="button"
              onClick={() => handleCategorySelect(null)}
              className="text-[11px] font-semibold text-forest-300 hover:text-gold-400 hover:underline transition-colors cursor-pointer"
            >
              Clear filter
            </button>
          )}
        </div>

        {/* Categories List */}
        <nav className="space-y-1" aria-label="Product Categories">
          {/* All Products */}
          <button
            type="button"
            onClick={() => handleCategorySelect(null)}
            className={`group flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
              !activeCategorySlug
                ? 'bg-gold-500 text-forest-900 font-bold shadow-sm'
                : 'text-forest-200 hover:bg-forest-700/70 hover:text-gold-300'
            }`}
          >
            <span className="truncate">All Products</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold transition-colors shrink-0 ml-2 ${
                !activeCategorySlug
                  ? 'bg-forest-900/20 text-forest-950 font-bold'
                  : 'bg-forest-700 text-forest-300 group-hover:bg-forest-600 group-hover:text-cream-100'
              }`}
            >
              {totalProductsCount}
            </span>
          </button>

          {categories.map((category) => {
            const isActive = category.slug === activeCategorySlug
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategorySelect(category.slug)}
                className={`group flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-gold-500 text-forest-900 font-bold shadow-sm'
                    : 'text-forest-200 hover:bg-forest-700/70 hover:text-gold-300'
                }`}
              >
                <span className="truncate">{category.name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold transition-colors shrink-0 ml-2 ${
                    isActive
                      ? 'bg-forest-900/20 text-forest-950 font-bold'
                      : 'bg-forest-700 text-forest-300 group-hover:bg-forest-600 group-hover:text-cream-100'
                  }`}
                >
                  {category.activeProductsCount}
                </span>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

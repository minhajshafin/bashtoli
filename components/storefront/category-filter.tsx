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
      {/* Mobile Horizontal Filter Chips with Snap Scroll */}
      <div
        className="flex md:hidden w-full overflow-x-auto pb-2 scrollbar-none gap-2 select-none"
        style={{ overflowAnchor: 'none' }}
      >
        <button
          type="button"
          onClick={() => handleCategorySelect(null)}
          className={`shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-sans transition-all cursor-pointer ${
            !activeCategorySlug
              ? 'bg-gold-500 text-forest-950 font-semibold shadow-xs border border-gold-400/50'
              : 'bg-cream-100 text-forest-900/80 border border-forest-900/10 hover:border-gold-500/40 hover:text-forest-950'
          }`}
        >
          <span>All Products</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
              !activeCategorySlug
                ? 'bg-forest-950/20 text-forest-950'
                : 'bg-forest-900/10 text-forest-700'
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
              className={`shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-sans transition-all cursor-pointer ${
                isActive
                  ? 'bg-gold-500 text-forest-950 font-semibold shadow-xs border border-gold-400/50'
                  : 'bg-cream-100 text-forest-900/80 border border-forest-900/10 hover:border-gold-500/40 hover:text-forest-950'
              }`}
            >
              <span>{category.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  isActive
                    ? 'bg-forest-950/20 text-forest-950'
                    : 'bg-forest-900/10 text-forest-700'
                }`}
              >
                {category.activeProductsCount}
              </span>
            </button>
          )
        })}
      </div>

      {/* Desktop Archival Gallery Index Sidebar */}
      <div className="hidden md:block rounded-[26px] border border-forest-800/80 bg-forest-900/95 backdrop-blur-md p-5 lg:p-6 shadow-atelier text-cream-100">
        <div className="flex items-center justify-between pb-3.5 mb-2.5 border-b border-forest-800/80">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
            <p className="text-[10px] font-sans font-medium uppercase tracking-[0.24em] text-gold-400">
              Collections
            </p>
          </div>
          {activeCategorySlug && (
            <button
              type="button"
              onClick={() => handleCategorySelect(null)}
              className="text-[11px] font-sans font-medium text-forest-300 hover:text-gold-300 transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {/* Categories List */}
        <nav className="space-y-1 pt-1" aria-label="Product Categories">
          {/* All Products */}
          <button
            type="button"
            onClick={() => handleCategorySelect(null)}
            className={`group flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-sm font-sans transition-all text-left cursor-pointer ${
              !activeCategorySlug
                ? 'bg-gold-500 text-forest-950 font-semibold shadow-xs'
                : 'text-forest-200/90 hover:bg-forest-800/60 hover:text-gold-200'
            }`}
          >
            <span className="truncate">All Products</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-sans font-medium transition-colors shrink-0 ml-2 ${
                !activeCategorySlug
                  ? 'bg-forest-950/20 text-forest-950 font-semibold'
                  : 'bg-forest-800/80 text-forest-300 group-hover:bg-forest-700 group-hover:text-cream-100'
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
                className={`group flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-sm font-sans transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-gold-500 text-forest-950 font-semibold shadow-xs'
                    : 'text-forest-200/90 hover:bg-forest-800/60 hover:text-gold-200'
                }`}
              >
                <span className="truncate">{category.name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-sans font-medium transition-colors shrink-0 ml-2 ${
                    isActive
                      ? 'bg-forest-950/20 text-forest-950 font-semibold'
                      : 'bg-forest-800/80 text-forest-300 group-hover:bg-forest-700 group-hover:text-cream-100'
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

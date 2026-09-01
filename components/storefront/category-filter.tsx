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

  const totalProductsCount = categories.reduce((sum, cat) => sum + cat.activeProductsCount, 0)

  return (
    <div className="w-full">
      {/* Mobile Horizontal Filter Chips */}
      <div className="flex md:hidden w-full overflow-x-auto pb-2 scrollbar-none gap-2">
        <button
          onClick={() => handleCategorySelect(null)}
          style={{
            flexShrink: 0,
            padding: '5px 14px',
            borderRadius: '100px',
            fontSize: '0.75rem',
            backgroundColor: !activeCategorySlug ? '#c9a96e' : '#1a3326',
            color: !activeCategorySlug ? '#1a3326' : '#e2c99a',
            border: `1px solid ${!activeCategorySlug ? '#c9a96e' : '#243d2e'}`,
            cursor: 'pointer',
            fontWeight: !activeCategorySlug ? 600 : 400,
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          All Products ({totalProductsCount})
        </button>
        {categories.map((category) => {
          const isActive = category.slug === activeCategorySlug
          return (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.slug)}
              style={{
                flexShrink: 0,
                padding: '5px 14px',
                borderRadius: '100px',
                fontSize: '0.75rem',
                backgroundColor: isActive ? '#c9a96e' : '#1a3326',
                color: isActive ? '#1a3326' : '#e2c99a',
                border: `1px solid ${isActive ? '#c9a96e' : '#243d2e'}`,
                cursor: 'pointer',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {category.name} ({category.activeProductsCount})
            </button>
          )
        })}
      </div>

      {/* Desktop Dark Forest Sidebar */}
      <div
        className="hidden md:block"
        style={{
          backgroundColor: '#080f0a',
          borderRadius: '20px',
          padding: '18px',
          border: '1px solid #1a3326',
        }}
      >
        <p
          style={{
            fontSize: '0.56rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#c9a96e',
            marginBottom: '12px',
            paddingLeft: '4px',
            fontFamily: "'Source Sans 3', system-ui, sans-serif",
          }}
        >
          Category
        </p>

        {/* All Products */}
        <button
          onClick={() => handleCategorySelect(null)}
          className="flex items-center justify-between w-full text-left transition-all"
          style={{
            padding: '8px 12px',
            borderRadius: '10px',
            marginBottom: '2px',
            border: 'none',
            backgroundColor: !activeCategorySlug ? '#c9a96e' : 'transparent',
            color: !activeCategorySlug ? '#1a3326' : '#6a9e7c',
            fontSize: '0.825rem',
            fontFamily: "'Source Sans 3', system-ui, sans-serif",
            cursor: 'pointer',
            fontWeight: !activeCategorySlug ? 600 : 400,
          }}
          onMouseEnter={(e) => {
            if (activeCategorySlug) {
              e.currentTarget.style.backgroundColor = '#243d2e'
              e.currentTarget.style.color = '#e2c99a'
            }
          }}
          onMouseLeave={(e) => {
            if (activeCategorySlug) {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#6a9e7c'
            }
          }}
        >
          <span>All Products</span>
          <span
            style={{
              fontSize: '0.67rem',
              borderRadius: '100px',
              padding: '2px 7px',
              backgroundColor: !activeCategorySlug ? 'rgba(26,51,38,0.25)' : '#1a3326',
              color: !activeCategorySlug ? '#1a3326' : '#3d6e54',
            }}
          >
            {totalProductsCount}
          </span>
        </button>

        <div style={{ height: '1px', backgroundColor: '#1a3326', margin: '6px 2px 8px' }} />

        {/* Categories List */}
        <div className="space-y-0.5">
          {categories.map((category) => {
            const isActive = category.slug === activeCategorySlug
            return (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.slug)}
                className="flex items-center justify-between w-full text-left transition-all"
                style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  marginBottom: '2px',
                  border: 'none',
                  backgroundColor: isActive ? '#c9a96e' : 'transparent',
                  color: isActive ? '#1a3326' : '#6a9e7c',
                  fontSize: '0.8rem',
                  fontFamily: "'Source Sans 3', system-ui, sans-serif",
                  cursor: 'pointer',
                  fontWeight: isActive ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#243d2e'
                    e.currentTarget.style.color = '#e2c99a'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = '#6a9e7c'
                  }
                }}
              >
                <span>{category.name}</span>
                <span
                  style={{
                    fontSize: '0.67rem',
                    borderRadius: '100px',
                    padding: '2px 7px',
                    backgroundColor: isActive ? 'rgba(26,51,38,0.25)' : '#1a3326',
                    color: isActive ? '#1a3326' : '#3d6e54',
                  }}
                >
                  {category.activeProductsCount}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}



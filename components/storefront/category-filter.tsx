'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'

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

/**
 * Dynamic Width-Filling Category Ribbon with Inline [+remaining more] Expander (/awwwards).
 * Fills the exact available width of the container in a single line with as many category
 * pills as fit. If more categories remain, the final pill rendered is `[+{remaining} more ▾]`.
 * Clicking it unfurls all categories in-place into a multi-row grid without side-scrolling.
 */
export function CategoryFilter({ categories, activeCategorySlug }: CategoryFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isExpanded, setIsExpanded] = useState(false)
  const [visibleCount, setVisibleCount] = useState<number | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)

  const handleCategorySelect = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (slug) {
      params.set('category', slug)
    } else {
      params.delete('category')
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
    setIsExpanded(false)
  }

  // Calculate how many categories can fit across the available width
  const calculateVisibleCount = useCallback(() => {
    if (!containerRef.current || !measureRef.current) return

    const containerWidth = containerRef.current.clientWidth
    if (containerWidth <= 0) return

    const children = measureRef.current.children
    if (children.length < 2) return

    const allCollectionsWidth = (children[0] as HTMLElement).offsetWidth
    // The last child in measureRef is the template "+99 more" button
    const moreButtonWidth = (children[children.length - 1] as HTMLElement).offsetWidth
    const gap = 8 // gap-2 = 8px

    let accumulated = allCollectionsWidth
    let count = 0

    for (let i = 0; i < categories.length; i++) {
      const catEl = children[1 + i] as HTMLElement | undefined
      if (!catEl) break
      const catWidth = catEl.offsetWidth

      const isLastItem = i === categories.length - 1

      if (isLastItem) {
        // If this is the last category, check if it fits without needing the more button
        if (accumulated + gap + catWidth <= containerWidth) {
          count++
        }
      } else {
        // Not the last item: must fit this category AND leave room for the "+remaining more" button
        if (accumulated + gap + catWidth + gap + moreButtonWidth <= containerWidth) {
          accumulated += gap + catWidth
          count++
        } else {
          break
        }
      }
    }

    setVisibleCount(Math.min(categories.length, Math.max(1, count)))
  }, [categories])

  useEffect(() => {
    calculateVisibleCount()

    // Re-calculate after custom fonts finish rendering
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        calculateVisibleCount()
      })
    }

    const el = containerRef.current
    if (!el) return

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => {
        calculateVisibleCount()
      })
      ro.observe(el)
      return () => ro.disconnect()
    } else {
      window.addEventListener('resize', calculateVisibleCount)
      return () => window.removeEventListener('resize', calculateVisibleCount)
    }
  }, [calculateVisibleCount])

  // In collapsed mode, determine visible categories.
  // Ensure the active category is always present in the visible row.
  const displayedCategories = useMemo(() => {
    if (isExpanded) return categories
    if (visibleCount === null) {
      // Default initial baseline before measurement
      return categories.slice(0, 5)
    }

    const base = categories.slice(0, visibleCount)
    if (activeCategorySlug) {
      const activeCat = categories.find((c) => c.slug === activeCategorySlug)
      if (activeCat && !base.some((c) => c.id === activeCat.id)) {
        const adjusted = [...base]
        if (adjusted.length > 0) {
          adjusted[adjusted.length - 1] = activeCat
        } else {
          adjusted.push(activeCat)
        }
        return adjusted
      }
    }
    return base
  }, [categories, visibleCount, isExpanded, activeCategorySlug])

  const remainingCount = Math.max(0, categories.length - displayedCategories.length)
  const hasMore = remainingCount > 0 || isExpanded

  return (
    <div ref={containerRef} className="w-full select-none overflow-hidden">
      {/* Off-screen measurement sandbox using exact typography & padding */}
      <div
        ref={measureRef}
        aria-hidden="true"
        className="absolute opacity-0 pointer-events-none -z-50 flex items-center gap-2 flex-nowrap"
        style={{
          position: 'absolute',
          visibility: 'hidden',
          top: -9999,
          left: -9999,
          whiteSpace: 'nowrap',
        }}
      >
        <button
          type="button"
          tabIndex={-1}
          className="shrink-0 inline-flex items-center px-3.5 py-1.5 sm:px-4 sm:py-1.5 rounded-full text-xs font-sans font-semibold border"
        >
          All Collections
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            tabIndex={-1}
            className="shrink-0 inline-flex items-center px-3.5 py-1.5 sm:px-4 sm:py-1.5 rounded-full text-xs font-sans border"
          >
            {c.name}
          </button>
        ))}
        <button
          type="button"
          tabIndex={-1}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-sans font-medium border"
        >
          <span>+99 more</span>
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} />
        </button>
      </div>

      {/* Rendered Category Pills */}
      <div
        className={`flex items-center gap-2 transition-all duration-300 ${
          isExpanded
            ? 'flex-wrap animate-fade-in'
            : 'flex-nowrap'
        }`}
      >
        {/* All Collections Pill */}
        <button
          type="button"
          onClick={() => handleCategorySelect(null)}
          className={`shrink-0 inline-flex items-center px-3.5 py-1.5 sm:px-4 sm:py-1.5 rounded-full text-xs font-sans transition-all cursor-pointer ${
            !activeCategorySlug
              ? 'bg-gold-500 text-forest-950 font-semibold shadow-sm border border-gold-400/60'
              : 'bg-forest-900/80 text-cream-200/90 border border-forest-700/70 hover:border-gold-500/50 hover:text-gold-200 hover:bg-forest-800/90 shadow-xs'
          }`}
        >
          All Collections
        </button>

        {/* Displayed Category Pills */}
        {displayedCategories.map((category) => {
          const isActive = category.slug === activeCategorySlug
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategorySelect(category.slug)}
              className={`shrink-0 inline-flex items-center px-3.5 py-1.5 sm:px-4 sm:py-1.5 rounded-full text-xs font-sans transition-all cursor-pointer ${
                isActive
                  ? 'bg-gold-500 text-forest-950 font-semibold shadow-sm border border-gold-400/60'
                  : 'bg-forest-900/80 text-cream-200/90 border border-forest-700/70 hover:border-gold-500/50 hover:text-gold-200 hover:bg-forest-800/90 shadow-xs'
              }`}
            >
              {category.name}
            </button>
          )
        })}

        {/* Dynamic Inline Counter / Collapse Pill */}
        {hasMore && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-label={
              isExpanded
                ? 'Collapse categories to single row'
                : `Show ${remainingCount} more categories`
            }
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-sans font-medium transition-all duration-200 cursor-pointer active:scale-95 ${
              isExpanded
                ? 'bg-gold-500 text-forest-950 font-semibold shadow-sm border border-gold-400/60'
                : 'bg-forest-900/95 text-gold-300 border border-gold-500/40 hover:border-gold-400 hover:text-gold-200 hover:bg-forest-800 shadow-xs'
            }`}
          >
            <span>{isExpanded ? 'Collapse' : `+${remainingCount} more`}</span>
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
                isExpanded ? 'rotate-180 text-forest-950' : 'text-gold-400'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

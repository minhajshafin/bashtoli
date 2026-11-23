'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

const SORT_OPTIONS = [
  { value: 'new', label: 'New Arrivals First' },
  { value: 'featured', label: 'Featured Selection' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
] as const

type SortValue = (typeof SORT_OPTIONS)[number]['value']

interface SortDropdownProps {
  theme?: 'light' | 'dark'
}

export function SortDropdown({ theme = 'light' }: SortDropdownProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentSort = (searchParams.get('sort') as SortValue) || 'new'

  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const activeOption =
    SORT_OPTIONS.find((opt) => opt.value === currentSort) || SORT_OPTIONS[0]

  const handleSelect = (value: SortValue) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'new') {
      params.delete('sort')
    } else {
      params.set('sort', value)
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
    setIsOpen(false)
  }

  // Handle click outside and Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const isDark = theme === 'dark'

  return (
    <div className="flex items-center gap-1.5 sm:gap-2.5">
      <span
        id="sort-label"
        className={`hidden sm:inline text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-sans font-medium whitespace-nowrap ${
          isDark ? 'text-forest-300' : 'text-forest-700/80'
        }`}
      >
        Sort by
      </span>

      <div ref={dropdownRef} className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby="sort-label"
          className={`flex items-center gap-1.5 sm:gap-2.5 rounded-pill px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-sans font-medium transition-[border-color,background-color,color] duration-normal cursor-pointer border focus:outline-none focus:ring-2 focus:ring-focus-ring ${
            isDark
              ? isOpen
                ? 'border-gold-500/80 bg-forest-900 text-gold-300 shadow-elevation-1'
                : 'border-forest-800 bg-forest-900/90 text-cream-100 hover:border-gold-500/60 hover:text-gold-200 shadow-xs'
              : isOpen
              ? 'border-gold-500 bg-cream-50 text-forest-950 shadow-elevation-1'
              : 'border-forest-900/15 bg-white hover:border-gold-500/70 hover:bg-cream-50 shadow-elevation-1'
          }`}
        >
          <span className="truncate max-w-[120px] sm:max-w-none">{activeOption.label}</span>
          <svg
            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-normal shrink-0 ${
              isDark ? 'text-gold-400' : 'text-forest-700'
            } ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            role="listbox"
            aria-labelledby="sort-label"
            className={`absolute right-0 mt-2 w-52 rounded-xl p-1.5 shadow-elevation-2 z-50 animate-fade-in ${
              isDark
                ? 'bg-forest-900 border border-forest-800 text-cream-100'
                : 'bg-white border border-forest-900/15 text-forest-950'
            }`}
          >
            {SORT_OPTIONS.map((opt) => {
              const isSelected = opt.value === currentSort
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  className={`flex items-center justify-between w-full px-3 py-2 text-xs rounded-lg font-sans text-left transition-colors duration-fast cursor-pointer ${
                    isDark
                      ? isSelected
                        ? 'bg-forest-800 text-gold-300 font-semibold'
                        : 'text-cream-200/90 hover:bg-forest-800/70 hover:text-gold-200'
                      : isSelected
                      ? 'bg-forest-950 text-cream-50 font-semibold'
                      : 'text-forest-800 hover:bg-cream-100 hover:text-forest-950 active:bg-cream-200'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <svg
                      className="w-3.5 h-3.5 shrink-0 text-gold-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

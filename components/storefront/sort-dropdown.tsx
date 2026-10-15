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

export function SortDropdown() {
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

  return (
    <div className="flex items-center gap-2.5">
      <span
        id="sort-label"
        className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-sans font-medium text-forest-300/80 whitespace-nowrap"
      >
        Sort by
      </span>

      <div ref={dropdownRef} className="relative">
        {/* Trigger Button — Dark Green Velvet Pill with Brass Accent */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby="sort-label"
          className={`flex items-center gap-2.5 rounded-full px-4 py-2 text-xs font-sans font-medium transition-all duration-200 cursor-pointer text-cream-100 border focus:outline-none focus:ring-2 focus:ring-focus-ring ${
            isOpen
              ? 'border-border-gold bg-forest-800 text-gold-300'
              : 'border-border-dark bg-forest-900/90 hover:border-border-gold hover:text-gold-200 hover:bg-forest-800/80'
          }`}
        >
          <span className="truncate">{activeOption.label}</span>
          <svg
            className={`w-3.5 h-3.5 text-gold-400 transition-transform duration-200 shrink-0 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu — Glassmorphic Deep Forest Container */}
        {isOpen && (
          <div
            role="listbox"
            aria-labelledby="sort-label"
            className="absolute right-0 mt-2 w-52 rounded-2xl bg-forest-950/98 backdrop-blur-md border border-border-gold p-1.5 shadow-sm z-50 animate-fade-in"
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
                  className={`flex items-center justify-between w-full px-3 py-2 text-xs rounded-xl font-sans text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-btn-accent-bg text-btn-accent-text font-semibold'
                      : 'text-cream-200 hover:bg-forest-800 hover:text-gold-300 active:bg-forest-700'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <svg
                      className="w-3.5 h-3.5 shrink-0 text-forest-950"
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

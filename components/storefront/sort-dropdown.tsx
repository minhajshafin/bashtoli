'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

const SORT_OPTIONS = [
  { value: 'new', label: 'New Arrivals First' },
  { value: 'featured', label: 'Featured' },
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
    <div className="flex items-center gap-3">
      <span
        id="sort-label"
        style={{
          fontSize: '0.72rem',
          color: '#a8c4b0',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          fontWeight: 600,
          fontFamily: "'Source Sans 3', system-ui, sans-serif",
        }}
      >
        Sort
      </span>

      <div ref={dropdownRef} className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby="sort-label"
          className="flex items-center gap-2.5 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200"
          style={{
            backgroundColor: '#0f2318',
            color: '#e2c99a',
            border: isOpen ? '1px solid #c9a96e' : '1px solid #243d2e',
            boxShadow: isOpen ? '0 0 16px rgba(201,169,110,0.15)' : 'none',
          }}
        >
          <span className="truncate">{activeOption.label}</span>
          <svg
            className={`w-3.5 h-3.5 text-gold-400 transition-transform duration-200 shrink-0 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Custom Themed Options Menu */}
        {isOpen && (
          <div
            role="listbox"
            aria-labelledby="sort-label"
            className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[200px] rounded-2xl p-1.5 shadow-2xl border transition-all animate-fade-in backdrop-blur-md"
            style={{
              backgroundColor: 'rgba(15, 35, 24, 0.96)',
              borderColor: '#243d2e',
              boxShadow: '0 16px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(201,169,110,0.1)',
            }}
          >
            {SORT_OPTIONS.map(({ value, label }) => {
              const isSelected = value === currentSort

              return (
                <button
                  key={value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(value)}
                  className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left"
                  style={{
                    backgroundColor: isSelected ? 'rgba(36, 61, 46, 0.9)' : 'transparent',
                    color: isSelected ? '#c9a96e' : '#a8c4b0',
                    border: isSelected ? '1px solid rgba(201, 169, 110, 0.35)' : '1px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'rgba(26, 51, 38, 0.7)'
                      e.currentTarget.style.color = '#e2c99a'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = '#a8c4b0'
                    }
                  }}
                >
                  <span>{label}</span>
                  {isSelected && (
                    <svg
                      className="w-3.5 h-3.5 text-gold-400 shrink-0 ml-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
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

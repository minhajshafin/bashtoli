'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import React from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  // Generate page numbers to display
  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i)
  }

  return (
    <nav className="flex items-center justify-center gap-2 py-8" aria-label="Pagination">
      {/* Previous button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-forest-200 bg-cream-50 text-forest-600 transition-all hover:bg-cream-200 hover:text-forest-900 disabled:pointer-events-none disabled:opacity-50"
        aria-label="Previous page"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Page buttons */}
      <div className="flex items-center gap-1.5">
        {pages.map((page) => {
          const isActive = page === currentPage
          return (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gold-500 text-forest-800 shadow-md shadow-gold-500/20 font-bold'
                  : 'border border-forest-200 bg-cream-50 text-forest-600 hover:bg-cream-200 hover:text-forest-900'
              }`}
            >
              {page}
            </button>
          )
        })}
      </div>

      {/* Next button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-forest-200 bg-cream-50 text-forest-600 transition-all hover:bg-cream-200 hover:text-forest-900 disabled:pointer-events-none disabled:opacity-50"
        aria-label="Next page"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  )
}


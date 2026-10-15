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
    <nav className="flex items-center justify-center gap-2 py-8 select-none" aria-label="Pagination">
      {/* Previous page button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn-secondary flex h-10 w-10 items-center justify-center rounded-xl text-forest-700 disabled:pointer-events-none disabled:opacity-40"
        aria-label="Previous page"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Numbered page buttons */}
      <div className="flex items-center gap-1.5">
        {pages.map((page) => {
          const isActive = page === currentPage
          return (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-sans transition-all cursor-pointer ${
                isActive
                  ? 'btn-accent font-bold pointer-events-none'
                  : 'btn-secondary font-medium'
              }`}
            >
              {page}
            </button>
          )
        })}
      </div>

      {/* Next page button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn-secondary flex h-10 w-10 items-center justify-center rounded-xl text-forest-700 disabled:pointer-events-none disabled:opacity-40"
        aria-label="Next page"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  )
}

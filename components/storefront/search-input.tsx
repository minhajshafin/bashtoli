'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import React, { useState } from 'react'

export function SearchInput() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const qParam = searchParams.get('q') || ''
  const [query, setQuery] = useState(qParam)
  const [prevQParam, setPrevQParam] = useState(qParam)

  // Sync state if URL changes externally
  if (qParam !== prevQParam) {
    setPrevQParam(qParam)
    setQuery(qParam)
  }

  const handleSearch = (e: React.SyntheticEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (query.trim()) {
      params.set('q', query.trim())
    } else {
      params.delete('q')
    }
    params.delete('page') // Reset page to 1 on new search
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-2xl border border-input-border bg-input-bg py-3 pr-12 pl-4 text-sm text-input-text transition-all focus:border-input-border-focus focus:outline-none focus:ring-2 focus:ring-input-focus-ring"
        />
        <button
          type="submit"
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-text-muted hover:text-btn-accent-bg transition-colors cursor-pointer"
          aria-label="Submit search"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>
    </form>
  )
}

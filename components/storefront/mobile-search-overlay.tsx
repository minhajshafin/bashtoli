'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Search, X, ArrowRight, BookOpen, PenTool, Sparkles } from 'lucide-react'

interface SearchProduct {
  id: string
  name: string
  slug: string
  price: number
  categoryName: string | null
  imageUrl: string | null
}

interface MobileSearchOverlayProps {
  isOpen: boolean
  onClose: () => void
}

const FEATURED_CATEGORIES = [
  { name: 'Notebooks', slug: 'notebooks-and-journals', icon: BookOpen },
  { name: 'Writing Tools', slug: 'writing-instruments', icon: PenTool },
  { name: 'Ink & Calligraphy', slug: 'ink-and-calligraphy', icon: Sparkles },
  { name: 'Paper & Cards', slug: 'paper-and-cards' },
  { name: 'Gift Sets', slug: 'gift-collections' },
  { name: 'Desk Items', slug: 'desk-accessories' },
]

const POPULAR_SEARCHES = [
  'Journal',
  'Starter Kit',
  'Leather Cover',
  'Botanical',
  'Ink Set',
  'Pen Stand',
  'Field Notes',
]

export function MobileSearchOverlay({ isOpen, onClose }: MobileSearchOverlayProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)

  // Reset fields during render when overlay closes
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen)
    if (!isOpen) {
      setQuery('')
      setSearchResults([])
    }
  }

  // Derive visible results: automatically empty when query is blank
  const results = query.trim() ? searchResults : []

  // Focus input and lock body scroll when opened
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      return () => {
        clearTimeout(timer)
        document.body.style.overflow = ''
      }
    } else {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Escape key listener
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Live search debouncing
  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        })
        if (res.ok) {
          const data = await res.json()
          setSearchResults(data.products || [])
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Search error:', err)
        }
      } finally {
        setLoading(false)
      }
    }, 200)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onClose()
      router.push(`/products?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleSelectPopular = (term: string) => {
    setQuery(term)
    inputRef.current?.focus()
  }

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Product Search"
      className="md:hidden fixed inset-0 z-50 flex flex-col bg-forest-950/98 backdrop-blur-2xl text-cream-100 animate-in fade-in duration-200"
    >
      {/* Top Search Bar */}
      <div className="shrink-0 px-4 pt-3 pb-3 border-b border-forest-800/80 bg-forest-950/80">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gold-400/80" />
            <input
              ref={inputRef}
              type="search"
              id="mobile-search-input"
              name="q"
              aria-label="Search journals, pens, paper"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search journals, pens, paper..."
              className="w-full h-12 pl-10 pr-10 text-base rounded-2xl bg-forest-900/90 text-cream-100 placeholder:text-forest-400/80 border border-forest-800 focus:border-gold-500/80 focus:ring-2 focus:ring-gold-500/20 focus:outline-none transition-all shadow-inner"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  inputRef.current?.focus()
                }}
                aria-label="Clear query"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center text-forest-400 hover:text-gold-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-12 px-3 flex items-center justify-center text-xs font-semibold uppercase tracking-wider text-forest-300 hover:text-gold-300 active:scale-95 transition-all cursor-pointer"
          >
            Cancel
          </button>
        </form>
      </div>

      {/* Results / Discovery Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* State 1: Active query with live results */}
        {query.trim().length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-forest-400">
                {loading ? 'Searching...' : `Matching Products (${results.length})`}
              </p>
              {loading && (
                <div className="w-3.5 h-3.5 border-2 border-gold-400/30 border-t-gold-400 rounded-full animate-spin" />
              )}
            </div>

            {results.length > 0 ? (
              <div className="space-y-2">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3.5 p-2.5 rounded-2xl bg-forest-900/50 hover:bg-forest-900 border border-forest-800/60 active:scale-[0.99] transition-all group"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-12 h-12 rounded-xl bg-forest-800/80 overflow-hidden shrink-0 border border-forest-700/50">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="48px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-forest-500 font-display text-sm">
                          বাঁ
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-cream-100 truncate group-hover:text-gold-300 transition-colors">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {product.categoryName && (
                          <span className="text-[10px] uppercase tracking-wider text-forest-400 font-medium">
                            {product.categoryName}
                          </span>
                        )}
                        <span className="text-xs font-bold text-gold-400 font-price">
                          ৳{product.price.toLocaleString('en-BD')}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="w-4 h-4 text-forest-500 group-hover:text-gold-300 group-hover:translate-x-0.5 transition-all shrink-0 mr-1" />
                  </Link>
                ))}

                {/* View all full catalogue results */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="btn-secondary w-full h-11 flex items-center justify-center gap-2 rounded-xl text-xs font-semibold"
                  >
                    <span>View all matching items for &ldquo;{query}&rdquo;</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : !loading ? (
              /* Zero results empty state */
              <div className="py-10 text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-forest-900/60 border border-forest-800/80 flex items-center justify-center text-forest-400">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-cream-100 font-display">
                    No products found
                  </h3>
                  <p className="text-xs text-forest-400 mt-1 max-w-xs mx-auto">
                    We couldn&apos;t find anything matching &ldquo;{query}&rdquo;. Try another search term or browse popular categories below.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/products"
                    onClick={onClose}
                    className="btn-secondary inline-flex h-10 items-center justify-center px-5 rounded-xl text-xs font-semibold"
                  >
                    Browse All Stationery &rarr;
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          /* State 2: Empty query - Quick Discovery & Popular Searches */
          <div className="space-y-6">
            {/* Quick Categories */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-forest-400 mb-2.5">
                Browse Categories
              </p>
              <div className="grid grid-cols-2 gap-2">
                {FEATURED_CATEGORIES.map((cat) => {
                  const Icon = cat.icon || BookOpen
                  return (
                    <Link
                      key={cat.slug}
                      href={`/products?category=${cat.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-2.5 p-3 rounded-2xl bg-forest-900/60 hover:bg-forest-900 border border-forest-800/70 text-left active:scale-[0.98] transition-all group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-forest-800/80 flex items-center justify-center text-gold-400 shrink-0 group-hover:scale-105 transition-transform">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-cream-100 group-hover:text-gold-300 transition-colors leading-snug">
                        {cat.name}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Popular Searches */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-forest-400 mb-2.5">
                Popular Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSelectPopular(term)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-forest-900/60 hover:bg-forest-900 border border-forest-800/80 text-xs font-medium text-cream-200/90 hover:text-gold-300 active:scale-95 transition-all cursor-pointer"
                  >
                    <Search className="w-3 h-3 text-gold-400/70" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

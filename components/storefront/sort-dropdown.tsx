'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

const SORT_OPTIONS = [
  { value: 'new', label: 'New Arrivals First' },
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
] as const

export function SortDropdown() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get('sort') || 'new'

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', e.target.value)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="sort-select"
        style={{
          fontSize: '0.72rem',
          color: '#a8c4b0',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          fontWeight: 500,
        }}
      >
        Sort
      </label>
      <div style={{ position: 'relative' }}>
        <select
          id="sort-select"
          value={currentSort}
          onChange={handleChange}
          style={{
            backgroundColor: '#0f2318',
            color: '#c9a96e',
            border: '1px solid #243d2e',
            borderRadius: '100px',
            padding: '7px 36px 7px 16px',
            fontSize: '0.8rem',
            appearance: 'none',
            cursor: 'pointer',
            outline: 'none',
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%23c9a96e' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            backgroundSize: '14px',
          }}
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

const ROUTE_LABELS: Record<string, string> = {
  admin: 'Dashboard',
  products: 'Products',
  new: 'Add Product',
  categories: 'Categories',
  orders: 'Orders',
  storefront: 'Storefront',
  staff: 'Staff Accounts',
}

export function AdminBreadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length <= 1) {
    return (
      <div className="hidden sm:flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-ink-600 truncate">
        <Home className="h-3.5 w-3.5 shrink-0 text-ink-500" aria-hidden="true" />
        <span className="font-bold text-ink-950 truncate">Dashboard</span>
      </div>
    )
  }

  const crumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const isLast = index === segments.length - 1

    let label = ROUTE_LABELS[segment]
    if (!label) {
      if (segment.length > 20) {
        label = 'Details'
      } else {
        label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
      }
    }

    return { label, href, isLast }
  })

  return (
    <nav
      aria-label="Breadcrumb"
      className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-500"
    >
      <Link
        href="/admin"
        className="flex items-center gap-1.5 text-ink-500 hover:text-ink-950 transition-colors rounded px-1 py-0.5"
      >
        <Home className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Admin</span>
      </Link>

      {crumbs.slice(1).map((crumb, idx) => (
        <React.Fragment key={crumb.href + idx}>
          <ChevronRight className="h-3 w-3 text-ink-400 shrink-0" aria-hidden="true" />
          {crumb.isLast ? (
            <span className="font-bold text-ink-950 truncate max-w-[160px]">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="text-ink-500 hover:text-ink-950 transition-colors truncate max-w-[140px] rounded px-1 py-0.5"
            >
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

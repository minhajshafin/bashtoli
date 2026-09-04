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

  // If we are on /admin itself, show Dashboard
  if (segments.length <= 1) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Home className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-slate-800">Dashboard</span>
      </div>
    )
  }

  // Build breadcrumb segments
  const crumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const isLast = index === segments.length - 1

    let label = ROUTE_LABELS[segment]
    if (!label) {
      // If it looks like a UUID or ID, format neatly
      if (segment.length > 20) {
        label = 'Details'
      } else {
        label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
      }
    }

    return { label, href, isLast }
  })

  return (
    <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-500">
      <Link
        href="/admin"
        className="flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span>Admin</span>
      </Link>

      {crumbs.slice(1).map((crumb, idx) => (
        <React.Fragment key={crumb.href + idx}>
          <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
          {crumb.isLast ? (
            <span className="font-semibold text-slate-900 truncate max-w-[150px]">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="text-slate-500 hover:text-slate-900 transition-colors truncate max-w-[120px]"
            >
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Store,
  Users,
  X,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  exact?: boolean
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      {
        label: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    title: 'Catalog',
    items: [
      {
        label: 'Products',
        href: '/admin/products',
        icon: Package,
        exact: false,
      },
      {
        label: 'Categories',
        href: '/admin/categories',
        icon: FolderTree,
        exact: false,
      },
    ],
  },
  {
    title: 'Sales',
    items: [
      {
        label: 'Orders',
        href: '/admin/orders',
        icon: ShoppingBag,
        exact: false,
      },
    ],
  },
  {
    title: 'Operations',
    items: [
      {
        label: 'Storefront',
        href: '/admin/storefront',
        icon: Store,
        exact: false,
      },
      {
        label: 'Staff Settings',
        href: '/admin/staff',
        icon: Users,
        exact: false,
      },
    ],
  },
]

/**
 * Modernized Admin sidebar navigation.
 * Uses grouped sections, clean Lucide icons, clear active states,
 * and responsive mobile drawer behaviors.
 */
export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [lastPath, setLastPath] = useState(pathname)

  // Listen to mobile menu toggle broadcasts
  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev)
    window.addEventListener('toggle-sidebar', handleToggle)
    return () => window.removeEventListener('toggle-sidebar', handleToggle)
  }, [])

  // Auto-close sidebar drawer on route navigation
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setIsOpen(false)
  }

  return (
    <>
      {/* Backdrop overlay on mobile viewports */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar drawer container */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out md:static md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Brand header */}
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-white">
                  Bashtoli
                </span>
                <span className="rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider">
                  Admin
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Control Center</span>
            </div>
          </div>

          {/* Close button inside sidebar on mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {group.title}
              </p>
              <div className="space-y-0.5 pt-1">
                {group.items.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href)
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.href}
                      id={`admin-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      href={item.href}
                      className={[
                        'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-150',
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm font-bold'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white',
                      ].join(' ')}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon
                        className={[
                          'h-4 w-4 shrink-0 transition-colors',
                          isActive
                            ? 'text-white'
                            : 'text-slate-400 group-hover:text-slate-200',
                        ].join(' ')}
                      />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer info & live storefront link */}
        <div className="shrink-0 border-t border-slate-800 p-4 bg-slate-950/30">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800/70 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              View Live Store
            </span>
            <span className="text-[10px] text-slate-400">↗</span>
          </Link>
          <div className="mt-2 px-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Admin Console</span>
            <span className="font-mono text-[10px]">v1.2.0</span>
          </div>
        </div>
      </aside>
    </>
  )
}

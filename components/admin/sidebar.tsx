'use client'

import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Store,
  Users,
  X,
  ArrowUpRight,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  exact?: boolean
}

interface NavGroup {
  code: string
  title: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    code: '01',
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
    code: '02',
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
    code: '03',
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
    code: '04',
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

const DESKTOP_MQ = '(min-width: 768px)'

function subscribeDesktop(cb: () => void) {
  const mql = window.matchMedia(DESKTOP_MQ)
  mql.addEventListener('change', cb)
  return () => mql.removeEventListener('change', cb)
}

function getIsDesktop() {
  return window.matchMedia(DESKTOP_MQ).matches
}

function getIsDesktopServer() {
  return true
}

function SidebarNavContent({
  pathname,
  onCloseMobile,
  isMobileDrawer,
}: {
  pathname: string
  onCloseMobile?: () => void
  isMobileDrawer: boolean
}) {
  return (
    <div className="flex h-full flex-col bg-ink-950 text-paper-50 border-r border-ink-800">
      {/* Brand Masthead */}
      <div className="flex h-16 shrink-0 items-center justify-between px-5 border-b border-ink-800 bg-ink-900">
        <Link
          href="/admin"
          onClick={onCloseMobile}
          className="flex items-center gap-3 rounded-lg focus-visible:outline-paper-50"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ink-700 bg-ink-950 p-1.5">
            <Image
              src="/logo.svg"
              alt=""
              width={24}
              height={24}
              className="h-full w-full object-contain brightness-0 invert"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-extrabold tracking-tight text-paper-50">
                Bashtoli
              </span>
              <span className="rounded bg-paper-50 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-ink-950">
                Studio
              </span>
            </div>
            <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-paper-500">
              Admin Ledger
            </span>
          </div>
        </Link>

        {isMobileDrawer && onCloseMobile && (
          <button
            type="button"
            autoFocus
            onClick={onCloseMobile}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-ink-700 text-paper-300 hover:bg-ink-800 hover:text-paper-50 transition-colors cursor-pointer focus-visible:outline-paper-50"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <nav aria-label="Admin Sections" className="flex-1 space-y-6 overflow-y-auto px-3.5 py-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1.5">
            <p className="px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-paper-500">
              <span className="text-paper-400 mr-1.5">{group.code}</span>
              <span className="text-ink-600 mr-1.5">/</span>
              {group.title}
            </p>
            <div className="space-y-1">
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
                    onClick={onCloseMobile}
                    className={`group flex min-h-[44px] items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors duration-150 focus-visible:outline-paper-50 ${
                      isActive
                        ? 'bg-paper-50 text-ink-950 font-bold shadow-elevation-1'
                        : 'text-paper-300 font-medium hover:bg-ink-800 hover:text-paper-50'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="flex items-center gap-3">
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-ink-950'
                            : 'text-paper-400 group-hover:text-paper-50'
                        }`}
                      />
                      <span>{item.label}</span>
                    </span>
                    {isActive && (
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-ink-950 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Info & Storefront Link */}
      <div className="shrink-0 border-t border-ink-800 p-4 bg-ink-900/70 space-y-3">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[44px] items-center justify-between rounded-xl border border-ink-700 bg-ink-950 px-3.5 py-2 text-xs font-semibold text-paper-200 hover:border-paper-400 hover:text-paper-50 transition-colors focus-visible:outline-paper-50"
        >
          <span>View Live Store</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-paper-400" aria-hidden="true" />
        </Link>
        <div className="px-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-paper-500">
          <span>Monochrome Studio</span>
          <span>COD Ops</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Monochrome Dual-Tone Admin Sidebar & Mobile Drawer.
 * Renders a static `<aside>` on desktop (`>= 768px`) and a native `<dialog>`
 * modal drawer via `showModal()` on mobile (`< 768px`), ensuring zero duplicate
 * DOM navigation IDs and browser-native focus trapping.
 */
export function Sidebar() {
  const pathname = usePathname()
  const isDesktop = useSyncExternalStore(
    subscribeDesktop,
    getIsDesktop,
    getIsDesktopServer
  )
  const [isOpen, setIsOpen] = useState(false)
  const [lastPath, setLastPath] = useState(pathname)
  const drawerRef = useRef<HTMLDialogElement>(null)
  const pressedOutsideRef = useRef(false)

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev)
    window.addEventListener('toggle-sidebar', handleToggle)
    return () => window.removeEventListener('toggle-sidebar', handleToggle)
  }, [])

  // Auto-close mobile drawer on route navigation or desktop resize
  const [prevIsDesktop, setPrevIsDesktop] = useState(isDesktop)
  if (pathname !== lastPath || isDesktop !== prevIsDesktop) {
    setLastPath(pathname)
    setPrevIsDesktop(isDesktop)
    if (isOpen) setIsOpen(false)
  }

  // Sync mobile <dialog> state
  useEffect(() => {
    if (isDesktop) return
    const dialog = drawerRef.current
    if (!dialog) return

    if (isOpen) {
      dialog.setAttribute('closedby', 'any')
      if (typeof dialog.showModal === 'function') {
        if (!dialog.open) dialog.showModal()
      } else {
        dialog.setAttribute('open', '')
      }
    } else {
      if (typeof dialog.close === 'function') {
        if (dialog.open) dialog.close()
      } else {
        dialog.removeAttribute('open')
      }
    }
  }, [isOpen, isDesktop])

  if (isDesktop) {
    return (
      <aside className="hidden md:flex w-64 shrink-0 flex-col">
        <SidebarNavContent pathname={pathname} isMobileDrawer={false} />
      </aside>
    )
  }

  function isOutsideDrawer(e: React.PointerEvent<HTMLDialogElement>, dialog: HTMLDialogElement) {
    const r = dialog.getBoundingClientRect()
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom
  }

  return (
    <dialog
      ref={drawerRef}
      id="admin-mobile-drawer"
      aria-label="Admin navigation"
      className="admin-drawer-dialog md:hidden"
      onCancel={(e) => {
        e.preventDefault()
        setIsOpen(false)
      }}
      onClose={() => setIsOpen(false)}
      onPointerDown={(e) => {
        const dialog = drawerRef.current
        if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return
        pressedOutsideRef.current = isOutsideDrawer(e, dialog)
      }}
      onPointerUp={(e) => {
        const dialog = drawerRef.current
        if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return
        if (pressedOutsideRef.current && isOutsideDrawer(e, dialog)) {
          setIsOpen(false)
        }
        pressedOutsideRef.current = false
      }}
    >
      <SidebarNavContent
        pathname={pathname}
        isMobileDrawer={true}
        onCloseMobile={() => setIsOpen(false)}
      />
    </dialog>
  )
}

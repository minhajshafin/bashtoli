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
} from 'lucide-react'
import { LogoutButton } from './logout-button'

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
    title: 'Settings',
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
    <div className="flex h-full flex-col bg-adm-surface text-adm-fg border-r border-adm-border">
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center justify-between px-5 border-b border-adm-border">
        <Link
          href="/admin"
          onClick={onCloseMobile}
          className="flex items-center gap-3 rounded-lg"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-adm-accent p-1.5 shadow-subtle">
            <Image
              src="/logo.svg"
              alt=""
              width={20}
              height={20}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[15px] font-bold tracking-tight text-adm-fg">
              Bashtoli
            </span>
            <span className="text-xs font-medium text-adm-muted">
              Admin
            </span>
          </div>
        </Link>

        {isMobileDrawer && onCloseMobile && (
          <button
            type="button"
            autoFocus
            onClick={onCloseMobile}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-adm-border text-adm-muted hover:bg-adm-surface-2 hover:text-adm-fg transition-colors cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <nav aria-label="Admin Sections" className="flex-1 space-y-5 overflow-y-auto px-3.5 py-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            <p className="px-3 text-[11px] font-medium text-adm-muted">
              {group.title}
            </p>
            <div className="space-y-0.5">
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
                    className={`group flex min-h-[42px] items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors duration-150 ${
                      isActive
                        ? 'bg-adm-accent-tint text-adm-accent-text font-semibold'
                        : 'text-adm-fg-2 font-medium hover:bg-adm-surface-2 hover:text-adm-fg'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-adm-accent-text'
                          : 'text-adm-muted group-hover:text-adm-fg'
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Sign Out */}
      <div className="shrink-0 border-t border-adm-border p-3.5">
        <LogoutButton />
      </div>
    </div>
  )
}

/**
 * Adaptive Light/Dark Admin Sidebar & Mobile Drawer.
 * Renders a static `<aside>` on desktop (`>= 768px`) and a native `<dialog>`
 * modal drawer via `showModal()` on mobile (`< 768px`).
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

  const [prevIsDesktop, setPrevIsDesktop] = useState(isDesktop)
  if (pathname !== lastPath || isDesktop !== prevIsDesktop) {
    setLastPath(pathname)
    setPrevIsDesktop(isDesktop)
    if (isOpen) setIsOpen(false)
  }

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
      <aside className="hidden md:flex w-60 shrink-0 flex-col">
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
        isMobileDrawer
        onCloseMobile={() => setIsOpen(false)}
      />
    </dialog>
  )
}

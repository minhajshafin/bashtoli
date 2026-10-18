'use client'

import React, { useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/lib/actions/auth'
import {
  LayoutDashboard,
  Package,
  MapPin,
  Heart,
  User,
  LogOut,
} from 'lucide-react'

const NAV_ITEMS = [
  {
    label: 'Overview',
    shortLabel: 'Overview',
    href: '/account',
    icon: LayoutDashboard,
  },
  {
    label: 'Order History',
    shortLabel: 'Orders',
    href: '/account/orders',
    icon: Package,
  },
  {
    label: 'Saved Addresses',
    shortLabel: 'Addresses',
    href: '/account/addresses',
    icon: MapPin,
  },
  {
    label: 'Wishlist',
    shortLabel: 'Wishlist',
    href: '/account/wishlist',
    icon: Heart,
  },
  {
    label: 'Profile Settings',
    shortLabel: 'Profile',
    href: '/account/profile',
    icon: User,
  },
]

export function AccountNav() {
  const pathname = usePathname()
  const activeTabRef = useRef<HTMLAnchorElement>(null)
  const navContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll the active tab into center view on mobile navigation
  useEffect(() => {
    if (activeTabRef.current && navContainerRef.current) {
      const container = navContainerRef.current
      const tab = activeTabRef.current
      const scrollLeft = tab.offsetLeft - (container.offsetWidth / 2) + (tab.offsetWidth / 2)
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
    }
  }, [pathname])

  return (
    <div className="flex flex-col gap-4">
      {/* Mobile Horizontal Rail / Desktop Vertical List */}
      <div className="relative">
        <nav
          ref={navContainerRef}
          aria-label="Account Sections"
          className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none scroll-smooth px-1 -mx-1"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {NAV_ITEMS.map(({ label, shortLabel, href, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                ref={isActive ? activeTabRef : undefined}
                aria-current={isActive ? 'page' : undefined}
                className={`shrink-0 flex items-center justify-between rounded-xl px-4 py-2.5 text-xs sm:text-sm font-sans transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-forest-950 text-cream-50 font-semibold shadow-xs ring-1 ring-gold-500/30'
                    : 'bg-cream-100/70 lg:bg-transparent border border-forest-200/80 lg:border-transparent text-forest-700 hover:bg-cream-200/70 hover:text-forest-950'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive ? 'text-gold-400 stroke-[2.2]' : 'text-forest-500 stroke-[1.8]'
                    }`}
                  />
                  {/* Full label on desktop, short label on small screens */}
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{shortLabel}</span>
                </div>
                {isActive && (
                  <span className="hidden lg:inline-block w-1.5 h-1.5 rounded-full bg-gold-400 ml-2 shrink-0 shadow-2xs" />
                )}
              </Link>
            )
          })}

          {/* Mobile Sign Out Chip at the end of the rail */}
          <div className="lg:hidden shrink-0">
            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Sign Out"
                className="flex items-center gap-1.5 rounded-xl border border-terracotta-500/30 bg-terracotta-100/50 px-3.5 py-2.5 text-xs font-sans font-semibold text-terracotta-700 hover:bg-terracotta-100 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <LogOut className="h-3.5 w-3.5 text-terracotta-600" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </nav>
      </div>

      {/* Desktop Sign Out Option */}
      <div className="pt-3 border-t border-forest-200/80 hidden lg:block">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-terracotta-700 hover:text-terracotta-800 px-3.5 py-2.5 rounded-xl hover:bg-terracotta-100/70 transition-colors w-full text-left cursor-pointer active:scale-[0.99]"
          >
            <LogOut className="h-4 w-4 shrink-0 text-terracotta-600" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </div>
  )
}

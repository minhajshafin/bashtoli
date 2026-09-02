'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/lib/actions/auth'

const NAV_ITEMS = [
  { label: 'Overview', href: '/account' },
  { label: 'Order History', href: '/account/orders' },
  { label: 'Saved Addresses', href: '/account/addresses' },
  { label: 'Wishlist', href: '/account/wishlist' },
  { label: 'Profile Settings', href: '/account/profile' },
]

export function AccountNav() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none">
        {NAV_ITEMS.map(({ label, href }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`shrink-0 flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-forest-800 text-cream-100 shadow-sm font-semibold'
                  : 'text-forest-700 hover:bg-cream-200/80 hover:text-forest-900'
              }`}
            >
              <span>{label}</span>
              {isActive && (
                <span className="hidden lg:inline-block w-2 h-2 rounded-full bg-gold-400 ml-2 shrink-0" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="pt-4 border-t border-forest-200 hidden lg:block">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-2.5 text-sm font-medium text-rose-700 hover:text-rose-800 px-4 py-2.5 rounded-xl hover:bg-rose-50 transition-colors w-full text-left cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Sign Out
          </button>
        </form>
      </div>
    </div>
  )
}

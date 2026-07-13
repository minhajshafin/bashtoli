'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/lib/actions/auth'

interface MobileNavProps {
  isLoggedIn: boolean
  fullName: string | null
}

export function MobileNav({ isLoggedIn, fullName }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const [lastPath, setLastPath] = useState(pathname)

  // Close the mobile drawer menu when route pathname changes
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setIsOpen(false)
  }

  // Prevent background scrolling when menu drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <div className="md:hidden flex items-center">
      {/* Trigger Menu Button */}
      <button
        id="storefront-mobile-nav-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center p-2 rounded-xl text-zinc-550 hover:bg-zinc-100 hover:text-zinc-900 transition-colors focus:outline-none dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
      >
        <svg
          className="h-6 w-6 stroke-[2]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Slide-out Overlay Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer container content panel */}
          <div className="relative ml-auto flex h-full w-72 max-w-full flex-col bg-white p-6 shadow-xl dark:bg-zinc-950 animate-slide-in-right">
            {/* Header / Brand in Menu */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-900">
              <span className="text-lg font-black tracking-tight text-zinc-900 dark:text-white">
                Bashtoli
              </span>
              <button
                id="storefront-mobile-nav-close"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-900"
                aria-label="Close menu"
              >
                <svg className="h-5 w-5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Menu Links */}
            <nav className="flex-1 py-6 space-y-4 text-sm font-bold text-zinc-700 dark:text-zinc-300">
              <Link
                href="/products"
                className="block py-2 px-3 rounded-lg hover:bg-zinc-50 hover:text-amber-600 dark:hover:bg-zinc-900 dark:hover:text-amber-500 transition-colors"
              >
                Shop Catalog
              </Link>
              <Link
                href="/about"
                className="block py-2 px-3 rounded-lg hover:bg-zinc-50 hover:text-amber-600 dark:hover:bg-zinc-900 dark:hover:text-amber-500 transition-colors"
              >
                Our Story
              </Link>
              <Link
                href="/contact"
                className="block py-2 px-3 rounded-lg hover:bg-zinc-50 hover:text-amber-600 dark:hover:bg-zinc-900 dark:hover:text-amber-500 transition-colors"
              >
                Contact Us
              </Link>
              <Link
                href="/account/wishlist"
                className="block py-2 px-3 rounded-lg hover:bg-zinc-50 hover:text-amber-600 dark:hover:bg-zinc-900 dark:hover:text-amber-500 transition-colors"
              >
                Saved Wishlist
              </Link>
            </nav>

            {/* Footer / Account status */}
            <div className="border-t border-zinc-100 pt-6 dark:border-zinc-900 space-y-4">
              {isLoggedIn ? (
                <div className="space-y-3">
                  <div className="px-3">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Logged In As</p>
                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate mt-0.5">
                      {fullName || 'Customer'}
                    </p>
                  </div>
                  <Link
                    href="/account"
                    className="block text-center py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 transition-colors"
                  >
                    Manage Account
                  </Link>
                  <form action={logoutAction} className="w-full">
                    <button
                      type="submit"
                      className="w-full text-center py-2.5 rounded-xl bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-500 transition-colors"
                    >
                      Logout
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/login"
                    className="block text-center py-2.5 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                  >
                    Login / Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

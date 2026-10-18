'use client'

import React, { useRef, useEffect, useLayoutEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Store, Heart, ShoppingBag, User } from 'lucide-react'
import { gsap, isReducedMotion } from '@/lib/motion'
import { useCart } from '@/lib/cart/cart-context'
import { useWishlist } from '@/lib/wishlist/wishlist-context'

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export function MobileBottomDock() {
  const pathname = usePathname()
  const { itemCount, openDrawer, isDrawerOpen } = useCart()
  const wishlistContext = useWishlist()
  const wishlistCount = wishlistContext?.wishlistIds?.length ?? 0

  const dockRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLAnchorElement | HTMLButtonElement | null)[]>([])
  const isFirstRender = useRef(true)

  // Do not render bottom dock on checkout, bag, admin, or individual product detail pages
  const isHiddenRoute =
    pathname === '/checkout' ||
    pathname?.startsWith('/checkout/') ||
    pathname === '/bag' ||
    pathname?.startsWith('/admin') ||
    (pathname?.startsWith('/products/') && pathname !== '/products')

  const isBag = isDrawerOpen || pathname === '/bag'
  const isHome = pathname === '/' && !isBag
  const isShop = pathname.startsWith('/products') && !isBag
  const isWishlist = pathname === '/account/wishlist' && !isBag
  const isAccount = pathname.startsWith('/account') && !isWishlist && !isBag

  let activeIndex = -1
  if (isHome) activeIndex = 0
  else if (isShop) activeIndex = 1
  else if (isWishlist) activeIndex = 2
  else if (isBag) activeIndex = 3
  else if (isAccount) activeIndex = 4

  useIsomorphicLayoutEffect(() => {
    if (isHiddenRoute) return
    const targetEl = activeIndex >= 0 ? itemRefs.current[activeIndex] : null
    const indicator = indicatorRef.current
    if (!indicator) return

    if (!targetEl) {
      gsap.to(indicator, { opacity: 0, duration: 0.25, ease: 'power2.out' })
      return
    }

    const targetX = targetEl.offsetLeft
    const targetY = targetEl.offsetTop
    const targetW = targetEl.offsetWidth
    const targetH = targetEl.offsetHeight

    if (isFirstRender.current || isReducedMotion()) {
      isFirstRender.current = false
      gsap.set(indicator, {
        x: targetX,
        y: targetY,
        width: targetW,
        height: targetH,
        opacity: 1,
      })
      return
    }

    // Smooth spring physics slide to target button position
    gsap.to(indicator, {
      x: targetX,
      y: targetY,
      width: targetW,
      height: targetH,
      opacity: 1,
      duration: 0.45,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  }, [activeIndex, isHiddenRoute])

  // Reposition indicator immediately on window resize / orientation change
  useEffect(() => {
    if (isHiddenRoute) return
    function handleResize() {
      const targetEl = activeIndex >= 0 ? itemRefs.current[activeIndex] : null
      const indicator = indicatorRef.current
      if (!indicator || !targetEl) return
      gsap.set(indicator, {
        x: targetEl.offsetLeft,
        y: targetEl.offsetTop,
        width: targetEl.offsetWidth,
        height: targetEl.offsetHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [activeIndex, isHiddenRoute])

  // Do not render bottom dock on checkout, admin, or individual product detail pages
  // Evaluated after all hooks have run to strictly uphold React's Rules of Hooks
  if (isHiddenRoute) {
    return null
  }

  return (
    <nav
      aria-label="Mobile Navigation Dock"
      className="md:hidden fixed inset-x-0 z-40 flex justify-center pointer-events-none px-4"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}
    >
      <div
        ref={dockRef}
        className="relative pointer-events-auto flex items-center justify-between gap-1 px-3 py-1.5 rounded-full bg-forest-950/90 backdrop-blur-xl border border-gold-500/30 shadow-2xl shadow-forest-950/90 ring-1 ring-white/10 max-w-[310px] w-full"
      >
        {/* Sliding Active Indicator (GSAP Animated) */}
        <div
          ref={indicatorRef}
          aria-hidden="true"
          className="absolute top-0 left-0 w-10 h-10 rounded-full bg-gold-400/15 border border-gold-400/35 shadow-xs pointer-events-none z-0 flex items-center justify-center opacity-0"
        />

        {/* 1. Home */}
        <Link
          ref={(el) => {
            itemRefs.current[0] = el
          }}
          href="/"
          aria-label="Home"
          aria-current={isHome ? 'page' : undefined}
          className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-250 active:scale-90 cursor-pointer ${
            isHome
              ? 'text-gold-300'
              : 'text-cream-100/60 hover:text-cream-100'
          }`}
        >
          <Home className="h-5 w-5 stroke-[1.8]" />
        </Link>

        {/* 2. Shop / Catalog */}
        <Link
          ref={(el) => {
            itemRefs.current[1] = el
          }}
          href="/products"
          aria-label="Shop Catalog"
          aria-current={isShop ? 'page' : undefined}
          className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-250 active:scale-90 cursor-pointer ${
            isShop
              ? 'text-gold-300'
              : 'text-cream-100/60 hover:text-cream-100'
          }`}
        >
          <Store className="h-5 w-5 stroke-[1.8]" />
        </Link>

        {/* 3. Wishlist */}
        <Link
          ref={(el) => {
            itemRefs.current[2] = el
          }}
          href="/account/wishlist"
          aria-label={`Wishlist (${wishlistCount})`}
          aria-current={isWishlist ? 'page' : undefined}
          className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-250 active:scale-90 cursor-pointer ${
            isWishlist
              ? 'text-gold-300'
              : 'text-cream-100/60 hover:text-cream-100'
          }`}
        >
          <Heart className="h-5 w-5 stroke-[1.8]" />
          {wishlistCount > 0 && (
            <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-btn-accent-bg text-btn-accent-text border border-gold-400/40 text-[9px] font-bold font-price leading-none animate-fade-in z-20">
              {wishlistCount}
            </span>
          )}
        </Link>

        {/* 4. Bag Drawer Trigger */}
        <button
          ref={(el) => {
            itemRefs.current[3] = el
          }}
          type="button"
          onClick={openDrawer}
          aria-label={`Shopping Bag (${itemCount})`}
          aria-current={isBag ? 'page' : undefined}
          className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-250 active:scale-90 cursor-pointer ${
            isBag
              ? 'text-gold-300'
              : 'text-cream-100/60 hover:text-cream-100'
          }`}
        >
          <ShoppingBag className="h-5 w-5 stroke-[1.8]" />
          {itemCount > 0 && (
            <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-btn-accent-bg text-btn-accent-text border border-gold-400/40 text-[9px] font-bold font-price leading-none animate-fade-in z-20">
              {itemCount}
            </span>
          )}
        </button>

        {/* 5. Account */}
        <Link
          ref={(el) => {
            itemRefs.current[4] = el
          }}
          href="/account"
          aria-label="Account"
          aria-current={isAccount ? 'page' : undefined}
          className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-250 active:scale-90 cursor-pointer ${
            isAccount
              ? 'text-gold-300'
              : 'text-cream-100/60 hover:text-cream-100'
          }`}
        >
          <User className="h-5 w-5 stroke-[1.8]" />
        </Link>
      </div>
    </nav>
  )
}

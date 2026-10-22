import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MobileBottomDock } from '@/components/storefront/mobile-bottom-dock'
import { WishlistProvider } from '@/lib/wishlist/wishlist-context'
import { CartProvider } from '@/lib/cart/cart-context'

let mockCurrentPathname = '/'

vi.mock('next/navigation', () => ({
  usePathname: () => mockCurrentPathname,
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

vi.mock('@/lib/motion', () => ({
  gsap: {
    to: vi.fn(),
    set: vi.fn(),
  },
  isReducedMotion: () => false,
}))

vi.mock('@/lib/actions/cart', () => ({
  fetchDbCart: vi.fn().mockResolvedValue([]),
  mergeGuestCartAction: vi.fn().mockResolvedValue({ error: null }),
  addToDbCartAction: vi.fn().mockResolvedValue({ error: null }),
  updateDbCartQtyAction: vi.fn().mockResolvedValue({ error: null }),
  removeFromDbCartAction: vi.fn().mockResolvedValue({ error: null }),
  clearDbCartAction: vi.fn().mockResolvedValue({ error: null }),
}))

vi.mock('@/lib/actions/wishlist', () => ({
  fetchUserWishlistAction: vi.fn().mockResolvedValue([]),
  mergeGuestWishlistAction: vi.fn().mockResolvedValue({ error: null }),
  addToWishlistAction: vi.fn().mockResolvedValue({ error: null }),
  removeFromWishlistAction: vi.fn().mockResolvedValue({ error: null }),
}))

const mockToast = vi.fn()

vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({ toast: mockToast }),
}))

describe('MobileBottomDock Hydration & Route Hiding', () => {
  beforeEach(() => {
    mockCurrentPathname = '/'
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders navigation dock on public storefront page after mount', async () => {
    mockCurrentPathname = '/products'

    render(
      <WishlistProvider isLoggedIn={false}>
        <CartProvider isLoggedIn={false}>
          <MobileBottomDock />
        </CartProvider>
      </WishlistProvider>
    )

    await waitFor(() => {
      const dock = screen.getByRole('navigation', { name: 'Mobile Navigation Dock' })
      expect(dock).toBeDefined()
    })
  })

  it('omits MobileBottomDock on checkout route (/checkout) to prevent hydration mismatch', async () => {
    mockCurrentPathname = '/checkout'

    const { container } = render(
      <WishlistProvider isLoggedIn={false}>
        <CartProvider isLoggedIn={false}>
          <MobileBottomDock />
        </CartProvider>
      </WishlistProvider>
    )

    expect(screen.queryByRole('navigation', { name: 'Mobile Navigation Dock' })).toBeNull()
    expect(container.firstChild).toBeNull()
  })

  it('omits MobileBottomDock on admin route (/admin)', async () => {
    mockCurrentPathname = '/admin/orders'

    const { container } = render(
      <WishlistProvider isLoggedIn={false}>
        <CartProvider isLoggedIn={false}>
          <MobileBottomDock />
        </CartProvider>
      </WishlistProvider>
    )

    await waitFor(() => {
      expect(container.firstChild).toBeNull()
    })
  })

  it('omits MobileBottomDock on product detail pages (/products/some-slug)', async () => {
    mockCurrentPathname = '/products/artisan-notebook'

    const { container } = render(
      <WishlistProvider isLoggedIn={false}>
        <CartProvider isLoggedIn={false}>
          <MobileBottomDock />
        </CartProvider>
      </WishlistProvider>
    )

    await waitFor(() => {
      expect(container.firstChild).toBeNull()
    })
  })

  it('safely reflects counts only after context is loaded', async () => {
    mockCurrentPathname = '/'
    localStorage.setItem('bashtoli_guest_cart', JSON.stringify([
      { variant_id: 'v1', product_id: 'p1', name: 'Item 1', variant_name: 'V1', price: 100, image_url: null, qty: 3 }
    ]))
    localStorage.setItem('bashtoli_guest_wishlist', JSON.stringify(['p1', 'p2']))

    render(
      <WishlistProvider isLoggedIn={false}>
        <CartProvider isLoggedIn={false}>
          <MobileBottomDock />
        </CartProvider>
      </WishlistProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Shopping Bag (3)' })).toBeDefined()
      expect(screen.getByRole('link', { name: 'Wishlist (2)' })).toBeDefined()
    })
  })
})

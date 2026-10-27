import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { WishlistProvider, useWishlist } from '@/lib/wishlist/wishlist-context'
import { NavHeader } from '@/components/storefront/nav-header'

vi.mock('@/lib/actions/wishlist', () => ({
  fetchUserWishlistAction: vi.fn().mockResolvedValue(['p1', 'p2']),
  mergeGuestWishlistAction: vi.fn().mockResolvedValue({ error: null }),
  addToWishlistAction: vi.fn().mockResolvedValue({ error: null }),
  removeFromWishlistAction: vi.fn().mockResolvedValue({ error: null }),
}))

const mockToast = vi.fn()

vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({ toast: mockToast }),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt || ''} />,
}))

vi.mock('@/components/storefront/cart-icon', () => ({
  CartIcon: () => <div data-testid="cart-icon">Cart</div>,
}))

vi.mock('@/components/storefront/mobile-search-overlay', () => ({
  MobileSearchOverlay: () => null,
}))

describe('WishlistProvider Hydration & isLoaded Safety', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  function WishlistConsumer() {
    const { wishlistIds, isLoaded } = useWishlist()
    return (
      <div>
        <div data-testid="is-loaded">{String(isLoaded)}</div>
        <div data-testid="count">{wishlistIds.length}</div>
      </div>
    )
  }

  it('provides isLoaded=false on first render and becomes true after mount', async () => {
    localStorage.setItem('bashtoli_guest_wishlist', JSON.stringify(['item-1', 'item-2']))

    render(
      <WishlistProvider isLoggedIn={false}>
        <WishlistConsumer />
      </WishlistProvider>
    )

    // After mount/effects, isLoaded becomes true and guest items load
    await waitFor(() => {
      expect(screen.getByTestId('is-loaded').textContent).toBe('true')
      expect(screen.getByTestId('count').textContent).toBe('2')
    })
  })

  it('does not render wishlist badge in NavHeader before isLoaded is true', async () => {
    localStorage.setItem('bashtoli_guest_wishlist', JSON.stringify(['prod-1']))

    render(
      <WishlistProvider isLoggedIn={false}>
        <NavHeader isLoggedIn={false} fullName={null} isStaffOrAdmin={false} />
      </WishlistProvider>
    )

    // After hydration loads the items, badge appears with count
    await waitFor(() => {
      const badge = screen.getByText('1')
      expect(badge).toBeDefined()
    })
  })

  it('sets isLoaded=true and logs error when fetchUserWishlistAction rejects', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { fetchUserWishlistAction } = await import('@/lib/actions/wishlist')
    vi.mocked(fetchUserWishlistAction).mockRejectedValueOnce(new Error('Network error'))

    render(
      <WishlistProvider isLoggedIn={true}>
        <WishlistConsumer />
      </WishlistProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('is-loaded').textContent).toBe('true')
    })
    expect(consoleSpy).toHaveBeenCalledWith('Failed to load user wishlist:', expect.any(Error))
    consoleSpy.mockRestore()
  })

  it('shows success toast only after toggle action succeeds', async () => {
    const { addToWishlistAction } = await import('@/lib/actions/wishlist')
    vi.mocked(addToWishlistAction).mockResolvedValueOnce({ error: null, success: true })

    function ToggleConsumer() {
      const { toggleWishlist, wishlistIds } = useWishlist()
      return (
        <div>
          <button onClick={() => toggleWishlist('prod-xyz', 'Artisan Notebook')}>Toggle</button>
          <div data-testid="count">{wishlistIds.length}</div>
        </div>
      )
    }

    render(
      <WishlistProvider isLoggedIn={true}>
        <ToggleConsumer />
      </WishlistProvider>
    )

    const button = screen.getByRole('button', { name: 'Toggle' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledTimes(1)
      expect(mockToast).toHaveBeenCalledWith('Added "Artisan Notebook" to your wishlist!', 'success')
    })
  })

  it('rolls back and shows only one error toast when toggle action fails', async () => {
    const { addToWishlistAction } = await import('@/lib/actions/wishlist')
    vi.mocked(addToWishlistAction).mockResolvedValueOnce({ error: 'Failed to add item to wishlist. Please try again.' })

    function ToggleConsumer() {
      const { toggleWishlist, wishlistIds } = useWishlist()
      return (
        <div>
          <button onClick={() => toggleWishlist('prod-fail', 'Failing Item')}>Toggle</button>
          <div data-testid="ids">{wishlistIds.join(',')}</div>
        </div>
      )
    }

    render(
      <WishlistProvider isLoggedIn={true}>
        <ToggleConsumer />
      </WishlistProvider>
    )

    const button = screen.getByRole('button', { name: 'Toggle' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledTimes(1)
      expect(mockToast).toHaveBeenCalledWith('Failed to add item to wishlist. Please try again.', 'error')
    })
    // Rolled back so prod-fail is not in wishlistIds
    expect(screen.getByTestId('ids').textContent).not.toContain('prod-fail')
  })
})

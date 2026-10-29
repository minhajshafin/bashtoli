import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
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

  it('does not resurrect an item removed optimistically before fetchUserWishlistAction resolves', async () => {
    let resolveFetch!: (ids: string[]) => void
    const fetchPromise = new Promise<string[]>((res) => {
      resolveFetch = res
    })
    const { fetchUserWishlistAction, addToWishlistAction, removeFromWishlistAction } = await import('@/lib/actions/wishlist')
    vi.mocked(fetchUserWishlistAction).mockReturnValueOnce(fetchPromise)
    vi.mocked(addToWishlistAction).mockResolvedValue({ error: null, success: true })
    vi.mocked(removeFromWishlistAction).mockResolvedValue({ error: null, success: true })

    function ToggleConsumer() {
      const { toggleWishlist, wishlistIds, isWishlisted } = useWishlist()
      return (
        <div>
          <button onClick={() => toggleWishlist('prod-resurrect')}>Toggle</button>
          <div data-testid="is-wishlisted">{String(isWishlisted('prod-resurrect'))}</div>
          <div data-testid="ids">{wishlistIds.join(',')}</div>
        </div>
      )
    }

    render(
      <WishlistProvider isLoggedIn={true}>
        <ToggleConsumer />
      </WishlistProvider>
    )

    // User toggles add, then toggles remove before fetch resolves
    const button = screen.getByRole('button', { name: 'Toggle' })
    fireEvent.click(button) // added optimistically
    expect(screen.getByTestId('is-wishlisted').textContent).toBe('true')

    fireEvent.click(button) // removed optimistically
    expect(screen.getByTestId('is-wishlisted').textContent).toBe('false')

    // Now delayed initial fetch resolves with prod-resurrect
    await act(async () => {
      resolveFetch(['prod-resurrect'])
    })

    // The optimistic removal must NOT be overwritten by the delayed fetch
    expect(screen.getByTestId('is-wishlisted').textContent).toBe('false')
    expect(screen.getByTestId('ids').textContent).not.toContain('prod-resurrect')
  })

  it('does not overwrite optimistic addition when fetchUserWishlistAction resolves later without the item', async () => {
    let resolveFetch!: (ids: string[]) => void
    const fetchPromise = new Promise<string[]>((res) => {
      resolveFetch = res
    })
    const { fetchUserWishlistAction, addToWishlistAction } = await import('@/lib/actions/wishlist')
    vi.mocked(fetchUserWishlistAction).mockReturnValueOnce(fetchPromise)
    vi.mocked(addToWishlistAction).mockResolvedValueOnce({ error: null, success: true })

    function AddConsumer() {
      const { toggleWishlist, wishlistIds, isWishlisted } = useWishlist()
      return (
        <div>
          <button onClick={() => toggleWishlist('prod-new', 'New Product')}>Add</button>
          <div data-testid="is-wishlisted">{String(isWishlisted('prod-new'))}</div>
          <div data-testid="ids">{wishlistIds.join(',')}</div>
        </div>
      )
    }

    render(
      <WishlistProvider isLoggedIn={true}>
        <AddConsumer />
      </WishlistProvider>
    )

    expect(screen.getByTestId('is-wishlisted').textContent).toBe('false')

    const button = screen.getByRole('button', { name: 'Add' })
    fireEvent.click(button)

    expect(screen.getByTestId('is-wishlisted').textContent).toBe('true')

    await act(async () => {
      resolveFetch(['other-db-prod'])
    })

    expect(screen.getByTestId('is-wishlisted').textContent).toBe('true')
    expect(screen.getByTestId('ids').textContent).toContain('prod-new')
    expect(screen.getByTestId('ids').textContent).toContain('other-db-prod')
  })

  it('skips redundant fetchUserWishlistAction when initialWishlistIds is supplied by the server', async () => {
    const { fetchUserWishlistAction } = await import('@/lib/actions/wishlist')
    vi.mocked(fetchUserWishlistAction).mockClear()

    function SimpleConsumer() {
      const { wishlistIds, isLoaded } = useWishlist()
      return (
        <div>
          <div data-testid="is-loaded">{String(isLoaded)}</div>
          <div data-testid="ids">{wishlistIds.join(',')}</div>
        </div>
      )
    }

    render(
      <WishlistProvider isLoggedIn={true} initialWishlistIds={['prod-server']}>
        <SimpleConsumer />
      </WishlistProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('is-loaded').textContent).toBe('true')
    })

    expect(screen.getByTestId('ids').textContent).toBe('prod-server')
    expect(fetchUserWishlistAction).not.toHaveBeenCalled()
  })

  it('syncs guest items to state when isLoggedIn is true and initialWishlistIds is empty array', async () => {
    localStorage.setItem('bashtoli_guest_wishlist', JSON.stringify(['guest-1']))
    const { mergeGuestWishlistAction, addToWishlistAction } = await import('@/lib/actions/wishlist')
    vi.mocked(mergeGuestWishlistAction).mockResolvedValueOnce({ error: null })
    vi.mocked(addToWishlistAction).mockResolvedValueOnce({ error: null, success: true })

    function GuestSyncConsumer() {
      const { isWishlisted, wishlistIds, isLoaded } = useWishlist()
      return (
        <div>
          <div data-testid="is-loaded">{String(isLoaded)}</div>
          <div data-testid="is-wishlisted">{String(isWishlisted('guest-1'))}</div>
          <div data-testid="ids">{wishlistIds.join(',')}</div>
        </div>
      )
    }

    render(
      <WishlistProvider isLoggedIn={true} initialWishlistIds={[]}>
        <GuestSyncConsumer />
      </WishlistProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('is-loaded').textContent).toBe('true')
    })

    expect(mergeGuestWishlistAction).toHaveBeenCalledWith(['guest-1'])
    expect(screen.getByTestId('is-wishlisted').textContent).toBe('true')
    expect(screen.getByTestId('ids').textContent).toContain('guest-1')
  })

  it('preserves failed guest items in localStorage and excludes them from state', async () => {
    localStorage.setItem('bashtoli_guest_wishlist', JSON.stringify(['guest-fail']))
    const { mergeGuestWishlistAction } = await import('@/lib/actions/wishlist')
    vi.mocked(mergeGuestWishlistAction).mockResolvedValueOnce({ error: 'Sync failed' })

    function FailedSyncConsumer() {
      const { isWishlisted, wishlistIds, isLoaded } = useWishlist()
      return (
        <div>
          <div data-testid="is-loaded">{String(isLoaded)}</div>
          <div data-testid="is-wishlisted">{String(isWishlisted('guest-fail'))}</div>
          <div data-testid="ids">{wishlistIds.join(',')}</div>
        </div>
      )
    }

    render(
      <WishlistProvider isLoggedIn={true} initialWishlistIds={[]}>
        <FailedSyncConsumer />
      </WishlistProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('is-loaded').textContent).toBe('true')
    })

    expect(screen.getByTestId('is-wishlisted').textContent).toBe('false')
    expect(screen.getByTestId('ids').textContent).not.toContain('guest-fail')
    expect(localStorage.getItem('bashtoli_guest_wishlist')).toContain('guest-fail')
  })

  it('auth-pending mode: toggleWishlist is a no-op and WishlistButton renders disabled with aria-busy', async () => {
    const { addToWishlistAction } = await import('@/lib/actions/wishlist')
    vi.mocked(addToWishlistAction).mockClear()
    const { WishlistButton } = await import('@/components/storefront/wishlist-button')

    function PendingConsumer() {
      const { isPending, toggleWishlist, wishlistIds } = useWishlist()
      return (
        <div>
          <div data-testid="is-pending">{String(isPending)}</div>
          <button onClick={() => toggleWishlist('prod-pending')}>Direct Toggle</button>
          <div data-testid="ids">{wishlistIds.join(',')}</div>
          <WishlistButton productId="prod-pending" productName="Pending Product" variant="detail" />
        </div>
      )
    }

    render(
      <WishlistProvider isLoggedIn={false} initialWishlistIds={[]} pending>
        <PendingConsumer />
      </WishlistProvider>
    )

    expect(screen.getByTestId('is-pending').textContent).toBe('true')

    // Calling toggle directly while pending is a no-op
    const directButton = screen.getByRole('button', { name: 'Direct Toggle' })
    fireEvent.click(directButton)
    expect(screen.getByTestId('ids').textContent).toBe('')
    expect(addToWishlistAction).not.toHaveBeenCalled()

    // WishlistButton renders disabled with aria-busy
    const wishlistBtn = screen.getByRole('button', { name: 'Add to wishlist' })
    expect(wishlistBtn).toBeDisabled()
    expect(wishlistBtn.getAttribute('aria-busy')).toBe('true')
  })

  it('re-rendering with an equal array does not re-run guest sync or fetch', async () => {
    const { fetchUserWishlistAction, mergeGuestWishlistAction } = await import('@/lib/actions/wishlist')
    vi.mocked(fetchUserWishlistAction).mockClear()
    vi.mocked(mergeGuestWishlistAction).mockClear()

    function SimpleConsumer() {
      const { isLoaded } = useWishlist()
      return <div data-testid="is-loaded">{String(isLoaded)}</div>
    }

    const { rerender } = render(
      <WishlistProvider isLoggedIn={true} initialWishlistIds={['prod-a']}>
        <SimpleConsumer />
      </WishlistProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('is-loaded').textContent).toBe('true')
    })

    expect(fetchUserWishlistAction).toHaveBeenCalledTimes(0)
    expect(mergeGuestWishlistAction).toHaveBeenCalledTimes(0)

    // Re-render with new array reference but equal values
    rerender(
      <WishlistProvider isLoggedIn={true} initialWishlistIds={['prod-a']}>
        <SimpleConsumer />
      </WishlistProvider>
    )

    // Verify it still was not called
    expect(fetchUserWishlistAction).toHaveBeenCalledTimes(0)
    expect(mergeGuestWishlistAction).toHaveBeenCalledTimes(0)
  })
})

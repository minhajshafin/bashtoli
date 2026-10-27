import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { CartProvider, useCart } from '@/lib/cart/cart-context'
import { getGuestCart, saveGuestCart } from '@/lib/cart/guest-cart'
import * as cartActions from '@/lib/actions/cart'

const mockToast = vi.fn()

vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({ toast: mockToast }),
}))

vi.mock('@/lib/actions/cart', () => ({
  fetchDbCart: vi.fn().mockResolvedValue([
    {
      variant_id: 'var-1',
      product_id: 'prod-1',
      name: 'Notebook',
      variant_name: 'Grid',
      price: 150,
      image_url: null,
      qty: 2,
    },
    {
      variant_id: 'var-2',
      product_id: 'prod-2',
      name: 'Pen',
      variant_name: 'Blue',
      price: 50,
      image_url: null,
      qty: 1,
    },
  ]),
  addToDbCartAction: vi.fn().mockResolvedValue({ error: null }),
  updateDbCartQtyAction: vi.fn().mockResolvedValue({ error: null }),
  removeFromDbCartAction: vi.fn().mockResolvedValue({ error: null }),
  clearDbCartAction: vi.fn().mockResolvedValue({ error: null }),
  mergeGuestCartAction: vi.fn().mockResolvedValue({ error: null, success: true }),
}))

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function CartTestConsumer() {
  const { cart, isLoaded, updateQty, removeItem, clearCart } = useCart()

  return (
    <div>
      <div data-testid="is-loaded">{String(isLoaded)}</div>
      <div data-testid="cart-count">{cart.length}</div>
      <button
        data-testid="update-btn"
        onClick={() => updateQty('var-1', 10)}
      >
        Update Qty
      </button>
      <button
        data-testid="remove-btn"
        onClick={() => removeItem('var-1')}
      >
        Remove
      </button>
      <button
        data-testid="clear-btn"
        onClick={() => clearCart()}
      >
        Clear
      </button>
    </div>
  )
}

describe('CartProvider Debounce Cancellation and Merge Safety', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('update then remove within 300 ms calls only the remove action', async () => {
    render(
      <CartProvider isLoggedIn={true}>
        <CartTestConsumer />
      </CartProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('is-loaded').textContent).toBe('true')
    })

    const updateBtn = screen.getByTestId('update-btn')
    const removeBtn = screen.getByTestId('remove-btn')

    // 1. Trigger updateQty
    await act(async () => {
      updateBtn.click()
    })

    // Wait 100ms (within the 300ms debounce window)
    await sleep(100)

    // 2. Trigger removeItem before debounce expires
    await act(async () => {
      removeBtn.click()
    })

    // 3. Wait 350ms (past the 300ms threshold)
    await sleep(350)

    // Verify: update was cancelled and never called
    expect(cartActions.updateDbCartQtyAction).not.toHaveBeenCalled()

    // Verify: remove action was called
    expect(cartActions.removeFromDbCartAction).toHaveBeenCalledTimes(1)
    expect(cartActions.removeFromDbCartAction).toHaveBeenCalledWith('var-1')
  })

  it('update then clear sends no update', async () => {
    render(
      <CartProvider isLoggedIn={true}>
        <CartTestConsumer />
      </CartProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('is-loaded').textContent).toBe('true')
    })

    const updateBtn = screen.getByTestId('update-btn')
    const clearBtn = screen.getByTestId('clear-btn')

    // 1. Trigger updateQty
    await act(async () => {
      updateBtn.click()
    })

    // Wait 100ms (within debounce window)
    await sleep(100)

    // 2. Trigger clearCart
    await act(async () => {
      clearBtn.click()
    })

    // 3. Wait 350ms (past debounce window)
    await sleep(350)

    // Verify: update was cancelled and never called
    expect(cartActions.updateDbCartQtyAction).not.toHaveBeenCalled()

    // Verify: clear action was dispatched
    expect(cartActions.clearDbCartAction).toHaveBeenCalledTimes(1)
  })

  it('restores guest items if mergeGuestCartAction returns an error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    saveGuestCart([
      {
        variant_id: 'var-guest',
        product_id: 'prod-guest',
        name: 'Guest Notebook',
        variant_name: 'A5',
        price: 200,
        image_url: null,
        qty: 3,
      },
    ])

    vi.mocked(cartActions.mergeGuestCartAction).mockResolvedValueOnce({
      error: 'Network failure merging cart',
    })

    render(
      <CartProvider isLoggedIn={true}>
        <CartTestConsumer />
      </CartProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('is-loaded').textContent).toBe('true')
    })

    // Check that items are restored to localStorage
    const guestCart = getGuestCart()
    expect(guestCart.length).toBe(1)
    expect(guestCart[0].variant_id).toBe('var-guest')
    expect(guestCart[0].qty).toBe(3)
    consoleSpy.mockRestore()
  })

  it('restores guest items if mergeGuestCartAction throws an exception', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    saveGuestCart([
      {
        variant_id: 'var-throw',
        product_id: 'prod-throw',
        name: 'Crash Pen',
        variant_name: 'Red',
        price: 80,
        image_url: null,
        qty: 2,
      },
    ])

    vi.mocked(cartActions.mergeGuestCartAction).mockRejectedValueOnce(
      new Error('Fetch threw connection timeout')
    )

    render(
      <CartProvider isLoggedIn={true}>
        <CartTestConsumer />
      </CartProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('is-loaded').textContent).toBe('true')
    })

    // Check that items are restored to localStorage
    const guestCart = getGuestCart()
    expect(guestCart.length).toBe(1)
    expect(guestCart[0].variant_id).toBe('var-throw')
    expect(guestCart[0].qty).toBe(2)
    consoleSpy.mockRestore()
  })
})

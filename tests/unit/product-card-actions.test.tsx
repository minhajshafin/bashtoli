import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProductCard } from '@/components/storefront/product-card'
import { ToastProvider } from '@/components/ui/toast'
import { WishlistProvider } from '@/lib/wishlist/wishlist-context'
import { CartProvider } from '@/lib/cart/cart-context'
import type { ProductWithDetails } from '@/lib/queries/products'

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ fill, ...props }: any) => <img {...props} />,
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/',
}))

const mockProduct: ProductWithDetails = {
  id: 'prod-123',
  name: 'Artisan Bamboo Basket',
  slug: 'artisan-bamboo-basket',
  description: 'Handcrafted bamboo basket.',
  base_price: 1500,
  active: true,
  featured: false,
  category_id: 'cat-1',
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
  categories: {
    id: 'cat-1',
    name: 'Baskets',
    slug: 'baskets',
    sort_order: 1,
    image_url: null,
    is_featured: true,
    featured_order: 1,
    created_at: '2026-01-01',
  },
  product_variants: [
    {
      id: 'var-123',
      product_id: 'prod-123',
      sku: 'BASKET-MED',
      price: 1500,
      stock_qty: 10,
      active: true,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
      option_values: { Size: 'Medium' },
    },
  ],
  product_images: [
    {
      id: 'img-1',
      product_id: 'prod-123',
      url: '/images/basket.jpg',
      alt_text: 'Basket photo',
      sort_order: 1,
    },
  ],
}

describe('ProductCard Quick Actions', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('adds product to wishlist without leaving page and shows toast', async () => {
    render(
      <ToastProvider>
        <WishlistProvider isLoggedIn={false}>
          <CartProvider isLoggedIn={false}>
            <ProductCard product={mockProduct} />
          </CartProvider>
        </WishlistProvider>
      </ToastProvider>
    )

    // Click the wishlist button
    const wishlistBtn = screen.getByRole('button', { name: /add to wishlist/i })
    fireEvent.click(wishlistBtn)

    // Verify toast appears
    await waitFor(() => {
      expect(
        screen.getByText('Added "Artisan Bamboo Basket" to your wishlist!')
      ).toBeInTheDocument()
    })

    // Verify guest wishlist updated in localStorage
    const saved = JSON.parse(localStorage.getItem('bashtoli_guest_wishlist') || '[]')
    expect(saved).toContain('prod-123')
  })

  it('adds product to bag on desktop button click without leaving page and shows toast', async () => {
    render(
      <ToastProvider>
        <WishlistProvider isLoggedIn={false}>
          <CartProvider isLoggedIn={false}>
            <ProductCard product={mockProduct} />
          </CartProvider>
        </WishlistProvider>
      </ToastProvider>
    )

    // Click desktop "+ Add to Bag" button
    const addToBagBtn = screen.getByRole('button', { name: /\+ Add to Bag/i })
    fireEvent.click(addToBagBtn)

    // Verify toast appears
    await waitFor(() => {
      expect(
        screen.getByText('Added "Artisan Bamboo Basket" to your bag!')
      ).toBeInTheDocument()
    })

    // Verify guest cart updated in localStorage
    const savedCart = JSON.parse(localStorage.getItem('bashtoli_guest_cart') || '[]')
    expect(savedCart).toHaveLength(1)
    expect(savedCart[0].product_id).toBe('prod-123')
    expect(savedCart[0].variant_id).toBe('var-123')
    expect(savedCart[0].qty).toBe(1)
  })

  it('adds product to bag on mobile button click without leaving page and shows toast', async () => {
    render(
      <ToastProvider>
        <WishlistProvider isLoggedIn={false}>
          <CartProvider isLoggedIn={false}>
            <ProductCard product={mockProduct} />
          </CartProvider>
        </WishlistProvider>
      </ToastProvider>
    )

    // Click mobile quick add button
    const mobileAddBtn = screen.getByRole('button', {
      name: 'Add Artisan Bamboo Basket to bag',
    })
    fireEvent.click(mobileAddBtn)

    // Verify toast appears
    await waitFor(() => {
      expect(
        screen.getByText('Added "Artisan Bamboo Basket" to your bag!')
      ).toBeInTheDocument()
    })
  })
})

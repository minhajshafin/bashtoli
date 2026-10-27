import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockRpc = vi.fn()
const mockFrom = vi.fn()
const mockHeaders = vi.fn()
const mockRevalidatePath = vi.fn()
const mockRevalidateTag = vi.fn()
const mockSendOrderEmails = vi.fn()
const mockCheckRateLimit = vi.fn()

vi.mock('next/headers', () => ({
  headers: () => mockHeaders(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
  revalidateTag: (...args: unknown[]) => mockRevalidateTag(...args),
}))

vi.mock('@/lib/supabase/rate-limit', () => ({
  checkCheckoutRateLimit: () => mockCheckRateLimit(),
}))

vi.mock('@/lib/email/resend', () => ({
  sendOrderEmails: (...args: unknown[]) => mockSendOrderEmails(...args),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    })
  ),
  createAdminClient: vi.fn(() => ({
    rpc: mockRpc,
    from: mockFrom,
  })),
}))

import { submitCheckout } from '@/lib/actions/checkout'
import type { CartItem } from '@/lib/cart/guest-cart'

const VALID_FORM = {
  customer_name: 'Habib Rahman',
  phone: '01712345678',
  guest_email: 'habib@example.com',
  address: 'House 12, Road 4, Dhanmondi, Dhaka',
  fulfillment_type: 'delivery' as const,
  delivery_zone: 'inside_dhaka' as const,
  notes: 'Ring the doorbell',
}

const SAMPLE_CART: CartItem[] = [
  {
    variant_id: 'd1111111-1111-1111-1111-111111111111',
    product_id: 'f1111111-1111-1111-1111-111111111111',
    name: 'Bamboo Pen',
    variant_name: 'Standard',
    price: 150,
    image_url: 'https://example.com/pen.jpg',
    qty: 2,
  },
]

describe('submitCheckout server action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockHeaders.mockResolvedValue(new Headers())
    mockCheckRateLimit.mockResolvedValue({ limited: false })
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    mockSendOrderEmails.mockResolvedValue(undefined)
  })

  it('rejects checkout when cart is empty', async () => {
    const res = await submitCheckout(VALID_FORM, [])
    expect(res.error).toContain('cart is empty')
  })

  it('rejects checkout with invalid form fields', async () => {
    const res = await submitCheckout(
      {
        ...VALID_FORM,
        phone: '123',
      },
      SAMPLE_CART
    )
    expect(res.error).toBe('Please fix the errors below.')
    expect(res.fieldErrors?.phone).toBeDefined()
  })

  it('rejects checkout when stock is insufficient during pre-flight check', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'd1111111-1111-1111-1111-111111111111',
              price: 150,
              active: true,
              stock_qty: 1,
              product_id: 'f1111111-1111-1111-1111-111111111111',
              products: {
                id: 'f1111111-1111-1111-1111-111111111111',
                name: 'Bamboo Pen',
                slug: 'bamboo-pen',
                active: true,
              },
            },
          ],
          error: null,
        }),
      }),
    })

    const res = await submitCheckout(VALID_FORM, SAMPLE_CART)
    expect(res.error).toContain('Insufficient stock')
    expect(mockRpc).not.toHaveBeenCalled()
  })

  it('successfully places order, invokes place_order RPC, and invalidates product/catalog caches', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'd1111111-1111-1111-1111-111111111111',
              price: 150,
              active: true,
              stock_qty: 10,
              product_id: 'f1111111-1111-1111-1111-111111111111',
              products: {
                id: 'f1111111-1111-1111-1111-111111111111',
                name: 'Bamboo Pen',
                slug: 'bamboo-pen',
                active: true,
              },
            },
          ],
          error: null,
        }),
      }),
    })

    mockRpc.mockResolvedValue({
      data: {
        order_number: 'ORD-20260912-0099',
        subtotal: 300,
        delivery_fee: 70,
        total: 370,
      },
      error: null,
    })

    const res = await submitCheckout(VALID_FORM, SAMPLE_CART)

    expect(res.error).toBeNull()
    expect(res.orderNumber).toBe('ORD-20260912-0099')

    expect(mockRpc).toHaveBeenCalledWith(
      'place_order',
      expect.objectContaining({
        p_customer_name: 'Habib Rahman',
        p_items: [
          {
            variant_id: 'd1111111-1111-1111-1111-111111111111',
            product_id: 'f1111111-1111-1111-1111-111111111111',
            qty: 2,
            product_name: 'Bamboo Pen (Standard)',
          },
        ],
      })
    )

    expect(mockRevalidateTag).toHaveBeenCalledWith('products', 'max')
    expect(mockRevalidateTag).toHaveBeenCalledWith('featured-products', 'max')
    expect(mockRevalidateTag).toHaveBeenCalledWith('categories', 'max')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/products')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/admin')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/products')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/orders')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/products/f1111111-1111-1111-1111-111111111111')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/products/bamboo-pen')
  })

  it('invoking checkout twice with the same idempotency key returns the same order without creating a duplicate or throwing', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'd1111111-1111-1111-1111-111111111111',
              price: 150,
              active: true,
              stock_qty: 10,
              product_id: 'f1111111-1111-1111-1111-111111111111',
              products: {
                id: 'f1111111-1111-1111-1111-111111111111',
                name: 'Bamboo Pen',
                slug: 'bamboo-pen',
                active: true,
              },
            },
          ],
          error: null,
        }),
      }),
    })

    const testIdempotencyKey = 'a0000000-0000-4000-8000-000000000001'
    const existingOrderResult = {
      order_number: 'ORD-20260912-0099',
      access_token: 'test_access_token_abc123',
      subtotal: 300,
      delivery_fee: 70,
      total: 370,
    }

    mockRpc.mockResolvedValue({
      data: existingOrderResult,
      error: null,
    })

    const formWithKey = {
      ...VALID_FORM,
      idempotency_key: testIdempotencyKey,
    }

    // First attempt
    const firstAttempt = await submitCheckout(formWithKey, SAMPLE_CART)
    expect(firstAttempt.error).toBeNull()
    expect(firstAttempt.orderNumber).toBe('ORD-20260912-0099')
    expect(firstAttempt.accessToken).toBe('test_access_token_abc123')

    // Second attempt with exact same idempotency key
    const secondAttempt = await submitCheckout(formWithKey, SAMPLE_CART)
    expect(secondAttempt.error).toBeNull()
    expect(secondAttempt.orderNumber).toBe(firstAttempt.orderNumber)
    expect(secondAttempt.accessToken).toBe(firstAttempt.accessToken)

    // Verify both calls forwarded the idempotency key to place_order RPC
    expect(mockRpc).toHaveBeenCalledTimes(2)
    expect(mockRpc).toHaveBeenNthCalledWith(
      1,
      'place_order',
      expect.objectContaining({
        p_idempotency_key: testIdempotencyKey,
      })
    )
    expect(mockRpc).toHaveBeenNthCalledWith(
      2,
      'place_order',
      expect.objectContaining({
        p_idempotency_key: testIdempotencyKey,
      })
    )
  })

  it('sanitizes raw DB errors and never leaks DB strings to the customer', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'd1111111-1111-1111-1111-111111111111',
              price: 150,
              active: true,
              stock_qty: 10,
              product_id: 'f1111111-1111-1111-1111-111111111111',
              products: {
                id: 'f1111111-1111-1111-1111-111111111111',
                name: 'Bamboo Pen',
                slug: 'bamboo-pen',
                active: true,
              },
            },
          ],
          error: null,
        }),
      }),
    })

    const rawDbError = 'duplicate key value violates unique constraint "orders_order_number_key" DETAIL: Key (order_number)=(ORD-123) already exists.'
    mockRpc.mockResolvedValueOnce({
      data: null,
      error: { message: rawDbError },
    })

    const res = await submitCheckout(VALID_FORM, SAMPLE_CART)
    expect(res.error).toBe("We couldn't place your order. Please try again.")
    expect(res.error).not.toContain(rawDbError)
    expect(res.error).not.toContain('unique constraint')
    expect(res.error).not.toContain('orders_order_number_key')
  })

  it('maps known place_order exceptions by prefix to user-friendly messages', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'd1111111-1111-1111-1111-111111111111',
              price: 150,
              active: true,
              stock_qty: 10,
              product_id: 'f1111111-1111-1111-1111-111111111111',
              products: {
                id: 'f1111111-1111-1111-1111-111111111111',
                name: 'Bamboo Pen',
                slug: 'bamboo-pen',
                active: true,
              },
            },
          ],
          error: null,
        }),
      }),
    })

    const prefixCases = [
      { prefix: 'INSUFFICIENT_STOCK: d111 has 0 left', expected: 'One or more items in your cart do not have enough stock.' },
      { prefix: 'ITEM_INACTIVE: f111 is inactive', expected: 'One or more items in your cart are no longer available.' },
      { prefix: 'ITEM_NOT_FOUND: x999 missing', expected: 'One or more items in your cart could not be found.' },
      { prefix: 'INVALID_ZONE: invalid zone null', expected: 'Please select a valid delivery zone.' },
      { prefix: 'INVALID_QTY: item qty is 0', expected: 'Please enter a valid item quantity.' },
      { prefix: 'INVALID_ITEMS: empty array', expected: 'Your cart is empty or contains invalid items.' },
    ]

    for (const { prefix, expected } of prefixCases) {
      mockRpc.mockResolvedValueOnce({
        data: null,
        error: { message: prefix },
      })
      const res = await submitCheckout(VALID_FORM, SAMPLE_CART)
      expect(res.error).toContain(expected)
      expect(res.error).not.toContain(prefix)
    }
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockRpc = vi.fn()
const mockRevalidatePath = vi.fn()
const mockRevalidateTag = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        getUser: mockGetUser,
      },
      rpc: mockRpc,
    })
  ),
}))

vi.mock('next/cache', () => ({
  revalidatePath: (path: string) => mockRevalidatePath(path),
  revalidateTag: (...args: unknown[]) => mockRevalidateTag(...args),
}))

import { customerCancelOrderAction } from '@/lib/actions/customer-cancel-order'

describe('customerCancelOrderAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects cancellation if user is unauthenticated', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    })

    const res = await customerCancelOrderAction('test-order-id')
    expect(res).toEqual({ error: 'You must be logged in to cancel orders.' })
    expect(mockRpc).not.toHaveBeenCalled()
  })

  it('delegates to atomic cancel_order RPC and returns success', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'cust-user-1' } },
      error: null,
    })
    mockRpc.mockResolvedValueOnce({ error: null })

    const res = await customerCancelOrderAction('test-order-id')
    expect(res).toEqual({ error: null, success: true })
    expect(mockRpc).toHaveBeenCalledWith('cancel_order', {
      p_order_id: 'test-order-id',
    })
    expect(mockRevalidateTag).toHaveBeenCalledWith('products', 'max')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/account/orders')
  })

  it('maps whitelisted cancel_order error messages to user-friendly messages', async () => {
    const cases = [
      {
        raw: 'Order not found',
        expected: 'Order not found. Please verify the order details.',
      },
      {
        raw: 'Unauthorized: Not the order owner',
        expected: 'You are not authorized to cancel this order.',
      },
      {
        raw: 'Only pending orders can be cancelled',
        expected: 'Only pending orders can be cancelled.',
      },
      {
        raw: 'Orders can only be cancelled within 24 hours of placement.',
        expected: 'Orders can only be cancelled within 24 hours of placement.',
      },
    ]

    for (const { raw, expected } of cases) {
      mockGetUser.mockResolvedValueOnce({
        data: { user: { id: 'cust-user-1' } },
        error: null,
      })
      mockRpc.mockResolvedValueOnce({
        error: { message: raw },
      })

      const res = await customerCancelOrderAction('test-order-id')
      expect(res).toEqual({ error: expected })
    }
  })

  it('sanitizes raw DB errors and never leaks DB strings to the customer', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'cust-user-1' } },
      error: null,
    })
    const rawDbError = 'new row for relation "orders" violates check constraint "orders_status_check"'
    mockRpc.mockResolvedValueOnce({
      error: { message: rawDbError },
    })

    const res = await customerCancelOrderAction('test-order-id')
    expect(res).toEqual({ error: 'Failed to cancel the order. Please try again.' })
    expect(res.error).not.toContain(rawDbError)
    expect(res.error).not.toContain('check constraint')
    expect(res.error).not.toContain('orders_status_check')
  })

  it('handles unexpected exceptions safely', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'cust-user-1' } },
      error: null,
    })
    mockRpc.mockRejectedValueOnce(new Error('Network drop'))

    const res = await customerCancelOrderAction('test-order-id')
    expect(res).toEqual({ error: 'Failed to cancel the order. Please try again.' })
  })
})

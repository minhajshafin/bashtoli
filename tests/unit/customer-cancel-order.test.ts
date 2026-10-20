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

  it('returns RPC error message if order cancellation fails', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'cust-user-1' } },
      error: null,
    })
    mockRpc.mockResolvedValueOnce({
      error: { message: 'Only pending orders can be cancelled' },
    })

    const res = await customerCancelOrderAction('test-order-id')
    expect(res).toEqual({ error: 'Only pending orders can be cancelled' })
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

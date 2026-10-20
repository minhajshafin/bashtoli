import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockRpc = vi.fn()
const mockRevalidatePath = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        getUser: mockGetUser,
      },
      rpc: mockRpc,
    })
  ),
  createAdminClient: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: (path: string) => mockRevalidatePath(path),
}))

import {
  findUnclaimedGuestOrders,
  claimGuestOrdersAction,
} from '@/lib/actions/claim-guest-orders'

describe('claim-guest-orders actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('findUnclaimedGuestOrders', () => {
    it('returns empty array when user is unauthenticated', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      })

      const res = await findUnclaimedGuestOrders()
      expect(res).toEqual({ orders: [], error: 'Not authenticated' })
      expect(mockRpc).not.toHaveBeenCalled()
    })

    it('successfully queries unclaimed orders via find_unclaimed_guest_orders RPC', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { user: { id: 'cust-1', email: 'test@example.com' } },
        error: null,
      })
      mockRpc.mockResolvedValueOnce({
        data: [
          {
            id: 'order-1',
            order_number: 'ORD-20261020-0001',
            created_at: '2026-10-20T00:00:00Z',
            total: '550.00',
          },
        ],
        error: null,
      })

      const res = await findUnclaimedGuestOrders()
      expect(res.error).toBeNull()
      expect(res.orders).toEqual([
        {
          id: 'order-1',
          order_number: 'ORD-20261020-0001',
          created_at: '2026-10-20T00:00:00Z',
          total: 550,
        },
      ])
      expect(mockRpc).toHaveBeenCalledWith('find_unclaimed_guest_orders')
    })
  })

  describe('claimGuestOrdersAction', () => {
    it('returns error when user is unauthenticated', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      })

      const res = await claimGuestOrdersAction(['order-1'])
      expect(res).toEqual({ error: 'Not authenticated' })
      expect(mockRpc).not.toHaveBeenCalled()
    })

    it('returns error when no order IDs are supplied', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { user: { id: 'cust-1' } },
        error: null,
      })

      const res = await claimGuestOrdersAction([])
      expect(res).toEqual({ error: 'No orders selected.' })
      expect(mockRpc).not.toHaveBeenCalled()
    })

    it('successfully claims guest orders via claim_guest_orders RPC', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { user: { id: 'cust-1' } },
        error: null,
      })
      mockRpc.mockResolvedValueOnce({
        data: 2,
        error: null,
      })

      const res = await claimGuestOrdersAction(['order-1', 'order-2'])
      expect(res).toEqual({ error: null, success: true, claimed: 2 })
      expect(mockRpc).toHaveBeenCalledWith('claim_guest_orders', {
        p_order_ids: ['order-1', 'order-2'],
      })
      expect(mockRevalidatePath).toHaveBeenCalledWith('/account/orders')
    })
  })
})

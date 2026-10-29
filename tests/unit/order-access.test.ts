import { describe, it, expect } from 'vitest'
import {
  resolveOrderAccess,
  isOrderCancelable,
  type RedactedOrderDTO,
} from '@/lib/order/access'

describe('lib/order/access.ts - resolveOrderAccess', () => {
  const mockOrder = {
    user_id: 'user-owner-123',
    access_token: 'valid-secret-token-32-chars-long',
  }

  it('resolves "full" for authenticated owner', () => {
    const result = resolveOrderAccess({
      order: mockOrder,
      user: { id: 'user-owner-123' },
      role: 'customer',
      token: null,
      cookieVerified: false,
    })
    expect(result).toBe('full')
  })

  it('resolves "full" for staff user even without matching user_id or token', () => {
    const result = resolveOrderAccess({
      order: mockOrder,
      user: { id: 'user-staff-999' },
      role: 'staff',
      token: null,
      cookieVerified: false,
    })
    expect(result).toBe('full')
  })

  it('resolves "full" for admin user even without matching user_id or token', () => {
    const result = resolveOrderAccess({
      order: mockOrder,
      user: { id: 'user-admin-001' },
      role: 'admin',
      token: null,
      cookieVerified: false,
    })
    expect(result).toBe('full')
  })

  it('resolves "full" for caller with valid matching access token', () => {
    const result = resolveOrderAccess({
      order: mockOrder,
      user: null,
      role: null,
      token: 'valid-secret-token-32-chars-long',
      cookieVerified: false,
    })
    expect(result).toBe('full')
  })

  it('resolves "gate" for caller with wrong access token', () => {
    const result = resolveOrderAccess({
      order: mockOrder,
      user: null,
      role: null,
      token: 'wrong-token-invalid',
      cookieVerified: false,
    })
    expect(result).toBe('gate')
  })

  it('resolves "partial" for verified phone cookie', () => {
    const result = resolveOrderAccess({
      order: mockOrder,
      user: null,
      role: null,
      token: null,
      cookieVerified: true,
    })
    expect(result).toBe('partial')
  })

  it('resolves "gate" for caller with no credentials (unauthenticated, no token, unverified cookie)', () => {
    const result = resolveOrderAccess({
      order: mockOrder,
      user: null,
      role: null,
      token: null,
      cookieVerified: false,
    })
    expect(result).toBe('gate')
  })

  it('resolves "gate" for logged-in non-owner without matching token or verified cookie', () => {
    const result = resolveOrderAccess({
      order: mockOrder,
      user: { id: 'user-other-person' },
      role: 'customer',
      token: null,
      cookieVerified: false,
    })
    expect(result).toBe('gate')
  })

  it('resolves "not_found" when order is null or undefined', () => {
    expect(
      resolveOrderAccess({
        order: null,
        user: { id: 'user-owner-123' },
        role: 'admin',
      })
    ).toBe('not_found')

    expect(
      resolveOrderAccess({
        order: undefined,
        user: null,
      })
    ).toBe('not_found')
  })

  describe('isOrderCancelable', () => {
    it('returns true for pending order created less than 24 hours ago', () => {
      const recent = new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      expect(isOrderCancelable(recent, 'pending')).toBe(true)
    })

    it('returns false for pending order created more than 24 hours ago', () => {
      const old = new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString()
      expect(isOrderCancelable(old, 'pending')).toBe(false)
    })

    it('returns false for non-pending orders even if recent', () => {
      const recent = new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      expect(isOrderCancelable(recent, 'confirmed')).toBe(false)
      expect(isOrderCancelable(recent, 'delivered')).toBe(false)
      expect(isOrderCancelable(recent, 'cancelled')).toBe(false)
    })
  })

  describe('RedactedOrderDTO Type Safety', () => {
    it('asserts that RedactedOrderDTO type strictly excludes sensitive/private columns', () => {
      // Forbidden fields that must never exist on RedactedOrderDTO
      type ForbiddenFields =
        | 'customer_name'
        | 'phone'
        | 'email'
        | 'guest_email'
        | 'address'
        | 'notes'
        | 'access_token'
        | 'user_id'
        | 'subtotal'
        | 'delivery_fee'
        | 'total'
        | 'idempotency_key'

      // Type-level assertion: check intersection between RedactedOrderDTO keys and ForbiddenFields is empty
      type LeakedKeys = Extract<keyof RedactedOrderDTO, ForbiddenFields>
      type AssertNoLeak = [LeakedKeys] extends [never] ? true : false
      const assertType: AssertNoLeak = true
      expect(assertType).toBe(true)

      // Runtime object assertion
      const sampleDto: RedactedOrderDTO = {
        order_number: 'BSH-2026-0001',
        status: 'pending',
        created_at: new Date().toISOString(),
        items: [{ id: 'item-1', product_name: 'Bamboo Pen', qty: 2 }],
      }

      const keys = Object.keys(sampleDto)
      const forbiddenList: ForbiddenFields[] = [
        'customer_name',
        'phone',
        'email',
        'guest_email',
        'address',
        'notes',
        'access_token',
        'user_id',
        'subtotal',
        'delivery_fee',
        'total',
        'idempotency_key',
      ]

      for (const field of forbiddenList) {
        expect(keys).not.toContain(field)
      }
    })
  })
})

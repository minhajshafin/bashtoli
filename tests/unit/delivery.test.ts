/**
 * @file tests/unit/delivery.test.ts
 *
 * Unit tests for lib/config/delivery.ts
 *
 * These tests run in isolation — no Supabase connection required.
 * Pattern: group by function, cover happy path + edge cases.
 */
import { describe, it, expect } from 'vitest'
import { DELIVERY_FEES, getDeliveryFee } from '@/lib/config/delivery'

// ── DELIVERY_FEES constant ────────────────────────────────────
describe('DELIVERY_FEES', () => {
  it('charges ৳70 for inside_dhaka deliveries', () => {
    expect(DELIVERY_FEES.inside_dhaka).toBe(70)
  })

  it('charges ৳120 for outside_dhaka deliveries', () => {
    expect(DELIVERY_FEES.outside_dhaka).toBe(120)
  })
})

// ── getDeliveryFee() ──────────────────────────────────────────
describe('getDeliveryFee()', () => {
  it('returns 0 for pickup regardless of zone', () => {
    expect(getDeliveryFee('pickup')).toBe(0)
  })

  it('returns 0 for pickup even when a zone is passed', () => {
    expect(getDeliveryFee('pickup', 'inside_dhaka')).toBe(0)
  })

  it('returns 70 for delivery inside Dhaka', () => {
    expect(getDeliveryFee('delivery', 'inside_dhaka')).toBe(70)
  })

  it('returns 120 for delivery outside Dhaka', () => {
    expect(getDeliveryFee('delivery', 'outside_dhaka')).toBe(120)
  })

  it('throws when fulfillment is delivery but no zone provided', () => {
    expect(() => getDeliveryFee('delivery')).toThrow(
      'delivery_zone is required for fulfillment_type = delivery',
    )
  })

  it('throws when fulfillment is delivery and zone is null', () => {
    expect(() => getDeliveryFee('delivery', null)).toThrow(
      'delivery_zone is required for fulfillment_type = delivery',
    )
  })
})

// ── Migration Synchronization (Drift Prevention) ─────────────
describe('Delivery Fee Synchronization with Database Migration', () => {
  it('strictly matches the fee constants defined in 004_functions_and_triggers.sql', async () => {
    const fs = await import('node:fs')
    const path = await import('node:path')

    const migrationPath = path.resolve(process.cwd(), 'supabase/migrations/004_functions_and_triggers.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    const insideMatch = sql.match(/p_delivery_zone\s*=\s*'inside_dhaka'\s*THEN\s*v_delivery_fee\s*:=\s*(\d+);/)
    const outsideMatch = sql.match(/p_delivery_zone\s*=\s*'outside_dhaka'\s*THEN\s*v_delivery_fee\s*:=\s*(\d+);/)

    expect(insideMatch).not.toBeNull()
    expect(outsideMatch).not.toBeNull()

    const dbInsideDhaka = Number(insideMatch![1])
    const dbOutsideDhaka = Number(outsideMatch![1])

    expect(DELIVERY_FEES.inside_dhaka).toBe(dbInsideDhaka)
    expect(DELIVERY_FEES.outside_dhaka).toBe(dbOutsideDhaka)
  })
})

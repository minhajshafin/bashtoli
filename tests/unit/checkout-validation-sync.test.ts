import { describe, it, expect } from 'vitest'
import { checkoutSchema } from '@/lib/validations/checkout'

describe('Checkout form field validation parity with server schema', () => {
  it('validates customer_name identically on client and server', () => {
    const schema = checkoutSchema.shape.customer_name

    // Valid
    expect(schema.safeParse('Arif Rahman').success).toBe(true)
    expect(schema.safeParse('A'.repeat(100)).success).toBe(true)

    // Invalid: empty
    const emptyRes = schema.safeParse('')
    expect(emptyRes.success).toBe(false)
    if (!emptyRes.success) {
      expect(emptyRes.error.issues[0].message).toBe('Full name is required')
    }

    // Invalid: over 100 chars
    const longRes = schema.safeParse('A'.repeat(101))
    expect(longRes.success).toBe(false)
    if (!longRes.success) {
      expect(longRes.error.issues[0].message).toBe('Name cannot exceed 100 characters')
    }
  })

  it('validates phone number identically on client and server', () => {
    const schema = checkoutSchema.shape.phone

    // Valid
    expect(schema.safeParse('01712345678').success).toBe(true)
    expect(schema.safeParse('+8801712345678').success).toBe(true)
    expect(schema.safeParse('01987654321').success).toBe(true)

    // Invalid: too short
    const shortRes = schema.safeParse('0171234')
    expect(shortRes.success).toBe(false)

    // Invalid: non-BD operator prefix (e.g. 010, 011, 012)
    const invalidPrefix = schema.safeParse('01012345678')
    expect(invalidPrefix.success).toBe(false)
    if (!invalidPrefix.success) {
      expect(invalidPrefix.error.issues[0].message).toBe('Invalid Bangladeshi phone number format (e.g. 017XXXXXXXX)')
    }
  })

  it('validates address identically on client and server', () => {
    const schema = checkoutSchema.shape.address

    // Valid
    expect(schema.safeParse('House 12, Road 5, Block B, Dhanmondi').success).toBe(true)

    // Invalid: under 5 chars
    const shortRes = schema.safeParse('Apt')
    expect(shortRes.success).toBe(false)
    if (!shortRes.success) {
      expect(shortRes.error.issues[0].message).toBe('Delivery address must be at least 5 characters')
    }

    // Invalid: over 300 chars
    const longRes = schema.safeParse('A'.repeat(301))
    expect(longRes.success).toBe(false)
    if (!longRes.success) {
      expect(longRes.error.issues[0].message).toBe('Address cannot exceed 300 characters')
    }
  })

  it('validates guest_email identically on client and server', () => {
    const schema = checkoutSchema.shape.guest_email

    // Valid optional / empty
    expect(schema.safeParse('').success).toBe(true)
    expect(schema.safeParse(undefined).success).toBe(true)
    expect(schema.safeParse('buyer@example.com').success).toBe(true)

    // Invalid email
    const invalidEmail = schema.safeParse('not-an-email')
    expect(invalidEmail.success).toBe(false)
    if (!invalidEmail.success) {
      expect(invalidEmail.error.issues[0].message).toBe('Invalid email address')
    }
  })
})

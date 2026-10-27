import { describe, it, expect, vi } from 'vitest'
import {
  sanitizeActionError,
  mapCheckoutError,
  mapCancelOrderError,
  mapAuthError,
  extractSafeErrorInfo,
} from '@/lib/utils/action-error'

describe('lib/utils/action-error.ts', () => {
  it('sanitizeActionError logs safe error object server-side and returns fallback message', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const secretError = new Error('Database password leak or sensitive constraint detail')

    const message = sanitizeActionError('test-tag', secretError, 'Generic friendly message')

    expect(message).toBe('Generic friendly message')
    expect(consoleSpy).toHaveBeenCalledWith({
      tag: 'test-tag',
      name: 'Error',
      code: undefined,
      message: 'Database password leak or sensitive constraint detail',
    })
    consoleSpy.mockRestore()
  })

  it('mapCheckoutError handles all known prefix codes properly', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(mapCheckoutError('INSUFFICIENT_STOCK: item 123')).toBe(
      'One or more items in your cart do not have enough stock. Please adjust quantities and try again.'
    )
    expect(mapCheckoutError('ITEM_INACTIVE: item 123')).toBe(
      'One or more items in your cart are no longer available. Please refresh and try again.'
    )
    expect(mapCheckoutError('ITEM_NOT_FOUND: item 123')).toBe(
      'One or more items in your cart could not be found. Please check your cart and try again.'
    )
    expect(mapCheckoutError('INVALID_ZONE: null')).toBe(
      'Please select a valid delivery zone.'
    )
    expect(mapCheckoutError('INVALID_QTY: 0')).toBe(
      'Please enter a valid item quantity.'
    )
    expect(mapCheckoutError('INVALID_ITEMS: empty')).toBe(
      'Your cart is empty or contains invalid items.'
    )
    expect(
      mapCheckoutError('syntax error at or near SELECT * FROM secrets')
    ).toBe("We couldn't place your order. Please try again.")

    consoleSpy.mockRestore()
  })

  it('mapCancelOrderError whitelists the four cancellation errors and sanitizes unknown ones', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(mapCancelOrderError('Order not found')).toBe(
      'Order not found. Please verify the order details.'
    )
    expect(mapCancelOrderError('Unauthorized: Not the order owner')).toBe(
      'You are not authorized to cancel this order.'
    )
    expect(mapCancelOrderError('Only pending orders can be cancelled')).toBe(
      'Only pending orders can be cancelled.'
    )
    expect(
      mapCancelOrderError(
        'Orders can only be cancelled within 24 hours of placement.'
      )
    ).toBe('Orders can only be cancelled within 24 hours of placement.')
    expect(
      mapCancelOrderError('duplicate key value violates unique constraint')
    ).toBe('Failed to cancel the order. Please try again.')

    consoleSpy.mockRestore()
  })

  it('Postgres-style error containing phone number and address in details must not appear in any console.error call', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const postgresErrorWithPii = {
      name: 'PostgrestError',
      code: '23505',
      message: 'duplicate key value violates unique constraint',
      details: 'Key (phone, address)=(+8801712345678, Road 12 House 4 Banani Dhaka) already exists.',
      hint: 'Rows must be unique by phone and address.',
      where: 'PL/pgSQL function update_profile line 42',
    }

    // Call across sanitizeActionError, mapCheckoutError, and mapCancelOrderError
    sanitizeActionError('profile:saveAddress', postgresErrorWithPii)
    mapCheckoutError(postgresErrorWithPii)
    mapCancelOrderError(postgresErrorWithPii)
    mapAuthError(postgresErrorWithPii)

    const calls = consoleSpy.mock.calls
    const callsJson = JSON.stringify(calls)

    // Ensure sensitive PII in details/hint/where is never passed to console.error
    expect(callsJson).not.toContain('+8801712345678')
    expect(callsJson).not.toContain('Banani Dhaka')
    expect(callsJson).not.toContain('Road 12')
    expect(callsJson).not.toContain('PL/pgSQL')
    expect(callsJson).not.toContain('details')
    expect(callsJson).not.toContain('hint')
    expect(callsJson).not.toContain('where')

    // Confirm that only the safe object structure was logged
    expect(consoleSpy).toHaveBeenCalledWith({
      tag: 'profile:saveAddress',
      name: 'PostgrestError',
      code: '23505',
      message: 'duplicate key value violates unique constraint',
    })

    consoleSpy.mockRestore()
  })

  it('truncates error message to 300 characters', () => {
    const longMessage = 'A'.repeat(500)
    const error = new Error(longMessage)

    const safe = extractSafeErrorInfo('test', error)
    expect(safe.message.length).toBe(300)
    expect(safe.message).toBe('A'.repeat(300))
  })

  describe('mapAuthError', () => {
    it('maps weak_password to friendly message', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const res = mapAuthError({ code: 'weak_password', message: 'Password is too weak' })
      expect(res).toBe('The password provided is too weak. Please choose a stronger password.')
      consoleSpy.mockRestore()
    })

    it('maps same_password to friendly message', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const res = mapAuthError({ code: 'same_password', message: 'New password should be different' })
      expect(res).toBe('New password must be different from your current password.')
      consoleSpy.mockRestore()
    })

    it('maps over_request_rate_limit to friendly message', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const res = mapAuthError({ code: 'over_request_rate_limit', message: 'Too many requests' })
      expect(res).toBe('Too many requests. Please wait a few moments and try again.')
      consoleSpy.mockRestore()
    })

    it('maps over_email_send_rate_limit to friendly message', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const res = mapAuthError({ code: 'over_email_send_rate_limit', message: 'Rate limit exceeded' })
      expect(res).toBe('Too many email attempts. Please wait a few moments before trying again.')
      consoleSpy.mockRestore()
    })

    it('maps otp_expired to friendly message', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const res = mapAuthError({ code: 'otp_expired', message: 'Token has expired' })
      expect(res).toBe('Your reset link has expired. Please request a new one.')
      consoleSpy.mockRestore()
    })

    it('maps flow_state_expired to friendly message', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const res = mapAuthError({ code: 'flow_state_expired', message: 'Flow expired' })
      expect(res).toBe('Your reset link has expired. Please request a new one.')
      consoleSpy.mockRestore()
    })

    it('returns generic fallback for unknown code or unmapped error', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const res1 = mapAuthError({ code: 'unexpected_failure', message: 'Internal crash' })
      expect(res1).toBe('An unexpected authentication error occurred. Please try again.')

      const res2 = mapAuthError(new Error('Random unhandled error'))
      expect(res2).toBe('An unexpected authentication error occurred. Please try again.')

      const res3 = mapAuthError({ code: 'unknown_code' }, 'Custom fallback')
      expect(res3).toBe('Custom fallback')

      consoleSpy.mockRestore()
    })
  })
})

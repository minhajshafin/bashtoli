import { describe, it, expect, vi } from 'vitest'
import crypto from 'node:crypto'
import {
  timingSafeEqualStrings,
  signOrderVerification,
  verifyOrderVerification,
  getOrderVerificationCookieName,
  setOrderVerificationCookie,
  isOrderCookieVerified,
} from '@/lib/utils/order-token'

describe('Order Token & Authorization Utilities', () => {
  const TEST_SECRET = 'test-order-cookie-secret-1234567890'
  const ORDER_NUMBER = 'ORD-20261020-0042'
  const VALID_TOKEN = 'a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890'

  describe('timingSafeEqualStrings', () => {
    it('returns true for identical strings', () => {
      expect(timingSafeEqualStrings(VALID_TOKEN, VALID_TOKEN)).toBe(true)
      expect(timingSafeEqualStrings('hello-world', 'hello-world')).toBe(true)
      expect(timingSafeEqualStrings('', '')).toBe(true)
    })

    it('returns false for strings of different lengths without throwing', () => {
      expect(timingSafeEqualStrings(VALID_TOKEN, 'short')).toBe(false)
      expect(timingSafeEqualStrings('short', VALID_TOKEN)).toBe(false)
      expect(timingSafeEqualStrings('', 'a')).toBe(false)
    })

    it('returns false for strings of same length with different characters', () => {
      const tampered = VALID_TOKEN.slice(0, -1) + '1'
      expect(timingSafeEqualStrings(VALID_TOKEN, tampered)).toBe(false)
    })

    it('returns false safely when either or both arguments are null or undefined', () => {
      expect(timingSafeEqualStrings(null, VALID_TOKEN)).toBe(false)
      expect(timingSafeEqualStrings(VALID_TOKEN, undefined)).toBe(false)
      expect(timingSafeEqualStrings(undefined, undefined)).toBe(false)
      expect(timingSafeEqualStrings(null, null)).toBe(false)
    })
  })

  describe('signOrderVerification & verifyOrderVerification', () => {
    it('signs and successfully verifies an order verification cookie payload', () => {
      const signed = signOrderVerification(ORDER_NUMBER, TEST_SECRET)
      expect(typeof signed).toBe('string')
      expect(signed).toContain('.')

      const isValid = verifyOrderVerification(ORDER_NUMBER, signed, TEST_SECRET)
      expect(isValid).toBe(true)
    })

    it('fails verification if verified against a different order number', () => {
      const signed = signOrderVerification(ORDER_NUMBER, TEST_SECRET)
      const isValid = verifyOrderVerification('ORD-20261020-9999', signed, TEST_SECRET)
      expect(isValid).toBe(false)
    })

    it('fails verification if signed with a different secret', () => {
      const signed = signOrderVerification(ORDER_NUMBER, 'secret-A')
      const isValid = verifyOrderVerification(ORDER_NUMBER, signed, 'secret-B')
      expect(isValid).toBe(false)
    })

    it('fails verification if the signature is tampered', () => {
      const signed = signOrderVerification(ORDER_NUMBER, TEST_SECRET)
      const [issuedAt, hmac] = signed.split('.')
      const tamperedHmac = hmac.slice(0, -2) + 'ff'
      const isValid = verifyOrderVerification(ORDER_NUMBER, `${issuedAt}.${tamperedHmac}`, TEST_SECRET)
      expect(isValid).toBe(false)
    })

    it('fails verification if the payload is malformed', () => {
      expect(verifyOrderVerification(ORDER_NUMBER, 'invalid-payload-without-dot', TEST_SECRET)).toBe(false)
      expect(verifyOrderVerification(ORDER_NUMBER, 'not-a-number.hmac', TEST_SECRET)).toBe(false)
      expect(verifyOrderVerification(ORDER_NUMBER, '', TEST_SECRET)).toBe(false)
      expect(verifyOrderVerification(ORDER_NUMBER, null, TEST_SECRET)).toBe(false)
    })

    it('fails verification if the token has expired beyond maxAge', () => {
      // Simulate issued 25 hours ago
      const twentyFiveHoursAgo = Date.now() - 25 * 60 * 60 * 1000
      const hmac = crypto
        .createHmac('sha256', TEST_SECRET)
        .update(`${ORDER_NUMBER}:${twentyFiveHoursAgo}`)
        .digest('hex')
      const expiredPayload = `${twentyFiveHoursAgo}.${hmac}`

      const isValid = verifyOrderVerification(ORDER_NUMBER, expiredPayload, TEST_SECRET, 24 * 60 * 60 * 1000)
      expect(isValid).toBe(false)
    })

    it('fails verification if the token timestamp is suspiciously in the future', () => {
      // Simulate issued 5 minutes in future
      const futureTime = Date.now() + 5 * 60 * 1000
      const hmac = crypto
        .createHmac('sha256', TEST_SECRET)
        .update(`${ORDER_NUMBER}:${futureTime}`)
        .digest('hex')
      const futurePayload = `${futureTime}.${hmac}`

      const isValid = verifyOrderVerification(ORDER_NUMBER, futurePayload, TEST_SECRET)
      expect(isValid).toBe(false)
    })
  })

  describe('Cookie Store Integration', () => {
    it('sets the verification cookie with appropriate httpOnly options', () => {
      const mockSet = vi.fn()
      const cookieStore = { set: mockSet }

      setOrderVerificationCookie(cookieStore, ORDER_NUMBER, TEST_SECRET)

      const expectedCookieName = getOrderVerificationCookieName(ORDER_NUMBER)
      expect(mockSet).toHaveBeenCalledTimes(1)
      expect(mockSet).toHaveBeenCalledWith(
        expectedCookieName,
        expect.stringMatching(/^\d+\.[a-f0-9]{64}$/),
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 86400,
        })
      )
    })

    it('correctly validates verified cookie in mock cookieStore', () => {
      const signed = signOrderVerification(ORDER_NUMBER, TEST_SECRET)
      const cookieName = getOrderVerificationCookieName(ORDER_NUMBER)

      const cookieStore = {
        get: vi.fn((name: string) => {
          if (name === cookieName) {
            return { value: signed }
          }
          return undefined
        }),
      }

      expect(isOrderCookieVerified(cookieStore, ORDER_NUMBER, TEST_SECRET)).toBe(true)
      expect(isOrderCookieVerified(cookieStore, 'ORD-OTHER-0001', TEST_SECRET)).toBe(false)
    })

    it('returns false when cookie does not exist in cookieStore', () => {
      const cookieStore = {
        get: vi.fn(() => undefined),
      }
      expect(isOrderCookieVerified(cookieStore, ORDER_NUMBER, TEST_SECRET)).toBe(false)
    })
  })

  describe('Authorization Rules Evaluation', () => {
    // Pure logic helper testing the access level resolution rules
    function resolveOrderAccess({
      userId,
      orderUserId,
      userRole,
      queryToken,
      orderAccessToken,
      isCookieVerified,
    }: {
      userId?: string | null
      orderUserId?: string | null
      userRole?: string | null
      queryToken?: string | null
      orderAccessToken: string
      isCookieVerified: boolean
    }): 'FULL_VIEW' | 'PARTIAL_VIEW' | 'VERIFICATION_GATE' {
      const isOwner = Boolean(userId && orderUserId && userId === orderUserId)
      const isStaffOrAdmin = userRole === 'staff' || userRole === 'admin'
      const hasValidToken = timingSafeEqualStrings(queryToken, orderAccessToken)

      if (isOwner || isStaffOrAdmin || hasValidToken) {
        return 'FULL_VIEW'
      }

      if (isCookieVerified) {
        return 'PARTIAL_VIEW'
      }

      return 'VERIFICATION_GATE'
    }

    it('grants FULL_VIEW to the authenticated order owner', () => {
      const access = resolveOrderAccess({
        userId: 'user-123',
        orderUserId: 'user-123',
        userRole: 'customer',
        queryToken: null,
        orderAccessToken: VALID_TOKEN,
        isCookieVerified: false,
      })
      expect(access).toBe('FULL_VIEW')
    })

    it('grants FULL_VIEW to staff and admin users regardless of ownership or token', () => {
      const staffAccess = resolveOrderAccess({
        userId: 'staff-999',
        orderUserId: 'user-123',
        userRole: 'staff',
        queryToken: null,
        orderAccessToken: VALID_TOKEN,
        isCookieVerified: false,
      })
      expect(staffAccess).toBe('FULL_VIEW')

      const adminAccess = resolveOrderAccess({
        userId: 'admin-001',
        orderUserId: 'user-123',
        userRole: 'admin',
        queryToken: null,
        orderAccessToken: VALID_TOKEN,
        isCookieVerified: false,
      })
      expect(adminAccess).toBe('FULL_VIEW')
    })

    it('grants FULL_VIEW to guests with a valid access token matching in constant time', () => {
      const guestTokenAccess = resolveOrderAccess({
        userId: null,
        orderUserId: null,
        userRole: null,
        queryToken: VALID_TOKEN,
        orderAccessToken: VALID_TOKEN,
        isCookieVerified: false,
      })
      expect(guestTokenAccess).toBe('FULL_VIEW')
    })

    it('grants PARTIAL_VIEW to guests with verified cookie (no token, not owner)', () => {
      const partialAccess = resolveOrderAccess({
        userId: null,
        orderUserId: null,
        userRole: null,
        queryToken: null,
        orderAccessToken: VALID_TOKEN,
        isCookieVerified: true,
      })
      expect(partialAccess).toBe('PARTIAL_VIEW')
    })

    it('routes to VERIFICATION_GATE when guest has no token and no verified cookie', () => {
      const gateAccess = resolveOrderAccess({
        userId: null,
        orderUserId: null,
        userRole: null,
        queryToken: null,
        orderAccessToken: VALID_TOKEN,
        isCookieVerified: false,
      })
      expect(gateAccess).toBe('VERIFICATION_GATE')
    })

    it('routes to VERIFICATION_GATE when token is invalid or tampered', () => {
      const gateAccess = resolveOrderAccess({
        userId: null,
        orderUserId: null,
        userRole: null,
        queryToken: 'invalid-token-tampered',
        orderAccessToken: VALID_TOKEN,
        isCookieVerified: false,
      })
      expect(gateAccess).toBe('VERIFICATION_GATE')
    })
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getClientIpFromHeaders,
  checkAuthRateLimit,
  checkOrderLookupRateLimit,
  checkCheckoutRateLimit,
} from '@/lib/supabase/rate-limit'
import type { NextRequest } from 'next/server'

// Mock Upstash
const mockLimit = vi.fn()
vi.mock('@upstash/ratelimit', () => {
  class MockRatelimit {
    opts: unknown
    limit = mockLimit
    constructor(opts: unknown) {
      this.opts = opts
    }
    static slidingWindow = vi.fn((requests: number, window: string) => ({ requests, window }))
  }
  return {
    Ratelimit: MockRatelimit,
  }
})

vi.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: vi.fn().mockReturnValue({}),
  },
}))

describe('Rate Limiting & Security Hardening (lib/supabase/rate-limit.ts)', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('Edge IP Extraction (getClientIpFromHeaders)', () => {
    it('prefers x-real-ip over x-forwarded-for', () => {
      const headers = new Headers({
        'x-real-ip': '203.0.113.195',
        'x-forwarded-for': '198.51.100.1, 198.51.100.2',
      })
      expect(getClientIpFromHeaders(headers)).toBe('203.0.113.195')
    })

    it('extracts rightmost trusted IP from x-forwarded-for to prevent client spoofing', () => {
      const headers = new Headers({
        'x-forwarded-for': '10.0.0.1, 198.51.100.5, 203.0.113.42',
      })
      expect(getClientIpFromHeaders(headers)).toBe('203.0.113.42')
    })

    it('handles single entry in x-forwarded-for', () => {
      const headers = new Headers({
        'x-forwarded-for': '198.51.100.77',
      })
      expect(getClientIpFromHeaders(headers)).toBe('198.51.100.77')
    })

    it('normalizes IPv6 loopback (::1) to 127.0.0.1', () => {
      const headers = new Headers({
        'x-forwarded-for': '::1',
      })
      expect(getClientIpFromHeaders(headers)).toBe('127.0.0.1')
    })

    it('falls back to 127.0.0.1 when headers are missing', () => {
      const headers = new Headers()
      expect(getClientIpFromHeaders(headers)).toBe('127.0.0.1')
    })
  })

  describe('Unconfigured Environment (Fail-Open)', () => {
    beforeEach(() => {
      delete process.env.UPSTASH_REDIS_REST_URL
      delete process.env.UPSTASH_REDIS_REST_TOKEN
    })

    it('allows auth requests through when Redis is not configured', async () => {
      const req = {
        headers: new Headers({ 'x-real-ip': '1.2.3.4' }),
      } as unknown as NextRequest

      const res = await checkAuthRateLimit(req)
      expect(res).toEqual({ limited: false })
      expect(mockLimit).not.toHaveBeenCalled()
    })

    it('allows order lookup requests through when Redis is not configured', async () => {
      const headers = new Headers({ 'x-real-ip': '1.2.3.4' })
      const res = await checkOrderLookupRateLimit(headers)
      expect(res).toEqual({ limited: false })
      expect(mockLimit).not.toHaveBeenCalled()
    })

    it('allows checkout requests through when Redis is not configured', async () => {
      const headers = new Headers({ 'x-real-ip': '1.2.3.4' })
      const res = await checkCheckoutRateLimit(headers)
      expect(res).toEqual({ limited: false })
      expect(mockLimit).not.toHaveBeenCalled()
    })
  })

  describe('Active Rate Limiting & Fail-Open Resilience', () => {
    beforeEach(() => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://mock-redis.upstash.io'
      process.env.UPSTASH_REDIS_REST_TOKEN = 'mock-token'
    })

    it('returns limited: false when within sliding window threshold', async () => {
      mockLimit.mockResolvedValueOnce({
        success: true,
        limit: 10,
        remaining: 9,
        reset: Date.now() + 60000,
      })

      const req = {
        headers: new Headers({ 'x-real-ip': '198.51.100.1' }),
      } as unknown as NextRequest

      const res = await checkAuthRateLimit(req)
      expect(res).toEqual({ limited: false })
      expect(mockLimit).toHaveBeenCalledWith('198.51.100.1')
    })

    it('returns limited: true with retryAfter seconds when quota is exceeded', async () => {
      const resetTime = Date.now() + 30000 // 30 seconds from now
      mockLimit.mockResolvedValueOnce({
        success: false,
        limit: 10,
        remaining: 0,
        reset: resetTime,
      })

      const req = {
        headers: new Headers({ 'x-real-ip': '198.51.100.1' }),
      } as unknown as NextRequest

      const res = await checkAuthRateLimit(req)
      expect(res.limited).toBe(true)
      if (res.limited) {
        expect(res.retryAfter).toBeGreaterThanOrEqual(29)
        expect(res.retryAfter).toBeLessThanOrEqual(31)
      }
    })

    it('fails open when Redis throws connection error or timeout on auth', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockLimit.mockRejectedValueOnce(new Error('Connection timed out to Upstash Redis'))

      const req = {
        headers: new Headers({ 'x-real-ip': '198.51.100.1' }),
      } as unknown as NextRequest

      const res = await checkAuthRateLimit(req)
      expect(res).toEqual({ limited: false })
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[rate-limit] Auth limiter error:'),
        expect.any(Error)
      )
      consoleSpy.mockRestore()
    })

    it('fails open when Redis throws connection error on order lookup', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockLimit.mockRejectedValueOnce(new Error('ECONNREFUSED'))

      const headers = new Headers({ 'x-real-ip': '198.51.100.1' })
      const res = await checkOrderLookupRateLimit(headers)
      expect(res).toEqual({ limited: false })
      consoleSpy.mockRestore()
    })

    it('fails open when Redis throws connection error on checkout', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockLimit.mockRejectedValueOnce(new Error('Upstash REST 500'))

      const headers = new Headers({ 'x-real-ip': '198.51.100.1' })
      const res = await checkCheckoutRateLimit(headers)
      expect(res).toEqual({ limited: false })
      consoleSpy.mockRestore()
    })
  })
})

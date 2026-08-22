/**
 * lib/supabase/rate-limit.ts
 *
 * Production-grade rate limiting using Upstash Redis + @upstash/ratelimit.
 * Falls back gracefully (allow-through) when env vars are not configured,
 * so the app works in development without a Redis instance.
 *
 * Setup (production):
 *   1. Create a Redis database at https://console.upstash.com
 *   2. Add to your environment:
 *        UPSTASH_REDIS_REST_URL=https://...upstash.io
 *        UPSTASH_REDIS_REST_TOKEN=...
 *
 * Limits defined here:
 *   auth   — 10 requests / 60 s per IP (login, signup, forgot-password)
 *   order  — 5 requests / 60 s per IP  (guest order lookup)
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import type { NextRequest } from 'next/server'

// ── Helpers ───────────────────────────────────────────────────

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1'
  // Normalise IPv6 loopback so local dev always passes
  return ip === '::1' ? '127.0.0.1' : ip
}

function isConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  )
}

// ── Singleton limiters (created once, reused across requests) ─

let authLimiter: Ratelimit | null = null
let orderLimiter: Ratelimit | null = null

function getAuthLimiter(): Ratelimit {
  if (!authLimiter) {
    authLimiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, '60 s'),
      prefix: 'rl:auth',
      analytics: false,
    })
  }
  return authLimiter
}

function getOrderLimiter(): Ratelimit {
  if (!orderLimiter) {
    orderLimiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, '60 s'),
      prefix: 'rl:order',
      analytics: false,
    })
  }
  return orderLimiter
}

// ── Public API ────────────────────────────────────────────────

export type RateLimitResult =
  | { limited: false }
  | { limited: true; retryAfter: number }

/**
 * Check the auth rate limit for the given request's IP.
 * Returns `{ limited: false }` when Upstash is not configured (fail-open).
 */
export async function checkAuthRateLimit(
  request: NextRequest
): Promise<RateLimitResult> {
  if (!isConfigured()) return { limited: false }

  const ip = getClientIp(request)

  try {
    const { success, reset } = await getAuthLimiter().limit(ip)
    if (success) return { limited: false }
    const retryAfter = Math.ceil((reset - Date.now()) / 1000)
    return { limited: true, retryAfter }
  } catch (err) {
    // If Redis is unreachable, fail open so the site stays up
    console.error('[rate-limit] Auth limiter error:', err)
    return { limited: false }
  }
}

/**
 * Check the order-lookup rate limit for the given request's IP.
 * Returns `{ limited: false }` when Upstash is not configured (fail-open).
 */
export async function checkOrderLookupRateLimit(
  request: NextRequest
): Promise<RateLimitResult> {
  if (!isConfigured()) return { limited: false }

  const ip = getClientIp(request)

  try {
    const { success, reset } = await getOrderLimiter().limit(ip)
    if (success) return { limited: false }
    const retryAfter = Math.ceil((reset - Date.now()) / 1000)
    return { limited: true, retryAfter }
  } catch (err) {
    console.error('[rate-limit] Order limiter error:', err)
    return { limited: false }
  }
}

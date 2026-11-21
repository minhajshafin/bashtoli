import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { resetRateLimits } from '../e2e/test-helpers'

describe('resetRateLimits production safety guards', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('throws an error if VERCEL_ENV is production', async () => {
    process.env.VERCEL_ENV = 'production'
    process.env.E2E_SUPABASE_URL = 'http://localhost:54321'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'

    await expect(resetRateLimits()).rejects.toThrow(
      'SAFETY VIOLATION: resetRateLimits() cannot be executed in production'
    )
  })

  it('throws an error if E2E_SUPABASE_URL is missing', async () => {
    delete process.env.E2E_SUPABASE_URL
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'

    await expect(resetRateLimits()).rejects.toThrow(
      'SAFETY VIOLATION: resetRateLimits() is restricted to test environments with valid E2E_SUPABASE_URL.'
    )
  })

  it('throws an error if E2E_SUPABASE_URL does not match NEXT_PUBLIC_SUPABASE_URL', async () => {
    process.env.E2E_SUPABASE_URL = 'http://staging.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://production.supabase.co'

    await expect(resetRateLimits()).rejects.toThrow(
      'SAFETY VIOLATION: resetRateLimits() is restricted to test environments with valid E2E_SUPABASE_URL.'
    )
  })
})

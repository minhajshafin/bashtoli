import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getBaseUrl } from '@/lib/utils/url'

describe('lib/utils/url.ts: getBaseUrl', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', '')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('uses NEXT_PUBLIC_APP_URL when present and strips trailing slashes', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://bashtoli.com///')
    expect(getBaseUrl()).toBe('https://bashtoli.com')
  })

  it('resolves from headers with x-forwarded-host and x-forwarded-proto', () => {
    const headers = new Headers({
      'x-forwarded-host': 'preview.bashtoli.com',
      'x-forwarded-proto': 'https',
    })
    expect(getBaseUrl(headers)).toBe('https://preview.bashtoli.com')
  })

  it('resolves host header and defaults proto based on environment', () => {
    vi.stubEnv('NODE_ENV', 'development')
    const headers = new Headers({
      host: 'localhost:3000',
    })
    expect(getBaseUrl(headers)).toBe('http://localhost:3000')
  })

  it('falls back to default when no env or headers provided', () => {
    vi.stubEnv('NODE_ENV', 'development')
    expect(getBaseUrl()).toBe('http://localhost:3000')

    vi.stubEnv('NODE_ENV', 'production')
    expect(getBaseUrl()).toBe('https://bashtoli.com')
  })
})

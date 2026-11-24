import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/auth/callback/route'

const mockVerifyOtp = vi.fn()
const mockExchangeCodeForSession = vi.fn()
const mockSetSession = vi.fn()

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn((_url, _key, options) => {
    return {
      auth: {
        verifyOtp: mockVerifyOtp,
        exchangeCodeForSession: mockExchangeCodeForSession,
        setSession: async (params: { access_token: string; refresh_token: string }) => {
          const res = await mockSetSession(params)
          if (!res.error) {
            options?.cookies?.setAll?.([
              { name: 'sb-auth-token', value: 'token-val', options: { path: '/' } },
            ])
          }
          return res
        },
      },
    }
  }),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    getAll: () => [],
    set: vi.fn(),
  })),
}))

describe('app/api/auth/callback/route.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockVerifyOtp.mockResolvedValue({ error: null })
    mockExchangeCodeForSession.mockResolvedValue({ error: null })
    mockSetSession.mockResolvedValue({ data: { session: {} }, error: null })
  })

  describe('GET handler', () => {
    it('redirects to /login when query parameter contains explicit error', async () => {
      const req = new Request('https://bashtoli.com/api/auth/callback?error=access_denied&error_description=User+declined')
      const res = await GET(req)

      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe(
        'https://bashtoli.com/login?error=User%20declined'
      )
    })

    it('verifies token_hash and type on server and redirects to target', async () => {
      const req = new Request(
        'https://bashtoli.com/api/auth/callback?token_hash=valid_hash&type=recovery&redirectTo=/reset-password'
      )
      const res = await GET(req)

      expect(mockVerifyOtp).toHaveBeenCalledWith({
        token_hash: 'valid_hash',
        type: 'recovery',
      })
      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe('https://bashtoli.com/reset-password')
    })

    it('redirects to /login if token_hash verification fails', async () => {
      mockVerifyOtp.mockResolvedValue({
        error: { message: 'Token expired', status: 400 },
      })
      const req = new Request(
        'https://bashtoli.com/api/auth/callback?token_hash=expired_hash&type=email'
      )
      const res = await GET(req)

      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toContain('/login?error=')
    })

    it('exchanges code for session and redirects to target on server when valid', async () => {
      const req = new Request(
        'https://bashtoli.com/api/auth/callback?code=pkce_code&redirectTo=/account'
      )
      const res = await GET(req)

      expect(mockExchangeCodeForSession).toHaveBeenCalledWith('pkce_code')
      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe('https://bashtoli.com/account')
    })

    it('falls back to client hash bridge when code exchange fails (e.g. cross-device missing code verifier)', async () => {
      mockExchangeCodeForSession.mockResolvedValue({
        error: { message: 'both auth code and code verifier should be non-empty', status: 400 },
      })
      const req = new Request(
        'https://bashtoli.com/api/auth/callback?code=pkce_code&redirectTo=/account'
      )
      const res = await GET(req)

      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toContain('text/html')
      const text = await res.text()
      expect(text).toContain('window.location.hash')
      expect(text).toContain('fetch(\'/api/auth/callback\'')
      expect(text).toContain('/account')
    })

    it('renders client hash bridge when neither token_hash nor code is in searchParams (hash fragment flow)', async () => {
      const req = new Request(
        'https://bashtoli.com/api/auth/callback?redirectTo=/reset-password'
      )
      const res = await GET(req)

      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toContain('text/html')
      const text = await res.text()
      expect(text).toContain('window.location.hash')
      expect(text).toContain('/reset-password')
      expect(text).toContain('fetch(\'/api/auth/callback\'')
    })
  })

  describe('POST handler', () => {
    it('rejects payloads missing access_token or refresh_token with 400', async () => {
      const req = new Request('https://bashtoli.com/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: 'valid' }),
      })
      const res = await POST(req)
      expect(res.status).toBe(400)
      const json = await res.json()
      expect(json.error).toContain('Missing or invalid')
    })

    it('successfully calls setSession and sets auth cookie headers', async () => {
      const req = new Request('https://bashtoli.com/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: 'fake_access_token',
          refresh_token: 'fake_refresh_token',
        }),
      })
      const res = await POST(req)

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(mockSetSession).toHaveBeenCalledWith({
        access_token: 'fake_access_token',
        refresh_token: 'fake_refresh_token',
      })
      expect(res.headers.get('set-cookie')).toContain('sb-auth-token')
    })

    it('returns 400 if setSession returns an error', async () => {
      mockSetSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid JWT token', status: 400 },
      })
      const req = new Request('https://bashtoli.com/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: 'bad_token',
          refresh_token: 'bad_token',
        }),
      })
      const res = await POST(req)
      expect(res.status).toBe(400)
      const json = await res.json()
      expect(json.error).toBe('Invalid JWT token')
    })
  })
})

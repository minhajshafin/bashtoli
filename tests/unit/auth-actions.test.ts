import { describe, it, expect, vi, beforeEach } from 'vitest'
import { forgotPasswordAction, resetPasswordAction } from '@/lib/actions/auth'

const mockResetPasswordForEmail = vi.fn()
const mockUpdateUser = vi.fn()
const mockSignOut = vi.fn()
const mockCreateClient = vi.fn()
const mockCreateImplicitAuthClient = vi.fn()
const mockCheckAuthRateLimit = vi.fn()

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => new Headers({ host: 'localhost:3000' })),
}))

vi.mock('@/lib/supabase/rate-limit', () => ({
  checkAuthRateLimit: (...args: unknown[]) => mockCheckAuthRateLimit(...args),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args),
  createImplicitAuthClient: (...args: unknown[]) => mockCreateImplicitAuthClient(...args),
}))

describe('Password reset server actions (lib/actions/auth.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('NODE_ENV', 'development')
    mockCheckAuthRateLimit.mockResolvedValue({ limited: false })
    mockResetPasswordForEmail.mockResolvedValue({ data: {}, error: null })
    mockUpdateUser.mockResolvedValue({ data: { user: {} }, error: null })
    mockSignOut.mockResolvedValue({ error: null })

    mockCreateClient.mockResolvedValue({
      auth: {
        updateUser: mockUpdateUser,
        signOut: mockSignOut,
      },
    })
    mockCreateImplicitAuthClient.mockReturnValue({
      auth: {
        resetPasswordForEmail: mockResetPasswordForEmail,
      },
    })
  })

  describe('forgotPasswordAction', () => {
    it('uses createImplicitAuthClient instead of PKCE cookie client and redirects to /api/auth/callback?redirectTo=/reset-password', async () => {
      const formData = new FormData()
      formData.set('email', 'Customer@Example.com')

      const res = await forgotPasswordAction({ error: null }, formData)

      expect(res).toEqual({ error: null, success: true })
      expect(mockCreateImplicitAuthClient).toHaveBeenCalledTimes(1)
      expect(mockCreateClient).not.toHaveBeenCalled()
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith('customer@example.com', {
        redirectTo: 'http://localhost:3000/api/auth/callback?redirectTo=/reset-password',
      })
    })

    it('surfaces rate limit errors from Supabase email sending', async () => {
      mockResetPasswordForEmail.mockResolvedValue({
        data: null,
        error: { message: 'Email rate limit exceeded', code: 'over_email_send_rate_limit', status: 429 },
      })

      const formData = new FormData()
      formData.set('email', 'customer@example.com')

      const res = await forgotPasswordAction({ error: null }, formData)

      expect(res.error).toBe(
        'Email rate limit exceeded. Please wait a few minutes before trying again.'
      )
    })
  })

  describe('resetPasswordAction', () => {
    it('updates password and signs out temporary recovery session', async () => {
      const formData = new FormData()
      formData.set('password', 'NewSecurePass123!')
      formData.set('confirmPassword', 'NewSecurePass123!')

      const res = await resetPasswordAction({ error: null }, formData)

      expect(res).toEqual({ error: null, success: true })
      expect(mockCreateClient).toHaveBeenCalledTimes(1)
      expect(mockUpdateUser).toHaveBeenCalledWith({
        password: 'NewSecurePass123!',
      })
      expect(mockSignOut).toHaveBeenCalledTimes(1)
    })

    it('still returns success if signOut errors after password was updated', async () => {
      mockSignOut.mockResolvedValue({ error: { message: 'Network hiccup', status: 500 } })

      const formData = new FormData()
      formData.set('password', 'NewSecurePass123!')
      formData.set('confirmPassword', 'NewSecurePass123!')

      const res = await resetPasswordAction({ error: null }, formData)

      expect(res).toEqual({ error: null, success: true })
    })
  })
})

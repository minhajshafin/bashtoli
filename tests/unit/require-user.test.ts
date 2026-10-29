import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const mockRedirect = vi.fn()
vi.mock('next/navigation', () => ({
  redirect: (target: string) => {
    mockRedirect(target)
    throw new Error(`NEXT_REDIRECT:${target}`)
  },
}))

const mockGetUser = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(async () => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}))

describe('lib/supabase/require-user.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('unauthenticated redirects to login with exact redirectTo target', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const { requireUser } = await import('@/lib/supabase/require-user')

    await expect(requireUser('/account/orders')).rejects.toThrow('NEXT_REDIRECT:/login?redirectTo=/account/orders')
    expect(mockRedirect).toHaveBeenCalledWith('/login?redirectTo=/account/orders')
  })

  it('unauthenticated defaults to /account redirect when no target specified', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const { requireUser } = await import('@/lib/supabase/require-user')

    await expect(requireUser()).rejects.toThrow('NEXT_REDIRECT:/login?redirectTo=/account')
    expect(mockRedirect).toHaveBeenCalledWith('/login?redirectTo=/account')
  })

  it('authenticated returns the user without redirecting', async () => {
    const mockUser = {
      id: 'usr_test_123',
      email: 'customer@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    }
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
    const { requireUser } = await import('@/lib/supabase/require-user')

    const user = await requireUser('/account/profile')
    expect(user).toEqual(mockUser)
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('verifies that each /account/* page and layout invokes requireUser() with correct redirect targets', () => {
    const accountDir = path.resolve(process.cwd(), 'app/(storefront)/account')
    const filesToVerify = [
      { file: 'layout.tsx', expectedTarget: '/account' },
      { file: 'page.tsx', expectedTarget: '/account' },
      { file: 'addresses/page.tsx', expectedTarget: '/account/addresses' },
      { file: 'orders/page.tsx', expectedTarget: '/account/orders' },
      { file: 'profile/page.tsx', expectedTarget: '/account/profile' },
      { file: 'wishlist/page.tsx', expectedTarget: '/account/wishlist' },
    ]

    for (const { file, expectedTarget } of filesToVerify) {
      const fullPath = path.join(accountDir, file)
      const content = fs.readFileSync(fullPath, 'utf8')

      expect(content).toContain("import { requireUser } from '@/lib/supabase/require-user'")
      expect(content).toMatch(new RegExp(`requireUser\\(['"\`]${expectedTarget}['"\`]\\)`))
    }
  })
})

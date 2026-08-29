/**
 * @file tests/unit/profile-delete.test.ts
 *
 * Unit tests for account deletion action validations and safeguards.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockFrom = vi.fn()
const mockSignOut = vi.fn()
const mockAdminDeleteUser = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    auth: {
      getUser: mockGetUser,
      signOut: mockSignOut,
    },
    from: mockFrom,
  })),
  createAdminClient: vi.fn(() => ({
    auth: {
      admin: {
        deleteUser: mockAdminDeleteUser,
      },
    },
  })),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { deleteAccountAction } from '@/lib/actions/profile'

describe('deleteAccountAction validation & safeguards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects deletion if confirmation phrase is incorrect', async () => {
    const formData = new FormData()
    formData.append('confirmation', 'NOT_DELETE')

    const result = await deleteAccountAction({ error: null }, formData)
    expect(result.error).toBe('Please type DELETE exactly to confirm account deletion.')
  })

  it('rejects deletion if confirmation phrase is empty', async () => {
    const formData = new FormData()
    formData.append('confirmation', '')

    const result = await deleteAccountAction({ error: null }, formData)
    expect(result.error).toBe('Please type DELETE exactly to confirm account deletion.')
  })

  it('rejects deletion if unauthenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })

    const formData = new FormData()
    formData.append('confirmation', 'DELETE')

    const result = await deleteAccountAction({ error: null }, formData)
    expect(result.error).toBe('You must be logged in to delete your account.')
  })

  it('prevents sole admin from deleting their account', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'admin-1' } } })
    
    // First .from('profiles').select('role')... returns role = 'admin'
    // Second .from('profiles').select('id', { count: 'exact' })... returns count = 1
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: { role: 'admin' } }),
        }),
      }),
    }).mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ count: 1 }),
      }),
    })

    const formData = new FormData()
    formData.append('confirmation', 'DELETE')

    const result = await deleteAccountAction({ error: null }, formData)
    expect(result.error).toContain('Cannot delete the sole administrator account')
  })

  it('successfully deletes a regular customer account', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'cust-1' } } })
    
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: { role: 'customer' } }),
        }),
      }),
    })

    mockAdminDeleteUser.mockResolvedValueOnce({ error: null })
    mockSignOut.mockResolvedValueOnce({})

    const formData = new FormData()
    formData.append('confirmation', 'DELETE')

    const result = await deleteAccountAction({ error: null }, formData)
    expect(result.error).toBeNull()
    expect(result.success).toBe(true)
    expect(mockAdminDeleteUser).toHaveBeenCalledWith('cust-1')
    expect(mockSignOut).toHaveBeenCalled()
  })
})

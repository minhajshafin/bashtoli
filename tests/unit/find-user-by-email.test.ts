import { describe, it, expect, vi } from 'vitest'
import { findUserByEmail, pruneStaleTestUsers } from '../e2e/test-helpers'
import type { SupabaseClient, User } from '@supabase/supabase-js'

describe('findUserByEmail pagination helper', () => {
  it('finds user on page 2 when paginating', async () => {
    const listUsersMock = vi.fn().mockImplementation(async ({ page, perPage }: { page: number; perPage: number }) => {
      expect(perPage).toBe(1000)
      if (page === 1) {
        return {
          data: {
            users: [
              { id: 'user-1', email: 'alpha@example.com' } as User,
              { id: 'user-2', email: 'beta@example.com' } as User,
            ],
            nextPage: 2,
            lastPage: 2,
            total: 3,
          },
          error: null,
        }
      }
      if (page === 2) {
        return {
          data: {
            users: [
              { id: 'user-3', email: 'target@example.com' } as User,
            ],
            nextPage: null,
            lastPage: 2,
            total: 3,
          },
          error: null,
        }
      }
      return {
        data: { users: [], nextPage: null, lastPage: 2, total: 3 },
        error: null,
      }
    })

    const mockClient = {
      auth: {
        admin: {
          listUsers: listUsersMock,
        },
      },
    } as unknown as SupabaseClient

    // Test case-insensitive lookup
    const foundUser = await findUserByEmail('TARGET@EXAMPLE.COM', mockClient)

    expect(foundUser).not.toBeNull()
    expect(foundUser?.id).toBe('user-3')
    expect(foundUser?.email).toBe('target@example.com')
    expect(listUsersMock).toHaveBeenCalledTimes(2)
    expect(listUsersMock).toHaveBeenNthCalledWith(1, { page: 1, perPage: 1000 })
    expect(listUsersMock).toHaveBeenNthCalledWith(2, { page: 2, perPage: 1000 })
  })

  it('returns null when user is not found after searching all pages', async () => {
    const listUsersMock = vi.fn().mockImplementation(async ({ page }: { page: number }) => {
      if (page === 1) {
        return {
          data: {
            users: [{ id: 'user-1', email: 'user1@example.com' } as User],
            nextPage: 2,
            lastPage: 2,
            total: 2,
          },
          error: null,
        }
      }
      if (page === 2) {
        return {
          data: {
            users: [{ id: 'user-2', email: 'user2@example.com' } as User],
            nextPage: null,
            lastPage: 2,
            total: 2,
          },
          error: null,
        }
      }
      return {
        data: { users: [], nextPage: null, lastPage: 2, total: 2 },
        error: null,
      }
    })

    const mockClient = {
      auth: {
        admin: {
          listUsers: listUsersMock,
        },
      },
    } as unknown as SupabaseClient

    const foundUser = await findUserByEmail('nonexistent@example.com', mockClient)

    expect(foundUser).toBeNull()
    expect(listUsersMock).toHaveBeenCalledTimes(2)
  })

  it('returns null when users list is empty', async () => {
    const listUsersMock = vi.fn().mockResolvedValue({
      data: {
        users: [],
        nextPage: null,
        lastPage: 0,
        total: 0,
      },
      error: null,
    })

    const mockClient = {
      auth: {
        admin: {
          listUsers: listUsersMock,
        },
      },
    } as unknown as SupabaseClient

    const foundUser = await findUserByEmail('someone@example.com', mockClient)

    expect(foundUser).toBeNull()
    expect(listUsersMock).toHaveBeenCalledTimes(1)
    expect(listUsersMock).toHaveBeenCalledWith({ page: 1, perPage: 1000 })
  })
})

describe('pruneStaleTestUsers helper', () => {
  it('deletes stale claim and admin users older than 1 hour while preserving wishlist and recent users', async () => {
    const now = Date.now()
    const twoHoursAgo = new Date(now - 2 * 60 * 60 * 1000).toISOString()
    const tenMinutesAgo = new Date(now - 10 * 60 * 1000).toISOString()

    const listUsersMock = vi.fn().mockResolvedValue({
      data: {
        users: [
          // Stale claim user -> should be deleted
          { id: 'stale-claim-1', email: 'e2e-claim-12345@example.com', created_at: twoHoursAgo } as User,
          // Stale admin user -> should be deleted
          { id: 'stale-admin-1', email: 'e2e-admin-67890@example.com', created_at: twoHoursAgo } as User,
          // Fresh claim user -> should NOT be deleted (< 1 hour)
          { id: 'recent-claim', email: 'e2e-claim-fresh@example.com', created_at: tenMinutesAgo } as User,
          // Fixed wishlist user -> should NEVER be deleted even if > 1 hour
          { id: 'wishlist-user', email: 'e2e-wishlist-user@example.com', created_at: twoHoursAgo } as User,
          // Unrelated user -> should NOT be deleted
          { id: 'regular-user', email: 'customer@example.com', created_at: twoHoursAgo } as User,
        ],
        nextPage: null,
        lastPage: 1,
        total: 5,
      },
      error: null,
    })

    const deleteUserMock = vi.fn().mockResolvedValue({ error: null })

    const mockClient = {
      auth: {
        admin: {
          listUsers: listUsersMock,
          deleteUser: deleteUserMock,
        },
      },
    } as unknown as SupabaseClient

    const deletedCount = await pruneStaleTestUsers(mockClient)

    expect(deletedCount).toBe(2)
    expect(deleteUserMock).toHaveBeenCalledTimes(2)
    expect(deleteUserMock).toHaveBeenCalledWith('stale-claim-1')
    expect(deleteUserMock).toHaveBeenCalledWith('stale-admin-1')
    expect(deleteUserMock).not.toHaveBeenCalledWith('recent-claim')
    expect(deleteUserMock).not.toHaveBeenCalledWith('wishlist-user')
    expect(deleteUserMock).not.toHaveBeenCalledWith('regular-user')
  })
})

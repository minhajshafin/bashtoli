import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockFrom = vi.fn()
const mockStorageFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        getUser: mockGetUser,
      },
      from: mockFrom,
      storage: {
        from: mockStorageFrom,
      },
    })
  ),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { deleteProduct } from '@/lib/actions/products'

describe('deleteProduct server action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects deletion if unauthenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })

    const res = await deleteProduct('prod-123')
    expect(res.error).toBe('Unauthenticated: You must be logged in.')
  })

  it('rejects deletion if user is customer role', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } })
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: { role: 'customer' } }),
        }),
      }),
    })

    const res = await deleteProduct('prod-123')
    expect(res.error).toBe('Unauthorized: Staff or admin access required.')
  })

  it('soft-deletes product when order history exists (sets active = false)', async () => {
    // 1. Auth check
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'admin-1' } } })
    // Profile role
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: { role: 'admin' } }),
        }),
      }),
    })

    // 2. order_items check -> returns count: 2 (has history)
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ count: 2, error: null }),
      }),
    })

    // 3. update product (active = false)
    const mockUpdateEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq })
    mockFrom.mockReturnValueOnce({
      update: mockUpdate,
    })

    const res = await deleteProduct('prod-ordered')
    expect(res.error).toBeNull()
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ active: false })
    )
    expect(mockUpdateEq).toHaveBeenCalledWith('id', 'prod-ordered')
  })

  it('hard-deletes variants first and then product when no order history exists', async () => {
    // 1. Auth check
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'admin-1' } } })
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: { role: 'admin' } }),
        }),
      }),
    })

    // 2. order_items check -> count: 0
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
      }),
    })

    // 3. product_images select
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [{ url: 'https://example.com/storage/v1/object/public/product-images/p1/img.jpg' }],
          error: null,
        }),
      }),
    })

    // Storage remove
    const mockRemove = vi.fn().mockResolvedValue({ error: null })
    mockStorageFrom.mockReturnValue({ remove: mockRemove })

    // 4. product_variants delete
    const mockVariantsEq = vi.fn().mockResolvedValue({ error: null })
    const mockVariantsDelete = vi.fn().mockReturnValue({ eq: mockVariantsEq })
    mockFrom.mockReturnValueOnce({
      delete: mockVariantsDelete,
    })

    // 5. products delete
    const mockProductEq = vi.fn().mockResolvedValue({ error: null })
    const mockProductDelete = vi.fn().mockReturnValue({ eq: mockProductEq })
    mockFrom.mockReturnValueOnce({
      delete: mockProductDelete,
    })

    const res = await deleteProduct('prod-new')
    expect(res.error).toBeNull()
    expect(mockVariantsDelete).toHaveBeenCalled()
    expect(mockVariantsEq).toHaveBeenCalledWith('product_id', 'prod-new')
    expect(mockProductDelete).toHaveBeenCalled()
    expect(mockProductEq).toHaveBeenCalledWith('id', 'prod-new')
  })
})

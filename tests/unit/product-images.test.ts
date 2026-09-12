import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockRevalidatePath = vi.fn()
const mockRevalidateTag = vi.fn()
const mockStorageFrom = vi.fn()

type TableMock = Record<string, unknown>
let profilesMock: TableMock
let productImagesMock: TableMock

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        getUser: mockGetUser,
      },
      from: vi.fn((table: string) => {
        if (table === 'profiles') return profilesMock
        if (table === 'product_images') return productImagesMock
        throw new Error(`Unexpected table ${table}`)
      }),
      storage: {
        from: mockStorageFrom,
      },
    })
  ),
}))

vi.mock('next/cache', () => ({
  revalidatePath: (path: string) => mockRevalidatePath(path),
  revalidateTag: (...args: unknown[]) => mockRevalidateTag(...args),
}))

import {
  addProductImage,
  updateProductImageAlt,
  deleteProductImage,
} from '@/lib/actions/product-images'

const PROD_UUID = 'c1111111-1111-4111-8111-111111111111'
const IMG_UUID_1 = 'a1111111-1111-4111-8111-111111111111'

describe('Product Images Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-user-id' } },
      error: null,
    })

    profilesMock = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { role: 'admin' },
            error: null,
          }),
        }),
      }),
    }
  })

  describe('updateProductImageAlt', () => {
    it('successfully updates alt text when valid imageId and altText are provided', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })

      productImagesMock = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { product_id: PROD_UUID },
              error: null,
            }),
          }),
        }),
        update: mockUpdate,
      }

      const res = await updateProductImageAlt(IMG_UUID_1, 'Bamboo chair side view')

      expect(res).toEqual({ error: null })
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          alt_text: 'Bamboo chair side view',
        })
      )
      expect(mockRevalidatePath).toHaveBeenCalledWith(`/admin/products/${PROD_UUID}`)
    })

    it('rejects invalid image UUID format', async () => {
      const res = await updateProductImageAlt('invalid-uuid', 'Alt text')

      expect(res.error).toBe('Invalid image ID')
    })

    it('rejects alt text exceeding 150 characters', async () => {
      const longAlt = 'a'.repeat(151)
      const res = await updateProductImageAlt(IMG_UUID_1, longAlt)

      expect(res.error).toBe('Alt text must be 150 characters or fewer')
    })

    it('allows empty string and transforms to null', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })

      productImagesMock = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { product_id: PROD_UUID },
              error: null,
            }),
          }),
        }),
        update: mockUpdate,
      }

      const res = await updateProductImageAlt(IMG_UUID_1, '')

      expect(res).toEqual({ error: null })
      expect(mockUpdate).toHaveBeenCalledWith({
        alt_text: null,
      })
    })
  })

  describe('addProductImage', () => {
    it('successfully validates and inserts image metadata', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null })

      productImagesMock = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ sort_order: 0 }, { sort_order: 1 }],
            error: null,
          }),
        }),
        insert: mockInsert,
      }

      const res = await addProductImage(
        PROD_UUID,
        'https://example.com/storage/v1/object/public/product-images/test.jpg'
      )

      expect(res).toEqual({ error: null })
      expect(mockInsert).toHaveBeenCalledWith({
        product_id: PROD_UUID,
        url: 'https://example.com/storage/v1/object/public/product-images/test.jpg',
        alt_text: null,
        sort_order: 2,
      })
      expect(mockRevalidatePath).toHaveBeenCalledWith(`/admin/products/${PROD_UUID}`)
    })
  })

  describe('deleteProductImage', () => {
    it('successfully deletes image from database and storage bucket', async () => {
      const mockDbDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })
      const mockStorageRemove = vi.fn().mockResolvedValue({ error: null })

      mockStorageFrom.mockReturnValue({
        remove: mockStorageRemove,
      })

      productImagesMock = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: IMG_UUID_1,
                product_id: PROD_UUID,
                url: `https://example.com/storage/v1/object/public/product-images/${PROD_UUID}/test.webp`,
              },
              error: null,
            }),
          }),
        }),
        delete: mockDbDelete,
      }

      const res = await deleteProductImage(IMG_UUID_1)

      expect(res).toEqual({ error: null })
      expect(mockDbDelete).toHaveBeenCalled()
      expect(mockStorageFrom).toHaveBeenCalledWith('product-images')
      expect(mockStorageRemove).toHaveBeenCalledWith([`${PROD_UUID}/test.webp`])
      expect(mockRevalidatePath).toHaveBeenCalledWith(`/admin/products/${PROD_UUID}`)
    })

    it('returns error if image is not found', async () => {
      productImagesMock = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Row not found' },
            }),
          }),
        }),
      }

      const res = await deleteProductImage('non-existent-id')

      expect(res.error).toContain('Image not found')
    })
  })
})

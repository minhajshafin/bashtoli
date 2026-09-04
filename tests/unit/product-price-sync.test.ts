import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockRevalidatePath = vi.fn()
const mockRedirect = vi.fn()

// Define mock handlers per table
type TableMock = Record<string, unknown>
let profilesMock: TableMock
let productsMock: TableMock
let variantsMock: TableMock

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        getUser: mockGetUser,
      },
      from: vi.fn((table: string) => {
        if (table === 'profiles') return profilesMock
        if (table === 'products') return productsMock
        if (table === 'product_variants') return variantsMock
        throw new Error(`Unexpected table ${table}`)
      }),
    })
  ),
}))

vi.mock('next/cache', () => ({
  revalidatePath: (path: string) => mockRevalidatePath(path),
}))

vi.mock('next/navigation', () => ({
  redirect: (url: string) => mockRedirect(url),
}))

import { updateProduct, createProduct } from '@/lib/actions/products'
import { updateVariantsBulk } from '@/lib/actions/variants'

// RFC 4122 compliant UUIDs for Zod .uuid()
const PROD_UUID_1 = 'c1111111-1111-4111-8111-111111111111'
const PROD_UUID_2 = 'd2222222-2222-4222-8222-222222222222'
const PROD_UUID_3 = 'e3333333-3333-4333-8333-333333333333'
const VAR_UUID_1 = 'f4444444-4444-4444-8444-444444444444'
const VAR_UUID_2 = 'a5555555-5555-4555-8555-555555555555'

describe('Product Price Synchronization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-user-id' } } })

    profilesMock = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: { role: 'admin' } }),
        }),
      }),
    }
  })

  describe('updateProduct', () => {
    it('synchronizes single-variant price to base_price and revalidates storefront paths', async () => {
      const mockProductUpdateEq = vi.fn().mockResolvedValue({ error: null })
      const mockProductUpdate = vi.fn().mockReturnValue({ eq: mockProductUpdateEq })

      productsMock = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { slug: 'bamboo-lamp', base_price: 250 },
            }),
          }),
        }),
        update: mockProductUpdate,
      }

      const mockVariantUpdateEq = vi.fn().mockResolvedValue({ error: null })
      const mockVariantUpdate = vi.fn().mockReturnValue({ eq: mockVariantUpdateEq })

      variantsMock = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ id: VAR_UUID_1, price: 250, option_values: {} }],
            error: null,
          }),
        }),
        update: mockVariantUpdate,
      }

      const formData = new FormData()
      formData.set('id', PROD_UUID_1)
      formData.set('name', 'Bamboo Lamp')
      formData.set('slug', 'bamboo-lamp')
      formData.set('base_price', '350')
      formData.set('active', 'on')

      await updateProduct({ error: null }, formData)

      // Verify product table was updated with 350
      expect(mockProductUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          base_price: 350,
        })
      )

      // Verify variant price was updated to 350
      expect(mockVariantUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          price: 350,
        })
      )
      expect(mockVariantUpdateEq).toHaveBeenCalledWith('id', VAR_UUID_1)

      // Verify storefront cache revalidation
      expect(mockRevalidatePath).toHaveBeenCalledWith('/')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/products')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/products/bamboo-lamp')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/products')
      expect(mockRevalidatePath).toHaveBeenCalledWith(`/admin/products/${PROD_UUID_1}`)
    })

    it('synchronizes multi-variant prices matching previous base_price', async () => {
      const mockProductUpdateEq = vi.fn().mockResolvedValue({ error: null })
      const mockProductUpdate = vi.fn().mockReturnValue({ eq: mockProductUpdateEq })

      productsMock = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { slug: 'bamboo-chair', base_price: 400 },
            }),
          }),
        }),
        update: mockProductUpdate,
      }

      const mockVariantUpdateIn = vi.fn().mockResolvedValue({ error: null })
      const mockVariantUpdate = vi.fn().mockReturnValue({ in: mockVariantUpdateIn })

      variantsMock = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [
              { id: VAR_UUID_1, price: 400, option_values: { Color: 'Natural' } },
              { id: VAR_UUID_2, price: 400, option_values: { Color: 'Dark' } },
            ],
            error: null,
          }),
        }),
        update: mockVariantUpdate,
      }

      const formData = new FormData()
      formData.set('id', PROD_UUID_2)
      formData.set('name', 'Bamboo Chair')
      formData.set('slug', 'bamboo-chair')
      formData.set('base_price', '480')
      formData.set('active', 'on')

      await updateProduct({ error: null }, formData)

      expect(mockVariantUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          price: 480,
        })
      )
      expect(mockVariantUpdateIn).toHaveBeenCalledWith('id', [VAR_UUID_1, VAR_UUID_2])
      expect(mockRevalidatePath).toHaveBeenCalledWith('/products/bamboo-chair')
    })

    it('creates a default variant if product had no variants', async () => {
      productsMock = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { slug: 'bamboo-mat', base_price: 150 },
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }

      const mockVariantInsert = vi.fn().mockResolvedValue({ error: null })
      variantsMock = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
        insert: mockVariantInsert,
      }

      const formData = new FormData()
      formData.set('id', PROD_UUID_3)
      formData.set('name', 'Bamboo Mat')
      formData.set('slug', 'bamboo-mat')
      formData.set('base_price', '200')
      formData.set('active', 'on')

      await updateProduct({ error: null }, formData)

      expect(mockVariantInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          product_id: PROD_UUID_3,
          price: 200,
          stock_qty: 0,
          active: true,
          option_values: {},
        })
      )
    })
  })

  describe('createProduct', () => {
    it('creates a default variant matching base_price and revalidates storefront', async () => {
      productsMock = {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: PROD_UUID_1, slug: 'bamboo-tray' },
              error: null,
            }),
          }),
        }),
      }

      const mockVariantInsert = vi.fn().mockResolvedValue({ error: null })
      variantsMock = {
        insert: mockVariantInsert,
      }

      const formData = new FormData()
      formData.set('name', 'Bamboo Tray')
      formData.set('slug', 'bamboo-tray')
      formData.set('base_price', '220')
      formData.set('active', 'on')

      await createProduct({ error: null }, formData)

      expect(mockVariantInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          product_id: PROD_UUID_1,
          price: 220,
          active: true,
          option_values: {},
        })
      )
      expect(mockRevalidatePath).toHaveBeenCalledWith('/')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/products')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/products/bamboo-tray')
    })
  })

  describe('updateVariantsBulk', () => {
    it('synchronizes products.base_price to lowest variant price and revalidates storefront', async () => {
      const mockProductUpdateEq = vi.fn().mockResolvedValue({ error: null })
      const mockProductUpdate = vi.fn().mockReturnValue({
        eq: mockProductUpdateEq,
      })

      productsMock = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { slug: 'bamboo-shelf' },
            }),
          }),
        }),
        update: mockProductUpdate,
      }

      variantsMock = {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [
              { price: 320, active: true },
              { price: 380, active: true },
            ],
            error: null,
          }),
        }),
      }

      const res = await updateVariantsBulk(PROD_UUID_1, [
        {
          id: VAR_UUID_1,
          price: 320,
          stock_qty: 10,
          sku: 'BS-01',
          active: true,
        },
      ])

      expect(res.error).toBeNull()
      expect(mockProductUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          base_price: 320,
        })
      )
      expect(mockProductUpdateEq).toHaveBeenCalledWith('id', PROD_UUID_1)
      expect(mockRevalidatePath).toHaveBeenCalledWith('/')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/products')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/products/bamboo-shelf')
    })
  })
})

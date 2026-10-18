import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/search/route'

// Mock createPublicClient
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockIlike = vi.fn()
const mockOrder = vi.fn()
const mockLimit = vi.fn()

const mockSupabase = {
  from: vi.fn(() => ({
    select: mockSelect,
  })),
}

vi.mock('@/lib/supabase/server', () => ({
  createPublicClient: () => mockSupabase,
}))

describe('GET /api/search', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mock chain
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ ilike: mockIlike })
    mockIlike.mockReturnValue({ order: mockOrder })
    mockOrder.mockReturnValue({ limit: mockLimit })
  })

  it('returns empty products array when query parameter is omitted', async () => {
    const request = new Request('http://localhost:3000/api/search')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toEqual({ products: [] })
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns empty products array when query parameter is only whitespace', async () => {
    const request = new Request('http://localhost:3000/api/search?q=   ')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toEqual({ products: [] })
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('fetches and formats matching active products', async () => {
    mockLimit.mockResolvedValue({
      data: [
        {
          id: 'prod-1',
          name: 'Classic Fountain Pen',
          slug: 'classic-fountain-pen',
          base_price: 1250,
          categories: { name: 'Writing Tools', slug: 'writing-tools' },
          product_images: [
            { url: 'https://example.com/image-2.jpg', sort_order: 2 },
            { url: 'https://example.com/image-1.jpg', sort_order: 1 },
          ],
        },
      ],
      error: null,
    })

    const request = new Request('http://localhost:3000/api/search?q=fountain')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(mockSupabase.from).toHaveBeenCalledWith('products')
    expect(mockEq).toHaveBeenCalledWith('active', true)
    expect(mockIlike).toHaveBeenCalledWith('name', '%fountain%')
    expect(mockLimit).toHaveBeenCalledWith(6)

    expect(json.products).toEqual([
      {
        id: 'prod-1',
        name: 'Classic Fountain Pen',
        slug: 'classic-fountain-pen',
        price: 1250,
        categoryName: 'Writing Tools',
        imageUrl: 'https://example.com/image-1.jpg', // Lowest sort_order picked first
      },
    ])
  })

  it('handles database error by returning empty products with 500 status', async () => {
    mockLimit.mockResolvedValue({
      data: null,
      error: { message: 'Database connection failure' },
    })

    const request = new Request('http://localhost:3000/api/search?q=pen')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json).toEqual({ products: [] })
  })
})

import { NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase/server'
import { checkSearchRateLimit } from '@/lib/supabase/rate-limit'

export async function GET(request: Request) {
  // Apply per-IP rate limiter (prefix rl:search, 30 req / 60 s)
  const limitResult = await checkSearchRateLimit(request)
  if (limitResult.limited) {
    return NextResponse.json(
      { error: 'Too many search requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(limitResult.retryAfter) },
      }
    )
  }

  const { searchParams } = new URL(request.url)
  // Cap search query at 64 characters
  const rawQ = searchParams.get('q')?.trim() || ''
  const q = rawQ.slice(0, 64).trim()

  if (!q) {
    return NextResponse.json({ products: [] })
  }

  // Escape PostgreSQL LIKE special characters: backslash, percent, underscore
  const escapedQ = q.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')

  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        base_price,
        categories:category_id (name, slug),
        product_images (url, sort_order)
      `)
      .eq('active', true)
      .ilike('name', `%${escapedQ}%`)
      .order('created_at', { ascending: false })
      .limit(6)

    if (error) {
      console.error('Search API query error:', error)
      return NextResponse.json({ products: [] }, { status: 500 })
    }

    type RawSearchResult = {
      id: string
      name: string
      slug: string
      base_price: number
      categories: { name: string; slug: string } | null
      product_images: Array<{ url: string; sort_order: number }> | null
    }

    const items = (data || []) as unknown as RawSearchResult[]
    const formatted = items.map((item) => {
      const images = item.product_images ? [...item.product_images] : []
      images.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

      return {
        id: item.id,
        name: item.name,
        slug: item.slug,
        price: item.base_price,
        categoryName: item.categories?.name || null,
        imageUrl: images[0]?.url || null,
      }
    })

    return NextResponse.json({ products: formatted })
  } catch (err) {
    console.error('Search API unexpected error:', err)
    return NextResponse.json({ products: [] }, { status: 500 })
  }
}

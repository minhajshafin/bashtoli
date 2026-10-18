import { NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() || ''

  if (!q) {
    return NextResponse.json({ products: [] })
  }

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
      .ilike('name', `%${q}%`)
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

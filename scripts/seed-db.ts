import { createClient } from '@supabase/supabase-js'

async function seed() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Supabase environment variables (URL/Key) are missing.')
  }

  const supabase = createClient(url, key)

  console.log('Seeding E2E test database categories...')
  // 1. Insert E2E Test Category
  const { error: catError } = await supabase.from('categories').upsert({
    id: 'c1111111-1111-1111-1111-111111111111',
    name: 'E2E Test Category',
    slug: 'e2e-test-category',
    sort_order: 999,
  })
  if (catError) throw catError

  console.log('Seeding E2E test database products...')
  // 2. Insert E2E Test Product
  const { error: prodError } = await supabase.from('products').upsert({
    id: 'f1111111-1111-1111-1111-111111111111',
    category_id: 'c1111111-1111-1111-1111-111111111111',
    name: 'E2E Test Bamboo Product',
    slug: 'e2e-test-bamboo-product',
    description: 'An active bamboo test product seeded for Playwright checkout flow tests.',
    active: true,
  })
  if (prodError) throw prodError

  console.log('Seeding E2E test database variants...')
  // 3. Insert E2E Test Variant
  const { error: varError } = await supabase.from('product_variants').upsert({
    id: 'd1111111-1111-1111-1111-111111111111',
    product_id: 'f1111111-1111-1111-1111-111111111111',
    sku: 'E2E-TEST-SKU-001',
    price: 250.00,
    stock_qty: 150,
    active: true,
    option_values: {},
  })
  if (varError) throw varError

  console.log('Database seeded successfully for E2E tests!')
}

seed().catch(console.error)

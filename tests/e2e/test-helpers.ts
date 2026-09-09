import fs from 'node:fs'
import path from 'node:path'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

/**
 * Loads environment variables from .env.local if not already present.
 */
export function loadEnv(): void {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) return

  const envPath = path.resolve(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim()
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
        if (!process.env[key]) {
          process.env[key] = val
        }
      }
    }
  }
}

/**
 * Creates an administrative Supabase client using the service-role key.
 */
export function getAdminClient(): SupabaseClient {
  loadEnv()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Supabase URL or Service Role Key missing in environment.')
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Pre-seeds the database with a consistent test category, product, variant, and image.
 */
export async function ensureTestCatalog(): Promise<void> {
  const supabase = getAdminClient()

  // 1. Ensure test category
  const { error: catErr } = await supabase.from('categories').upsert({
    id: 'c1111111-1111-1111-1111-111111111111',
    name: 'E2E Test Category',
    slug: 'e2e-test-category',
    sort_order: 999,
  })
  if (catErr) console.warn('Catalog seed error (category):', catErr.message)

  // 2. Ensure test product
  const { error: prodErr } = await supabase.from('products').upsert({
    id: 'f1111111-1111-1111-1111-111111111111',
    category_id: 'c1111111-1111-1111-1111-111111111111',
    name: 'E2E Test Bamboo Product',
    slug: 'e2e-test-bamboo-product',
    description: 'An active bamboo test product seeded for Playwright checkout flow tests.',
    base_price: 250.00,
    active: true,
  })
  if (prodErr) console.warn('Catalog seed error (product):', prodErr.message)

  // 3. Ensure test variant with positive stock
  const { error: varErr } = await supabase.from('product_variants').upsert({
    id: 'd1111111-1111-1111-1111-111111111111',
    product_id: 'f1111111-1111-1111-1111-111111111111',
    sku: 'E2E-TEST-SKU-001',
    price: 250.00,
    stock_qty: 150,
    active: true,
    option_values: {},
  })
  if (varErr) console.warn('Catalog seed error (variant):', varErr.message)

  // 4. Ensure test product image
  const { error: imgErr } = await supabase.from('product_images').upsert({
    id: 'e1111111-1111-1111-1111-111111111111',
    product_id: 'f1111111-1111-1111-1111-111111111111',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600',
    sort_order: 0,
    alt_text: 'E2E Test Bamboo Product',
  })
  if (imgErr) console.warn('Catalog seed error (image):', imgErr.message)
}

/**
 * Creates or retrieves a confirmed customer user for testing.
 */
export async function createOrGetTestCustomer(
  email: string,
  password = 'testpassword123',
  fullName = 'Test Customer',
  phone = '01712345678'
): Promise<{ id: string; email: string; password: string; phone: string }> {
  const supabase = getAdminClient()

  // Check if user already exists
  const { data: users } = await supabase.auth.admin.listUsers()
  const existing = users?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())

  let userId: string

  if (existing) {
    userId = existing.id
    // Update password to known test password and ensure email is confirmed
    await supabase.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })
  } else {
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })
    if (error || !newUser.user) {
      throw new Error(`Failed to create test customer ${email}: ${error?.message}`)
    }
    userId = newUser.user.id
  }

  // Update profile phone and full name
  await supabase
    .from('profiles')
    .update({
      phone,
      full_name: fullName,
    })
    .eq('id', userId)

  return { id: userId, email, password, phone }
}

/**
 * Helper to log in a user through the UI form.
 */
export async function loginViaUI(page: Page, email: string, password = 'mypassword123'): Promise<void> {
  await page.goto('/login')
  await expect(page.locator('h1')).toContainText(/Welcome Back|Member Sign In/i)

  await page.fill('input#email', email)
  await page.fill('input#password', password)
  await page.click('button[type="submit"]')

  // Wait for redirection away from login page
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 })
}

/**
 * Creates an unclaimed guest order matching an email and phone number.
 */
export async function createTestGuestOrder(
  email: string,
  phone = '01712345678',
  customerName = 'Test Guest User'
): Promise<{ id: string; order_number: string }> {
  const supabase = getAdminClient()
  await ensureTestCatalog()

  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  const orderNumber = `ORD-CLAIM-${randomSuffix}`

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_id: null,
      customer_name: customerName,
      phone,
      guest_email: email,
      address: '123 Test Street, Gulshan, Dhaka',
      fulfillment_type: 'delivery',
      delivery_zone: 'inside_dhaka',
      subtotal: 250,
      delivery_fee: 80,
      total: 330,
      status: 'pending',
    })
    .select('id, order_number')
    .single()

  if (orderErr || !order) {
    throw new Error(`Failed to create guest order: ${orderErr?.message}`)
  }

  // Insert order item
  await supabase.from('order_items').insert({
    order_id: order.id,
    product_id: 'f1111111-1111-1111-1111-111111111111',
    variant_id: 'd1111111-1111-1111-1111-111111111111',
    product_name: 'E2E Test Bamboo Product',
    price_at_purchase: 250,
    qty: 1,
  })

  return order
}


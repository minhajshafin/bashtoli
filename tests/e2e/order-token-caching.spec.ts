import { test, expect } from '@playwright/test'
import {
  ensureTestCatalog,
  createTestGuestOrder,
  getAdminClient,
  deleteTestOrder,
} from './test-helpers'

test.describe('Order Confirmation Dynamic Token Verification & Cache Segregation', () => {
  let testOrderId: string | undefined
  let testOrderNumber: string | undefined
  let validAccessToken: string | undefined
  const customerName = 'Shafin Chowdhury'
  const customerPhone = '01712345678'
  const customerAddress = 'House 42, Road 7, Dhanmondi, Dhaka'

  test.beforeAll(async () => {
    await ensureTestCatalog()
    const guestOrder = await createTestGuestOrder(
      `e2e-token-test-${Date.now()}@example.com`,
      customerPhone,
      customerName
    )
    testOrderId = guestOrder.id
    testOrderNumber = guestOrder.order_number
    validAccessToken = guestOrder.access_token

    // Update address to ensure Dhanmondi address is present
    const supabase = getAdminClient()
    await supabase
      .from('orders')
      .update({ address: customerAddress })
      .eq('id', testOrderId)
  })

  test.afterAll(async () => {
    if (testOrderId) {
      await deleteTestOrder(testOrderId)
    }
  })

  test('request without token does NOT contain sensitive customer data in HTML shell', async ({ request, baseURL }) => {
    const url = `${baseURL}/order/${testOrderNumber}`
    const response = await request.get(url)
    expect(response.status()).toBe(200)

    const html = await response.text()
    // Confirm no PII appears in HTML
    expect(html).not.toContain(customerName)
    expect(html).not.toContain(customerPhone)
    expect(html).not.toContain(customerAddress)
    // Confirms gate UI is served
    expect(html).toContain('Verify Phone Number')
  })

  test('request with invalid/different token does NOT leak customer data', async ({ request, baseURL }) => {
    const invalidToken = 'sec-tok-invalid-attacker-token-99999'
    const url = `${baseURL}/order/${testOrderNumber}?token=${invalidToken}`
    const response = await request.get(url)
    expect(response.status()).toBe(200)

    const html = await response.text()
    // Confirm no PII appears in HTML
    expect(html).not.toContain(customerName)
    expect(html).not.toContain(customerPhone)
    expect(html).not.toContain(customerAddress)
    // Confirms gate UI is served
    expect(html).toContain('Verify Phone Number')
  })

  test('request with valid token resolves full order details in server response', async ({ request, baseURL }) => {
    const url = `${baseURL}/order/${testOrderNumber}?token=${validAccessToken}`
    const response = await request.get(url)
    expect(response.status()).toBe(200)

    const html = await response.text()
    // Confirm PII is present for legitimate authorized token
    expect(html).toContain(customerName)
    expect(html).toContain(customerAddress)
    expect(html).toContain('Cash on Delivery Reminder')
  })

  test('subsequent request with different token immediately following valid token is not served from cache', async ({ page }) => {
    // 1. Visit with valid token -> full details visible
    await page.goto(`/order/${testOrderNumber}?token=${validAccessToken}`)
    await expect(page.getByText(customerName)).toBeVisible()
    await expect(page.getByText(customerAddress)).toBeVisible()

    // 2. Open a new incognito context or navigate with different token -> strictly gated
    const differentToken = 'sec-tok-different-user-attempt-11111'
    await page.goto(`/order/${testOrderNumber}?token=${differentToken}`)
    await expect(page.getByRole('heading', { name: 'Verify Phone Number' })).toBeVisible()
    await expect(page.locator('body')).not.toContainText(customerName)
    await expect(page.locator('body')).not.toContainText(customerAddress)
  })
})

import { test, expect } from '@playwright/test'
import { ensureTestCatalog, createTestGuestOrder } from './test-helpers'

test.describe('E2E Guest Checkout & Order Tracking Flow', () => {
  test.beforeAll(async () => {
    await ensureTestCatalog()
  })

  test('should complete browse, add to bag, and checkout happy path with ?token= redirect and full view', async ({
    page,
  }) => {
    // 1. Navigate to storefront products listing
    await page.goto('/products')
    await expect(page).toHaveTitle(/Stationery|Products/i)

    // 2. Select the seeded test product
    const productCardLink = page.locator('a[href="/products/e2e-test-bamboo-product"]').first()
    await expect(productCardLink).toBeVisible({ timeout: 15000 })
    await productCardLink.click()

    // 3. Open product details and add to bag
    await expect(page).toHaveURL(/\/products\/e2e-test-bamboo-product/)
    await expect(page.locator('h1', { hasText: 'E2E Test Bamboo Product' })).toBeVisible()

    const addToBagButton = page.getByRole('button', { name: 'Add to Bag', exact: true })
    await expect(addToBagButton).toBeVisible()
    await addToBagButton.click()

    // Wait for toast or brief animation
    await page.waitForTimeout(500)

    // Click cart/bag link in navigation to open shopping bag drawer
    const bagLink = page.locator('a[href="/bag"]').first()
    await expect(bagLink).toBeVisible()
    await bagLink.click()

    // Drawer opens: click "View Full Shopping Bag" to navigate to /bag
    const viewFullBagLink = page.getByRole('link', { name: 'View Full Shopping Bag' })
    await expect(viewFullBagLink).toBeVisible()
    await viewFullBagLink.click()

    // 4. Verify bag page load and item presence
    await expect(page).toHaveURL(/\/bag/)
    await expect(page.locator('h1', { hasText: /Shopping Bag/i })).toBeVisible()
    await expect(page.locator('body')).toContainText('E2E Test Bamboo Product')

    // Click "Proceed to Checkout"
    const checkoutLink = page.locator('a[href="/checkout"]').first()
    await expect(checkoutLink).toBeVisible()
    await checkoutLink.click()

    // 5. Fill out shipping details in checkout form
    await expect(page).toHaveURL(/\/checkout/)
    await expect(page.locator('h1', { hasText: 'Checkout' })).toBeVisible()

    await page.fill('#customer_name', 'Playwright E2E Client')
    await page.fill('#phone', '01712345678')
    await page.fill('#guest_email', 'e2e-client@example.com')
    await page.fill('#address', 'Road 5, Block B, Banani, Dhaka')
    await page.fill('#notes', 'Deliver after 5 PM, drop with security guard.')

    // Choose Inside Dhaka shipping zone
    const zoneButton = page.locator('button:has-text("Inside Dhaka")')
    await expect(zoneButton).toBeVisible()
    await zoneButton.click()

    // Submit Cash on Delivery order
    const placeOrderButton = page.locator('button:has-text("Place Order")').first()
    await expect(placeOrderButton).toBeVisible()
    await placeOrderButton.click()

    // 6. Verify order confirmation screen and tracking details with ?token= query param
    // Sequence matches ORD-YYYYMMDD-NNNN?token=[a-f0-9]{64}
    await page.waitForURL(/\/order\/ORD-\d{8}-\d{4}\?token=[a-f0-9]{64}/, { timeout: 25000 })
    await expect(page.locator('h1', { hasText: /Thank you/i })).toBeVisible()

    const pageBody = page.locator('body')
    await expect(pageBody).toContainText('Playwright E2E Client')
    await expect(pageBody).toContainText('ORD-')
    await expect(pageBody).toContainText('E2E Test Bamboo Product')
    await expect(pageBody).toContainText('Road 5, Block B, Banani, Dhaka')
  })

  test('should display verification gate when visiting order without token and allow partial tracking via phone verification', async ({
    browser,
  }) => {
    // 1. Create a guest order using helper
    const uniqueId = Date.now()
    const testEmail = `e2e-token-gate-${uniqueId}@example.com`
    const testPhone = '01799887766'
    const customerName = 'Secret Customer Name'
    const guestOrder = await createTestGuestOrder(testEmail, testPhone, customerName)

    // 2. Open order URL directly in a clean browser context without token
    const context = await browser.newContext()
    const page = await context.newPage()

    await page.goto(`/order/${guestOrder.order_number}`)

    // 3. Verify Verification Gate is rendered
    await expect(page.locator('h1', { hasText: 'Verify Phone Number' })).toBeVisible({ timeout: 15000 })
    await expect(page.locator('body')).toContainText('Security Verification')
    // PII must NOT be visible in verification gate
    await expect(page.locator('body')).not.toContainText(customerName)
    await expect(page.locator('body')).not.toContainText(testEmail)
    await expect(page.locator('body')).not.toContainText('123 Test Street')

    // 4. Submit phone number verification
    await page.fill('input#phone', testPhone)
    await page.click('button[type="submit"]:has-text("Track Order")')

    // 5. Verify redirect / URL does NOT leak phone in query parameters
    await expect(page).toHaveURL(`/order/${guestOrder.order_number}`)
    expect(page.url()).not.toContain('phone=')
    expect(page.url()).not.toContain('token=')

    // 6. Verify Partial View is rendered
    await expect(page.locator('h1', { hasText: 'Order Tracking' })).toBeVisible({ timeout: 15000 })
    await expect(page.locator('body')).toContainText('Ordered Items')
    await expect(page.locator('body')).toContainText('E2E Test Bamboo Product')

    // Recipient contact and address details must be omitted in partial view
    await expect(page.locator('body')).not.toContainText(customerName)
    await expect(page.locator('body')).not.toContainText(testPhone)
    await expect(page.locator('body')).not.toContainText(testEmail)
    await expect(page.locator('body')).not.toContainText('123 Test Street')

    await context.close()
  })

  test('should grant full view when valid token is provided in query params', async ({ browser }) => {
    const uniqueId = Date.now()
    const testEmail = `e2e-token-full-${uniqueId}@example.com`
    const testPhone = '01711223344'
    const customerName = 'Authorized Full Viewer'
    const guestOrder = await createTestGuestOrder(testEmail, testPhone, customerName)

    const context = await browser.newContext()
    const page = await context.newPage()

    // Visit with valid token
    await page.goto(`/order/${guestOrder.order_number}?token=${guestOrder.access_token}`)

    // Full view rendered: recipient name, address, items, and thank you / order confirmation
    await expect(page.locator('h1', { hasText: /Thank you/i })).toBeVisible({ timeout: 15000 })
    await expect(page.locator('body')).toContainText(customerName)
    await expect(page.locator('body')).toContainText('123 Test Street')
    await expect(page.locator('body')).toContainText('E2E Test Bamboo Product')

    await context.close()
  })

  test('should look up order from /order/lookup and render partial tracking view', async ({ browser }) => {
    const uniqueId = Date.now()
    const testEmail = `e2e-lookup-${uniqueId}@example.com`
    const testPhone = '01755667788'
    const customerName = 'Lookup Test Customer'
    const guestOrder = await createTestGuestOrder(testEmail, testPhone, customerName)

    const context = await browser.newContext()
    const page = await context.newPage()

    await page.goto('/order/lookup')
    await expect(page.locator('h1', { hasText: 'Track Your Order' })).toBeVisible({ timeout: 15000 })

    await page.fill('input#order_number', guestOrder.order_number)
    await page.fill('input#phone', testPhone)
    await page.click('button[type="submit"]:has-text("Track Order")')

    // Navigates to /order/[orderNumber] without phone in URL
    await expect(page).toHaveURL(`/order/${guestOrder.order_number}`, { timeout: 15000 })
    expect(page.url()).not.toContain('phone=')

    // Partial view rendered
    await expect(page.locator('h1', { hasText: 'Order Tracking' })).toBeVisible({ timeout: 15000 })
    await expect(page.locator('body')).not.toContainText(customerName)
    await expect(page.locator('body')).not.toContainText('123 Test Street')

    await context.close()
  })
})

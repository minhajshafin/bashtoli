import { test, expect } from '@playwright/test'
import { ensureTestCatalog } from './test-helpers'

test.describe('E2E Guest Checkout Flow', () => {
  test.beforeAll(async () => {
    await ensureTestCatalog()
  })

  test('should complete browse, add to bag, and checkout happy path successfully', async ({ page }) => {
    // 1. Navigate to storefront products listing
    await page.goto('/products')
    await expect(page).toHaveTitle(/Products/i)

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

    // Click cart/bag link in navigation to view shopping bag
    const bagLink = page.locator('a[href="/bag"]').first()
    await expect(bagLink).toBeVisible()
    await bagLink.click()

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

    await page.fill('input#customer_name', 'Playwright E2E Client')
    await page.fill('input#phone', '01712345678')
    await page.fill('input#guest_email', 'e2e-client@example.com')
    await page.fill('textarea#address', 'Road 5, Block B, Banani, Dhaka')
    await page.fill('textarea#notes', 'Deliver after 5 PM, drop with security guard.')

    // Choose Inside Dhaka shipping zone
    const zoneButton = page.locator('button:has-text("Inside Dhaka")')
    await expect(zoneButton).toBeVisible()
    await zoneButton.click()

    // Submit Cash on Delivery order
    const placeOrderButton = page.locator('button:has-text("Place Order")')
    await expect(placeOrderButton).toBeVisible()
    await placeOrderButton.click()

    // 6. Verify order confirmation screen and tracking details
    // Sequence matches ORD-YYYYMMDD-NNNN
    await page.waitForURL(/\/order\/ORD-\d{8}-\d{4}/, { timeout: 25000 })
    await expect(page.locator('h1', { hasText: /Thank you/i })).toBeVisible()

    const pageBody = page.locator('body')
    await expect(pageBody).toContainText('Playwright E2E Client')
    await expect(pageBody).toContainText('ORD-')
    await expect(pageBody).toContainText('E2E Test Bamboo Product')
  })
})

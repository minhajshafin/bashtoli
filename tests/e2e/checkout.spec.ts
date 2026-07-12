import { test, expect } from '@playwright/test'

test.describe('E2E Guest Checkout Flow', () => {
  test('should complete browse, add to cart, and checkout happy path successfully', async ({ page }) => {
    // 1. Navigate to storefront products listing
    await page.goto('/products')
    await expect(page).toHaveTitle(/Products/i)

    // 2. Select the seeded test product
    const productCardLink = page.locator('a[href="/products/e2e-test-bamboo-product"]')
    await expect(productCardLink).toBeVisible({ timeout: 10000 })
    await productCardLink.click()

    // 3. Open product details and add to cart
    await expect(page).toHaveURL(/\/products\/e2e-test-bamboo-product/)
    await expect(page.locator('h1')).toContainText('E2E Test Bamboo Product')
    
    const addToCartButton = page.locator('button:has-text("Add to Cart")')
    await expect(addToCartButton).toBeVisible()
    await addToCartButton.click()

    // Click cart icon in navigation header to view cart
    const cartIconLink = page.locator('a[href="/cart"]')
    await expect(cartIconLink).toBeVisible()
    await cartIconLink.click()

    // 4. Verify cart page load and item presence
    await expect(page).toHaveURL(/\/cart/)
    await expect(page.locator('h1')).toContainText('Shopping Cart')
    await expect(page.locator('body')).toContainText('E2E Test Bamboo Product')

    // Click "Proceed to Checkout" link
    const checkoutLink = page.locator('a[href="/checkout"]')
    await expect(checkoutLink).toBeVisible()
    await checkoutLink.click()

    // 5. Fill out shipping details in checkout form
    await expect(page).toHaveURL(/\/checkout/)
    await expect(page.locator('h1')).toContainText('Checkout')

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
    // Matches ORD-YYYYMMDD-NNNN dynamic sequence
    await page.waitForURL(/\/order\/ORD-\d{8}-\d{4}/, { timeout: 20000 })
    await expect(page.locator('h1')).toContainText('Order Status')
    
    // Check client name, order number prefix, and product details exist in the page body
    const pageBody = page.locator('body')
    await expect(pageBody).toContainText('Playwright E2E Client')
    await expect(pageBody).toContainText('ORD-')
    await expect(pageBody).toContainText('E2E Test Bamboo Product')
  })
})

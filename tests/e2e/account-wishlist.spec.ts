import { test, expect } from '@playwright/test'
import {
  ensureTestCatalog,
  createOrGetTestCustomer,
  getAdminClient,
  loginViaUI,
} from './test-helpers'

test.describe('Account Wishlist Persistence & Interactions', () => {
  test.beforeAll(async () => {
    await ensureTestCatalog()
  })

  test('guest can toggle wishlist on product card with optimistic UI feedback', async ({ page }) => {
    await page.goto('/products')
    await expect(page).toHaveTitle(/Products/i)

    // Find the first product card's wishlist button
    const firstWishlistButton = page.locator('button[aria-label="Add to wishlist"]').first()
    await expect(firstWishlistButton).toBeVisible({ timeout: 15000 })

    // Click to add to wishlist
    await firstWishlistButton.click()

    // Expect button to toggle to "Remove from wishlist"
    const removeWishlistButton = page.locator('button[aria-label="Remove from wishlist"]').first()
    await expect(removeWishlistButton).toBeVisible({ timeout: 10000 })

    // Click again to toggle back
    await removeWishlistButton.click()
    await expect(firstWishlistButton).toBeVisible({ timeout: 10000 })
  })

  test('authenticated customer wishlist syncs to database and /account/wishlist', async ({ page }) => {
    const testEmail = 'e2e-wishlist-user@example.com'
    const customer = await createOrGetTestCustomer(testEmail, 'testpassword123', 'Wishlist Customer')

    // Clean any prior wishlist records for this customer
    const supabase = getAdminClient()
    await supabase.from('wishlist').delete().eq('user_id', customer.id)

    // 1. Log in as customer
    await loginViaUI(page, testEmail, 'testpassword123')

    // 2. Navigate to product detail page
    await page.goto('/products/e2e-test-bamboo-product')
    await expect(page.locator('h1')).toContainText('E2E Test Bamboo Product')

    const addWishlistButton = page.locator('button[aria-label="Add to wishlist"]').first()
    await expect(addWishlistButton).toBeVisible({ timeout: 15000 })

    // Click to add to wishlist
    await addWishlistButton.click()
    const removeBtnPDP = page.locator('button[aria-label="Remove from wishlist"]').first()
    await expect(removeBtnPDP).toBeVisible({ timeout: 10000 })
    await expect(removeBtnPDP).toBeEnabled({ timeout: 10000 })

    // 3. Navigate to /account/wishlist
    await page.goto('/account/wishlist')
    await expect(page).toHaveURL(/\/account\/wishlist/)
    await expect(page.locator('h1')).toContainText(/My Wishlist/i)

    // 4. Verify the product appears on the wishlist page
    const pageBody = page.locator('body')
    await expect(pageBody).toContainText('E2E Test Bamboo Product')

    // 5. Remove the item using the card remove button
    const removeBtn = page.locator('button[title="Remove from Wishlist"]').first()
    await expect(removeBtn).toBeVisible({ timeout: 10000 })
    await removeBtn.click()

    // 6. Verify item is removed
    await expect(page.locator('button[title="Remove from Wishlist"]')).toHaveCount(0, { timeout: 10000 })
  })
})

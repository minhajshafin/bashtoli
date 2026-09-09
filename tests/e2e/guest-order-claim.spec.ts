import { test, expect } from '@playwright/test'
import {
  ensureTestCatalog,
  createTestGuestOrder,
  createOrGetTestCustomer,
  loginViaUI,
} from './test-helpers'

test.describe('Guest Order Claiming Flow', () => {
  test.beforeAll(async () => {
    await ensureTestCatalog()
  })

  test('should detect unclaimed guest order and link it to customer account via RPC', async ({ page }) => {
    const uniqueId = Date.now()
    const testEmail = `e2e-claim-${uniqueId}@example.com`
    const testPhone = '01712345678'
    const customerName = `Claim Customer ${uniqueId.toString().slice(-4)}`

    // 1. Create an unclaimed guest order with this phone and email
    const guestOrder = await createTestGuestOrder(testEmail, testPhone, customerName)

    // 2. Create the customer account matching this email and phone
    await createOrGetTestCustomer(testEmail, 'testpassword123', customerName, testPhone)

    // 3. Log in as this customer
    await loginViaUI(page, testEmail, 'testpassword123')

    // 4. Navigate to /account/orders
    await page.goto('/account/orders')
    await expect(page).toHaveURL(/\/account\/orders/)

    // 5. Verify the ClaimOrdersPrompt banner detects the order
    const claimBanner = page.locator('text=Unlinked Guest Orders Found')
    await expect(claimBanner).toBeVisible({ timeout: 15000 })

    // Verify order number is present in the claim banner
    await expect(page.locator('body')).toContainText(guestOrder.order_number)

    // 6. Click the link orders button
    const claimButton = page.locator('button:has-text("Link Orders to My Account")')
    await expect(claimButton).toBeVisible()
    await claimButton.click()

    // 7. Verify toast confirmation and that the order is claimed into order history
    const toastMessage = page.locator('text=Successfully linked')
    await expect(toastMessage).toBeVisible({ timeout: 15000 })

    // Reload page to verify persistence in permanent order history list
    await page.reload()
    await expect(page.locator('body')).toContainText(guestOrder.order_number)
  })
})

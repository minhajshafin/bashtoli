import { test, expect } from '@playwright/test'
import { ensureTestCatalog, loginViaUI } from './test-helpers'

test.describe('Admin Order Lifecycle & Fulfillment', () => {
  test.beforeAll(async () => {
    await ensureTestCatalog()
  })

  test('admin should view orders list, inspect order details, and transition status', async ({ page }) => {
    // 1. Log in via UI as admin
    await loginViaUI(page, 'admin@example.com', 'mypassword123')

    // 2. Navigate to Admin Orders list
    await page.goto('/admin/orders')
    await expect(page.locator('h1')).toContainText('Orders')

    // 3. Ensure at least one order exists in the table
    const orderDetailLink = page.locator('a[href^="/admin/orders/"]').first()
    await expect(orderDetailLink).toBeVisible({ timeout: 15000 })

    // Click to view order details
    await orderDetailLink.click()

    // 4. Verify order details page snapshot
    await expect(page).toHaveURL(/\/admin\/orders\/[0-9a-fA-F-]+/)
    await expect(page.locator('h1')).toContainText(/ORD-/i)
    await expect(page.locator('h2:has-text("Purchased Items")')).toBeVisible()

    // 5. Test status transition
    const statusSelect = page.locator('select#order-status-select-input')
    await expect(statusSelect).toBeVisible()

    const currentStatus = await statusSelect.inputValue()

    // Determine target valid transition
    let targetStatus: string | null = null
    if (currentStatus === 'pending') {
      targetStatus = 'confirmed'
    } else if (currentStatus === 'confirmed') {
      targetStatus = 'shipped'
    } else if (currentStatus === 'shipped') {
      targetStatus = 'delivered'
    }

    if (targetStatus) {
      await statusSelect.selectOption(targetStatus)

      // Verify the select value updated
      await expect(statusSelect).toHaveValue(targetStatus, { timeout: 10000 })

      // Verify top status badge updates to reflect new status
      const headerBadge = page.locator('h1 + span')
      await expect(headerBadge).toContainText(targetStatus, { timeout: 10000 })

      // Verify status history section displays an entry
      const historySection = page.locator('body')
      await expect(historySection).toContainText(/Status History/i)
    }
  })
})

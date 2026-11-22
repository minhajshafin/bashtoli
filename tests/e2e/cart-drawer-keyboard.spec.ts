import { test, expect } from '@playwright/test'
import { resetRateLimits } from './test-helpers'

test.describe('Cart Drawer Keyboard Navigation & Accessibility', () => {
  test.beforeEach(async () => {
    await resetRateLimits()
  })

  test('should open drawer, trap focus, dismiss with Escape, and return focus to trigger', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/')

    const cartTrigger = page.getByRole('link', { name: /View Shopping Bag/i })
    await expect(cartTrigger).toBeVisible()

    // 1. Focus the trigger and open the drawer
    await cartTrigger.focus()
    await expect(cartTrigger).toBeFocused()
    await cartTrigger.click()

    // 2. Drawer dialog appears
    const drawerDialog = page.getByRole('dialog', { name: 'Shopping Bag Drawer' })
    await expect(drawerDialog).toBeVisible()

    // 3. Verify focus moves inside the drawer
    const closeButton = page.getByRole('button', { name: 'Close Shopping Bag' })
    await expect(closeButton).toBeFocused({ timeout: 3000 })

    // 4. Test Tab keyboard trapping inside drawer
    // Find all focusable elements inside the dialog
    const focusables = drawerDialog.locator(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const count = await focusables.count()
    expect(count).toBeGreaterThan(1)

    // Move to the last focusable element
    const lastElement = focusables.nth(count - 1)
    await lastElement.focus()
    await expect(lastElement).toBeFocused()

    // Press Tab from last element -> should cycle back to first element
    await page.keyboard.press('Tab')
    const firstElement = focusables.first()
    await expect(firstElement).toBeFocused()

    // Press Shift+Tab from first element -> should cycle back to last element
    await page.keyboard.press('Shift+Tab')
    await expect(lastElement).toBeFocused()

    // 5. Press Escape -> dismisses drawer
    await page.keyboard.press('Escape')
    await expect(drawerDialog).toBeHidden({ timeout: 3000 })

    // 6. Focus should be restored to the cart trigger button/link
    await expect(cartTrigger).toBeFocused({ timeout: 3000 })
  })
})

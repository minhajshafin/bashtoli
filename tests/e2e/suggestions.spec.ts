import { test, expect } from '@playwright/test'

test.describe('Customer Suggestions & Honeypot Bot Defense', () => {
  test('should submit a valid item suggestion and display confirmation banner', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Bashtoli/i)

    // Locate suggestion section
    const suggestionSection = page.locator('text=Help Us Grow')
    await expect(suggestionSection).toBeVisible({ timeout: 15000 })

    // Fill valid submission details
    await page.fill('#suggestion-name', 'E2E Bamboo Fan')
    await page.fill('#suggestion-contact', '01712345678')
    await page.fill('#suggestion-message', 'We would love handcrafted bamboo tea strainers and pen holders!')

    // Submit form
    const submitBtn = page.locator('button[type="submit"]:has-text("Share with us")')
    await expect(submitBtn).toBeVisible()
    await submitBtn.click()

    // Verify confirmation message
    const confirmationText = page.locator('text=Thank you — we\'ll look into it')
    await expect(confirmationText).toBeVisible({ timeout: 15000 })

    // Verify reset capability
    const resetBtn = page.locator('button:has-text("Suggest another item")')
    await expect(resetBtn).toBeVisible()
    await resetBtn.click()

    // Verify form is visible again
    await expect(page.locator('#suggestion-message')).toBeVisible({ timeout: 5000 })
  })

  test('should silently acknowledge bot submissions when honeypot is triggered', async ({ page }) => {
    await page.goto('/')

    // Fill form and trigger hidden honeypot
    await page.fill('#suggestion-name', 'Automated Spammer')
    await page.fill('#suggestion-contact', 'spam@automated-bot.net')
    await page.locator('input[name="b_hp_check"]').fill('spam_trap_triggered', { force: true })
    await page.fill('#suggestion-message', 'Visit spam site for special discounts!')

    // Submit form
    const submitBtn = page.locator('button[type="submit"]:has-text("Share with us")')
    await expect(submitBtn).toBeVisible()
    await submitBtn.click()

    // Verify it silently handles the submission without crashing
    const confirmationText = page.locator('text=Thank you — we\'ll look into it')
    await expect(confirmationText).toBeVisible({ timeout: 15000 })
  })
})

import { test, expect } from '@playwright/test'
import { ensureTestCatalog, createOrGetTestAdmin, loginViaUI } from './test-helpers'

test.describe('Admin Storefront Customization', () => {
  test.beforeAll(async () => {
    await ensureTestCatalog()
  })

  test('admin should update hero slide badge and reflect on storefront homepage', async ({ page }) => {
    // 1. Provision dedicated E2E admin with random credentials
    const adminEmail = `e2e-admin-storefront-${Date.now()}@example.com`
    const adminPassword = `AdminPass_${Date.now()}_${Math.random().toString(36).slice(2, 8)}!`
    const admin = await createOrGetTestAdmin(adminEmail, adminPassword)

    // Log in as admin
    await loginViaUI(page, admin.email, admin.password)

    // 2. Navigate to Storefront Management
    await page.goto('/admin/storefront')
    await expect(page.locator('h1')).toContainText('Storefront Settings')

    // 3. Find first slide edit button in HeroSlidesManager
    const editButton = page.locator('button:has-text("Edit Badge / Text")').first()
    await expect(editButton).toBeVisible({ timeout: 15000 })
    await editButton.click()

    // 4. Locate the Badge Text input
    const badgeInput = page.locator('label:has-text("Badge Text") + input').first()
    await expect(badgeInput).toBeVisible()

    const originalBadge = await badgeInput.inputValue()
    const testBadge = 'E2E Hero ' + Date.now().toString().slice(-4)

    // Fill new badge text
    await badgeInput.fill(testBadge)

    // Click Save Changes
    const saveButton = page.locator('button:has-text("Save Changes")').first()
    await expect(saveButton).toBeVisible()
    await saveButton.click()

    // Wait for success confirmation
    await expect(page.locator('text=Slide updated successfully')).toBeVisible({ timeout: 15000 })

    // 5. Navigate to storefront homepage
    await page.goto('/')
    await expect(page.locator('body')).toContainText(testBadge, { timeout: 15000 })

    // 6. Cleanup: revert to original badge
    await page.goto('/admin/storefront')
    const cleanupEditBtn = page.locator('button:has-text("Edit Badge / Text")').first()
    await cleanupEditBtn.click()

    const cleanupInput = page.locator('label:has-text("Badge Text") + input').first()
    await cleanupInput.fill(originalBadge || 'New Collection')
    await page.locator('button:has-text("Save Changes")').first().click()
    await expect(page.locator('text=Slide updated successfully')).toBeVisible({ timeout: 15000 })
  })
})

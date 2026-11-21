import { chromium } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const OUTPUT_DIR = '/home/billy/.gemini/antigravity/brain/a8bfbfcb-711f-4671-a03f-549f09d1e63f/screenshots'
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

const VIEWPORTS = [
  { name: '390px', width: 390, height: 844, isMobile: true },
  { name: '1280px', width: 1280, height: 800, isMobile: false },
]

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })

  try {
    for (const vp of VIEWPORTS) {
      console.log(`\nCapturing screenshots for viewport ${vp.name}...`)
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.isMobile,
        hasTouch: vp.isMobile,
      })

      const page = await context.newPage()

      // 1. /bag Empty State
      console.log(`- Capturing /bag empty state (${vp.name})...`)
      await page.goto('http://localhost:3000/bag', { waitUntil: 'networkidle' })
      await page.waitForTimeout(500)
      await page.screenshot({
        path: path.join(OUTPUT_DIR, `bag-empty-${vp.name}.png`),
        fullPage: false,
      })
      await page.screenshot({
        path: path.join(OUTPUT_DIR, `bag-empty-${vp.name}-full.png`),
        fullPage: true,
      })

      // 2. Add item to cart via PDP
      console.log(`- Adding item to cart via PDP (${vp.name})...`)
      await page.goto('http://localhost:3000/products/classic-ruled-school-notebook', { waitUntil: 'networkidle' })
      const optionA5 = page.getByRole('button', { name: 'A5', exact: true })
      if (await optionA5.isVisible()) {
        await optionA5.click()
        await page.waitForTimeout(300)
      }
      const addToBagBtn = page.getByRole('button', { name: 'Add to Bag' }).first()
      await addToBagBtn.waitFor({ state: 'visible' })
      await addToBagBtn.click()
      await page.waitForTimeout(800)

      // 3. /bag With Items
      console.log(`- Capturing /bag with items (${vp.name})...`)
      await page.goto('http://localhost:3000/bag', { waitUntil: 'networkidle' })
      await page.waitForTimeout(500)
      await page.screenshot({
        path: path.join(OUTPUT_DIR, `bag-items-${vp.name}.png`),
        fullPage: false,
      })
      await page.screenshot({
        path: path.join(OUTPUT_DIR, `bag-items-${vp.name}-full.png`),
        fullPage: true,
      })

      // 4. /checkout With Items
      console.log(`- Capturing /checkout with items (${vp.name})...`)
      await page.goto('http://localhost:3000/checkout', { waitUntil: 'networkidle' })
      await page.waitForTimeout(500)
      await page.screenshot({
        path: path.join(OUTPUT_DIR, `checkout-items-${vp.name}.png`),
        fullPage: false,
      })
      await page.screenshot({
        path: path.join(OUTPUT_DIR, `checkout-items-${vp.name}-full.png`),
        fullPage: true,
      })

      // 5. /checkout Error State (Click submit on empty fields)
      console.log(`- Capturing /checkout error state (${vp.name})...`)
      // Clear prefilled fields if any
      await page.fill('#customer_name', '')
      await page.fill('#phone', '')
      await page.fill('#address', '')
      
      // Submit to trigger browser or custom validation
      if (vp.isMobile) {
        const placeOrderBtn = page.getByRole('button', { name: 'Place Order' }).first()
        await placeOrderBtn.click({ force: true })
      } else {
        const placeOrderBtn = page.getByRole('button', { name: 'Place Order · Cash on Delivery →' })
        await placeOrderBtn.click({ force: true })
      }
      await page.waitForTimeout(400)

      await page.screenshot({
        path: path.join(OUTPUT_DIR, `checkout-errors-${vp.name}.png`),
        fullPage: false,
      })
      await page.screenshot({
        path: path.join(OUTPUT_DIR, `checkout-errors-${vp.name}-full.png`),
        fullPage: true,
      })

      await context.close()
    }

    console.log('\nAll screenshots captured successfully!')
  } finally {
    await browser.close()
  }
}

run().catch((err) => {
  console.error('Screenshot script failed:', err)
  process.exit(1)
})

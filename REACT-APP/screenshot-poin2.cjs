const { chromium } = require('playwright')
const path = require('path')
const OUT = path.join(__dirname, 'screenshots')

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1440, height: 900 })

  // 1. B2B Receipt list
  await page.goto('http://localhost:5173/b2b/receipt', { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  await page.screenshot({ path: path.join(OUT, 'p2-b2b-receipt.png') })
  console.log('saved p2-b2b-receipt.png')

  // 2. B2B Receipt modal (klik Lunas pertama)
  await page.locator('button:has-text("Lihat Receipt")').first().click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(OUT, 'p2-b2b-receipt-modal.png') })
  console.log('saved p2-b2b-receipt-modal.png')
  await page.locator('button:has-text("Tutup")').click()
  await page.waitForTimeout(300)

  // 3. Event Receipt list
  await page.goto('http://localhost:5173/event/receipt', { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  await page.screenshot({ path: path.join(OUT, 'p2-event-receipt.png') })
  console.log('saved p2-event-receipt.png')

  // 4. Event Receipt modal
  await page.locator('button:has-text("Lihat Receipt")').first().click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(OUT, 'p2-event-receipt-modal.png') })
  console.log('saved p2-event-receipt-modal.png')

  // 5. B2B sidebar (Receipt terlihat)
  await page.goto('http://localhost:5173/b2b/receipt', { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(OUT, 'p2-sidebar-b2b.png') })
  console.log('saved p2-sidebar-b2b.png')

  await browser.close()
  console.log('Done.')
})()

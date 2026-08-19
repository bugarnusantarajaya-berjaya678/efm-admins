const { chromium } = require('playwright')
const path = require('path')

const BASE = 'http://localhost:5173'
const OUT  = path.join(__dirname, 'screenshots')

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const page    = await browser.newPage()
  await page.setViewportSize({ width: 1440, height: 900 })

  // 1. Konsultasi page
  await page.goto(BASE + '/event/konsultasi', { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  await page.screenshot({ path: path.join(OUT, 'p1-konsultasi.png') })
  console.log('saved p1-konsultasi.png')

  // 2. Konsultasi detail modal (klik baris pertama)
  await page.locator('button[class*="w-7"][class*="h-7"]').first().click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(OUT, 'p1-konsultasi-modal.png') })
  console.log('saved p1-konsultasi-modal.png')
  await page.locator('button:has-text("Tutup")').click()
  await page.waitForTimeout(300)

  // 3. Quotation page
  await page.goto(BASE + '/event/quotation', { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  await page.screenshot({ path: path.join(OUT, 'p1-quotation.png') })
  console.log('saved p1-quotation.png')

  // 4. Quotation detail modal
  await page.locator('button[class*="w-7"][class*="h-7"]').first().click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(OUT, 'p1-quotation-modal.png') })
  console.log('saved p1-quotation-modal.png')

  // 5. Event sidebar (expanded)
  await page.goto(BASE + '/event/konsultasi', { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  await page.screenshot({ path: path.join(OUT, 'p1-sidebar-event.png') })
  console.log('saved p1-sidebar-event.png')

  await browser.close()
  console.log('Done.')
})()

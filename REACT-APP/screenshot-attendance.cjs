const { chromium } = require('playwright')
const path = require('path')

const BASE = 'http://localhost:5173'
const OUT  = path.join(__dirname, 'screenshots')

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const page    = await browser.newPage()
  await page.setViewportSize({ width: 1440, height: 900 })

  // 1. Full page
  await page.goto(BASE + '/attendance', { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  await page.screenshot({ path: path.join(OUT, 'att-1-full.png'), fullPage: true })
  console.log('saved att-1-full.png')

  // 2. Rekap PDF modal
  await page.locator('button:has-text("Lihat Rekap PDF")').first().click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(OUT, 'att-2-preview-modal.png') })
  console.log('saved att-2-preview-modal.png')

  // Close modal by clicking Tutup
  await page.locator('button:has-text("Tutup")').click()
  await page.waitForTimeout(500)

  // 3. Konfirmasi Bayar modal — reload page to ensure clean state
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  await page.locator('button:has-text("Approve & Proses Bayar")').first().click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(OUT, 'att-3-konfirmasi-modal.png') })
  console.log('saved att-3-konfirmasi-modal.png')

  await browser.close()
  console.log('Done.')
})()

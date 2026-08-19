const { chromium } = require('playwright')
const path = require('path')
const OUT = path.join(__dirname, 'screenshots')

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1440, height: 900 })

  await page.goto('http://localhost:5173/laporan/export', { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)

  // Setup: all modules + Juni 2026
  await page.click('button:has-text("Per Bulan")')
  const selects = await page.$$('select')
  await selects[0].selectOption('Juni')
  await selects[1].selectOption('2026')
  // Check "Semua Data"
  const cbs = await page.$$('input[type="checkbox"]')
  await cbs[0].check()

  await page.screenshot({ path: path.join(OUT, 'export-all-modules.png') })
  console.log('saved export-all-modules.png')

  // Export
  await page.click('button:has-text("Export Sekarang")')
  await page.waitForTimeout(2400)
  // Screenshot modal done
  await page.screenshot({ path: path.join(OUT, 'export-modal-done2.png') })
  console.log('saved export-modal-done2.png')

  // Click Download inside the modal (fixed overlay)
  await page.locator('.fixed.inset-0 button:has-text("Download")').click()
  await page.waitForTimeout(400)

  // Toast + riwayat updated
  await page.screenshot({ path: path.join(OUT, 'export-toast-riwayat.png'), fullPage: true })
  console.log('saved export-toast-riwayat.png')

  await browser.close()
  console.log('Done.')
})()

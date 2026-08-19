const { chromium } = require('playwright')
const path = require('path')
const OUT = path.join(__dirname, 'screenshots')

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1440, height: 900 })

  // 1. Full page — default state (empty)
  await page.goto('http://localhost:5173/laporan/export', { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  await page.screenshot({ path: path.join(OUT, 'export-empty.png'), fullPage: true })
  console.log('saved export-empty.png')

  // 2. Per Tahun tab
  await page.click('button:has-text("Per Tahun")')
  await page.waitForTimeout(200)
  await page.screenshot({ path: path.join(OUT, 'export-pertahun.png') })
  console.log('saved export-pertahun.png')

  // 3. Range Custom tab
  await page.click('button:has-text("Range Custom")')
  await page.waitForTimeout(200)
  await page.screenshot({ path: path.join(OUT, 'export-range.png') })
  console.log('saved export-range.png')

  // 4. Filled state: Per Bulan + select modules + format
  await page.click('button:has-text("Per Bulan")')
  await page.waitForTimeout(200)
  await page.selectOption('select', { label: 'Juni' }) // bulan
  const allSelects = await page.$$('select')
  await allSelects[1].selectOption({ label: '2026' }) // tahun
  // Check 3 modules
  const checkboxes = await page.$$('input[type="checkbox"]')
  for (let i = 1; i <= 3; i++) await checkboxes[i].check()
  await page.screenshot({ path: path.join(OUT, 'export-filled.png'), fullPage: true })
  console.log('saved export-filled.png')

  // 5. Click Export and capture modal loading
  await page.click('button:has-text("Export Sekarang")')
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(OUT, 'export-modal-loading.png') })
  console.log('saved export-modal-loading.png')

  // 6. Wait for modal done
  await page.waitForTimeout(2200)
  await page.screenshot({ path: path.join(OUT, 'export-modal-done.png') })
  console.log('saved export-modal-done.png')

  // 7. Click Download → toast + riwayat updated
  await page.click('button:has-text("Download")')
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(OUT, 'export-toast.png'), fullPage: true })
  console.log('saved export-toast.png')

  await browser.close()
  console.log('Done.')
})()

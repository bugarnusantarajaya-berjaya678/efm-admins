const { chromium } = require('playwright')
const path = require('path')
const OUT = path.join(__dirname, 'screenshots')

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1440, height: 900 })

  // ── 1. AttendancePage — card with action buttons ─────────────────────────
  await page.goto('http://localhost:5173/attendance', { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  await page.screenshot({ path: path.join(OUT, 'fix1-attendance-buttons.png') })
  console.log('saved fix1-attendance-buttons.png')

  // ── 2. B2B Receipt — horizontal scroll table ─────────────────────────────
  await page.goto('http://localhost:5173/b2b/receipt', { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  await page.screenshot({ path: path.join(OUT, 'fix2-b2b-receipt.png') })
  console.log('saved fix2-b2b-receipt.png')

  // ── 3. Event Receipt ──────────────────────────────────────────────────────
  await page.goto('http://localhost:5173/event/receipt', { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  await page.screenshot({ path: path.join(OUT, 'fix3-event-receipt.png') })
  console.log('saved fix3-event-receipt.png')

  // ── 4. Event Invoice — list page ─────────────────────────────────────────
  await page.goto('http://localhost:5173/event/invoice', { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  await page.screenshot({ path: path.join(OUT, 'fix4-event-invoice-list.png') })
  console.log('saved fix4-event-invoice-list.png')

  // 4b. Event Invoice — open modal
  const lihatBtn = page.locator('button:has-text("Lihat")').first()
  await lihatBtn.click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(OUT, 'fix4-event-invoice-modal.png') })
  console.log('saved fix4-event-invoice-modal.png')

  // Close modal
  const closeBtn = page.locator('.fixed.inset-0 button:has-text("Tutup")')
  await closeBtn.click()
  await page.waitForTimeout(300)

  // ── 5-7. Topbar: notif + user dropdown (already working — quick verify) ──
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)

  // Open notification dropdown
  const bellBtn = page.locator('button').filter({ has: page.locator('svg[class*="lucide-bell"], [data-lucide="bell"]') }).first()
  await bellBtn.click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(OUT, 'fix56-notif-dropdown.png') })
  console.log('saved fix56-notif-dropdown.png')

  // Click outside to close
  await page.mouse.click(700, 400)
  await page.waitForTimeout(300)

  // Open user dropdown
  const userBtn = page.locator('button').filter({ hasText: 'Admin EFM' }).first()
  await userBtn.click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(OUT, 'fix7-user-dropdown.png') })
  console.log('saved fix7-user-dropdown.png')

  await browser.close()
  console.log('All done.')
})()

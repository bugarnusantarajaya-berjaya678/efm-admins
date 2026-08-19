const { chromium } = require('playwright')
const path = require('path')
const OUT = path.join(__dirname, 'screenshots')

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1440, height: 900 })

  // Go to dashboard (login page will redirect here after we set localStorage)
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)

  // 1. Screenshot: Notification bell dropdown
  await page.click('button[class*="rounded-full"][class*="hover"]')
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(OUT, 'topbar-notif-dropdown.png') })
  console.log('saved topbar-notif-dropdown.png')

  // 2. Mark all read then screenshot
  const markBtn = page.locator('button:has-text("Tandai semua dibaca")')
  await markBtn.click()
  await page.waitForTimeout(300)
  await page.screenshot({ path: path.join(OUT, 'topbar-notif-all-read.png') })
  console.log('saved topbar-notif-all-read.png')

  // Close notification by clicking outside
  await page.keyboard.press('Escape')
  await page.mouse.click(700, 400)
  await page.waitForTimeout(300)

  // 3. Screenshot: User avatar dropdown
  const avatarBtn = page.locator('button:has-text("Admin EFM")').first()
  await avatarBtn.click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(OUT, 'topbar-user-dropdown.png') })
  console.log('saved topbar-user-dropdown.png')

  await browser.close()
  console.log('Done.')
})()

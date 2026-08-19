const { chromium } = require('playwright')
const path = require('path')
const OUT = path.join(__dirname, 'screenshots')

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1440, height: 900 })

  const pages = [
    ['http://localhost:5173/pp/leads',      'p3-pp-leads.png'],
    ['http://localhost:5173/pp/orders',     'p3-pp-orders.png'],
    ['http://localhost:5173/pp/invoice',    'p3-pp-invoice.png'],
    ['http://localhost:5173/pp/receipt',    'p3-pp-receipt.png'],
    ['http://localhost:5173/pp/documents',  'p3-pp-documents.png'],
    ['http://localhost:5173/b2b/corporate', 'p3-b2b-corporate.png'],
    ['http://localhost:5173/b2b/apartment', 'p3-b2b-apartment.png'],
    ['http://localhost:5173/b2b/invoice',   'p3-b2b-invoice.png'],
    ['http://localhost:5173/b2b/receipt',   'p3-b2b-receipt.png'],
    ['http://localhost:5173/event/leads',   'p3-event-leads.png'],
    ['http://localhost:5173/event/receipt', 'p3-event-receipt.png'],
    ['http://localhost:5173/attendance',    'p3-attendance.png'],
    ['http://localhost:5173/payment',       'p3-payment.png'],
  ]

  for (const [url, fname] of pages) {
    await page.goto(url, { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(OUT, fname) })
    console.log('saved', fname)
  }

  await browser.close()
  console.log('Done.')
})()

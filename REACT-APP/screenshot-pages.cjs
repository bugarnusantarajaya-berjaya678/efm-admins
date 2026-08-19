const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')

const BASE = 'http://localhost:5173'
const OUT  = path.join(__dirname, 'screenshots')
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT)

const PAGES = [
  { name: '1-dashboard-admin',    url: '/dashboard'          },
  { name: '2-pp-dashboard',       url: '/pp/dashboard'       },
  { name: '3-sidebar-full',       url: '/dashboard'          },
  { name: '4a-b2b-survey',        url: '/b2b/survey'         },
  { name: '4b-b2b-quotation',     url: '/b2b/quotation'      },
  { name: '5-laporan-revenue',    url: '/laporan/revenue'    },
  { name: '6a-pic-detail-profil', url: '/pic/PIC-001'        },
  { name: '6b-pic-detail-kontrak',url: '/pic/PIC-001'        },
  { name: '7-absensi',            url: '/attendance'         },
]

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const page    = await browser.newPage()
  await page.setViewportSize({ width: 1440, height: 900 })

  // Navigate once to load the app (handles redirect from / to /dashboard)
  await page.goto(BASE + '/dashboard', { waitUntil: 'networkidle' })

  for (const p of PAGES) {
    console.log(`→ ${p.url}`)
    await page.goto(BASE + p.url, { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)

    // For sidebar screenshot — expand all groups by clicking them
    if (p.name === '3-sidebar-full') {
      const toggles = await page.locator('button:has-text("LAPORAN")').all()
      for (const t of toggles) { try { await t.click() } catch {} }
      await page.waitForTimeout(400)
    }

    // For Kontrak tab click
    if (p.name === '6b-pic-detail-kontrak') {
      await page.locator('button:has-text("Kontrak/PKS")').click()
      await page.waitForTimeout(400)
    }

    const file = path.join(OUT, `${p.name}.png`)
    await page.screenshot({ path: file, fullPage: false })
    console.log(`   saved: ${file}`)
  }

  await browser.close()
  console.log('\nDone. Screenshots in:', OUT)
})()

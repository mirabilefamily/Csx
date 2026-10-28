// Sidebar header, thread spacing and summary panel crops at 1440: node scripts/phase11-crops2.mjs <before|after> [baseUrl]
import { chromium } from 'playwright-core'

const TAG = process.argv[2] ?? 'after'
const BASE = process.argv[3] ?? 'http://localhost:4173'
const OUT = '/app/memory/shots/phase11'
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome', args: ['--no-sandbox'] })
const p = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
p.on('pageerror', (e) => errors.push(e.message))
await p.goto(`${BASE}/login`)
await p.fill('input[type=email]', 'ava@goorin.com'); await p.fill('input[type=password]', 'goorin123')
await p.getByRole('button', { name: 'Sign in' }).click(); await p.waitForURL('**/dashboard')
await p.waitForTimeout(800)
await p.screenshot({ path: `${OUT}/sidebar-header-${TAG}.png`, clip: { x: 0, y: 0, width: 520, height: 120 } })
await p.goto(`${BASE}/inbox/GB-1065?view=needs_you`); await p.waitForTimeout(1200)
await p.screenshot({ path: `${OUT}/thread-spacing-${TAG}.png` })
if (TAG === 'after') {
  const sh = (await p.locator('header').first().boundingBox())?.height
  const lh = (await p.locator('[data-testid="sidebar-header"]').boundingBox().catch(() => null))?.height
  console.log('topbar height', sh, 'sidebar header height', lh)
  await p.click('[data-testid="summary-collapse"]'); await p.waitForTimeout(300)
  const w = await p.locator('[aria-label="Conversation"]').evaluate((e) => Math.round(e.getBoundingClientRect().width))
  console.log('collapsed rail:', Math.round((await p.locator('[data-testid="summary-rail"]').boundingBox()).width), 'conversation', w)
  await p.screenshot({ path: `${OUT}/summary-collapsed-1440.png` })
  await p.goto(`${BASE}/inbox/GB-1076?view=needs_you`); await p.waitForTimeout(900)
  console.log('persists across tickets:', await p.locator('[data-testid="summary-rail"]').isVisible())
  await p.keyboard.press(']'); await p.waitForTimeout(300)
  console.log('] expands:', await p.locator('[data-testid="summary-panel"]').isVisible())
  await p.screenshot({ path: `${OUT}/summary-expanded-1440.png` })
  console.log('money:', await p.locator('[data-testid="summary-order"]').innerText())
}
console.log(TAG, 'errors', errors.length)
await browser.close()

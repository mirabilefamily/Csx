// Before/after crops of the selected view row and the status pill: node scripts/phase11-crops.mjs <before|after> [baseUrl]
import { chromium } from 'playwright-core'

const TAG = process.argv[2] ?? 'after'
const BASE = process.argv[3] ?? 'http://localhost:4173'
const OUT = '/app/memory/shots/phase11'
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome', args: ['--no-sandbox'] })
const p = await browser.newPage({ viewport: { width: 1920, height: 1000 }, deviceScaleFactor: 2 })
await p.goto(`${BASE}/login`)
await p.fill('input[type=email]', 'ava@goorin.com'); await p.fill('input[type=password]', 'goorin123')
await p.getByRole('button', { name: 'Sign in' }).click(); await p.waitForURL('**/dashboard')
await p.goto(`${BASE}/inbox/GB-1076?view=mine`); await p.waitForTimeout(1200)
await p.locator('[data-testid="views-default"]').screenshot({ path: `${OUT}/crop-view-row-${TAG}.png` })
const pill = p.locator('[data-testid="conversation-header"] [data-testid^="status-pill"], [data-testid="conversation-header"] .rounded-full').first()
const box = await pill.boundingBox()
await p.screenshot({ path: `${OUT}/crop-status-pill-${TAG}.png`, clip: { x: box.x - 12, y: box.y - 10, width: box.width + 24, height: box.height + 20 } })
await p.goto(`${BASE}/inbox?view=needs_you`); await p.waitForTimeout(1000)
await p.locator('[data-testid="ticket-row-GB-1068"]').screenshot({ path: `${OUT}/crop-needs-card-${TAG}.png` })
const s = await p.evaluate(() => { const e = document.querySelector('[data-testid="view-needs_you"]'); return e && getComputedStyle(e.querySelector('span:last-child')).color })
console.log(TAG, 'needs-you count colour:', s)
await browser.close()

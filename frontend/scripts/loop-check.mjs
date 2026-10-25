// Loop Returns section check + screenshots: node scripts/loop-check.mjs [baseUrl]
import { chromium } from 'playwright-core'

const BASE = process.argv[2] ?? 'http://localhost:4173'
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome', args: ['--no-sandbox'] })
const errors = []
const login = async (p) => {
  p.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await p.goto(`${BASE}/login`)
  await p.fill('input[type=email]', 'ava@goorin.com')
  await p.fill('input[type=password]', 'goorin123')
  await p.getByRole('button', { name: 'Sign in' }).click()
  await p.waitForURL('**/dashboard')
}
const p = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
await login(p)
const txt = async (s) => (await p.innerText(s)).replace(/\s+/g, ' ').trim()
for (const t of ['GB-1076', 'GB-1068', 'GB-1078']) {
  await p.goto(`${BASE}/inbox/${t}`)
  await p.waitForSelector('[data-testid=loop-returns-section] [data-testid=loop-stats], [data-testid=loop-empty]')
  const empty = await p.isVisible('[data-testid=loop-empty]')
  console.log(`${t}: ${empty ? await txt('[data-testid=loop-empty]') : `${await txt('[data-testid=loop-stats]')} | high=${await p.isVisible('[data-testid=loop-high-rate]')} | cards=${(await p.locator('[data-testid^=loop-return-]').evaluateAll((e) => e.map((x) => x.dataset.testid))).join(',')}`}`)
  if (t === 'GB-1076') {
    console.log('  48213:', await txt('[data-testid=loop-return-48213]'))
    console.log('  view:', await p.getAttribute('[data-testid=loop-view-48213]', 'href'), await p.getAttribute('[data-testid=loop-view-48213]', 'target'), '| wordmark loaded:', await p.$eval('[data-testid=loop-wordmark]', (e) => e.naturalWidth > 0))
    await p.click('[data-testid=order-toggle-order-20398]')
    await p.evaluate(() => { const a = document.querySelector('[data-testid=customer-panel]'); const s = document.querySelector('[data-testid=shopify-orders]'); a.scrollTop = s.offsetTop - 8 })
    await p.waitForTimeout(400)
    await p.screenshot({ path: '/tmp/inbox-1440-shopify-loop.png' })
    await p.click('[data-testid=customer-panel-collapse]')
    console.log('  rail returns:', await txt('[data-testid=customer-rail-returns]'))
    await p.click('[data-testid=customer-panel-collapse]')
  }
}
const q = await (await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage()
await login(q)
await q.goto(`${BASE}/inbox/GB-1076`)
await q.click('[data-testid=details-toggle]')
await q.waitForSelector('[data-testid=ticket-details-sheet] [data-testid=loop-stats]')
console.log('390 sheet loop section visible:', await q.isVisible('[data-testid=ticket-details-sheet] [data-testid=loop-returns-section]'))
console.log('console errors:', errors.length, errors.slice(0, 2).join(' | '))
await browser.close()

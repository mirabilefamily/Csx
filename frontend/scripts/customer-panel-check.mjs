// JRN-110 check: inbox customer + Shopify panel. node scripts/customer-panel-check.mjs [baseUrl]
import { chromium } from 'playwright-core'

const BASE = process.argv[2] ?? 'http://localhost:4173'
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome', args: ['--no-sandbox'] })
const errors = []
const login = async (p) => {
  await p.goto(`${BASE}/login`)
  await p.fill('input[type=email]', 'ava@goorin.com')
  await p.fill('input[type=password]', 'goorin123')
  await p.getByRole('button', { name: 'Sign in' }).click()
  await p.waitForURL('**/dashboard')
}
const width = (p, s) => p.$eval(s, (e) => Math.round(e.getBoundingClientRect().width)).catch(() => -1)
for (const w of [1440, 1280, 1024]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } })
  const p = await ctx.newPage()
  p.on('console', (m) => m.type() === 'error' && errors.push(`${w}: ${m.text()}`))
  await login(p)
  await p.goto(`${BASE}/inbox/GB-1076`)
  await p.waitForSelector('[data-testid=customer-stats]')
  const conv = await width(p, 'section[aria-label=Conversation]')
  const panel = await width(p, '[data-testid=customer-panel]')
  const txt = async (s) => (await p.innerText(s)).replace(/\s+/g, ' ').trim()
  console.log(`${w}: conversation=${conv}px panel=${panel}px state=${await p.getAttribute('[data-testid=customer-panel]', 'data-state')} details-toggle visible=${await p.isVisible('[data-testid=details-toggle]')}`)
  if (w === 1440) {
    console.log('  header:', await txt('[data-testid=customer-card]'))
    console.log('  orders:', (await p.locator('[data-testid^=order-card-]').evaluateAll((els) => els.map((e) => `${e.dataset.testid}:${e.getAttribute('data-state')}`))).join(', '))
    console.log('  latest:', await txt('[data-testid=order-card-order-20398]'))
    console.log('  tracking target:', await p.getAttribute('[data-testid="tracking-link-#GB20398"]', 'target'), '| view in shopify:', await p.getAttribute('[data-testid=order-view-shopify-order-20398]', 'href'), await p.getAttribute('[data-testid=order-view-shopify-order-20398]', 'target'))
    await p.click('[data-testid=order-toggle-order-19790]')
    console.log('  older expanded:', await p.getAttribute('[data-testid=order-card-order-19790]', 'data-state'), '| past tickets + AI log below:', await p.isVisible('[data-testid=past-tickets]'), await p.isVisible('[data-testid=ai-attempt-log]'))
    await p.waitForTimeout(300)
    await p.screenshot({ path: '/tmp/inbox-1440.png' })
  }
  if (w === 1024) await p.screenshot({ path: '/tmp/inbox-1024.png' })
  // collapse → persists across tickets → expand
  await p.click('[data-testid=customer-panel-collapse]')
  const railW = await width(p, '[data-testid=customer-panel]')
  const exp = await p.getAttribute('[data-testid=customer-panel-collapse]', 'aria-expanded')
  await p.click('[data-testid=ticket-link-GB-1064]')
  await p.waitForSelector('[data-testid=customer-rail]')
  const stays = await p.getAttribute('[data-testid=customer-panel]', 'data-state')
  await p.click('[data-testid=customer-panel-collapse]')
  await p.waitForSelector('[data-testid=customer-stats]')
  console.log(`  collapse: rail=${railW}px aria-expanded=${exp} after-switch=${stays} → expanded=${await p.getAttribute('[data-testid=customer-panel]', 'data-state')} | GB-1064 fraud chip: ${await p.innerText('[data-testid=customer-fraud-chip]').catch(() => 'none')}`)
  if (w === 1440) {
    await p.click('[data-testid=ticket-link-GB-1078]')
    await p.waitForSelector('[data-testid=customer-guest]')
    console.log('  guest GB-1078:', await p.innerText('[data-testid=customer-guest]'), '|', await p.innerText('[data-testid=no-shopify-orders]'))
  }
  await ctx.close()
}
const ph = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
const q = await ph.newPage()
await login(q)
await q.goto(`${BASE}/inbox/GB-1076`)
await q.click('[data-testid=details-toggle]')
await q.waitForSelector('[data-testid=ticket-details-sheet] [data-testid=customer-stats]')
console.log('390 sheet:', await q.isVisible('[data-testid=customer-tags]'), await q.isVisible('[data-testid=order-card-order-20398]'), await q.isVisible('[data-testid=customer-rail]'))
await q.screenshot({ path: '/tmp/inbox-390-details.png' })
console.log('console errors:', errors.length, errors.slice(0, 2).join(' | '))
await browser.close()

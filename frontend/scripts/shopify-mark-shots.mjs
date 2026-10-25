// Shopify mark + header-logo thumb screenshots: node scripts/shopify-mark-shots.mjs [baseUrl]
import { chromium } from 'playwright-core'

const BASE = process.argv[2] ?? 'http://localhost:4173'
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome', args: ['--no-sandbox'] })
const p = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
await p.goto(`${BASE}/login`)
await p.fill('input[type=email]', 'ava@goorin.com')
await p.fill('input[type=password]', 'goorin123')
await p.getByRole('button', { name: 'Sign in' }).click()
await p.waitForURL('**/dashboard')
const marks = async () => p.locator('img[src$="shopify-bag.svg"]').evaluateAll((els) => els.filter((e) => e.offsetParent).map((e) => `${Math.round(e.getBoundingClientRect().width)}px${e.naturalWidth ? '' : '(broken)'}`).join(','))
for (const [route, ready, shot] of [
  ['/settings/integrations', '[data-testid=integration-tile-shopify]', '/tmp/integrations-tiles.png'],
  ['/settings/integrations/shopify', '[data-testid=shopify-widget-summary]', null],
  ['/settings/integrations/shopify/install', '[data-testid=install-status-card]', null],
  ['/inbox/GB-1076', '[data-testid=customer-stats]', '/tmp/inbox-customer-panel.png'],
  ['/widget-demo/theme-editor', '[data-testid=te-back]', null],
]) {
  await p.goto(`${BASE}${route}`)
  await p.waitForSelector(ready)
  await p.waitForTimeout(500)
  console.log(route.padEnd(40), 'marks:', await marks())
  if (shot) await p.screenshot({ path: shot })
}
await p.goto(`${BASE}/settings/integrations/shopify/widget`)
await p.waitForSelector('[data-testid=ws-logo-thumb]')
console.log('header logo thumb bg:', await p.$eval('[data-testid=ws-logo-thumb-bg]', (e) => getComputedStyle(e).backgroundColor))
await p.locator('[data-testid=ws-logo-thumb-bg]').scrollIntoViewIfNeeded()
await p.screenshot({ path: '/tmp/ws-logo-thumb.png' })
await browser.close()

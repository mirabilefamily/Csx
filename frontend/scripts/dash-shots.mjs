// Dashboard screenshots for the report: node scripts/dash-shots.mjs [baseUrl]
import { chromium } from 'playwright-core'

const BASE = process.argv[2] ?? 'http://localhost:4173'
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome', args: ['--no-sandbox'] })
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const phone = w < 640
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: phone, hasTouch: phone, deviceScaleFactor: phone ? 2 : 1 })
  const p = await ctx.newPage()
  await p.goto(`${BASE}/login`)
  await p.fill('input[type=email]', 'ava@goorin.com')
  await p.fill('input[type=password]', 'goorin123')
  await p.getByRole('button', { name: 'Sign in' }).click()
  await p.waitForURL('**/dashboard')
  await p.waitForSelector('[data-testid=refund-total]')
  await p.waitForSelector('[data-testid=fraud-list-open]')
  await p.waitForTimeout(600)
  if (phone) {
    const title = async () => p.getAttribute('[data-testid=mobile-page-title]', 'data-state')
    console.log('390 top-bar title at top:', await title())
    await p.screenshot({ path: `/tmp/dash-390-top.png` })
    await p.locator('[data-testid=kpi-card-csat_response_rate], [data-testid^=kpi-card-]').last().scrollIntoViewIfNeeded()
    await p.waitForTimeout(400)
    console.log('390 top-bar title after scroll:', await title())
    const cards = await p.locator('[data-testid^=kpi-card-]:not([data-testid=kpi-card-skeleton])').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().width)))
    console.log('390 kpi widths:', cards.join(','))
    await p.screenshot({ path: `/tmp/dash-390-kpi.png` })
    await p.locator('[data-testid=refunds-panel]').scrollIntoViewIfNeeded()
    await p.screenshot({ path: `/tmp/dash-390-refunds.png` })
    await p.locator('[data-testid=fraud-panel]').scrollIntoViewIfNeeded()
    await p.screenshot({ path: `/tmp/dash-390-fraud.png` })
  } else {
    const rows = await p.locator('[data-testid^=kpi-value-]').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().bottom)))
    console.log('1440 kpi value bottoms:', rows.join(','))
    await p.screenshot({ path: `/tmp/dash-1440-top.png` })
    await p.locator('[data-testid=refunds-fraud-row]').scrollIntoViewIfNeeded()
    await p.evaluate(() => document.querySelector('[data-testid=refunds-fraud-row]').scrollIntoView({ block: 'start' }))
    await p.waitForTimeout(300)
    await p.screenshot({ path: `/tmp/dash-1440-panels.png` })
  }
  await ctx.close()
}
await browser.close()

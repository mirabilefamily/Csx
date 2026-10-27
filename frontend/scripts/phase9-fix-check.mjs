// Phase 9 fix checks: inbox chips vs "+ New" overlap at 360–430, Open tickets KPI caption in every range.
import { chromium } from 'playwright-core'

const BASE = process.argv[2] ?? 'http://localhost:4173'
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome', args: ['--no-sandbox'] })
const errors = []
async function login(p) {
  p.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await p.goto(`${BASE}/login`)
  await p.fill('input[type=email]', 'ava@goorin.com')
  await p.fill('input[type=password]', 'goorin123')
  await p.getByRole('button', { name: 'Sign in' }).click()
  await p.waitForURL('**/dashboard')
}
for (const w of [360, 390, 430]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
  const p = await ctx.newPage()
  await login(p)
  await p.goto(`${BASE}/inbox`)
  await p.waitForSelector('[data-testid=inbox-view-chips]')
  await p.waitForTimeout(600)
  const r = await p.evaluate(() => {
    const c = document.querySelector('[data-testid=inbox-view-chips]').getBoundingClientRect()
    const b = document.querySelector('[data-testid=new-ticket-button]').getBoundingClientRect()
    return { chipsRight: Math.round(c.right), btnLeft: Math.round(b.left), btn: `${Math.round(b.width)}x${Math.round(b.height)}`, overflow: document.documentElement.scrollWidth > innerWidth }
  })
  console.log(`${w}: chips right=${r.chipsRight} button left=${r.btnLeft} (${r.btn}) overlap=${r.chipsRight > r.btnLeft} pageOverflow=${r.overflow}`)
  if (w === 390) await p.screenshot({ path: '/app/memory/shots/phase9/inbox-390.png' })
  await ctx.close()
}
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const p = await ctx.newPage()
await login(p)
for (const preset of ['today', '7d', '30d', '90d']) {
  await p.click(`[data-testid=range-${preset}]`)
  await p.waitForTimeout(900)
  console.log(`${preset}: open caption="${(await p.innerText('[data-testid=kpi-delta-open]')).trim()}" tone=${await p.getAttribute('[data-testid=kpi-delta-open]', 'data-tone')}`)
}
console.log('console errors:', errors.length)
await browser.close()

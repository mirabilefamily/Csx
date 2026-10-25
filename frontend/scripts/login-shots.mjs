// Login + title-font screenshots for the report: node scripts/login-shots.mjs [baseUrl]
import { chromium } from 'playwright-core'

const BASE = process.argv[2] ?? 'http://localhost:4173'
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome', args: ['--no-sandbox'] })
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const phone = w < 640
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: phone, hasTouch: phone, deviceScaleFactor: phone ? 2 : 1 })
  const p = await ctx.newPage()
  await p.goto(`${BASE}/login`)
  await p.waitForSelector('[data-testid=login-form]')
  const card = await p.$eval('[data-testid=login-card]', (e) => { const s = getComputedStyle(e); return `border=${s.borderTopWidth} radius=${s.borderTopLeftRadius} bg=${s.backgroundColor}` })
  const t = await p.$eval('[data-testid=login-title]', (e) => { const s = getComputedStyle(e); return `${s.fontFamily.split(',')[0]} ${s.fontWeight} ${s.fontSize}` })
  const btn = await p.$eval('[data-testid=login-submit]', (e) => `${Math.round(e.getBoundingClientRect().height)}px`)
  const icons = await p.locator('[data-testid=login-form] svg').count()
  console.log(`${w}: card ${card} | title ${t} | button ${btn} | svgs in form=${icons} (eye only) | logo=${await p.$eval('[data-testid=login-card] img', (e) => Math.round(e.getBoundingClientRect().width))}px card-h=${await p.$eval('[data-testid=login-card]', (e) => Math.round(e.getBoundingClientRect().height))} subline=${await p.locator('[data-testid=login-subline]').count()} footer="${await p.innerText('[data-testid=login-footer]')}"`)
  await p.waitForTimeout(600)
  await p.screenshot({ path: `/tmp/login-${w}.png` })
  if (!phone) {
    await p.click('[data-testid=login-submit]')
    await p.waitForSelector('#email-error:not(:empty)')
    await p.screenshot({ path: '/tmp/login-1440-errors.png' })
    await p.fill('[data-testid=email-input]', 'ava@goorin.com')
    await p.fill('[data-testid=password-input]', 'goorin123')
    await p.click('[data-testid=login-submit]')
    await p.waitForURL('**/dashboard')
    await p.waitForSelector('[data-testid=kpi-grid] [data-testid^=kpi-value-]')
    await p.waitForTimeout(500)
    const h1 = await p.$eval('[data-testid=page-title]', (e) => { const s = getComputedStyle(e); return `${s.fontFamily.split(',')[0]} ${s.fontWeight} ${s.fontSize} lh=${s.lineHeight}` })
    const label = await p.$eval('[data-testid=kpi-card-csatRate] p', (e) => `${e.scrollWidth <= e.clientWidth && e.scrollHeight <= e.clientHeight + 1 ? 'full' : 'clipped'} "${e.textContent}"`)
    console.log(`dashboard h1: ${h1} | last KPI label ${label}`)
    await p.screenshot({ path: '/tmp/dash-1440-title.png', clip: { x: 0, y: 0, width: 1440, height: 420 } })
    await p.click('[data-testid=demo-state-trigger]')
    await p.click('[data-testid=title-font-option-geist]')
    await p.waitForTimeout(700)
    console.log('after Geist h1:', await p.$eval('[data-testid=page-title]', (e) => `${getComputedStyle(e).fontFamily.split(',')[0]} ${getComputedStyle(e).fontSize}`))
    await p.screenshot({ path: '/tmp/title-font-picker.png' })
    await p.click('[data-testid=title-font-option-inter-display]')
    await p.waitForTimeout(300)
  }
  await ctx.close()
}
await browser.close()

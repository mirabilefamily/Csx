// Login polish check: node scripts/login-check.mjs [baseUrl]
// Screenshots /login variants at desktop + phone sizes, axe on each, tap-target / overflow / input metrics.
import { chromium } from 'playwright-core'
import { AxeBuilder } from '@axe-core/playwright'

const BASE = process.argv[2] ?? 'http://localhost:4173'
const OUT = '/app/test_reports/phase6/login'
const SIZES = [[1440, 900], [430, 932], [390, 844], [360, 640]]
const VARIANTS = [
  ['signin', '/login'],
  ['forgot', '/login', 'forgot'],
  ['invite', '/login?invite=abc123'],
  ['expired', '/login?invite=expired'],
]
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome', args: ['--no-sandbox'] })
const errors = []
for (const [w, h] of SIZES) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500 })
  const page = await ctx.newPage()
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  for (const [name, url, action] of VARIANTS) {
    await page.goto(`${BASE}${url}`)
    await page.waitForTimeout(900)
    if (action === 'forgot') await page.click('[data-testid=forgot-password-link]')
    await page.waitForTimeout(300)
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    const bad = axe.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)
    const m = await page.evaluate(() => {
      const small = [...document.querySelectorAll('[data-testid=login-page] button, [data-testid=login-page] a')]
        .map((e) => [e.getAttribute('data-testid') ?? e.textContent?.trim(), Math.round(e.getBoundingClientRect().height), Math.round(e.getBoundingClientRect().width)])
        .filter(([, hh, ww]) => hh < 44 || ww < 44)
      const inputs = [...document.querySelectorAll('[data-testid=login-page] input')].map((e) => `${e.id}:${Math.round(e.getBoundingClientRect().height)}px/${getComputedStyle(e).fontSize}`)
      return { overflow: document.documentElement.scrollWidth - innerWidth, small, inputs }
    })
    console.log(`${w}x${h} ${name.padEnd(8)} axe:${bad.length ? bad.join(',') : 0} overflow:${m.overflow} inputs:[${m.inputs.join(' ')}]${w < 500 && m.small.length ? ` small-taps:${JSON.stringify(m.small)}` : ''}`)
    if (w === 1440 || w === 390 || w === 360) await page.screenshot({ path: `${OUT}-${name}-${w}.png`, fullPage: true })
  }
  await ctx.close()
}
await browser.close()
console.log(`console errors: ${errors.length}`)

// No-serif check: computed font-family of every visible text element on app routes (storefront mock excluded). node scripts/serif-check.mjs [baseUrl]
import { chromium } from 'playwright-core'

const BASE = process.argv[2] ?? 'http://localhost:4173'
const ROUTES = ['/dashboard', '/inbox', '/inbox/GB-1064', '/guidance', '/settings/integrations', '/settings/integrations/claude', '/settings/ai', '/settings/widget', '/settings/users', '/widget-demo/theme-editor', '/styleguide', '/survey/tok_GB1066', '/nope']
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome', args: ['--no-sandbox'] })
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 640, hasTouch: w < 640 })
  const p = await ctx.newPage()
  await p.goto(`${BASE}/login`)
  await p.fill('input[type=email]', 'ava@goorin.com')
  await p.fill('input[type=password]', 'goorin123')
  await p.getByRole('button', { name: 'Sign in' }).click()
  await p.waitForURL('**/dashboard')
  for (const r of ['/login?invite=x', ...ROUTES]) {
    await p.goto(`${BASE}${r}`)
    await p.waitForTimeout(1200)
    const res = await p.evaluate(() => {
      const bad = new Set()
      const skip = (e) => e.closest('[data-store-mock], .font-store, [data-testid=mini-store]')
      for (const e of document.querySelectorAll('body *')) {
        if (!e.childNodes.length || ![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue
        if (skip(e)) continue
        const f = getComputedStyle(e).fontFamily.split(',')[0].replace(/["']/g, '').trim()
        if (/serif$/i.test(f) && !/sans/i.test(f) || /Georgia|Times|Fraunces|Instrument|Newsreader|Caslon/i.test(f)) bad.add(`${e.tagName.toLowerCase()}:${f}:${e.textContent.trim().slice(0, 24)}`)
      }
      const h1 = document.querySelector('h1')
      return { bad: [...bad].slice(0, 4), h1: h1 ? `${getComputedStyle(h1).fontFamily.split(',')[0]} ${getComputedStyle(h1).fontWeight} ${getComputedStyle(h1).fontSize}` : '-' }
    })
    console.log(`${w} ${r.padEnd(32)} h1=${res.h1}  serif=${res.bad.length ? res.bad.join(' | ') : 0}`)
  }
  await ctx.close()
}
await browser.close()

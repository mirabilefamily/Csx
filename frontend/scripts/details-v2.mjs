// Details panel v2 shots + measurements: node scripts/details-v2.mjs [baseUrl]
import { chromium } from 'playwright-core'
const BASE = process.argv[2] ?? 'http://localhost:4173'
const OUT = '/app/memory/shots/phase11'
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] })
const errs = []
const login = async (ctx) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(e.message)); await p.goto(`${BASE}/login`); await p.fill('input[type=email]', 'ava@goorin.com'); await p.fill('input[type=password]', 'goorin123'); await p.getByRole('button', { name: 'Sign in' }).click(); await p.waitForURL('**/dashboard'); return p }
const p = await login(await b.newContext({ viewport: { width: 1920, height: 1000 } }))
await p.goto(`${BASE}/inbox/GB-1076`); await p.waitForSelector('[data-testid="summary-panel"]'); await p.waitForTimeout(700)
const panel = p.locator('[data-testid="customer-panel"]')
const shotPanel = async (name) => { const bb = await panel.boundingBox(); await p.screenshot({ path: `${OUT}/${name}`, clip: { x: bb.x, y: bb.y, width: bb.width, height: Math.min(bb.height, 1000 - bb.y) } }) }
console.log('summary header:', (await p.locator('[data-testid="summary-panel"] > div').first().innerText()).replace(/\s+/g, ' '), '| rows:', (await p.locator('[data-testid="summary-rows"]').innerText()).replace(/\s+/g, ' ').slice(0, 220))
await shotPanel('summary-v2-1440.png')
await p.click('[data-testid="summary-view-details"]'); await p.waitForTimeout(500)
const sections = await p.locator('[data-testid="details-sidebar"] > section').evaluateAll((els) => els.map((e) => `${e.dataset.testid}:${Math.round(e.firstElementChild.getBoundingClientRect().height)}`))
console.log('details sections (header h):', sections.join(' '))
console.log('email occurrences in panel:', await panel.evaluate((e) => (e.innerText.match(/margaret\.okonkwo@example\.com/g) ?? []).length), '| phone occurrences:', await panel.evaluate((e) => (e.innerText.match(/\(\d{3}\)|\+1/g) ?? []).length), '| beige tiles:', await panel.locator('.bg-surface-muted').count(), '| Shopify customer pill:', await panel.locator('[data-testid="shopify-customer-tag"]').count(), '| matched-by line:', await panel.locator('text=Matched by the ticket email').count())
await p.hover('[data-testid="customer-email"]'); await p.waitForTimeout(700); console.log('email tooltip:', await p.locator('[data-testid="customer-email-tooltip"]').first().innerText().catch(() => 'none'))
console.log('stats:', (await p.locator('[data-testid="customer-stats"]').innerText()).replace(/\s+/g, ' '))
console.log('contact:', (await p.locator('[data-testid="customer-rows"]').innerText()).replace(/\s+/g, ' '), '| note:', await p.locator('[data-testid="customer-note-text"], [data-testid="customer-note-add"]').first().innerText())
console.log('returns header:', await p.locator('[data-testid="loop-returns-count"]').innerText(), '| ticket:', (await p.locator('[data-testid="ticket-details"]').innerText()).replace(/\s+/g, ' ').slice(0, 120))
await p.mouse.move(5, 5); await p.waitForTimeout(400); await shotPanel('details-v2-1440.png')
await panel.evaluate((e) => e.scrollTo(0, e.scrollHeight / 2)); await p.waitForTimeout(300); await shotPanel('details-v2-1440-scrolled.png')
for (const t of ['past-tickets', 'customer-feedback', 'ai-attempt-log']) { const tg = p.locator(`[data-testid="${t}-toggle"]`); if ((await tg.getAttribute('aria-expanded')) !== 'true') await tg.click() }
await p.waitForTimeout(300); await panel.evaluate((e) => e.scrollTo(0, e.scrollHeight)); await p.waitForTimeout(300); await shotPanel('details-v3-lower-1440.png')
const xs = await p.evaluate(() => ['customer-rows', 'ticket-fields'].map((id) => { const dd = document.querySelector(`[data-testid="${id}"] dd`); const el = dd?.querySelector('select') ?? dd; return id + ':' + Math.round(el.getBoundingClientRect().x + (el.tagName === 'SELECT' ? parseFloat(getComputedStyle(el).paddingLeft) + 1 : 0)) }))
console.log('value column x:', xs.join(' '), '| counts:', (await p.locator('[data-testid$="-count"]').allInnerTexts()).join(','))
console.log('ai rows:', (await p.locator('[data-testid^="ai-attempt-"]').allInnerTexts()).slice(0, 2).map((t) => t.replace(/\s+/g, ' ')).join(' | '), '| model id shown:', await panel.locator('text=/sonnet|claude-/i').count())
await p.click('[data-testid="shopify-orders-menu"]'); await p.click('[data-testid="order-tool-find"]'); await p.waitForTimeout(300); console.log('order tool via menu:', await p.locator('[data-testid="order-tool-panel"]').count())
await p.click('[data-testid="summary-view-summary"]'); await p.waitForTimeout(300); console.log('back to summary:', await p.locator('[data-testid="summary-rows"]').count())
const q = await login(await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }))
await q.goto(`${BASE}/inbox/GB-1076`); await q.waitForSelector('[data-testid="details-toggle"]'); await q.click('[data-testid="details-toggle"]'); await q.waitForTimeout(500)
await q.click('[data-testid="summary-view-details"]'); await q.waitForTimeout(400)
console.log('phone sheet:', await q.locator('[data-testid="ticket-details-sheet"]').count(), '| close:', await q.locator('[data-testid="details-close"]').count(), '| overflow:', await q.evaluate(() => document.documentElement.scrollWidth > innerWidth))
await q.screenshot({ path: `${OUT}/details-v2-390.png` })
console.log('page errors:', errs.length, errs.slice(0, 2))
await b.close()

// Phase 8 journey check (JRN-105..109): node scripts/phase8-check.mjs [baseUrl]
import { chromium } from 'playwright-core'

const BASE = process.argv[2] ?? 'http://localhost:4173'
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome', args: ['--no-sandbox'] })
const log = (...a) => console.log(...a)
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const p = await ctx.newPage()
const errors = []
p.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
const txt = (s) => p.innerText(s).then((t) => t.replace(/\s+/g, ' ').trim())
const toast = async () => (await p.waitForSelector('[data-sonner-toast]')).innerText().then((t) => t.split('\n')[0])

await p.goto(`${BASE}/login`)
await p.fill('input[type=email]', 'ava@goorin.com')
await p.fill('input[type=password]', 'goorin123')
await p.getByRole('button', { name: 'Sign in' }).click()
await p.waitForURL('**/dashboard')
await p.waitForSelector('[data-testid=refund-total]')
await p.waitForSelector('[data-testid=fraud-list-open]')

// JRN-105
for (const r of ['30d', '7d', '90d']) {
  await p.click(`[data-testid=range-${r}]`)
  await p.waitForTimeout(900)
  log(`[${r}] total=${await txt('[data-testid=refund-total]')} | count=${await txt('[data-testid=refund-count]')} | auto=${await txt('[data-testid=refund-auto-pct]')} | pending=${await txt('[data-testid=refund-pending]')}`)
  log(`      pipeline=${await txt('[data-testid=refund-pipeline]')} | ${await txt('[data-testid=refund-auto-limit]')} | trend=${await p.isVisible('[data-testid=refund-trend]')}`)
}
log('open alerts:', await txt('[data-testid=fraud-open-count]'), '| fa-101:', await txt('[data-testid=fraud-alert-fa-101]'))
const box = async (s) => (await p.locator(s).boundingBox())
const rb = await box('[data-testid=refunds-panel]'); const fb = await box('[data-testid=fraud-panel]'); const vb = await box('[data-testid=chart-volume-by-channel]')
log(`layout 1440: side-by-side=${Math.abs(rb.y - fb.y) < 2 && rb.x < fb.x} below-volume=${rb.y > vb.y}`)

// JRN-106
await p.click('[data-testid=fraud-action-hold-fa-101]'); log('hold toast:', await toast())
await p.waitForTimeout(1200)
log('after hold pipeline:', await txt('[data-testid=refund-pipeline]'), '| pending:', await txt('[data-testid=refund-pending]'))
await p.click("[data-testid=fraud-action-safe-fa-103]"); await p.waitForSelector("[data-sonner-toast]:has-text(\"Marked safe\")"); log("safe toast: Marked safe")
await p.waitForTimeout(300)
await p.click('[data-testid=fraud-action-escalate-fa-104]')
await p.waitForSelector('[data-sonner-toast]:has-text("Escalated to admin")'); log('escalate toast: Escalated to admin')
await p.locator('[data-sonner-toast]:has-text("Escalated to admin") button:has-text("Undo")').click()
await p.waitForTimeout(1000)
log('fa-104 after undo in open list:', await p.isVisible('[data-testid=fraud-list-open] [data-testid=fraud-alert-fa-104]'))
await p.click('[data-testid=fraud-tab-reviewed]')
log('reviewed fa-101:', await txt('[data-testid=fraud-reviewed-fa-101]'), '| fa-103:', await txt('[data-testid=fraud-reviewed-fa-103]'))
await p.click('[data-testid=fraud-tab-open]')
for (const id of ['fa-102', 'fa-104']) { await p.click(`[data-testid=fraud-action-safe-${id}]`); await p.waitForTimeout(900) }
log('all clear:', await txt('[data-testid=fraud-empty]'))

// JRN-107 (fresh session: reload resets mocks)
await p.reload(); await p.waitForSelector('[data-testid=fraud-list-open]')
await p.goto(`${BASE}/inbox`)
await p.waitForSelector('[data-testid=ticket-row-GB-1064]')
const shields = await p.locator('[data-testid^=ticket-fraud-]').evaluateAll((els) => els.map((e) => `${e.dataset.testid}:${e.getAttribute('aria-label')}`))
log('shields:', shields.join(', '))
log('nav badge:', await p.locator('[data-testid=inbox-needs-human-badge]').first().innerText().catch(() => 'n/a'))
await p.click('[data-testid=ticket-link-GB-1064]')
await p.waitForSelector('[data-testid=fraud-banner]')
log('banner:', await txt('[data-testid=fraud-banner]'))
await p.click('[data-testid=fraud-banner-view]')
await p.waitForURL('**/dashboard#fraud'); await p.waitForTimeout(1500)
const top = (await box('#fraud')).y
log(`landed ${new URL(p.url()).pathname}${new URL(p.url()).hash}, #fraud top=${Math.round(top)}`)

// JRN-108
await p.goto(`${BASE}/settings/ai`)
await p.waitForSelector('[data-testid=auto-refund-limit]')
log('defaults:', await p.isChecked('[data-testid=auto-refund-toggle]').catch(async () => (await p.getAttribute('[data-testid=auto-refund-toggle]', 'aria-checked'))), await p.inputValue('[data-testid=auto-refund-limit]'), '|', await txt('[data-testid=auto-refund-note]'))
await p.fill('[data-testid=auto-refund-limit]', '900')
log('900 error:', await txt('[data-testid=ai-section-auto-refunds] [id=auto-refund-error]').catch(() => 'none'))
await p.click('[data-testid=ai-save]'); log('900 save toast:', await toast())
await p.waitForTimeout(4500)
await p.fill('[data-testid=auto-refund-limit]', '120')
await p.click('[data-testid=ai-save]')
await p.waitForSelector('[data-sonner-toast]:has-text("AI settings saved")'); log('120 save: AI settings saved')
await p.click('[data-testid=nav-dashboard]').catch(() => p.goto(`${BASE}/dashboard`))
await p.waitForSelector('[data-testid=refund-auto-limit]')
log('dashboard limit:', await txt('[data-testid=refund-auto-limit]'))

// JRN-109 demo states
const demo = async (label) => { if (!(await p.isVisible('[data-testid=demo-state-panel]'))) await p.click('[data-testid=demo-state-trigger]'); await p.click(`[data-testid=demo-state-option-${label.toLowerCase()}]`); await p.keyboard.press('Escape') }
try {
  await demo('Error'); await p.waitForTimeout(1200)
  log('error states:', await p.isVisible('[data-testid=refunds-error]'), await p.isVisible('[data-testid=fraud-stale-error]') || await p.isVisible('[data-testid=fraud-error]'))
  await p.click('[data-testid=fraud-action-safe-fa-101]'); log('error action toast:', await (await p.waitForSelector('[data-sonner-toast]:has-text("update the alert")')).innerText())
  await demo('Empty'); await p.waitForTimeout(1200)
  log('empty:', await txt('[data-testid=refunds-empty]'), '|', await txt('[data-testid=fraud-empty]'))
  await demo('Loading'); await p.waitForTimeout(600)
  log('skeletons:', await p.isVisible('[data-testid=refunds-panel-skeleton]'), await p.isVisible('[data-testid=fraud-panel-skeleton]'))
  await demo('Live')
} catch (e) { log('demo switch failed:', e.message.split('\n')[0]) }
log('console errors:', errors.length, errors.slice(0, 3).join(' | '))
await browser.close()

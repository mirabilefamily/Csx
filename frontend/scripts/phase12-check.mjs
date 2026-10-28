// Phase 12 simpler Dashboard journeys (JRN-148..154) + screenshots: node scripts/phase12-check.mjs [baseUrl]
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const BASE = process.argv[2] ?? 'http://localhost:4173'
const OUT = '/app/memory/shots/phase12'
mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome', args: ['--no-sandbox'] })
const errors = []
const log = (...a) => console.log(...a)
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const p = await ctx.newPage()
p.on('pageerror', (e) => errors.push(e.message))
p.on('console', (m) => m.type() === 'error' && !/WebSocket/.test(m.text()) && errors.push(m.text()))
const txt = (s) => p.locator(s).first().innerText({ timeout: 4000 }).then((t) => t.replace(/\s+/g, ' ').trim()).catch(() => 'MISSING')
const step = async (name, fn) => { try { await fn() } catch (e) { log(`FAIL ${name}: ${e.message.split('\n')[0]}`) } }
await p.goto(`${BASE}/login`)
await p.fill('input[type=email]', 'ava@goorin.com')
await p.fill('input[type=password]', 'goorin123')
await p.getByRole('button', { name: 'Sign in' }).click()
await p.waitForURL('**/dashboard')
await p.waitForSelector('[data-testid^="kpi-card-"]:not([data-testid="kpi-card-skeleton"])')
await p.waitForTimeout(1200)

await step('JRN-148/167', async () => {
  const mods = await p.locator('[data-testid="dashboard-page"] > *').evaluateAll((els) => els.map((e) => e.dataset.testid || e.tagName.toLowerCase()))
  log('JRN-167 modules:', mods.length, mods.join(' > '))
  const cards = await p.locator('[data-testid="dashboard-grid"] > *').evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return `${e.dataset.testid}@${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}` }))
  log('  grid cards:', cards.join(' | '))
  const hdr = await p.locator('[data-testid="dashboard-grid"] header').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)))
  log('  header heights:', hdr.join(','))
  const kpis = await p.locator('[data-testid^="kpi-card-"]').evaluateAll((els) => els.map((e) => e.dataset.testid.replace('kpi-card-', '')))
  log('  KPIs:', kpis.length, kpis.join(','))
  for (const k of kpis) log(`  ${k}: ${await txt(`[data-testid="kpi-value-${k}"]`)} | ${await txt(`[data-testid="kpi-delta-${k}"]`)} tone=${await p.locator(`[data-testid="kpi-delta-${k}"]`).getAttribute('data-tone')}`)
  log('  sparklines:', await p.locator('[data-testid="kpi-sparkline"]').count(), '| delta pill bgs:', await p.locator('[data-testid^="kpi-delta-"] span').evaluateAll((els) => [...new Set(els.map((e) => getComputedStyle(e).backgroundColor))].join(',')))
  await p.screenshot({ path: `${OUT}/dashboard-1440.png`, fullPage: true })
})
await step('JRN-149', async () => {
  log('JRN-149 volume header:', await txt('[data-testid="volume-created"]'), '| header:', await txt('[data-testid="chart-volume-by-channel-header"]'))
})
await step('JRN-150/162 AI performance', async () => {
  log('AI overview:', await txt('[data-testid="resolved-by-ai-headline"]'), '|', await txt('[data-testid="resolved-by-claude"]'), '|', await txt('[data-testid="resolved-by-grokbot"]'), '|', await txt('[data-testid="resolved-by-human"]'))
  log('  timing:', await txt('[data-testid="chat-timing-panel"] dl'))
  await p.hover('[data-testid="chat-timing-independent"]'); await p.waitForTimeout(500)
  log('  tooltip:', await txt('[data-testid="chat-timing-tooltip"]'))
  await p.click('[data-testid="ai-tab-reasons"]'); log('  handover reasons rows:', await p.locator('[data-testid^="escalation-row-"]').count())
  await p.click('[data-testid="ai-tab-topics"]'); log('  top topics rows:', await p.locator('[data-testid^="tag-row-"]').count())
  await p.click('[data-testid="ai-tab-overview"]')
})
await step('JRN-151/163 Refunds & fraud', async () => {
  log('refunds:', await txt('[data-testid="refund-total"]'), '|', await txt('[data-testid="refund-count"]'), '|', await txt('[data-testid="refund-auto-pct"]'), '|', await txt('[data-testid="refund-pending"]'), '| limit:', await txt('[data-testid="refund-auto-limit"]'), '| pipeline:', await p.locator('[data-testid="refund-pipeline"]').count())
  log('  awaiting shown:', await p.locator('[data-testid="refund-awaiting"] li').count(), '| refunds view all:', await p.locator('[data-testid="refunds-view-all"]').count())
  if (await p.locator('[data-testid="refunds-view-all"]').count()) { await p.click('[data-testid="refunds-view-all"]'); await p.waitForSelector('[data-testid="refunds-sheet"]'); log('  refunds sheet rows:', await p.locator('[data-testid="refund-awaiting-all"] li').count()); await p.click('[data-testid="refunds-sheet-close"]'); await p.waitForTimeout(300) }
  log('  fraud tab label:', await txt('[data-testid="rf-tab-fraud"]'))
  await p.click('[data-testid="rf-tab-fraud"]')
  const rows = await p.locator('[data-testid="fraud-top-open"] > li').evaluateAll((els) => els.map((e) => `${e.dataset.testid}:${Math.round(e.getBoundingClientRect().height)}px`))
  log('  fraud compact rows:', rows.join(', '))
  await p.click('[data-testid="fraud-menu-fa-101"]'); log('  menu items:', (await p.locator('[role="menuitem"]').allInnerTexts()).join(' / '))
  await p.click('[data-testid="fraud-action-hold-fa-101"]'); await p.fill('[data-testid="fraud-note-input"]', 'Checking address'); await p.click('[data-testid="fraud-note-confirm"]')
  await p.waitForSelector('[data-sonner-toast]:has-text("Refund held")'); log('  hold via menu: toast ok')
  await p.locator('[data-sonner-toast] button:has-text("Undo")').click(); await p.waitForTimeout(900); log('  after undo fa-101 top:', await p.locator('[data-testid="fraud-top-open"] [data-testid="fraud-alert-fa-101"]').count())
  await p.screenshot({ path: `${OUT}/dashboard-fraud-tab-1440.png` })
  await p.click('[data-testid="fraud-view-all"]'); await p.waitForSelector('[data-testid="fraud-sheet"]'); await p.waitForTimeout(400)
  await p.screenshot({ path: `${OUT}/view-all-fraud-1440.png` })
  log('  sheet open list:', await p.locator('[data-testid="fraud-list-open"] > li').count())
  await p.click('[data-testid="fraud-action-safe-fa-101"]'); await p.fill('[data-testid="fraud-note-input"]', 'Called the customer'); await p.click('[data-testid="fraud-note-confirm"]'); await p.waitForTimeout(900)
  log('  after safe in sheet:', await p.locator('[data-testid="fraud-list-open"] > li').count())
  await p.click('[data-testid="fraud-sheet-undo"]'); await p.waitForTimeout(900)
  log('  after sheet undo:', await p.locator('[data-testid="fraud-list-open"] > li').count())
  await p.click('[data-testid="fraud-sheet-close"]'); await p.waitForTimeout(300)
  await p.click('[data-testid="rf-tab-refunds"]')
})
await step('JRN-153/164 CSAT', async () => {
  log('csat:', await txt('[data-testid="csat-average"]'), '| rate', await txt('[data-testid="csat-response-rate"]'), '| dist', await p.locator('[data-testid^="csat-dist-"]').count(), '| splits:', await txt('[data-testid="csat-splits"]'))
  log('  comments shown:', await p.locator('[data-testid^="csat-comment-"]').count(), '| view all:', await p.locator('[data-testid="csat-view-all"]').count())
  if (await p.locator('[data-testid="csat-view-all"]').count()) { await p.click('[data-testid="csat-view-all"]'); await p.waitForSelector('[data-testid="csat-sheet"]'); log('  sheet comments:', await p.locator('[data-testid="csat-sheet-comments"] li').count(), 'low:', await p.locator('[data-testid="csat-sheet-low"] li').count()); await p.click('[data-testid="csat-sheet-close"]'); await p.waitForTimeout(300) }
  await p.click('[data-testid="csat-tab-followup"]'); await p.waitForTimeout(200)
  log('  follow-up:', await p.locator('[data-testid="csat-low-scores"] [data-testid^="low-score-"]').count())
  await p.click('[data-testid="csat-settings-button"]'); await p.waitForURL('**/settings/csat'); log('  settings ->', new URL(p.url()).pathname)
  await p.goBack(); await p.waitForSelector('[data-testid="csat-section"]')
})
await step('JRN-148 ranges', async () => {
  for (const r of ['Last 24 hours', '7d', '90d']) { await p.getByRole('button', { name: r, exact: true }).or(p.getByRole('tab', { name: r, exact: true })).or(p.getByRole('radio', { name: r, exact: true })).first().click(); await p.waitForTimeout(900); log(`  ${r}: aiRate=${await txt('[data-testid="kpi-value-aiRate"]')} created=${await txt('[data-testid="kpi-value-created"]')} csat=${await txt('[data-testid="kpi-value-csatAvg"]')}`) }
})
await step('JRN-154', async () => {
  for (const [w, h] of [[1280, 900], [1024, 768], [768, 1024], [390, 844]]) {
    await p.setViewportSize({ width: w, height: h }); await p.goto(`${BASE}/dashboard`); await p.waitForSelector('[data-testid="kpi-card-open"]'); await p.waitForTimeout(1000)
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
    const pair = await p.locator('[data-testid="dashboard-grid"] > *').evaluateAll((els) => new Set(els.map((e) => Math.round(e.getBoundingClientRect().left))).size === 1)
    const eq = await p.locator('[data-testid="dashboard-grid"] > *').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)).join(','))
    log(`JRN-154 ${w}: overflow=${overflow} oneColumn=${pair} heights=${eq}`)
    if (w !== 768) await p.screenshot({ path: `${OUT}/dashboard-${w}.png`, fullPage: true })
    if (w === 390) {
      log('  5th KPI spans:', await p.locator('[data-testid="kpi-card-csatAvg"]').evaluate((e) => Math.round(e.getBoundingClientRect().width)), 'vs', await p.locator('[data-testid="kpi-card-open"]').evaluate((e) => Math.round(e.getBoundingClientRect().width)))
      await p.click('[data-testid="rf-tab-fraud"]'); await p.click('[data-testid="fraud-view-all"]'); await p.waitForTimeout(500)
      log('  phone sheet width:', await p.locator('[data-testid="fraud-sheet"]').evaluate((e) => Math.round(e.getBoundingClientRect().width)))
    }
  }
})
log('console errors:', errors.length, errors.slice(0, 3))
await browser.close()

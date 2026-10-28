// Phase 11 AI-first Inbox journeys (JRN-134..146) + screenshots: node scripts/phase11-check.mjs [baseUrl]
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const BASE = process.argv[2] ?? 'http://localhost:4173'
const OUT = '/app/memory/shots/phase11'
mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome', args: ['--no-sandbox'] })
const errors = []
const log = (...a) => console.log(...a)
const txt = (p, s) => p.locator(s).first().innerText({ timeout: 3000 }).then((t) => t.replace(/\s+/g, ' ').trim()).catch(() => 'MISSING')
const has = (p, s) => p.locator(s).count().then((n) => n > 0)
let p
const step = async (name, fn) => { try { await fn() } catch (e) { log(`FAIL ${name}: ${e.message.split('\n')[0]}`); await p.screenshot({ path: `/tmp/fail11-${name.replace(/\W+/g, '-')}.png` }).catch(() => {}) } }
async function login(page, email = 'ava@goorin.com') {
  await page.goto(`${BASE}/login`)
  await page.fill('input[type=email]', email)
  await page.fill('input[type=password]', 'goorin123')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('**/dashboard')
}
const go = async (path) => { await p.goto(`${BASE}${path}`); await p.waitForLoadState('networkidle'); await p.waitForTimeout(800) }
const ids = (sel) => p.locator(sel).evaluateAll((els) => els.map((e) => e.dataset.testid.replace(/^ticket-link-/, '')))

const ctx = await browser.newContext({ viewport: { width: 1680, height: 900 } })
p = await ctx.newPage()
p.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
p.on('pageerror', (e) => errors.push(`PAGEERROR ${e.message}`))
await login(p)

await step('JRN-134 opens on needs you', async () => {
  await p.setViewportSize({ width: 1440, height: 900 })
  await go('/inbox')
  log('JRN-134 view:', await txt(p, '[data-testid="views-dropdown"]'), '| status line:', await txt(p, '[data-testid="ai-status-line"]'))
  const opts = []
  await p.click('[data-testid="views-dropdown"]')
  for (const o of await p.locator('[role="option"]').all()) opts.push((await o.innerText()).trim())
  await p.keyboard.press('Escape')
  log('JRN-134 switcher:', opts.join(' | '))
  await p.setViewportSize({ width: 1680, height: 900 })
})

await step('JRN-135 cards + sort', async () => {
  await go('/inbox?view=needs_you')
  const list = await ids('[data-testid^="ticket-link-"]')
  log('JRN-135 needs you:', list.join(','))
  for (const id of list) {
    const draft = await has(p, `[data-testid="ticket-draft-ready-${id}"]`)
    log(`  ${id}: ${await txt(p, `[data-testid="ticket-waiting-${id}"]`)} tone=${await p.locator(`[data-testid="ticket-waiting-${id}"]`).getAttribute('data-tone')} draft=${draft} reason="${await txt(p, `[data-testid="ticket-reason-${id}"]`)}"`)
  }
  await p.click('[data-testid="needs-sort"]'); await p.click('[data-testid="needs-sort-newest"]'); await p.waitForTimeout(300)
  log('JRN-135 newest first:', (await ids('[data-testid^="ticket-link-"]')).slice(0, 3).join(','))
})

await step('JRN-136 AI handling + take over', async () => {
  await go('/inbox?view=ai_handling')
  const list = await ids('[data-testid^="ticket-link-"]')
  const states = {}
  for (const id of list) { const s = await txt(p, `[data-testid="ticket-ai-state-${id}"]`); (states[s] ??= []).push(id) }
  log('JRN-136 states:', JSON.stringify(states))
  const target = states['Replying']?.[0]
  await p.click(`[data-testid="take-over-${target}"]`)
  await p.waitForURL(`**/inbox/${target}**`)
  await p.waitForTimeout(800)
  log(`JRN-136 took over ${target}: event="${(await p.locator('[data-testid="event-line"]').last().innerText()).replace(/\s+/g, ' ')}" assignee=${await txt(p, '[data-testid="header-assignee"]')}`)
})

await step('JRN-138 brief + thread', async () => {
  await go('/inbox/GB-1076?view=needs_you')
  log('JRN-138 reason:', await txt(p, '[data-testid="why-brief-reason"]'))
  log('JRN-138 did:', await txt(p, '[data-testid="why-brief-did"]'))
  log('JRN-138 next:', await txt(p, '[data-testid="why-brief-next"]'))
  await p.click('[data-testid="why-brief-how-toggle"]')
  log('JRN-138 how:', await txt(p, '[data-testid="why-brief-how"]'))
  log('JRN-138 event lines:', await p.locator('[data-testid="event-line"]').count(), '| earlier btn:', await txt(p, '[data-testid="thread-show-earlier"]'))
  await go('/inbox/GB-1071?view=needs_you')
  log('JRN-138 GB-1071 short:', await txt(p, '[data-testid="why-brief-short"]'))
})

await step('JRN-139 draft first', async () => {
  await go('/inbox/GB-1076?view=needs_you')
  log('JRN-139 draft:', await txt(p, '[data-testid="draft-label"]'), await txt(p, '[data-testid="draft-confidence"]'))
  await p.click('[data-testid="draft-write-own"]')
  log('JRN-139 write own -> editor:', await has(p, '[data-testid="composer"]'), 'use draft:', await has(p, '[data-testid="composer-use-draft"]'))
  await p.click('[data-testid="composer-use-draft"]')
  await p.click('[data-testid="draft-edit"]'); await p.waitForTimeout(300)
  log('JRN-139 edit loads draft:', (await txt(p, '.ProseMirror')).slice(0, 40))
  await p.click('[data-testid="composer-use-draft"]')
  await p.click('[data-testid="draft-approve-menu"]'); await p.click('[data-testid="draft-approve-handback"]'); await p.waitForTimeout(900)
  log('JRN-139 handback banner:', await txt(p, '[data-testid="ai-handling-text"]'))
  await go('/inbox/GB-1074?view=needs_you')
  await p.keyboard.press('a'); await p.waitForTimeout(900)
  log('JRN-139 "a" approved GB-1074 (draft gone):', !(await has(p, '[data-testid^="draft-card-"]')))
  await go('/inbox/GB-1071?view=needs_you')
  await p.click('[data-testid="composer-ask-draft"]')
  await p.waitForSelector('[data-testid^="draft-card-"]', { timeout: 4000 })
  log('JRN-139 ask AI to draft -> card:', await txt(p, '[data-testid="draft-label"]'))
})

await step('JRN-140 editor', async () => {
  await go('/inbox/GB-1071?view=needs_you')
  if (await has(p, '[data-testid="draft-write-own"]')) await p.click('[data-testid="draft-write-own"]')
  log('JRN-140 placeholder:', await p.locator('.ProseMirror p').first().getAttribute('data-placeholder'), '| send disabled:', await p.locator('[data-testid="composer-send"]').isDisabled())
  await p.click('button[aria-label="Attach"]')
  log('JRN-140 attach toast:', await txt(p, '[data-sonner-toast]'))
  log('JRN-140 toolbar:', (await p.locator('[data-testid="composer"] button[aria-label]').evaluateAll((b) => b.map((x) => x.getAttribute('aria-label')))).join(','))
})

await step('JRN-141 header + menu', async () => {
  await go('/inbox/GB-1076?view=needs_you')
  const h = await p.locator('[data-testid="conversation-header"]').boundingBox()
  log('JRN-141 header height:', Math.round(h.height))
  await p.click('[data-testid="ticket-more"]')
  log('JRN-141 menu:', (await txt(p, '[role="menu"]')).slice(0, 200))
  await p.keyboard.press('Escape')
  await p.keyboard.press('ArrowRight'); await p.waitForTimeout(600)
  log('JRN-141 → moved to:', p.url().split('/inbox/')[1])
  await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(600)
  log('JRN-141 ← back to:', p.url().split('/inbox/')[1])
})

await step('JRN-142 summary', async () => {
  await go('/inbox/GB-1076?view=needs_you')
  for (const r of ['customer', 'order', 'returns', 'risk']) log(`JRN-142 ${r}:`, await txt(p, `[data-testid="summary-${r}"]`))
  await p.click('[data-testid="summary-view-details"]')
  log('JRN-142 full sections:', (await p.locator('[data-testid="full-details"] section h2, [data-testid="full-details"] [data-testid$="-section"]').count()), await has(p, '[data-testid="past-tickets"]'))
  await go('/inbox/GB-1065?view=needs_you')
  log('JRN-142 persisted full:', await has(p, '[data-testid="full-details"]'))
  await p.click('[data-testid="past-tickets"] button[aria-expanded]').catch(() => {})
  log('JRN-142 GB-1065 past:', await txt(p, '[data-testid="past-tickets-count"]'), '| show all:', await has(p, '[data-testid="past-tickets-show-all"]'))
})

await step('JRN-143 orders', async () => {
  await go('/inbox/GB-1076?view=needs_you')
  if (!(await has(p, '[data-testid="full-details"]'))) await p.click('[data-testid="summary-view-details"]')
  log('JRN-143 GB19790 total:', await txt(p, '[data-testid="order-total-order-19790"]'))
  await p.click('[data-testid="order-refund-order-19790"]')
  log('JRN-143 refundable:', await txt(p, '[data-testid="refund-available"]'))
  await p.click('[data-testid="refund-submit"]')
  log('JRN-143 $0:', await txt(p, '[data-testid="refund-invalid"]'))
  await p.locator('[data-testid^="refund-qty-"]').last().fill('1')
  log('JRN-143 over limit:', await txt(p, '[data-testid="refund-over-limit"]'))
  await p.click('[data-testid="refund-submit"]'); await p.waitForSelector('[data-testid="order-action-confirmation"]')
  await p.click('[data-testid="order-action-done"]'); await p.waitForTimeout(700)
  log('JRN-143 refund event:', (await p.locator('[data-testid="event-line"]').last().innerText()).replace(/\s+/g, ' '))
  const firstEdit = p.locator('[data-testid^="order-edit-"]').first()
  const oid = (await firstEdit.getAttribute('data-testid')).replace('order-edit-', '')
  await firstEdit.click()
  for (const b of await p.locator('[data-testid^="edit-remove-"]').all()) await b.click()
  await p.click('[data-testid="order-dialog-confirm"]')
  log('JRN-143 edit empty:', await txt(p, '[data-testid="edit-order-error"]'))
  await p.locator('[data-testid$="-inc"]').first().click(); await p.locator('[data-testid$="-inc"]').first().click()
  await p.click('[data-testid="order-dialog-confirm"]'); await p.waitForSelector('[data-testid="order-action-confirmation"]'); await p.click('[data-testid="order-action-done"]'); await p.waitForTimeout(500)
  log(`JRN-143 edit applied ${oid}:`, await txt(p, `[data-testid="order-total-${oid}"]`))
  await p.locator('[data-testid^="order-duplicate-"]').first().click(); await p.click('[data-testid="order-dialog-confirm"]'); await p.click('[data-testid="order-action-done"]'); await p.waitForTimeout(500)
  log('JRN-143 duplicate draft cards:', await p.locator('[data-testid^="order-draft-"]').count())
  await p.click('[data-testid="shopify-orders-menu"]'); await p.click('[data-testid="shopify-create-order"]')
  log('JRN-143 create disabled empty:', await p.locator('[data-testid="order-dialog-confirm"]').isDisabled())
  await p.fill('[data-testid="create-order-search"]', 'fedora'); await p.waitForTimeout(400)
  await p.locator('[data-testid^="create-order-product-"]').first().click()
  await p.click('[data-testid="create-order-qty-0-inc"]'); await p.fill('[data-testid="create-order-discount"]', '10')
  log('JRN-143 create total:', await txt(p, '[data-testid="create-order-total"]'))
  await p.click('[data-testid="order-dialog-confirm"]'); await p.waitForSelector('[data-testid="order-action-confirmation"]'); await p.click('[data-testid="order-action-done"]'); await p.waitForTimeout(500)
  log('JRN-143 draft cards after create:', await p.locator('[data-testid^="order-draft-"]').count())
})

await step('JRN-144 saved views', async () => {
  await go('/inbox?saved=sv-damaged')
  log('JRN-144 saved range:', await txt(p, '[data-testid="pagination-range"]'))
  await p.setViewportSize({ width: 1920, height: 1000 })
  await go('/inbox')
  await p.locator('[data-testid="views-shared"] [data-testid^="saved-view-menu-"]').first().click()
  await p.click('[data-testid="saved-view-delete"]')
  log('JRN-144 confirm:', await txt(p, '[data-testid="delete-view-dialog"] h2'))
  await p.click('[data-testid="delete-view-cancel"]')
  await p.setViewportSize({ width: 1440, height: 900 })
})

await step('JRN-145 ask AI + shortcuts', async () => {
  await go('/inbox/GB-1076?view=needs_you')
  await p.keyboard.press('Control+g'); await p.waitForSelector('[data-testid="ask-ai-panel"]')
  log('JRN-145 context:', await txt(p, '[data-testid="ask-ai-context"]'))
  await p.waitForSelector('[data-testid="ask-ai-prompt-2"]'); await p.click('[data-testid="ask-ai-prompt-2"]')
  await p.waitForSelector('[data-testid="ask-ai-sources"]')
  log('JRN-145 refund answer:', (await txt(p, '[data-testid="ask-ai-answer"]')).slice(0, 220), '| sources:', await txt(p, '[data-testid="ask-ai-sources"]'))
  await p.fill('[data-testid="ask-ai-input"]', 'what is the weather'); await p.click('[data-testid="ask-ai-send"]'); await p.waitForTimeout(900)
  log('JRN-145 fallback:', await txt(p, '[data-testid="ask-ai-turn-1"] [data-testid="ask-ai-answer"]'))
  await p.click('[data-testid="ask-ai-close"]'); await p.waitForTimeout(300)
  await p.locator('body').click({ position: { x: 5, y: 5 } }).catch(() => {})
  await p.keyboard.press('?'); await p.waitForTimeout(400)
  log('JRN-145 shortcuts:', (await txt(p, '[role="dialog"]')).slice(0, 260))
  await p.keyboard.press('Escape')
})

await step('JRN-146 visual + widths', async () => {
  for (const w of [1024, 1440, 1920]) {
    await p.setViewportSize({ width: w, height: 900 })
    await go('/inbox/GB-1076?view=needs_you')
    const cw = await p.locator('[aria-label="Conversation"]').first().evaluate((e) => Math.round(e.getBoundingClientRect().width))
    log(`JRN-146 ${w}: conversation=${cw} docked=${await p.locator('[data-testid="inbox-views-panel"]').isVisible().catch(() => false)} canvas=${await p.evaluate(() => getComputedStyle(document.body).backgroundColor)}`)
    await p.screenshot({ path: `${OUT}/inbox-${w}.png` })
  }
  await p.setViewportSize({ width: 768, height: 1000 })
  await go('/inbox/GB-1076?view=needs_you')
  log('JRN-146 768 list+conv:', await p.locator('[aria-label="Ticket list"]').isVisible(), await p.locator('[aria-label="Conversation"]').isVisible())
  await p.click('[data-testid="details-toggle"]'); await p.waitForTimeout(300)
  log('JRN-146 768 details sheet:', await p.locator('[data-testid="ticket-details-sheet"]').isVisible())
  await p.screenshot({ path: `${OUT}/inbox-768.png` })
})

await step('REQ-677 agent as Sam', async () => {
  await p.setViewportSize({ width: 1920, height: 1000 })
  await go('/inbox')
  await p.click('[data-testid="user-menu-trigger"]'); await p.waitForTimeout(300)
  await p.click('[data-testid="role-toggle-agent"]'); await p.waitForTimeout(500)
  await p.keyboard.press('Escape')
  await go('/inbox')
  await p.locator('[data-testid="views-shared"] [data-testid^="saved-view-menu-"]').first().click()
  log('REQ-677 agent delete disabled:', await p.locator('[data-testid="saved-view-delete"]').getAttribute('data-disabled'), '|', await txt(p, '[data-testid="saved-view-locked"]'))
  await p.keyboard.press('Escape')
})

const ph = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
const pp = await ph.newPage()
pp.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
await login(pp)
await pp.goto(`${BASE}/inbox`); await pp.waitForTimeout(1000)
log('phone opens on:', await txt(pp, '[aria-current="page"][data-testid^="view-chip-"]'))
await pp.screenshot({ path: `${OUT}/inbox-390-list.png` })
await pp.click('[data-testid="views-sheet-trigger"]'); await pp.waitForTimeout(400)
log('phone views sheet saved:', await pp.locator('[data-testid^="views-sheet-saved-"]').count())
await pp.keyboard.press('Escape')
await pp.goto(`${BASE}/inbox/GB-1076?view=needs_you`); await pp.waitForTimeout(1200)
log('phone draft docked:', await pp.locator('[data-testid^="draft-card-"]').isVisible())
await pp.screenshot({ path: `${OUT}/inbox-390-ticket.png` })
await pp.click('[data-testid="ticket-actions-trigger"]'); await pp.waitForTimeout(300)
log('phone ask AI in menu:', await pp.locator('[data-testid="ticket-ask-ai"]').isVisible())
await pp.keyboard.press('Escape')
await pp.click('[data-testid="details-toggle"]'); await pp.waitForTimeout(300)
await pp.click('[data-testid="summary-view-details"]').catch(() => {})
await pp.locator('[data-testid^="order-refund-"]').first().click()
const box = await pp.locator('[data-testid="order-dialog-refund"]').boundingBox()
log('phone order dialog full-screen:', box && Math.round(box.width), box && Math.round(box.height))
log('phone overflow:', await pp.evaluate(() => document.documentElement.scrollWidth > innerWidth))

// Iteration 14 fixes: brief vs draft vs summary vs Ask AI share one data source; widths; status line.
{
  const cx = await browser.newContext({ viewport: { width: 1680, height: 900 } })
  const q = await cx.newPage()
  await login(q)
  const money = (t) => (t.match(/\$[\d,]+\.\d\d/g) ?? [])
  for (const id of ['GB-1076', 'GB-1064', 'GB-1068']) {
    await q.goto(`${BASE}/inbox/${id}?view=all`); await q.waitForSelector('[data-testid="message-thread"]'); await q.waitForTimeout(700)
    if (await q.locator('[data-testid="summary-rows"]').count() === 0 && await q.locator('[data-testid="summary-view-details"]').count()) await q.click('[data-testid="summary-view-details"]')
    const did = await txt(q, '[data-testid="why-brief-did"]')
    const draft = await txt(q, '[data-testid="draft-confidence"]')
    const ret = await txt(q, '[data-testid="summary-returns"]')
    const briefPct = did.match(/(\d+)% confidence/)?.[1]
    const draftPct = draft.match(/(\d+)%/)?.[1]
    const briefLoop = did.match(/Loop returns? \((\$[\d,.]+) returned/)?.[1]
    const sumLoop = money(ret)[0]
    let askLoop = 'n/a'
    if (briefLoop) {
      await q.keyboard.press('Control+g'); await q.waitForSelector('[data-testid="ask-ai-prompt-0"]', { timeout: 5000 }).catch(() => {})
      const inp = q.locator('[data-testid="ask-ai-input"], [data-testid="assistant-input"]').first()
      if (await inp.count()) { await inp.fill('Is this refund eligible?'); await inp.press('Enter'); await q.waitForSelector('[data-testid="ask-ai-answer"]:has-text("returned")', { timeout: 5000 }).catch(() => {}); askLoop = (await q.locator('[data-testid="ask-ai-answer"]').last().innerText().catch(() => '')).match(/(\$[\d,.]+) returned/)?.[1] ?? 'MISSING' }
      await q.keyboard.press('Escape')
    }
    const ok = (briefPct === undefined || draftPct === undefined || briefPct === draftPct) && (!briefLoop || (briefLoop === sumLoop && (askLoop === 'n/a' || askLoop === briefLoop)))
    log(`facts ${id}: brief ${briefPct ?? '-'}% vs draft ${draftPct ?? '-'}% | loop brief ${briefLoop ?? '-'} summary ${sumLoop ?? '-'} ask ${askLoop} | ${ret} -> ${ok ? 'MATCH' : 'FAIL mismatch'}`)
  }
  const nameW = async () => q.locator('[data-testid="conversation-customer"]').evaluate((e) => ({ w: Math.round(e.getBoundingClientRect().width), first: e.closest('[data-testid="conversation-meta"]').innerText.trim().slice(0, 16) }))
  for (const w of [1024, 1100, 1279]) {
    await q.setViewportSize({ width: w, height: 800 }); await q.goto(`${BASE}/inbox/GB-1076`); await q.waitForSelector('[data-testid="conversation-customer"]'); await q.waitForTimeout(500)
    const closed = await nameW()
    const exp = q.locator('[aria-label="Expand details panel"]'); let open = { w: 'n/a', first: '' }
    if (await exp.count()) { await exp.click(); await q.waitForTimeout(300); open = await nameW(); await q.keyboard.press('Escape'); await q.waitForTimeout(200) }
    log(`name width ${w}: closed ${closed.w}px "${closed.first}" | drawer open ${open.w}px -> ${closed.w > 0 && (open.w === 'n/a' || open.w > 0) && !closed.first.startsWith('·') ? 'OK' : 'FAIL name collapsed'}`)
    if (w === 1024) await q.locator('[data-testid="conversation-header"]').screenshot({ path: `${OUT}/header-name-1024.png` })
  }
  for (const w of [1024, 1280, 1440, 1920]) {
    await q.setViewportSize({ width: w, height: 800 }); await q.goto(`${BASE}/inbox/GB-1076`); await q.waitForSelector('[data-testid="message-thread"]'); await q.waitForTimeout(600)
    const cw = await q.locator('[aria-label="Conversation"]').evaluate((e) => Math.round(e.getBoundingClientRect().width))
    const st = await q.locator('[data-testid="ai-status-line"]').evaluate((e) => ({ clipped: e.scrollWidth > e.clientWidth + 1, h: Math.round(e.getBoundingClientRect().height) }))
    const meta = await q.locator('[data-testid="conversation-meta"]').evaluate((e) => e.scrollWidth > e.clientWidth + 1)
    const hh = await q.locator('[data-testid="conversation-header"]').evaluate((e) => Math.round(e.getBoundingClientRect().height))
    log(`width ${w}: conversation ${cw}px ${cw >= 480 ? 'OK' : 'FAIL <480'} | status clipped ${st.clipped} h${st.h} | meta clipped ${meta} | header ${hh}px`)
    if (w === 1024) {
      await q.click('[aria-label="Expand details panel"]'); await q.waitForTimeout(300)
      log('  1024 drawer:', await q.locator('[data-testid="details-drawer"]').count(), 'backdrop', await q.locator('[data-testid="details-drawer-backdrop"]').count(), 'conv still', await q.locator('[aria-label="Conversation"]').evaluate((e) => Math.round(e.getBoundingClientRect().width)))
      await q.screenshot({ path: `${OUT}/inbox-1024-drawer.png` })
      await q.keyboard.press('Escape'); await q.waitForTimeout(200); log('  Esc closes:', await q.locator('[data-testid="details-drawer"]').count() === 0)
      await q.screenshot({ path: `${OUT}/inbox-1024.png` })
    }
    if (w === 1440 || w === 1920) await q.locator('[data-testid="conversation-header"]').screenshot({ path: `${OUT}/header-spacing-after-${w}.png` })
    if (w === 1440) await q.locator('[data-testid="why-brief"]').screenshot({ path: `${OUT}/brief-no-sliver-after.png` })
  }
  await q.setViewportSize({ width: 1440, height: 900 }); await q.goto(`${BASE}/inbox/GB-1076`); await q.waitForSelector('[data-testid^="draft-card-"]')
  await q.click('[data-testid="draft-approve"]').catch(async () => { await q.locator('[data-testid^="draft-card-"] button:has-text("Approve")').first().click() })
  await q.waitForSelector('[data-sonner-toast]', { timeout: 4000 }).catch(() => {})
  log('approve toast:', await txt(q, '[data-sonner-toast]'))
  await cx.close()
}

await step('Details overflow', async () => {
  for (const w of [1024, 1440, 1680]) {
    await p.setViewportSize({ width: w, height: 900 })
    for (const id of ['GB-1076', 'GB-1068', 'GB-1058']) {
      await p.goto(`${BASE}/inbox/${id}`); await p.waitForSelector('[data-testid="message-thread"]'); await p.waitForTimeout(500)
      const drawer = w < 1600
      if (drawer) { await p.click('[aria-label="Expand details panel"]'); await p.waitForTimeout(300) }
      const root = drawer ? '[data-testid="details-drawer"]' : '[data-testid="customer-panel"]'
      if (!(await p.locator(`${root} [data-testid="details-sidebar"]`).count())) { await p.click(`${root} [data-testid="summary-view-details"]`); await p.waitForTimeout(400) }
      const bad = await p.locator(root).first().evaluate((panel) => {
        const pb = panel.getBoundingClientRect(), pl = pb.left, pr = pb.left + panel.clientLeft + panel.clientWidth
        // Full-bleed section containers may touch the edge; their content must stay inside the 20px padding.
        return [...panel.querySelectorAll('[data-testid="details-sidebar"] *, [data-testid="summary-panel"] *')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.left > pl + 1 && r.right > pr - 20 + 0.5 && !e.closest('.sr-only') && getComputedStyle(e).position !== 'fixed' }).map((e) => (e.dataset.testid || e.tagName) + ':' + Math.round(e.getBoundingClientRect().right - pr + 20)).slice(0, 5)
      })
      log(`details overflow ${id} @${w}${w < 1600 ? ' drawer' : ' docked'}: ${bad.length ? 'FAIL ' + bad.join(', ') : 'OK'}`)
      if (id === 'GB-1076') { const sec = p.locator(`${root} [data-testid="loop-returns"]`); await sec.scrollIntoViewIfNeeded(); await sec.screenshot({ path: `${OUT}/returns-fix-${w}.png` }) }
      if (drawer) await p.keyboard.press('Escape')
    }
  }
})
log('console errors:', errors.length, JSON.stringify(errors.slice(0, 5)))
await browser.close()

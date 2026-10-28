// Inbox header v2 / draft composer v2 / brief glow / sidebar-expanded widths / demo-pill overlap: node scripts/phase11-v2.mjs [baseUrl] [tag]
import { chromium } from 'playwright-core'
const BASE = process.argv[2] ?? 'http://localhost:4173'
const TAG = process.argv[3] ?? 'after'
const OUT = '/app/memory/shots/phase11'
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] })
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
const p = await ctx.newPage()
const errs = []; p.on('pageerror', (e) => errs.push(e.message))
const log = (...a) => console.log(...a)
await p.goto(`${BASE}/login`); await p.fill('input[type=email]', 'ava@goorin.com'); await p.fill('input[type=password]', 'goorin123'); await p.getByRole('button', { name: 'Sign in' }).click(); await p.waitForURL('**/dashboard')
const box = (s) => p.locator(s).first().evaluate((e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.x), r: Math.round(r.right), y: Math.round(r.y), b: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height) } }).catch(() => null)
const overlaps = (a, c) => a && c && a.x < c.r && c.x < a.r && a.y < c.b && c.y < a.b
const open = async (id) => { await p.goto(`${BASE}/inbox/${id}`); await p.waitForSelector('[data-testid="message-thread"]'); await p.waitForTimeout(700) }

log('sidebar on /dashboard:', (await box('[data-testid="sidebar"]'))?.w)
for (const w of [1024, 1280, 1440, 1920]) {
  await p.setViewportSize({ width: w, height: 900 }); await open('GB-1076')
  const sb = (await box('[data-testid="sidebar"]'))?.w, conv = (await box('[aria-label="Conversation"]'))?.w
  const hdr = await box('[data-testid="conversation-header-inner"]'), brief = await box('[data-testid="why-brief"]'), dock = await box('[data-testid="draft-dock"] [data-testid^="draft-card-"]')
  const hb = await box('[data-testid="conversation-header"]')
  const subj = await box('[data-testid="conversation-subject"]'), meta = await box('[data-testid="conversation-meta"]')
  const gaps = await p.locator('[data-testid="conversation-controls"] > *').evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((r, i, a) => (i ? Math.round(r.x - a[i - 1].right) : null)).filter((x) => x !== null))
  const hs = await p.locator('[data-testid="conversation-controls"] > *').evaluateAll((els) => els.map((e) => Math.round((e.querySelector('button,span') ?? e).getBoundingClientRect().height)))
  const acts = await p.locator('[data-testid="conversation-actions"] > *:visible').evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return `${Math.round(r.width)}x${Math.round(r.height)}` }))
  const cname = (await box('[data-testid="conversation-customer"]'))?.w
  const contentX = await p.locator('[data-testid="conversation-header-inner"] > div').first().evaluate((e) => Math.round(e.getBoundingClientRect().x))
  log(`@${w}: sidebar ${sb} | conversation ${conv}px ${conv >= 480 ? 'OK' : 'FAIL'} | name ${cname}px | header h${hb?.h} pad-top ${subj && hb ? subj.y - hb.y : '-'} pad-bottom ${meta && hb ? hb.b - meta.b : '-'} | subj→meta ${subj && meta ? meta.y - subj.b : '-'}`)
  log(`   header text x ${contentX} | brief x ${brief?.x}–${brief?.r} | draft card x ${dock?.x}–${dock?.r} | header actions right ${hdr ? hdr.r - 24 : '-'} | brief gap below header ${brief && hb ? brief.y - hb.b : '-'}`)
  log('   meta clipped:', await p.locator('[data-testid="conversation-meta"]').evaluate((e) => e.scrollWidth > e.clientWidth + 1), '| visible controls:', (await p.locator('[data-testid="conversation-controls"] > *').allInnerTexts()).map((t) => t.trim() || 'icon').join(' / '))
  log(`   control gaps ${gaps.join('/')} heights ${hs.join('/')} | actions ${acts.join(' ')}`)
  if (w >= 1280) await p.locator('[data-testid="conversation-header"]').screenshot({ path: `${OUT}/header-spacing-v2-${TAG}-${w}.png` })
  if (w === 1440 || w === 1920) {
    await p.locator('[aria-label="Conversation"]').screenshot({ path: `${OUT}/draft-composer-v2-${TAG}-${w}.png`, clip: undefined }).catch(() => {})
    const dk = await box('[data-testid="draft-dock"]'); if (dk) await p.screenshot({ path: `${OUT}/draft-composer-v2-${w}.png`, clip: { x: dk.x, y: Math.max(0, dk.y - 40), width: dk.w, height: dk.h + 40 } })
    const actions = await box('[data-testid="draft-actions"]'), card = await box('[data-testid="draft-dock"] [data-testid^="draft-card-"]')
    log(`   draft actions inside card: ${actions && card && actions.b <= card.b && actions.y >= card.y} | card bottom ${card?.b} ≤ viewport ${900} | line length ~${await p.locator('[data-testid="draft-body"]').evaluate((e) => Math.round(e.clientWidth / 7.4))} chars`)
    const demo = await box('[data-testid="demo-state-trigger"]')
    const ctrls = await p.locator('button:visible, a:visible, input:visible').evaluateAll((els) => els.filter((e) => e.dataset.testid !== 'demo-state-trigger').map((e) => { const r = e.getBoundingClientRect(); return { x: r.x, r: r.right, y: r.y, b: r.bottom, id: e.dataset.testid || e.textContent?.slice(0, 20) } }))
    log(`   demo pill ${demo ? `${demo.w}x${demo.h} at ${demo.x},${demo.y}` : 'hidden'} overlaps: ${ctrls.filter((c) => overlaps(demo, c)).map((c) => c.id).join(', ') || 'none'}`)
  }
  if (w === 1440) {
    await p.locator('[data-testid="why-brief"]').evaluate((e) => e.scrollIntoView({ block: 'center' }))
    const bb = await box('[data-testid="why-brief"]'); await p.screenshot({ path: `${OUT}/brief-glow-1440.png`, clip: { x: bb.x - 24, y: Math.max(0, bb.y - 24), width: bb.w + 48, height: Math.min(bb.h + 48, 860) } })
    log('   brief glow:', await p.locator('[data-testid="why-brief"]').evaluate((e) => getComputedStyle(e).boxShadow + ' | border ' + getComputedStyle(e).borderTopColor), '| draft card shadow:', await p.locator('[data-testid="draft-dock"] [data-testid^="draft-card-"]').evaluate((e) => getComputedStyle(e).boxShadow))
    await p.click('[data-testid="draft-expand"]'); await p.waitForTimeout(300)
    const card = await box('[data-testid="draft-dock"] [data-testid^="draft-card-"]'), act = await box('[data-testid="draft-actions"]')
    log(`   expanded: card h${card.h} (≤ ${450}) actions visible ${act.b <= 900}`)
  }
}
for (const w of [1024, 1100, 1279]) {
  await p.setViewportSize({ width: w, height: 800 }); await open('GB-1076')
  const n1 = (await box('[data-testid="conversation-customer"]'))?.w
  const exp = p.locator('[aria-label="Expand details panel"]'); let n2 = 'n/a'
  if (await exp.count()) { await exp.click(); await p.waitForTimeout(300); n2 = (await box('[data-testid="conversation-customer"]'))?.w; await p.keyboard.press('Escape') }
  log(`name @${w}: closed ${n1}px drawer-open ${n2}px | conversation ${(await box('[aria-label="Conversation"]'))?.w}px`)
}
// phone
const ph = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
const q = await ph.newPage()
await q.goto(`${BASE}/login`); await q.fill('input[type=email]', 'ava@goorin.com'); await q.fill('input[type=password]', 'goorin123'); await q.getByRole('button', { name: 'Sign in' }).click(); await q.waitForURL('**/dashboard')
await q.goto(`${BASE}/inbox/GB-1076`); await q.waitForSelector('[data-testid="draft-actions"]'); await q.waitForTimeout(600)
const pa = await q.locator('[data-testid="draft-actions"] > *').evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return `${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}` }))
log('phone draft actions:', pa.join(' | '))
const dk = await q.locator('[data-testid="draft-dock"]').boundingBox(); await q.screenshot({ path: `${OUT}/draft-composer-v2-390.png`, clip: { x: 0, y: Math.max(0, dk.y - 60), width: 390, height: Math.min(844 - Math.max(0, dk.y - 60), dk.height + 60) } })
const demo = await q.locator('[data-testid="demo-state-trigger"]').boundingBox().catch(() => null)
const hits = await q.locator('button:visible, a:visible, input:visible').evaluateAll((els, d) => els.filter((e) => e.dataset.testid !== 'demo-state-trigger').filter((e) => { const r = e.getBoundingClientRect(); return d && r.x < d.x + d.width && d.x < r.right && r.y < d.y + d.height && d.y < r.bottom }).map((e) => e.dataset.testid || e.textContent?.slice(0, 20)), demo)
log('phone demo pill overlaps:', hits.join(', ') || 'none', '| brief shadow:', await q.locator('[data-testid="why-brief"]').evaluate((e) => getComputedStyle(e).boxShadow))
log('page errors:', errs.length, [...new Set(errs)].slice(0, 3))
await b.close()

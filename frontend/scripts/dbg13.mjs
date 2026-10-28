import { chromium } from 'playwright-core'
const BASE = 'http://localhost:4173'
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] })
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
p.on('pageerror', (e) => console.log('ERR', e.message))
await p.goto(`${BASE}/login`); await p.fill('input[type=email]', 'ava@goorin.com'); await p.fill('input[type=password]', 'goorin123'); await p.getByRole('button', { name: 'Sign in' }).click(); await p.waitForURL('**/dashboard')
const go = async (u) => { await p.evaluate((x) => { history.pushState({}, '', x); dispatchEvent(new PopStateEvent('popstate')) }, u); await p.waitForTimeout(900) }
await go('/ai/workflows/wf-order-tracking'); await p.click('[data-testid="editor-view-canvas"]'); await p.waitForSelector('.react-flow__node'); await p.waitForTimeout(800)
const edge = p.locator('.react-flow__edge[aria-label="Edge from ot-1 to ot-2"]')
const pt = await edge.locator('path.react-flow__edge-path').evaluate((el) => { const q = el.getPointAtLength(el.getTotalLength() * 0.7); const m = el.getScreenCTM(); return { x: q.x * m.a + m.e, y: q.y * m.d + m.f, len: el.getTotalLength() } })
console.log('pt', pt, await p.evaluate(({x,y}) => { const e = document.elementFromPoint(x, y); return e?.className?.baseVal ?? e?.className }, pt))
await p.mouse.click(pt.x, pt.y); await p.waitForTimeout(400)
console.log('selected cls', await edge.getAttribute('class'))
await edge.locator('.react-flow__edge-interaction').dispatchEvent('click'); await p.waitForTimeout(300); console.log('after dispatch', await edge.getAttribute('class'))
await b.close()

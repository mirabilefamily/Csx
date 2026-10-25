// Regression check for the integration model save + leave guard: node scripts/integration-check.mjs [baseUrl]
import { chromium } from 'playwright-core'

const BASE = process.argv[2] ?? 'http://localhost:4173'
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome', args: ['--no-sandbox'] })
const out = []
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 640, hasTouch: w < 640 })
  const p = await ctx.newPage()
  const pick = async (model) => {
    await p.click('[data-testid=model-select-claude]')
    await p.getByRole('option', { name: model, exact: true }).click()
  }
  await p.goto(`${BASE}/login`)
  await p.fill('input[type=email]', 'ava@goorin.com')
  await p.fill('input[type=password]', 'x')
  await p.getByRole('button', { name: 'Sign in' }).click()
  await p.waitForURL('**/dashboard')
  await p.goto(`${BASE}/settings/integrations`)
  await p.click('[data-testid=integration-tile-claude]')
  await p.waitForSelector('[data-testid=model-select-claude]')
  const models = await (async () => { await p.click('[data-testid=model-select-claude]'); const o = await p.getByRole('option').allInnerTexts(); await p.keyboard.press('Escape'); return o })()
  const before = await p.innerText('[data-testid=model-select-claude]')
  const next = models.find((m) => m !== before)
  // 1. dirty + back link → dialog, Keep editing stays
  await pick(next)
  await p.click('[data-testid=integration-back]')
  const dlg1 = await p.isVisible('[data-testid=unsaved-dialog]')
  await p.click('[data-testid=unsaved-keep-editing]')
  const stayed = p.url().includes('/integrations/claude')
  // 2. browser back while dirty → dialog
  await p.goBack()
  await p.waitForTimeout(400)
  const dlg2 = await p.isVisible('[data-testid=unsaved-dialog]')
  const stayed2 = p.url().includes('/integrations/claude')
  await p.click('[data-testid=unsaved-keep-editing]')
  // 3. save → tile shows new model
  await p.click('[data-testid=integration-save]')
  await p.waitForSelector('text=Claude settings saved')
  await p.click('[data-testid=integration-back]')
  await p.waitForSelector('[data-testid=integration-model-claude]')
  const tile = await p.innerText('[data-testid=integration-model-claude]')
  out.push(`${w}: back-link dialog=${dlg1} stayed=${stayed} | browser-back dialog=${dlg2} stayed=${stayed2} | saved ${before}→${next}, tile shows ${tile} ${tile === next ? 'OK' : 'STALE'}`)
  await ctx.close()
}
await browser.close()
console.log(out.join('\n'))

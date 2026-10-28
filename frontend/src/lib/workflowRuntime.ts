import type { RunChatMessage, RunOrder, Step, TestRun, Workflow, WorkflowChannel } from '@/types'
import { handlesOf, outEdge } from './workflowGraph'

// MOCKED runtime shared by Test workflow and the widget demo. Order details never reach chat before the code is verified (REQ-748).
export interface RuntimeDeps { findOrders: (email: string) => RunOrder[]; handoverText?: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
let seq = 0
const mid = () => `m${++seq}`
const code6 = () => String(Math.floor(100000 + Math.random() * 900000))

function fill(text: string, vars: Record<string, unknown>) {
  return text.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (m, k: string) => (vars[k] != null ? String(vars[k]) : m))
}

export function startRun(wf: Pick<Workflow, 'id' | 'steps' | 'edges'>, channel: WorkflowChannel, deps: RuntimeDeps, sender?: string, firstMessage?: string): TestRun {
  const run: TestRun = { workflowId: wf.id, channel, vars: { channel, ...(channel !== 'chat' && sender ? { email: sender } : {}) }, current: null, waitingFor: null, attempts: 0, chat: firstMessage ? [{ id: mid(), from: 'customer', text: firstMessage }] : [], inbox: [], log: [{ stepId: 'trigger', text: firstMessage ? `Trigger matched: “${firstMessage}”` : 'Trigger started', ok: true }], ended: null }
  return advance(wf, run, outEdge(wf, 'trigger', 'next')?.target ?? null, deps)
}

function bot(run: TestRun, text: string, extra: Partial<RunChatMessage> = {}) { run.chat.push({ id: mid(), from: 'bot', text, ...extra }) }

function sendCode(run: TestRun, st: Step) {
  const code = code6()
  run.vars.code = code
  run.vars.verified = false
  run.inbox.unshift({ id: mid(), from: 'Goorin Bros. <support@goorin.com>', to: String(run.vars.email ?? ''), subject: 'Your Goorin verification code', body: `Your verification code is ${code}. It expires in 10 minutes. If you didn't ask for this, you can ignore this email.`, at: new Date().toISOString() })
  run.log.push({ stepId: st.id, text: `Sent code email to ${run.vars.email}`, ok: true })
}

function advance(wf: Pick<Workflow, 'steps' | 'edges'>, prev: TestRun, startId: string | null, deps: RuntimeDeps): TestRun {
  const run: TestRun = structuredClone(prev)
  let id = startId
  for (let guard = 0; id && guard < 60; guard++) {
    const st = wf.steps.find((x) => x.id === id)
    if (!st) break
    run.current = st.id
    const c = st.config
    const go = (h: string) => outEdge(wf, st.id, h)?.target ?? null
    const next = () => go(handlesOf(st)[0]?.[0] ?? 'next')
    switch (st.type) {
      case 'message': bot(run, fill(c.text ?? '', run.vars), c.linkLabel && c.linkUrl ? { link: { label: c.linkLabel, url: fill(c.linkUrl, run.vars) } } : {}); run.log.push({ stepId: st.id, text: 'Sent message', ok: true }); id = next(); continue
      case 'ask':
        if (c.variable === 'email' && run.channel !== 'chat' && run.vars.email) { run.log.push({ stepId: st.id, text: `Used the sender's email ${run.vars.email}`, ok: true }); id = next(); continue }
        bot(run, fill(c.text ?? '', run.vars), c.kind === 'buttons' ? { buttons: (c.options ?? []).map((o) => o.label) } : c.helpLabel ? { buttons: [c.helpLabel] } : {})
        run.waitingFor = st.id; run.log.push({ stepId: st.id, text: 'Waiting for the customer', ok: true }); return run
      case 'send_code': sendCode(run, st); bot(run, fill(c.text ?? '', run.vars)); id = next(); continue
      case 'check_code': run.attempts = 0; run.waitingFor = st.id; return run
      case 'find_orders': {
        const orders = deps.findOrders(String(run.vars[c.variable ?? 'email'] ?? ''))
        run.vars.orders = orders; run.vars['orders.count'] = orders.length; run.vars['orders.unfulfilled'] = orders.filter((o) => /unfulfilled|processing/i.test(o.status)).length
        if (orders[0]) { run.vars['order.number'] = orders[0].number; run.vars['order.tracking_url'] = orders[0].trackingUrl ?? '' }
        run.log.push({ stepId: st.id, text: `Found ${orders.length} order${orders.length === 1 ? '' : 's'} for ${run.vars.email}`, ok: true }); id = next(); continue
      }
      case 'show_orders': {
        const orders = ((run.vars.orders as RunOrder[]) ?? []).slice(0, c.limit ?? 3)
        if (run.channel === 'chat') {
          if (run.vars.verified !== true) { run.log.push({ stepId: st.id, text: 'Blocked: code not verified, no order details shown', ok: false }); bot(run, "I need to verify your email before I can share order details."); run.ended = 'blocked'; run.current = null; return run }
          bot(run, `Here ${orders.length === 1 ? 'is your latest order' : `are your latest ${orders.length} orders`}:`, { orders })
        } else {
          run.inbox.unshift({ id: mid(), from: 'Goorin Bros. <support@goorin.com>', to: String(run.vars.email), subject: 'Your Goorin orders', body: orders.map((o) => `${o.number} · ${o.date} · ${o.items} · ${o.status}${o.trackingUrl ? ` · Track: ${o.trackingUrl}` : ''}`).join('\n'), at: new Date().toISOString() })
          bot(run, `I've emailed your order details to ${run.vars.email}.`)
        }
        run.log.push({ stepId: st.id, text: `Showed ${orders.length} order${orders.length === 1 ? '' : 's'}`, ok: true }); id = next(); continue
      }
      case 'condition': {
        const v = c.condVar === 'channel' ? run.channel : run.vars[c.condVar ?? '']
        const n = Number(v), m = Number(c.condValue)
        const yes = c.op === 'gt' ? n > m : c.op === 'lt' ? n < m : String(v ?? '') === String(c.condValue ?? '')
        run.log.push({ stepId: st.id, text: `${yes ? c.yesLabel : c.noLabel}`, ok: true }); id = go(yes ? 'yes' : 'no'); continue
      }
      case 'start_return': run.vars.rma = `#LR-${Math.floor(1000 + Math.random() * 9000)}`; run.log.push({ stepId: st.id, text: `Started return ${run.vars.rma} (mock)`, ok: true }); id = next(); continue
      case 'handover':
        bot(run, deps.handoverText ?? `Test run ended: handed to ${c.team ?? 'Support'} (no real ticket created).`)
        run.log.push({ stepId: st.id, text: `Handed to ${c.team ?? 'Support'}${c.tag ? ` · tag ${c.tag}` : ''}`, ok: true }); run.ended = `handed to ${c.team ?? 'Support'}`; run.current = st.id; return run
      case 'end':
        if (c.csat) bot(run, 'Thanks! How did we do today? (1–5)')
        run.log.push({ stepId: st.id, text: 'Workflow ended', ok: true }); run.ended = 'completed'; return run
      default: run.log.push({ stepId: st.id, text: `${st.type.replace('_', ' ')} (mock)`, ok: true }); id = next(); continue
    }
  }
  if (!run.ended && !run.waitingFor) { run.ended = 'stopped'; run.log.push({ stepId: run.current ?? 'trigger', text: 'Path stopped: no next step', ok: false }) }
  return run
}

export function replyRun(wf: Pick<Workflow, 'steps' | 'edges'>, prev: TestRun, text: string, deps: RuntimeDeps): TestRun {
  if (!prev.waitingFor || prev.ended) return prev
  const run: TestRun = structuredClone(prev)
  run.chat.push({ id: mid(), from: 'customer', text })
  const st = wf.steps.find((x) => x.id === run.waitingFor)!
  const c = st.config
  const go = (h: string) => outEdge(wf, st.id, h)?.target ?? null
  run.waitingFor = null
  if (st.type === 'check_code') {
    if (/resend/i.test(text)) { sendCode(run, st); bot(run, `We've sent a new code to ${run.vars.email}. The old one no longer works.`); run.waitingFor = st.id; return run }
    if (text.trim() === run.vars.code) { run.vars.verified = true; run.log.push({ stepId: st.id, text: 'Code verified', ok: true }); return advance(wf, run, go('ok'), deps) }
    run.attempts += 1
    const left = (c.attempts ?? 3) - run.attempts
    run.log.push({ stepId: st.id, text: `Wrong code (${run.attempts}/${c.attempts ?? 3})`, ok: false })
    if (left <= 0) return advance(wf, run, go('fail'), deps)
    bot(run, fill(c.wrongText ?? '', { ...run.vars, tries_left: left, tries_left_text: `You have ${left} ${left === 1 ? 'try' : 'tries'} left.` }), { buttons: ['Resend code'] })
    run.waitingFor = st.id
    return run
  }
  if (c.kind === 'buttons') {
    const opt = (c.options ?? []).find((o) => o.label.toLowerCase() === text.trim().toLowerCase())
    if (!opt) { bot(run, 'Please pick one of the options.', { buttons: (c.options ?? []).map((o) => o.label) }); run.waitingFor = st.id; return run }
    run.vars[c.variable || st.id] = opt.label
    return advance(wf, run, go(opt.id), deps)
  }
  if (c.kind === 'email' && !EMAIL_RE.test(text.trim())) { bot(run, c.validation || "That doesn't look like an email address."); run.waitingFor = st.id; return run }
  if (c.helpText && (/(don'?t|do not) know|not sure|no idea/i.test(text) || text.trim().toLowerCase() === (c.helpLabel ?? '').toLowerCase())) { bot(run, c.helpText); bot(run, fill(c.text ?? '', run.vars), c.helpLabel ? { buttons: [c.helpLabel] } : {}); run.log.push({ stepId: st.id, text: 'Showed the help tip and asked again', ok: true }); run.waitingFor = st.id; return run }
  if (c.kind === 'number') {
    const n = parseFloat(text.replace(',', '.'))
    if (Number.isNaN(n)) { bot(run, 'Please enter a number.', c.helpLabel ? { buttons: [c.helpLabel] } : {}); run.waitingFor = st.id; return run }
    const cm = /\bin(ch(es)?)?\b|"/i.test(text) || n < 30 ? Math.round(n * 2.54 * 10) / 10 : n
    run.vars[c.variable || st.id] = cm
    run.log.push({ stepId: st.id, text: `Saved {{${c.variable}}} = ${cm}`, ok: true })
    return advance(wf, run, go('next'), deps)
  }
  run.vars[c.variable || st.id] = c.kind === 'email' ? text.trim().toLowerCase() : text.trim()
  run.log.push({ stepId: st.id, text: `Saved {{${c.variable}}}`, ok: true })
  return advance(wf, run, go('next'), deps)
}

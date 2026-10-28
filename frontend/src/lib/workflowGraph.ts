import dagre from '@dagrejs/dagre'
import type { Edge, Step, StepConfig, StepType, Workflow, WorkflowIssue } from '@/types'

export const TERMINAL: StepType[] = ['handover', 'end']

export const STEP_LABEL: Record<StepType, string> = {
  message: 'Send message', ask: 'Ask a question', send_code: 'Send email code', check_code: 'Check code', find_orders: 'Find orders by email', show_orders: 'Show orders',
  update_address: 'Update shipping address', find_returns: 'Find returns', start_return: 'Start a return', condition: 'Condition', add_tag: 'Add tag', set_field: 'Set field', handover: 'Hand over to a person', end: 'End workflow',
}

export const STEP_GROUPS: [string, StepType[]][] = [
  ['Talk', ['message', 'ask']], ['Verify', ['send_code', 'check_code']], ['Shopify', ['find_orders', 'show_orders', 'update_address']], ['Loop', ['find_returns', 'start_return']],
  ['Logic', ['condition']], ['Ticket', ['add_tag', 'set_field', 'handover']], ['End', ['end']],
]

export const DEFAULT_CONFIG: Partial<Record<StepType, StepConfig>> = {
  message: { text: '' }, ask: { text: '', kind: 'text', variable: '' }, send_code: { text: "We've sent a 6-digit code to {{email}}. It expires in 10 minutes." },
  check_code: { attempts: 3, wrongText: "That code didn't match. {{tries_left_text}}" }, find_orders: { variable: 'email' }, show_orders: { limit: 3 },
  condition: { condVar: '', op: 'eq', condValue: '', yesLabel: 'If', noLabel: 'Otherwise' }, add_tag: { tag: '' }, set_field: { field: '', fieldValue: '' }, handover: { team: 'Support' }, end: { csat: false },
}

// Outgoing handles per step: [handle id, label].
export function handlesOf(st: Step): [string, string][] {
  if (TERMINAL.includes(st.type)) return []
  if (st.type === 'condition') return [['yes', st.config.yesLabel || 'If'], ['no', st.config.noLabel || 'Otherwise']]
  if (st.type === 'check_code') return [['ok', 'Code is correct'], ['fail', 'Out of tries']]
  if (st.type === 'ask' && st.config.kind === 'buttons') return (st.config.options ?? []).map((o) => [o.id, o.label])
  return [['next', 'Next']]
}

export const SETS: Partial<Record<StepType, (c: StepConfig) => string[]>> = {
  ask: (c) => (c.variable ? [c.variable] : []),
  send_code: () => ['code'],
  find_orders: () => ['orders', 'orders.count', 'orders.unfulfilled', 'order.number', 'order.tracking_url'],
  start_return: () => ['rma'],
  find_returns: () => ['returns.count'],
}
const BUILTIN = ['channel', 'customer.name', 'tries_left', 'tries_left_text']

export const usedVars = (c: StepConfig) => [...`${c.text ?? ''} ${c.note ?? ''}`.matchAll(/\{\{\s*([\w.]+)\s*\}\}/g)].map((m) => m[1]).concat(c.condVar && c.condVar !== 'channel' ? [c.condVar] : [])

// Same intent matching for Test workflow and the widget runtime.
export function matchesTrigger(t: Workflow['trigger'], text: string) {
  const q = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
  if (!q) return false
  if (t.quickReply && q === t.quickReply.toLowerCase()) return true
  if (t.intent && q.includes(t.intent.toLowerCase())) return true
  return t.phrases.some((p) => p.trim() && (q.includes(p.toLowerCase().trim()) || p.toLowerCase().split(' ').filter((w) => w.length > 3).every((w) => q.includes(w))))
}

export const outEdge = (wf: Pick<Workflow, 'edges'>, source: string, handle: string) => wf.edges.find((x) => x.source === source && x.sourceHandle === handle)

export function reachable(wf: Pick<Workflow, 'edges'>, from = 'trigger') {
  const seen = new Set<string>()
  const q = [from]
  while (q.length) { const id = q.shift()!; for (const x of wf.edges) if (x.source === id && !seen.has(x.target)) { seen.add(x.target); q.push(x.target) } }
  return seen
}

function ancestors(wf: Pick<Workflow, 'edges'>, id: string) {
  const seen = new Set<string>()
  const q = [id]
  while (q.length) { const cur = q.shift()!; for (const x of wf.edges) if (x.target === cur && !seen.has(x.source)) { seen.add(x.source); q.push(x.source) } }
  return seen
}

// Variables set on EVERY path from the trigger to this step (must-analysis fixpoint, REQ-734).
export function variablesBefore(wf: Pick<Workflow, 'steps' | 'edges'>, id: string) {
  const all = new Set(wf.steps.flatMap((x) => SETS[x.type]?.(x.config) ?? []).concat(BUILTIN))
  const inn = new Map<string, Set<string>>(wf.steps.map((s) => [s.id, new Set(all)]))
  const out = (src: string) => (src === 'trigger' ? new Set(BUILTIN) : new Set([...(inn.get(src) ?? []), ...(SETS[wf.steps.find((s) => s.id === src)?.type as StepType]?.(wf.steps.find((s) => s.id === src)!.config) ?? [])]))
  for (let changed = true, guard = 0; changed && guard < 50; guard++) {
    changed = false
    for (const st of wf.steps) {
      const preds = wf.edges.filter((e) => e.target === st.id)
      const next = preds.length ? preds.map((e) => out(e.source)).reduce((a, b) => new Set([...a].filter((v) => b.has(v)))) : new Set(BUILTIN)
      if (next.size !== inn.get(st.id)!.size) { inn.set(st.id, next); changed = true }
    }
  }
  return [...(inn.get(id) ?? BUILTIN)]
}

export function stepNumbers(wf: Pick<Workflow, 'steps' | 'edges'>) {
  const order = new Map<string, number>()
  const visit = (id: string) => {
    if (order.has(id)) return
    const st = wf.steps.find((x) => x.id === id)
    if (!st) return
    order.set(id, order.size + 1)
    for (const [h] of handlesOf(st)) { const t = outEdge(wf, id, h)?.target; if (t) visit(t) }
  }
  const first = outEdge(wf, 'trigger', 'next')?.target
  if (first) visit(first)
  for (const st of wf.steps) if (!order.has(st.id)) order.set(st.id, order.size + 1)
  return order
}

// Validation rules (REQ-744).
export function validate(wf: Pick<Workflow, 'steps' | 'edges' | 'trigger'>): WorkflowIssue[] {
  const issues: WorkflowIssue[] = []
  const nums = stepNumbers(wf)
  const name = (st: Step) => `Step ${nums.get(st.id)} · ${STEP_LABEL[st.type]}`
  const live = reachable(wf)
  if (!wf.trigger.intent.trim()) issues.push({ stepId: null, text: 'Trigger: give the intent a name.' })
  if (!wf.trigger.channels.length) issues.push({ stepId: null, text: 'Trigger: pick at least one channel.' })
  if (!outEdge(wf, 'trigger', 'next')) issues.push({ stepId: null, text: 'Trigger: connect the first step.' })
  for (const st of wf.steps) {
    if (!live.has(st.id)) { issues.push({ stepId: st.id, text: `${name(st)}: not connected to the trigger.` }); continue }
    for (const [h, l] of handlesOf(st)) if (!outEdge(wf, st.id, h)) issues.push({ stepId: st.id, text: `${name(st)}: the "${l}" path doesn't end in End or Hand over.` })
    if ((st.type === 'message' || st.type === 'ask') && !st.config.text?.trim()) issues.push({ stepId: st.id, text: `${name(st)}: the message is empty.` })
    if (st.type === 'ask' && !st.config.variable?.trim()) issues.push({ stepId: st.id, text: `${name(st)}: save the answer to a variable.` })
    if (st.type === 'ask' && st.config.kind === 'buttons' && !st.config.options?.length) issues.push({ stepId: st.id, text: `${name(st)}: add at least one button.` })
    if (st.type === 'check_code' && !wf.steps.some((x) => x.type === 'send_code' && ancestors(wf, st.id).has(x.id))) issues.push({ stepId: st.id, text: `${name(st)}: needs a Send email code step before it.` })
    const known = variablesBefore(wf, st.id)
    for (const v of usedVars(st.config)) if (!known.includes(v)) { issues.push({ stepId: st.id, text: `${name(st)}: {{${v}}} isn't set before this step.` }); break }
  }
  return issues
}

const uid = (t: string) => `${t}-${Math.random().toString(36).slice(2, 8)}`

export function newStep(type: StepType, position = { x: 0, y: 0 }): Step {
  const cfg = structuredClone(DEFAULT_CONFIG[type] ?? {})
  if (type === 'ask' && cfg.kind === 'buttons') cfg.options = [{ id: 'a', label: 'Yes' }]
  return { id: uid('st'), type, config: cfg, position }
}

// Insert a new step on a handle: source.handle → new → old target (REQ-735).
export function insertAfter<W extends Pick<Workflow, 'steps' | 'edges'>>(wf: W, source: string, handle: string, type: StepType): { wf: W; id: string } {
  const old = outEdge(wf, source, handle)
  const src = wf.steps.find((x) => x.id === source)
  const st = newStep(type, src ? { x: src.position.x, y: src.position.y + 120 } : { x: 0, y: 0 })
  const first = handlesOf(st)[0]?.[0]
  const edges = wf.edges.filter((x) => x !== old).concat({ id: uid('e'), source, sourceHandle: handle, target: st.id })
  if (old && first) edges.push({ id: uid('e'), source: st.id, sourceHandle: first, target: old.target })
  return { wf: { ...wf, steps: [...wf.steps, st], edges }, id: st.id }
}

export function removeStep<W extends Pick<Workflow, 'steps' | 'edges'>>(wf: W, id: string): W {
  const st = wf.steps.find((x) => x.id === id)
  const next = st && handlesOf(st).length === 1 ? outEdge(wf, id, handlesOf(st)[0][0])?.target : undefined
  const edges = wf.edges.filter((x) => x.source !== id).map((x) => (x.target === id ? (next ? { ...x, target: next } : null) : x)).filter((x): x is Edge => !!x)
  return { ...wf, steps: wf.steps.filter((x) => x.id !== id), edges }
}

export function duplicateStep<W extends Pick<Workflow, 'steps' | 'edges'>>(wf: W, id: string): W {
  const st = wf.steps.find((x) => x.id === id)
  if (!st || handlesOf(st).length !== 1) return wf
  const { wf: next, id: nid } = insertAfter(wf, id, handlesOf(st)[0][0], st.type)
  return { ...next, steps: next.steps.map((x) => (x.id === nid ? { ...x, config: structuredClone(st.config) } : x)) }
}

// Swap the contents of two linear steps (list reorder by drag or Move up / down).
export function swapSteps<W extends Pick<Workflow, 'steps' | 'edges'>>(wf: W, a: string, b: string): W {
  const A = wf.steps.find((x) => x.id === a)
  const B = wf.steps.find((x) => x.id === b)
  if (!A || !B || handlesOf(A).length !== 1 || handlesOf(B).length !== 1 || handlesOf(A)[0][0] !== handlesOf(B)[0][0]) return wf
  return { ...wf, steps: wf.steps.map((x) => (x.id === a ? { ...x, type: B.type, config: B.config } : x.id === b ? { ...x, type: A.type, config: A.config } : x)) }
}

export const linearNeighbour = (wf: Pick<Workflow, 'steps' | 'edges'>, id: string, dir: -1 | 1) => {
  if (dir === 1) { const st = wf.steps.find((x) => x.id === id); const h = st && handlesOf(st); return h?.length === 1 ? outEdge(wf, id, h[0][0])?.target : undefined }
  const ins = wf.edges.filter((x) => x.target === id)
  return ins.length === 1 && ins[0].source !== 'trigger' && ins[0].sourceHandle === 'next' ? ins[0].source : undefined
}

// "Tidy up" auto-layout (dagre, top to bottom).
export function tidy<W extends Pick<Workflow, 'steps' | 'edges'>>(wf: W): W {
  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: 'TB', nodesep: 48, ranksep: 64 })
  g.setDefaultEdgeLabel(() => ({}))
  g.setNode('trigger', { width: 260, height: 72 })
  for (const st of wf.steps) g.setNode(st.id, { width: 260, height: 88 })
  for (const x of wf.edges) if (g.hasNode(x.source) && g.hasNode(x.target)) g.setEdge(x.source, x.target)
  dagre.layout(g)
  return { ...wf, steps: wf.steps.map((st) => { const p = g.node(st.id); return { ...st, position: { x: Math.round(p.x - 130), y: Math.round(p.y - 44) } } }) }
}

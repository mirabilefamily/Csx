import type { RunOrder, Workflow, WorkflowTemplate } from '@/types'
import { request, ApiError } from './client'
import { db } from './db'
import { orderTracking, workflowTemplates } from '@/mocks/workflows'
import { matchesTrigger, tidy, validate } from '@/lib/workflowGraph'

// MOCKED process automations (Phase 13). In-memory; resets on reload.
const now = () => new Date().toISOString()
const uid = () => `wf-${Math.random().toString(36).slice(2, 8)}`

// GET /api/workflows (list order = run priority)
export const listWorkflows = () => request(() => db.workflows.map((w) => ({ ...w })), { empty: () => [] })

// GET /api/workflows/:id
export const getWorkflow = (id: string) => request(() => db.workflows.find((w) => w.id === id) ?? null)

// GET /api/workflow-templates
export const listTemplates = () => request(() => workflowTemplates.map(({ id, name, description, build }) => ({ id, name, description, steps: build().steps.length })))

// POST /api/workflows { templateId? }: new Draft
export const createWorkflow = (by: string, templateId?: string) =>
  request(() => {
    const tpl: WorkflowTemplate | undefined = workflowTemplates.find((t) => t.id === templateId)
    const base = tpl ? tidy(tpl.build()) : { name: 'Untitled workflow', description: '', trigger: { intent: '', phrases: [], channels: ['chat' as const], quickReply: null }, steps: [], edges: [] }
    const wf: Workflow = { id: uid(), status: 'draft', runs7d: 0, completedPct: null, handedPct: null, editedAt: now(), editedBy: by, templateId, ...base }
    db.workflows.push(wf)
    return wf
  })

// PUT /api/workflows/:id
export const saveWorkflow = (wf: Workflow, by: string) =>
  request(() => {
    if (wf.status === 'active' && validate(wf).length) throw new ApiError('Fix the issues before saving an active workflow.', 422)
    const saved = { ...wf, editedAt: now(), editedBy: by }
    db.workflows = db.workflows.map((w) => (w.id === wf.id ? saved : w))
    return saved
  })

// POST /api/workflows/:id/status: blocked while there are issues (REQ-728)
export const setStatus = (id: string, status: Workflow['status'], by: string) =>
  request(() => {
    const wf = db.workflows.find((w) => w.id === id)
    if (!wf) throw new ApiError('Workflow not found', 404)
    const n = validate(wf).length
    if (status === 'active' && n) throw new ApiError(`Fix ${n} issue${n === 1 ? '' : 's'} before turning this on.`, 422)
    Object.assign(wf, { status, editedAt: now(), editedBy: by })
    return wf
  })

export const duplicateWorkflow = (id: string, by: string) =>
  request(() => {
    const src = db.workflows.find((w) => w.id === id)!
    const copy: Workflow = { ...structuredClone(src), id: uid(), name: `${src.name} (copy)`, status: 'draft', runs7d: 0, completedPct: null, handedPct: null, editedAt: now(), editedBy: by }
    db.workflows.splice(db.workflows.indexOf(src) + 1, 0, copy)
    return copy
  })

export const renameWorkflow = (id: string, name: string, by: string) => request(() => { const wf = db.workflows.find((w) => w.id === id)!; Object.assign(wf, { name, editedAt: now(), editedBy: by }); return wf })

export const deleteWorkflow = (id: string) => request(() => { db.workflows = db.workflows.filter((w) => w.id !== id); return true })

// PUT /api/workflows/order
export const reorderWorkflows = (ids: string[]) => request(() => { db.workflows = ids.map((id) => db.workflows.find((w) => w.id === id)!).filter(Boolean); return db.workflows })

// Active chat workflow whose trigger matches the message (widget runtime, REQ-757); same matcher as Test workflow.
export function activeWorkflowFor(text: string): Workflow | null {
  return db.workflows.find((w) => w.status === 'active' && w.trigger.channels.includes('chat') && matchesTrigger(w.trigger, text)) ?? null
}

export const activeWorkflowById = (id: string) => db.workflows.find((w) => w.id === id && w.status === 'active') ?? null
// Workflows and templates a widget starter can point at; templates count as Off until created.
export const starterWorkflowChoices = () => [
  ...db.workflows.map((w) => ({ id: w.id, name: w.name, active: w.status === 'active' })),
  ...workflowTemplates.filter((t) => !db.workflows.some((w) => w.name === t.name)).map((t) => ({ id: t.id, name: t.name, active: false })),
]

export const activeOrderTracking = () => db.workflows.find((w) => w.status === 'active' && w.trigger.intent === orderTracking().trigger.intent) ?? null

// GET /api/shopify/orders?email= (MOCKED, same data as the Inbox panel). Sync for the step runtime.
export function findOrdersByEmail(email: string): RunOrder[] {
  const c = db.customers.find((x) => x.email.toLowerCase() === email.toLowerCase())
  return (c?.orders ?? []).filter((o) => !o.isDraft).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((o) => ({
    number: o.number, date: new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), items: o.lineItems.map((l) => `${l.title}${l.quantity > 1 ? ` ×${l.quantity}` : ''}`).join(', '),
    status: o.fulfillmentStatus === 'fulfilled' || o.trackingUrl ? `Shipped${o.carrier ? ` via ${o.carrier}` : ''}` : o.fulfillmentStatus.replace('_', ' ').replace(/^./, (x) => x.toUpperCase()), total: o.total, carrier: o.carrier, trackingUrl: o.trackingUrl,
  }))
}

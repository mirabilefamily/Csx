import type { LoopReturn, TicketDetail } from '@/types'
import { HANDOVER_REASONS } from '@/mocks/tickets'
import { ESCALATION_LABELS } from '@/lib/labels'
import { request } from './client'
import { db } from './db'

export type Source = 'guidance' | 'shopify' | 'loop' | 'ticket' | 'fraud'
export const SOURCE_LABEL: Record<Source, string> = { guidance: 'Guidance', shopify: 'Shopify', loop: 'Loop Returns', ticket: 'This ticket', fraud: 'Fraud signals' }
export interface AssistantAnswer { text: string; draft?: string; sources: Source[] }
export interface Brief {
  reason: string
  did: { text: string; source: Source }[]
  next: string
  how: { intent: string; articles: string[]; data: string[]; confidence: number | null }
  summary: string | null
  at: string
  stale: boolean
}

export const PROMPTS_TICKET = ['Summarize this ticket', 'What has this customer ordered?', 'Is this order eligible for a refund?', 'Draft a reply']
export const PROMPTS_GLOBAL = ['How many tickets need a human?', 'Which tickets are at risk of fraud?', 'What are customers asking about most?']
export const FALLBACK = "I can't answer that in this demo yet. Try one of the suggestions."

const INTENTS: Record<string, string> = { damaged: 'Damaged item / Replacement', returns: 'Returns / Refund status', refund: 'Returns / Refund status', sizing: 'Product / Sizing', exchange: 'Order / Exchange', shipping: 'Order / Shipping status', 'order-status': 'Order / Shipping status', 'custom-order': 'Wholesale / Custom order', wholesale: 'Wholesale / Pricing', care: 'Product / Care' }
export const intentOf = (tags: string[]) => tags.map((t) => INTENTS[t]).find(Boolean) ?? 'General / Question'
import { usd } from '@/lib/format'
import { aiConfidence, lifetimeSpend, loopStats } from '@/lib/customerFacts'
const loopFor = (customerId?: string): LoopReturn[] => (customerId ? db.loopReturns.filter((r) => r.customerId === customerId) : [])

// "Why you're here" brief, built only from the ticket's own seed data.
export function briefFor(d: TicketDetail, generatedAt?: string): Brief | null {
  if (d.ticket.status !== 'needs_human') return null
  const real = d.messages.filter((m) => m.authorType !== 'system')
  const last = d.attempts[d.attempts.length - 1]
  const order = d.customer?.orders.find((o) => o.number === d.ticket.orderNumber) ?? d.customer?.orders[0]
  const returns = loopFor(d.customer?.id)
  const at = generatedAt ?? last?.createdAt ?? d.ticket.updatedAt
  const titles = [...new Set(d.attempts.flatMap((a) => a.guidanceIds).map((g) => d.guidanceTitles[g]).filter(Boolean))]
  const did: Brief['did'] = []
  const conf = aiConfidence(d)
  const ls = loopStats(returns, lifetimeSpend(d.customer?.orders))
  if (titles[0]) did.push({ text: `Checked "${titles[0]}"${conf !== null ? ` and drafted a reply at ${Math.round(conf * 100)}% confidence` : ''}`, source: 'guidance' })
  if (order) did.push({ text: `Found order ${order.number}: ${usd(order.total)}, ${order.financialStatus.replace('_', ' ')}, ${order.fulfillmentStatus.replace('_', ' ')}`, source: 'shopify' })
  if (returns.length) did.push({ text: `Found ${returns.length} Loop return${returns.length > 1 ? 's' : ''} (${usd(ls.dollars)} returned${ls.rate !== null ? `, ${ls.rate.toFixed(1)}% of spend` : ''})`, source: 'loop' })
  else if (d.customer) did.push({ text: 'Checked Loop: no returns for this customer', source: 'loop' })
  const reason = HANDOVER_REASONS[d.ticket.id] ?? d.ticket.handoverReason ?? (d.ticket.escalationReason ? ESCALATION_LABELS[d.ticket.escalationReason] : 'The AI handed this ticket to a person')
  const next = d.drafts.length ? 'Review the AI draft, then Approve & send or edit it.' : d.ticket.escalationReason === 'refund_over_limit' ? 'Approve or decline the refund in Full details › Shopify.' : 'Reply to the customer, or ask the AI to draft one.'
  const first = real.find((m) => m.authorType === 'customer')?.body ?? d.ticket.preview
  const summary = real.length < 3 ? null : `${d.ticket.customer.name}: ${first.split(/(?<=[.!?])\s/)[0]}`
  return { reason, did: did.slice(0, 3), next, how: { intent: intentOf(d.ticket.tags), articles: titles, data: [order ? `Shopify order ${order.number}` : 'Shopify (no orders)', `Loop (${returns.length} returns)`, d.fraudAlert ? `Fraud alert ${d.fraudAlert.riskScore}` : 'No fraud alert'], confidence: conf }, summary, at, stale: real.some((m) => m.authorType === 'customer' && m.createdAt > at) }
}

// POST /api/assistant/ask  { question, ticketId? } (MOCKED)
export function ask(question: string, d: TicketDetail | null): Promise<AssistantAnswer> {
  return request(() => {
    const q = question.toLowerCase()
    if (d) {
      const name = d.ticket.customer.name.split(' ')[0]
      const orders = d.customer?.orders ?? []
      const returns = loopFor(d.customer?.id)
      if (q.includes('summar')) {
        const b = briefFor(d)
        return { text: `${d.ticket.customer.name} wrote about "${d.ticket.subject}". ${b ? `Handed over: ${b.reason}.` : `Status: ${d.ticket.status.replace('_', ' ')}.`} ${d.messages.filter((m) => m.authorType !== 'system').length} messages so far.`, sources: ['ticket'] }
      }
      if (q.includes('ordered')) return { text: orders.length ? orders.map((o) => `${o.number}: ${o.lineItems.map((l) => `${l.quantity}× ${l.title}`).join(', ')} (${usd(o.total)}, ${o.fulfillmentStatus.replace('_', ' ')})`).join('\n') : `${name} has no Shopify orders.`, sources: ['shopify'] }
      if (q.includes('refund') || q.includes('eligible')) {
        const o = orders[0]
        const limit = db.aiSettings.autoRefund.limit
        const ls = loopStats(returns, lifetimeSpend(orders))
        const loop = returns.length ? ` Loop: ${returns.length} return${returns.length > 1 ? 's' : ''}, ${usd(ls.dollars)} returned${ls.rate !== null ? ` (${ls.rate.toFixed(1)}% of spend)` : ''}.` : ' Loop: no returns for this customer.'
        const text = !o ? 'There is no order to refund.' : `${o.number} is ${o.financialStatus.replace('_', ' ')} (${usd(o.total)}, ${usd(o.total - (o.refundedAmount ?? 0))} refundable). ${d.fraudAlert?.status === 'open' ? `It has an open fraud alert (risk ${d.fraudAlert.riskScore}), so review it first.` : 'No open fraud alert.'} ${o.total > limit ? `It's above the $${limit} auto-refund limit, so you approve it.` : `It's within the $${limit} auto-refund limit.`}${loop}`
        return { text, sources: ['shopify', 'loop', ...(d.fraudAlert ? (['fraud'] as Source[]) : [])] }
      }
      if (q.includes('draft') || q.includes('reply')) {
        const draft = `Hi ${name}, thanks for reaching out about "${d.ticket.subject}". ${orders[0] ? `I've pulled up order ${orders[0].number} and ` : ''}I'm on it, and I'll follow up today with next steps.`
        return { text: draft, draft, sources: ['ticket', 'guidance'] }
      }
    }
    if (q.includes('need a human') || q.includes('needs a human') || q.includes('need you')) return { text: `${db.tickets.filter((t) => t.status === 'needs_human' && !t.setAside).length} tickets need you right now.`, sources: ['ticket'] }
    if (q.includes('fraud')) return { text: db.fraudAlerts.filter((a) => a.status === 'open').map((a) => `${a.ticketId}: risk ${a.riskScore}`).join('\n') || 'No open fraud alerts.', sources: ['fraud'] }
    if (q.includes('asking about')) {
      const counts: Record<string, number> = {}
      db.tickets.forEach((t) => t.tags.forEach((g) => (counts[g] = (counts[g] ?? 0) + 1)))
      return { text: Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t, n]) => `${t} (${n})`).join(', '), sources: ['ticket'] }
    }
    return { text: FALLBACK, sources: [] }
  })
}

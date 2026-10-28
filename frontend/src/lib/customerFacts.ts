import type { LoopReturn, ShopifyOrder, TicketDetail } from '@/types'

// Single source of truth for customer facts shown in the brief, Ask Goorin AI, summary and full details.
export const paidOrders = (orders: ShopifyOrder[] = []) => orders.filter((o) => !o.isDraft)
export const lifetimeSpend = (orders: ShopifyOrder[] = []) => Math.round(paidOrders(orders).reduce((s, o) => s + o.total, 0) * 100) / 100

// Cancelled and expired returns are counted, but left out of Returned $ and the return rate.
export function loopStats(returns: LoopReturn[], spend: number) {
  const dollars = returns.filter((r) => r.state !== 'cancelled' && r.state !== 'expired').reduce((s, r) => s + r.returnTotal, 0)
  return { count: returns.length, dollars, rate: spend > 0 ? (dollars / spend) * 100 : null }
}

// The confidence the user sees on the draft card; falls back to the last AI attempt.
export function aiConfidence(d: Pick<TicketDetail, 'drafts' | 'attempts'>): number | null {
  const draft = d.drafts[d.drafts.length - 1]
  if (draft) return draft.confidence
  const last = d.attempts[d.attempts.length - 1]
  return last ? last.confidence : null
}

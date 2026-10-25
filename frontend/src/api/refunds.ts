import type { DateRange, FraudAction, FraudAlert, FraudReviewResult, RefundRecord, RefundStage, RefundSummary, SessionUser } from '@/types'
import { priorRange, rangeLength, toKey } from '@/lib/dateRange'
import { ApiError, request } from './client'
import { db, syncFraudFlag } from './db'

const STAGES: RefundStage[] = ['requested', 'approved', 'refunded', 'declined', 'on_hold']
const inRange = (iso: string, r: DateRange) => { const k = toKey(new Date(iso)); return k >= r.from && k <= r.to }
const sum = (rs: RefundRecord[]) => rs.reduce((s, r) => s + r.amount, 0)
const refunded = (rs: RefundRecord[]) => sum(rs.filter((r) => r.stage === 'refunded'))

// Refunded $ per day (per week for ranges over a month).
function trend(range: DateRange, rs: RefundRecord[]) {
  const bucket = rangeLength(range) > 31 ? 7 : 1
  const out = Array<number>(Math.ceil(rangeLength(range) / bucket)).fill(0)
  const start = new Date(`${range.from}T00:00:00`).getTime()
  rs.forEach((r) => {
    const i = Math.floor((new Date(r.createdAt).getTime() - start) / 86_400_000 / bucket)
    if (r.stage === 'refunded' && i >= 0 && i < out.length) out[i] += r.amount
  })
  return out
}

function summarize(range: DateRange, records: RefundRecord[]): RefundSummary {
  const cur = records.filter((r) => inRange(r.createdAt, range))
  const prev = records.filter((r) => inRange(r.createdAt, priorRange(range)))
  const decided = cur.filter((r) => r.decidedBy)
  const awaiting = cur.filter((r) => r.stage === 'requested').sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  return {
    totalRefunded: refunded(cur),
    previousTotal: prev.length ? refunded(prev) : null,
    count: cur.length,
    autoPct: decided.length ? Math.round((decided.filter((r) => r.auto).length / decided.length) * 100) : null,
    pending: { count: awaiting.length, amount: sum(awaiting) },
    stages: Object.fromEntries(STAGES.map((s) => [s, cur.filter((r) => r.stage === s).length])) as Record<RefundStage, number>,
    trend: trend(range, cur),
    awaiting,
    autoRefund: db.aiSettings.autoRefund,
  }
}

// GET /api/refunds/summary?from=YYYY-MM-DD&to=YYYY-MM-DD
export function getRefunds(range: DateRange): Promise<RefundSummary> {
  return request(() => summarize(range, db.refunds), { empty: () => summarize(range, []) })
}

// GET /api/fraud-alerts
export function getFraudAlerts(): Promise<FraudAlert[]> {
  return request(() => [...db.fraudAlerts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), { empty: () => [] })
}

const held = new Map<string, { refundId: string; stage: RefundStage }>()
const find = (id: string) => {
  const a = db.fraudAlerts.find((x) => x.id === id)
  if (!a) throw new ApiError('Alert not found.', 404)
  return a
}

// POST /api/fraud-alerts/:id/review  { action }
export function reviewFraudAlert(id: string, action: FraudAction, actor: SessionUser): Promise<FraudReviewResult> {
  return request(() => {
    const a = find(id)
    if (a.status !== 'open') throw new ApiError('This alert was already reviewed.', 409)
    Object.assign(a, { status: action, reviewedBy: actor.name, reviewedAt: new Date().toISOString() })
    let refund: RefundRecord | null = null
    if (action === 'held') {
      refund = db.refunds.find((r) => r.id === a.refundId && (r.stage === 'requested' || r.stage === 'approved')) ?? null
      if (refund) { held.set(id, { refundId: refund.id, stage: refund.stage }); refund.stage = 'on_hold' }
    }
    syncFraudFlag(a.ticketId)
    return { alert: a, refund }
  })
}

// POST /api/fraud-alerts/:id/undo
export function undoFraudReview(id: string): Promise<FraudAlert> {
  return request(() => {
    const a = find(id)
    Object.assign(a, { status: 'open', reviewedBy: null, reviewedAt: null })
    const h = held.get(id)
    const r = h && db.refunds.find((x) => x.id === h.refundId)
    if (h && r) r.stage = h.stage
    held.delete(id)
    syncFraudFlag(a.ticketId)
    return a
  })
}

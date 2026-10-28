import { addDays, format, parseISO } from 'date-fns'
import type { Channel, CsatResponse, CsatSummary, DailyMetric, DashboardSummary, DateRange, EscalationReason, KpiMetric, Resolver } from '@/types'
import { CHANNEL_LABELS, ESCALATION_LABELS, RESOLVER_LABELS } from '@/lib/labels'
import { priorRange, rangeLength } from '@/lib/dateRange'
import { request } from './client'
import { db } from './db'

const inRange = (key: string, r: DateRange) => key >= r.from && key <= r.to
const dayKey = (iso: string) => format(new Date(iso), 'yyyy-MM-dd')
const sum = (rows: DailyMetric[], f: (m: DailyMetric) => number) => rows.reduce((s, m) => s + f(m), 0)
const avg = (rs: CsatResponse[]) => (rs.length ? rs.reduce((s, r) => s + r.score, 0) / rs.length : null)
const ratio = (a: number, b: number) => (b ? (a / b) * 100 : null)
const weighted = (rows: DailyMetric[], f: (m: DailyMetric) => number, w: (m: DailyMetric) => number) => {
  const total = sum(rows, w)
  return total ? sum(rows, (m) => f(m) * w(m)) / total : null
}

function bucketize<T>(r: DateRange, rows: { key: string; value: T }[], combine: (vals: T[]) => Record<string, unknown>) {
  const days = rangeLength(r)
  const size = days > 31 ? 7 : 1
  const out: Record<string, unknown>[] = []
  for (let start = parseISO(r.from); format(start, 'yyyy-MM-dd') <= r.to; start = addDays(start, size)) {
    const from = format(start, 'yyyy-MM-dd')
    const to = format(addDays(start, size - 1), 'yyyy-MM-dd')
    const vals = rows.filter((x) => x.key >= from && x.key <= to).map((x) => x.value)
    const label = days === 1 ? 'Today' : size === 7 ? `Wk of ${format(start, 'MMM d')}` : format(start, 'MMM d')
    out.push({ label, ...combine(vals) })
  }
  return out
}

function kpis(cur: DailyMetric[], prev: DailyMetric[], curR: CsatResponse[], prevR: CsatResponse[]): KpiMetric[] {
  const aiRate = (rows: DailyMetric[]) => ratio(sum(rows, (m) => m.resolvedClaude + m.resolvedGrokbot), sum(rows, (m) => m.resolved))
  const frt = (rows: DailyMetric[]) => weighted(rows, (m) => m.firstResponseMinutes, (m) => m.ticketsCreated)
  const res = (rows: DailyMetric[]) => weighted(rows, (m) => m.resolutionMinutes, (m) => m.resolved)
  const rate = (rows: DailyMetric[], rs: CsatResponse[]) => ratio(rs.length, sum(rows, (m) => m.surveysSent))
  const created = (rows: DailyMetric[]) => (rows.length ? sum(rows, (m) => m.ticketsCreated) : null)
  return [
    { key: 'open', label: 'Open tickets', value: cur.at(-1)?.openAtEnd ?? null, previous: prev.at(-1)?.openAtEnd ?? null, format: 'count', betterWhen: 'lower', hint: 'Not yet resolved at end of period' },
    { key: 'created', label: 'Tickets created', value: created(cur), previous: created(prev), format: 'count', betterWhen: 'neutral', hint: 'Email and chat combined' },
    { key: 'aiRate', label: 'AI resolution rate', value: aiRate(cur), previous: aiRate(prev), format: 'percent', betterWhen: 'higher', hint: 'Resolved by AI or Grokbot' },
    { key: 'frt', label: 'First response time', value: frt(cur), previous: frt(prev), format: 'duration', betterWhen: 'lower', hint: 'Average, all channels' },
    { key: 'resolution', label: 'Resolution time', value: res(cur), previous: res(prev), format: 'duration', betterWhen: 'lower', hint: 'Average time to resolve' },
    { key: 'csatAvg', label: 'CSAT average', value: avg(curR), previous: avg(prevR), format: 'score', betterWhen: 'higher', hint: 'Out of 5' },
    { key: 'csatRate', label: 'CSAT response rate', value: rate(cur, curR), previous: rate(prev, prevR), format: 'percent', betterWhen: 'higher', hint: 'Responses per survey sent' },
  ]
}

// Sparkline points: the same KPI computed over up to 12 slices of the period.
function withSeries(list: KpiMetric[], cur: DailyMetric[], curR: CsatResponse[]): KpiMetric[] {
  if (cur.length < 2) return list
  const size = Math.ceil(cur.length / Math.min(12, cur.length))
  const slices: KpiMetric[][] = []
  for (let i = 0; i < cur.length; i += size) {
    const c = cur.slice(i, i + size)
    const keys = new Set(c.map((m) => m.date))
    slices.push(kpis(c, [], curR.filter((r) => keys.has(dayKey(r.createdAt))), []))
  }
  return list.map((k, i) => ({ ...k, series: slices.map((s) => s[i].value ?? 0) }))
}

function csatSummary(range: DateRange, rs: CsatResponse[]): CsatSummary {
  const split = <K extends string>(keys: K[], labels: Record<K, string>, f: (r: CsatResponse) => K) =>
    keys.map((key) => {
      const sub = rs.filter((r) => f(r) === key)
      return { key, label: labels[key], average: avg(sub), responses: sub.length }
    })
  const newest = [...rs].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return {
    totalResponses: rs.length,
    average: avg(rs),
    trend: bucketize(range, rs.map((r) => ({ key: dayKey(r.createdAt), value: r })), (vals) => ({
      average: vals.length ? Math.round((avg(vals) ?? 0) * 100) / 100 : null,
      responses: vals.length,
    })) as CsatSummary['trend'],
    distribution: [1, 2, 3, 4, 5].map((score) => ({ score, count: rs.filter((r) => r.score === score).length })),
    byChannel: split<Channel>(['email', 'chat'], CHANNEL_LABELS, (r) => r.channel),
    byResolver: split<Resolver>(['claude', 'grokbot', 'human'], RESOLVER_LABELS, (r) => r.resolvedBy),
    latestComments: newest.filter((r) => r.comment).slice(0, 6),
    lowScores: newest.filter((r) => r.score <= db.csatSurvey.lowScoreThreshold),
  }
}

function compute(range: DateRange): DashboardSummary {
  const prior = priorRange(range)
  const cur = db.dailyMetrics.filter((m) => inRange(m.date, range))
  const prev = db.dailyMetrics.filter((m) => inRange(m.date, prior))
  const curR = db.csatResponses.filter((r) => inRange(dayKey(r.createdAt), range))
  const prevR = db.csatResponses.filter((r) => inRange(dayKey(r.createdAt), prior))
  const days = rangeLength(range)
  const reasons = Object.keys(ESCALATION_LABELS) as EscalationReason[]
  const tagTotals: Record<string, number> = {}
  cur.forEach((m) => Object.entries(m.tags).forEach(([t, n]) => (tagTotals[t] = (tagTotals[t] ?? 0) + n)))

  return {
    range,
    priorRange: prior,
    comparisonLabel: days === 1 ? 'vs yesterday' : `vs prior ${days} days`,
    kpis: withSeries(kpis(cur, prev, curR, prevR), cur, curR),
    volumeByChannel: bucketize(range, cur.map((m) => ({ key: m.date, value: m })), (vals) => ({
      email: vals.reduce((s, m) => s + m.email, 0),
      chat: vals.reduce((s, m) => s + m.chat, 0),
    })) as DashboardSummary['volumeByChannel'],
    resolvedBy: [
      { key: 'claude', label: 'AI', count: sum(cur, (m) => m.resolvedClaude) },
      { key: 'grokbot', label: 'Grokbot', count: sum(cur, (m) => m.resolvedGrokbot) },
      { key: 'human', label: 'Human', count: sum(cur, (m) => m.resolvedHuman) },
    ],
    escalationReasons: reasons
      .map((key) => ({ key, label: ESCALATION_LABELS[key], count: sum(cur, (m) => m.escalations[key]) }))
      .sort((a, b) => b.count - a.count),
    topTags: Object.entries(tagTotals)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    csat: csatSummary(range, curR),
  }
}

function emptySummary(range: DateRange): DashboardSummary {
  const live = compute(range)
  return {
    ...live,
    kpis: live.kpis.map((k) => ({ ...k, value: null, previous: null })),
    volumeByChannel: [],
    resolvedBy: [],
    escalationReasons: [],
    topTags: [],
    csat: { totalResponses: 0, average: null, trend: [], distribution: [], byChannel: [], byResolver: [], latestComments: [], lowScores: [] },
  }
}

// GET /api/dashboard/summary?from=YYYY-MM-DD&to=YYYY-MM-DD
export function getDashboardSummary(range: DateRange): Promise<DashboardSummary> {
  return request(() => compute(range), { empty: () => emptySummary(range) })
}

export interface ChatTimingWindow { medianFirstReplySec: number; medianReplySec: number; waitingNow: number; longestWaitSec: number }
export interface ChatReplyTiming { windowLabel: string; current: ChatTimingWindow; previous: ChatTimingWindow }

// GET /api/dashboard/chat-timing  — last 30 complete minutes vs the preceding 30
export function getChatReplyTiming(): Promise<ChatReplyTiming> {
  return request(() => {
    const end = new Date()
    end.setSeconds(0, 0)
    end.setMinutes(end.getMinutes() - (end.getMinutes() % 30))
    const start = new Date(end.getTime() - 30 * 60_000)
    const t = (d: Date) => format(d, 'h:mm a')
    return {
      windowLabel: `${t(start)}–${t(end)}`,
      current: { medianFirstReplySec: 14, medianReplySec: 38, waitingNow: 2, longestWaitSec: 192 },
      previous: { medianFirstReplySec: 21, medianReplySec: 44, waitingNow: 3, longestWaitSec: 165 },
    }
  })
}

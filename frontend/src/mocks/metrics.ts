import { format, subDays } from 'date-fns'
import type { DailyMetric, EscalationReason } from '@/types'
import { tickets } from './tickets'
import { NOW, mulberry32 } from './time'

// 90 visible days plus 90 days of history so the 90d range has a prior period to compare against.
export const METRIC_HISTORY_DAYS = 180

const rand = mulberry32(1895)

const REASON_WEIGHTS: [EscalationReason, number][] = [
  ['low_confidence', 30], ['asked_for_human', 18], ['damaged_item', 16], ['refund_over_limit', 12],
  ['negative_sentiment', 9], ['custom_order', 8], ['wholesale', 7],
]
const TAG_WEIGHTS: [string, number][] = [
  ['order-status', 30], ['sizing', 22], ['returns', 16], ['exchange', 10], ['shipping', 8],
  ['damaged', 6], ['care', 5], ['gift-card', 4], ['custom-order', 3], ['wholesale', 3], ['stock', 3],
]

function distribute<K extends string>(total: number, weights: [K, number][]) {
  const jittered = weights.map(([k, w]) => [k, w * (0.75 + rand() * 0.5)] as const)
  const sum = jittered.reduce((s, [, w]) => s + w, 0)
  const out = {} as Record<K, number>
  let left = total
  jittered.forEach(([k, w], i) => {
    const v = i === jittered.length - 1 ? left : Math.min(left, Math.round((total * w) / sum))
    out[k] = v
    left -= v
  })
  return out
}

const activeNow = tickets.filter((t) => !['resolved', 'closed'].includes(t.status)).length
const dayFraction = Math.max(0.2, (NOW.getHours() * 60 + NOW.getMinutes()) / 1440)
let open = 24

export const dailyMetrics: DailyMetric[] = Array.from({ length: METRIC_HISTORY_DAYS }, (_, i) => {
  const daysBack = METRIC_HISTORY_DAYS - 1 - i
  const date = subDays(NOW, daysBack)
  const progress = i / (METRIC_HISTORY_DAYS - 1)
  const weekend = date.getDay() === 0 || date.getDay() === 6
  const scale = daysBack === 0 ? dayFraction : 1
  const created = Math.max(2, Math.round((weekend ? 24 : 34) * (1 + progress * 0.18) * (0.85 + rand() * 0.3) * scale))
  const chat = Math.round(created * (0.34 + rand() * 0.1 + (weekend ? 0.06 : 0)))
  const resolved = Math.round(created * (0.9 + rand() * 0.12))
  const ai = progress * 0.08
  const resolvedClaude = Math.round(resolved * (0.5 + ai + rand() * 0.05))
  const resolvedGrokbot = Math.round(resolved * (0.16 + rand() * 0.04))
  const resolvedHuman = Math.max(0, resolved - resolvedClaude - resolvedGrokbot)
  open = daysBack === 0 ? activeNow : Math.max(18, Math.min(28, open + Math.round((rand() - 0.5) * 4)))
  return {
    date: format(date, 'yyyy-MM-dd'),
    ticketsCreated: created,
    email: created - chat,
    chat,
    openAtEnd: open,
    resolved,
    resolvedClaude,
    resolvedGrokbot,
    resolvedHuman,
    firstResponseMinutes: Math.round((7.2 - ai * 30 + rand() * 1.6) * 10) / 10,
    resolutionMinutes: Math.round(430 - ai * 1400 + rand() * 80),
    surveysSent: Math.round(resolved * 0.72),
    escalations: distribute(resolvedHuman + Math.round(resolvedGrokbot * 0.4), REASON_WEIGHTS),
    tags: distribute(created, TAG_WEIGHTS),
  }
})

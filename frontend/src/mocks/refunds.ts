import type { FraudAlert, FraudSignal, FraudSignalCode, FraudStatus, RefundRecord, RefundStage, Resolver } from '@/types'
import { tickets } from './tickets'
import { hoursAgo, minutesAfter, mulberry32 } from './time'

const ticket = (id: string) => tickets.find((t) => t.id === id)!
const orderFor = (id: string) => ticket(id).orderNumber ?? `#GB${20100 + (Number(id.slice(3)) - 1040) * 7}`

function refund(id: string, ticketId: string, amount: number, reason: string, stage: RefundStage, decidedBy: Resolver | null, ageHours: number, recommendation: RefundRecord['recommendation'] = 'approve'): RefundRecord {
  const createdAt = hoursAgo(ageHours)
  const auto = decidedBy === 'claude' || decidedBy === 'grokbot'
  return {
    id, ticketId, orderNumber: orderFor(ticketId), customer: ticket(ticketId).customer.name, amount, currency: 'USD', reason, stage, decidedBy, auto, createdAt,
    refundedAt: stage === 'refunded' ? minutesAfter(createdAt, auto ? 3 : 240) : null,
    recommendation,
  }
}

const POOL = ['GB-1062', 'GB-1057', 'GB-1055', 'GB-1054', 'GB-1053', 'GB-1052', 'GB-1051', 'GB-1050', 'GB-1049', 'GB-1048', 'GB-1047', 'GB-1046', 'GB-1045', 'GB-1044', 'GB-1043', 'GB-1042', 'GB-1041', 'GB-1066']
const REASONS = ['Damaged on arrival', 'Wrong size', 'Changed mind', 'Wrong color', 'Late delivery', 'Not as pictured']
const rand = mulberry32(427)

const generated = Array.from({ length: 24 }, (_, i) => {
  const amount = Math.round(28 + rand() * 210)
  const roll = rand()
  const stage: RefundStage = i % 8 === 3 ? 'declined' : 'refunded'
  const decidedBy: Resolver = stage === 'refunded' && amount <= 75 && roll < 0.85 ? (roll < 0.55 ? 'claude' : 'grokbot') : 'human'
  const age = 24 + Math.round((i / 24) * 86 * 24 + rand() * 20)
  return refund(`rf-${String(i + 1).padStart(3, '0')}`, POOL[i % POOL.length], amount, REASONS[Math.floor(rand() * REASONS.length)], stage, decidedBy, age)
})

export const refunds: RefundRecord[] = [
  refund('rf-201', 'GB-1064', 168, 'Not received', 'requested', null, 5, 'hold'),
  refund('rf-202', 'GB-1068', 451, 'Damaged on arrival', 'requested', null, 20, 'approve'),
  refund('rf-203', 'GB-1071', 96, 'Late delivery', 'requested', null, 30, 'hold'),
  refund('rf-204', 'GB-1076', 210, 'Damaged on arrival', 'requested', null, 3, 'approve'),
  refund('rf-205', 'GB-1070', 64, 'Changed mind', 'approved', 'grokbot', 9),
  refund('rf-206', 'GB-1056', 142, 'Damaged on arrival', 'on_hold', 'human', 6 * 24, 'hold'),
  ...generated,
]

const SIGNALS: Record<FraudSignalCode, string> = {
  repeat_refund: '3rd refund in 30 days',
  not_received_delivered: 'Not received · tracking delivered',
  high_value: 'High-value order',
  new_account: 'New account, large order',
  address_mismatch: 'Billing/shipping mismatch',
}
const sig = (code: FraudSignalCode, label = SIGNALS[code]): FraudSignal => ({ code, label })

function alert(id: string, ticketId: string, riskScore: number, signals: FraudSignal[], amountAtRisk: number, ageHours: number, status: FraudStatus = 'open', reviewedBy: string | null = null, refundId: string | null = null): FraudAlert {
  const createdAt = hoursAgo(ageHours)
  return {
    id, ticketId, orderNumber: orderFor(ticketId), customer: ticket(ticketId).customer.name, riskScore,
    level: riskScore >= 75 ? 'high' : riskScore >= 45 ? 'medium' : 'low',
    signals, amountAtRisk, status, createdAt, reviewedBy, reviewedAt: reviewedBy ? minutesAfter(createdAt, 90) : null, refundId,
  }
}

export const fraudAlerts: FraudAlert[] = [
  alert('fa-101', 'GB-1064', 91, [sig('not_received_delivered'), sig('repeat_refund')], 168, 4, 'open', null, 'rf-201'),
  alert('fa-102', 'GB-1068', 68, [sig('high_value', 'High-value order ($451)'), sig('repeat_refund', '2nd refund in 30 days')], 451, 18, 'open', null, 'rf-202'),
  alert('fa-103', 'GB-1077', 38, [sig('address_mismatch')], 129, 26),
  alert('fa-104', 'GB-1071', 57, [sig('new_account'), sig('repeat_refund', '2nd refund in 30 days')], 96, 50, 'open', null, 'rf-203'),
  alert('fa-105', 'GB-1062', 31, [sig('address_mismatch')], 88, 9 * 24, 'safe', 'Sam Okafor'),
  alert('fa-106', 'GB-1056', 82, [sig('repeat_refund'), sig('address_mismatch')], 142, 6 * 24, 'held', 'Ava Martinez', 'rf-206'),
  alert('fa-107', 'GB-1048', 61, [sig('not_received_delivered'), sig('new_account')], 118, 23 * 24, 'escalated', 'Sam Okafor'),
  alert('fa-108', 'GB-1042', 44, [sig('high_value', 'High-value order ($310)')], 310, 50 * 24, 'safe', 'Ava Martinez'),
]

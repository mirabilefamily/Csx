import { Link } from 'react-router-dom'
import { ArrowRight, ShieldAlert } from 'lucide-react'
import type { FraudAction, FraudAlert, FraudSignal, RefundStage, RiskLevel } from '@/types'
import { Button } from '@/components/ui/button'
import { formatMoney, timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'

export const RISK_LABEL: Record<RiskLevel, string> = { high: 'High', medium: 'Medium', low: 'Low' }
const RISK_STYLE: Record<RiskLevel, string> = {
  high: 'bg-red-50 text-red-700 ring-red-100',
  medium: 'bg-amber-50 text-amber-900 ring-amber-300',
  low: 'bg-slate-100 text-slate-700 ring-slate-300',
}

export function RiskBadge({ level, score, testId }: { level: RiskLevel; score?: number; testId?: string }) {
  return (
    <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset', RISK_STYLE[level])} data-testid={testId}>
      <ShieldAlert className="h-3.5 w-3.5" aria-hidden />
      {score !== undefined && <span className="num">{score}</span>}
      <span>{RISK_LABEL[level]}</span>
    </span>
  )
}

export function FraudShield({ level, testId }: { level: RiskLevel; testId: string }) {
  return <ShieldAlert role="img" aria-label={`Fraud risk: ${RISK_LABEL[level]}`} className="h-3.5 w-3.5 text-red-600" data-testid={testId} />
}

export function SignalChips({ signals, testId, tone = 'neutral' }: { signals: FraudSignal[]; testId: string; tone?: 'neutral' | 'alert' }) {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Fraud signals">
      {signals.map((s) => (
        <li key={s.code} className={cn('rounded-full px-2.5 py-1 text-xs', tone === 'alert' ? 'bg-white text-red-700 ring-1 ring-inset ring-red-100' : 'bg-surface-muted text-ink')} data-testid={`${testId}-${s.code}`}>{s.label}</li>
      ))}
    </ul>
  )
}

const STEPS = [['requested', 'Requested', 'bg-brass-300'], ['approved', 'Approved', 'bg-tobacco-300'], ['refunded', 'Refunded', 'bg-tobacco-600']] as const

export function RefundPipeline({ stages, testId = 'refund-pipeline' }: { stages: Record<RefundStage, number>; testId?: string }) {
  const total = Math.max(1, stages.requested + stages.approved + stages.refunded)
  return (
    <div data-testid={testId}>
      <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-surface-muted" aria-hidden>
        {STEPS.map(([k, , c]) => stages[k] > 0 && <div key={k} className={c} style={{ width: `${(stages[k] / total) * 100}%` }} />)}
      </div>
      <ol className="mt-3 grid grid-cols-3 gap-2" aria-label="Refund pipeline">
        {STEPS.map(([k, label, c], i) => (
          <li key={k} className="min-w-0" data-testid={`${testId}-${k}`}>
            <span className="flex items-center gap-1.5 text-xs text-ink-muted"><i className={cn('h-2 w-2 shrink-0 rounded-full', c)} aria-hidden />{label}{i < 2 && <ArrowRight className="h-3 w-3 text-ink-subtle" aria-hidden />}</span>
            <span className="num text-base text-ink">{stages[k]}</span>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-xs text-ink-muted">
        <span data-testid={`${testId}-declined`}>Declined {stages.declined}</span> · <span data-testid={`${testId}-on_hold`}>On hold {stages.on_hold}</span>
      </p>
    </div>
  )
}

const DONE: Record<FraudAction, string> = { safe: 'Marked safe', held: 'Refund held', escalated: 'Escalated' }
export const ACTIONS: [FraudAction, string, string][] = [['safe', 'Mark safe', 'safe'], ['held', 'Hold refund', 'hold'], ['escalated', 'Escalate', 'escalate']]

export function FraudAlertRow({ a, onAction, busy }: { a: FraudAlert; onAction?: (a: FraudAlert, action: FraudAction) => void; busy?: boolean }) {
  return (
    <li className="space-y-3 py-4 first:pt-0 last:pb-0" data-testid={`fraud-alert-${a.id}`}>
      <div className="flex items-start gap-3">
        <RiskBadge level={a.level} score={a.riskScore} testId={`fraud-risk-${a.id}`} />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-baseline gap-x-2 text-sm"><span className="font-semibold text-ink">{a.customer}</span><span className="text-ink-muted">Order {a.orderNumber}</span></p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-ink-muted">
            <span className="font-medium text-ink" data-testid={`fraud-amount-${a.id}`}>{formatMoney(a.amountAtRisk)} at risk</span>
            <span aria-hidden>·</span><span>{timeAgo(a.createdAt)}</span><span aria-hidden>·</span>
            <Link to={`/inbox/${a.ticketId}`} className="inline-flex items-center rounded font-medium text-tobacco-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-sm:min-h-11" data-testid={`fraud-ticket-link-${a.id}`}>{a.ticketId}</Link>
          </p>
        </div>
      </div>
      <SignalChips signals={a.signals} testId={`fraud-signal-${a.id}`} />
      {a.status === 'open' ? (
        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
          {ACTIONS.map(([action, label, id]) => (
            <Button key={action} size="sm" variant="outline" disabled={busy || !onAction} className="max-sm:px-2" onClick={() => onAction?.(a, action)} data-testid={`fraud-action-${id}-${a.id}`}>{label}</Button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-ink-muted" data-testid={`fraud-reviewed-${a.id}`}>
          <span className="font-medium text-ink">{DONE[a.status]} by {a.reviewedBy}</span>{a.reviewedAt && <> · {timeAgo(a.reviewedAt)}</>}
          {a.reviewNote && <span className="mt-1 block rounded-lg bg-surface-muted px-2.5 py-1.5 text-ink" data-testid={`fraud-note-${a.id}`}>Note: {a.reviewNote}</span>}
        </p>
      )}
    </li>
  )
}

// Compact one-line alert row for the dashboard card (REQ-763); actions sit in a ⋯ menu.
export function FraudCompactRow({ a, menu }: { a: FraudAlert; menu: React.ReactNode }) {
  return (
    <li className="flex min-h-12 items-center gap-3 py-2" data-testid={`fraud-alert-${a.id}`}>
      <RiskBadge level={a.level} score={a.riskScore} testId={`fraud-risk-${a.id}`} />
      <Link to={`/inbox/${a.ticketId}`} className="min-w-0 flex-1 truncate rounded text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" data-testid={`fraud-ticket-${a.id}`}>
        <span className="font-semibold text-ink">{a.customer}</span><span className="text-ink-muted"> · {a.orderNumber} · </span><span className="font-medium text-ink" data-testid={`fraud-amount-${a.id}`}>{formatMoney(a.amountAtRisk)}</span><span className="text-ink-muted"> · {a.signals[0]?.label}</span>
      </Link>
      {menu}
    </li>
  )
}

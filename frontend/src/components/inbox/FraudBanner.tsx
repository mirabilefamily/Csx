import { Link } from 'react-router-dom'
import { ShieldAlert, ShieldCheck } from 'lucide-react'
import type { FraudAlert } from '@/types'
import { RISK_LABEL, SignalChips } from '@/components/dashboard/FraudBits'

const DONE = { safe: 'Marked safe', held: 'Refund held', escalated: 'Escalated' } as const

export function FraudBanner({ a }: { a: FraudAlert }) {
  if (a.status !== 'open')
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border bg-surface-sunken px-4 py-2.5 text-sm text-ink md:px-6" data-testid="fraud-banner-reviewed">
        <ShieldCheck className="h-4 w-4 shrink-0 text-green-700" aria-hidden />
        <p><span className="font-semibold">{DONE[a.status]}</span> by {a.reviewedBy}</p>
        {a.reviewNote && <p className="text-ink-muted" data-testid="fraud-banner-note">Note: {a.reviewNote}</p>}
      </div>
    )
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 md:px-6" data-testid="fraud-banner">
      <ShieldAlert className="h-4 w-4 shrink-0 text-red-600" aria-hidden />
      <p className="font-semibold" data-testid="fraud-banner-title">Fraud risk {a.riskScore} · {RISK_LABEL[a.level]}</p>
      <SignalChips signals={a.signals} tone="alert" testId="fraud-banner-signal" />
      <Link to="/dashboard#fraud" className="ml-auto inline-flex items-center rounded font-semibold text-red-700 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-sm:min-h-11" data-testid="fraud-banner-view">View alert</Link>
    </div>
  )
}

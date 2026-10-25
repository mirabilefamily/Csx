import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import type { FraudAlert } from '@/types'
import { RISK_LABEL, SignalChips } from '@/components/dashboard/FraudBits'

export function FraudBanner({ a }: { a: FraudAlert }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 md:px-6" data-testid="fraud-banner">
      <ShieldAlert className="h-4 w-4 shrink-0 text-red-600" aria-hidden />
      <p className="font-semibold" data-testid="fraud-banner-title">Fraud risk {a.riskScore} · {RISK_LABEL[a.level]}</p>
      <SignalChips signals={a.signals} tone="alert" testId="fraud-banner-signal" />
      <Link to="/dashboard#fraud" className="ml-auto inline-flex items-center rounded font-semibold text-red-700 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-sm:min-h-11" data-testid="fraud-banner-view">View alert</Link>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Sheet, SheetCloseButton, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { Link } from 'react-router-dom'
import { ChevronRight, ReceiptText } from 'lucide-react'
import type { DateRange, RefundSummary } from '@/types'
import { refundsApi } from '@/api'
import { useApi, useDemoState } from '@/hooks/useApi'
import { EmptyState, ErrorState } from '@/components/States'
import { formatMoney, timeAgo } from '@/lib/format'
import { palette } from '@/theme/tokens'
import { Panel, ViewAll } from './Panel'
import { Num } from '@/components/Num'
import { RefundPipeline } from './FraudBits'

const REC = { approve: 'AI: approve', decline: 'AI: decline', hold: 'AI: hold, fraud signals' } as const

function Trend({ values }: { values: number[] }) {
  if (values.length < 2) return null
  const max = Math.max(1, ...values)
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${30 - (v / max) * 26}`).join(' ')
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="h-10 w-full" role="img" aria-label={`Refunded per period: ${values.map((v) => `$${v}`).join(', ')}`} data-testid="refund-trend">
      <polygon points={`0,32 ${pts} 100,32`} fill={palette.brass[500]} opacity={0.12} />
      <polyline points={pts} fill="none" stroke={palette.brass[500]} strokeWidth={1.6} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  )
}

function delta(cur: number, prev: number | null) {
  if (prev === null || prev === 0) return 'No prior period'
  const pct = Math.round(((cur - prev) / prev) * 100)
  return `${pct > 0 ? '+' : ''}${pct}% vs prior period`
}

function Stat({ label, value, sub, testId }: { label: string; value: string; sub?: string; testId: string }) {
  return (
    <div className="min-w-0" data-testid={testId}>
      <p className="text-[13px] font-medium leading-5 text-ink-muted">{label}</p>
      <p className="mt-1 text-[26px] leading-8 text-ink"><Num value={value} /></p>
      {sub && <p className="mt-0.5 text-xs text-ink-muted" data-testid={`${testId}-sub`}>{sub}</p>}
    </div>
  )
}

function AwaitingList({ rows, testId }: { rows: RefundSummary['awaiting']; testId: string }) {
  return (
    <ul className="-mx-2 divide-y divide-border/70" data-testid={testId}>
      {rows.map((r) => (
        <li key={r.id}>
          <Link to={`/inbox/${r.ticketId}`} className="flex min-h-11 items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" data-testid={`refund-awaiting-${r.id}`}>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-baseline gap-x-2 text-sm"><span className="font-medium text-ink">{r.customer}</span><span className="text-xs text-ink-muted">{r.orderNumber}</span></span>
              <span className="block truncate text-xs text-ink-muted">{r.reason} · {timeAgo(r.createdAt)} · {REC[r.recommendation]}</span>
            </span>
            <span className="num text-sm text-ink">{formatMoney(r.amount)}</span>
            <ChevronRight className="h-4 w-4 text-ink-subtle" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  )
}

function Body({ s, limitLink }: { s: RefundSummary; limitLink?: React.ReactNode }) {
  const [all, setAll] = useState(false)
  if (s.count === 0) return <div className="flex min-h-[220px] items-center justify-center"><EmptyState compact title="No refunds in this period" description="Try a wider date range." icon={<ReceiptText className="h-5 w-5" aria-hidden />} testId="refunds-empty" /></div>
  return (
    <div className="space-y-5">
      {limitLink && <div className="-mt-2 flex justify-end">{limitLink}</div>}
      <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
        <Stat label="Total refunded" value={formatMoney(s.totalRefunded)} sub={delta(s.totalRefunded, s.previousTotal)} testId="refund-total" />
        <Stat label="Refunds" value={s.count.toLocaleString()} testId="refund-count" />
        <Stat label="Auto-refunded by AI" value={s.autoPct === null ? '—' : `${s.autoPct}%`} testId="refund-auto-pct" />
        <Stat label="Pending approval" value={`${s.pending.count} · ${formatMoney(s.pending.amount)}`} testId="refund-pending" />
      </div>
      {!limitLink && <Trend values={s.trend} />}
      <RefundPipeline stages={s.stages} />
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-ink">Awaiting approval</h4>
          <ViewAll count={s.awaiting.length} onClick={() => setAll(true)} testId="refunds-view-all" />
        </div>
        {s.awaiting.length === 0 ? <p className="text-sm text-ink-muted" data-testid="refund-awaiting-empty">Nothing waiting on a person.</p> : !all && <AwaitingList rows={s.awaiting.slice(0, 3)} testId="refund-awaiting" />}
      </div>
      <Sheet open={all} onOpenChange={setAll}>
        <SheetContent className="sm:max-w-[480px]" data-testid="refunds-sheet">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div><SheetTitle className="text-[15px] font-semibold text-ink">Awaiting approval</SheetTitle><SheetDescription className="text-sm text-ink-muted">{s.awaiting.length} refunds · {formatMoney(s.pending.amount)}</SheetDescription></div>
            <SheetCloseButton label="Close awaiting refunds" data-testid="refunds-sheet-close" />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4"><AwaitingList rows={s.awaiting} testId="refund-awaiting-all" /></div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export function RefundsPanel({ range, refreshKey, bare }: { range: DateRange; refreshKey: number; bare?: boolean }) {
  const { data, loading, error, reload } = useApi(() => refundsApi.getRefunds(range), [range.from, range.to, refreshKey])
  const demo = useDemoState()
  const [shown, setShown] = useState<RefundSummary | null>(null)
  useEffect(() => { if (data) setShown(data) }, [data])
  const limit = shown?.autoRefund
  const limitLink = limit && <Link to="/ai/replies" className="inline-flex shrink-0 items-center rounded text-[13px] font-medium text-tobacco-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-sm:min-h-11" data-testid="refund-auto-limit">{limit.enabled ? `Auto-refund limit: ${formatMoney(limit.limit)}` : 'Auto-refunds off'}</Link>
  return (
    <Panel
      title="Refunds"
      description="Recorded in range"
      loading={!error && (demo === 'loading' || (loading && !shown))}
      height={420}
      testId="refunds-panel"
      bare={bare}
      action={!bare && limitLink}
    >
      {error ? <ErrorState title="Refunds didn't load" description="We couldn't fetch refunds for this period." onRetry={reload} testId="refunds-error" /> : shown && <Body s={shown} limitLink={bare ? limitLink : undefined} />}
    </Panel>
  )
}

import { useState } from 'react'
import { ExternalLink, RefreshCw, Truck } from 'lucide-react'
import type { LoopLabelStatus, LoopOutcome, LoopReturn, LoopState } from '@/types'
import { Num } from '@/components/Num'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import { usd } from '@/lib/format'
const PILL = 'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium'
const STATE: Record<LoopState, [string, string]> = {
  open: ['Open', 'bg-brass-50 text-brass-700'], in_review: ['In review', 'bg-amber-50 text-amber-900'], closed: ['Closed', 'bg-slate-100 text-slate-700'],
  cancelled: ['Cancelled', 'bg-slate-100 text-slate-700'], expired: ['Expired', 'bg-slate-100 text-slate-700'],
}
const OUTCOME: Record<LoopOutcome, string> = { refund: 'Refund', exchange: 'Exchange', store_credit: 'Store credit', gift_card: 'Gift card' }
const LABEL: Record<LoopLabelStatus, string> = { label_created: 'Label created', in_transit: 'In transit', delivered_to_warehouse: 'Delivered to warehouse' }
const amountOf = (r: LoopReturn) => (r.outcome === 'refund' ? r.refund : r.outcome === 'exchange' ? r.exchangeTotal : r.storeCredit)

export { loopStats } from '@/lib/customerFacts'
import { loopStats } from '@/lib/customerFacts'

export function LoopMark({ size = 14 }: { size?: number }) {
  return <img src="/images/brand/loop-mark.svg" alt="" aria-hidden width={size} height={size} style={{ width: size, height: size, flexShrink: 0 }} />
}

export function LoopReturnCard({ r }: { r: LoopReturn }) {
  return (
    <div className="space-y-2.5 rounded-xl border border-border bg-surface p-3" data-testid={`loop-return-${r.id}`}>
      <div>
        <p className="flex items-baseline justify-between gap-2"><span className="text-sm font-semibold text-ink">#LR-{r.id}</span><span className="text-[11px] text-ink-muted">{new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></p>
        <p className="text-[11px] text-ink-muted">Order {r.orderNumber}</p>
      </div>
      <p className="flex flex-wrap gap-1">
        <span className={cn(PILL, STATE[r.state][1])} data-testid={`loop-state-${r.id}`}>{STATE[r.state][0]}</span>
        <span className={cn(PILL, 'bg-white text-ink ring-1 ring-inset ring-border')} data-testid={`loop-outcome-${r.id}`}>{OUTCOME[r.outcome]}</span>
      </p>
      <ul className="space-y-2" aria-label="Returned items">
        {r.items.map((it) => (
          <li key={it.sku} className="flex items-center gap-2.5">
            <img src={it.image} alt="" className="h-9 w-9 shrink-0 rounded-md object-cover ring-1 ring-border" loading="lazy" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-medium text-ink">{it.title}</span>
              <span className="block text-[11px] text-ink-muted">{it.variant} · {it.reason} · Qty {it.quantity}</span>
              {it.exchangeFor && <span className="block text-[11px] text-ink-muted">Exchange for {it.exchangeFor}</span>}
            </span>
          </li>
        ))}
      </ul>
      <dl className="grid grid-cols-2 gap-2 text-xs">
        <div><dt className="text-[11px] text-ink-muted">Return total</dt><dd className="text-ink"><Num value={usd(r.returnTotal)} /></dd></div>
        <div><dt className="text-[11px] text-ink-muted">{OUTCOME[r.outcome]}</dt><dd className="text-ink" data-testid={`loop-amount-${r.id}`}><Num value={usd(amountOf(r))} /></dd></div>
      </dl>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <span className="inline-flex items-center gap-1 text-[11px] text-ink-muted" data-testid={`loop-label-${r.id}`}><Truck className="h-3.5 w-3.5" aria-hidden />{LABEL[r.labelStatus]}</span>
        <a href={r.adminUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded text-xs font-medium text-tobacco-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-sm:min-h-11" data-testid={`loop-view-${r.id}`}>
          <LoopMark />View in Loop<ExternalLink className="h-3 w-3" aria-hidden /><span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
    </div>
  )
}

const STATE_FILTERS = [
  ['all', 'Open, closed and expired', () => true],
  ['open', 'Open & in review', (r: LoopReturn) => r.state === 'open' || r.state === 'in_review'],
  ['closed', 'Closed', (r: LoopReturn) => r.state === 'closed'],
  ['inactive', 'Cancelled & expired', (r: LoopReturn) => r.state === 'cancelled' || r.state === 'expired'],
] as const
const RANGES = [['all', 'All time', Infinity], ['90', 'Last 90 days', 90], ['365', 'Last 12 months', 365]] as const

export function LoopReturnsSection({ returns: all, lifetimeSpend, error, onRetry }: { returns?: LoopReturn[]; lifetimeSpend: number; error?: unknown; onRetry?: () => void }) {
  const [state, setState] = useState<string>('all')
  const [range, setRange] = useState<string>('all')
  const [looking, setLooking] = useState(false)
  const days = RANGES.find((r) => r[0] === range)![2]
  const match = STATE_FILTERS.find((f) => f[0] === state)![2]
  const returns = all?.filter((r) => match(r) && (Date.now() - new Date(r.createdAt).getTime()) / 864e5 <= days)
  const refresh = (fn?: () => void) => { setLooking(true); fn?.(); setTimeout(() => setLooking(false), 700) }
  const s = returns && loopStats(returns, lifetimeSpend)
  return (
    <section className="space-y-3 border-b border-border px-5 py-5" aria-label="Loop Returns" data-testid="loop-returns-section">
      <h3 className="flex items-center gap-2">
        <img src="/images/brand/loop-wordmark.svg" alt="Loop Returns" width={56} height={18} style={{ width: 56, height: 18 }} data-testid="loop-wordmark" />
        <span className="text-sm font-semibold text-ink" aria-hidden>Returns</span>
        <Button variant="ghost" size="icon-sm" className="ml-auto" aria-label="Refresh Loop returns" onClick={() => refresh(onRetry)} data-testid="loop-refresh"><RefreshCw className={cn(looking && 'animate-spin')} aria-hidden /></Button>
      </h3>
      <div className="grid grid-cols-2 gap-2" data-testid="loop-filters">
        <Select value={range} onValueChange={(v) => { setRange(v); refresh() }}>
          <SelectTrigger className="h-9 text-xs max-sm:h-11" aria-label="Return date range" data-testid="loop-range"><SelectValue /></SelectTrigger>
          <SelectContent>{RANGES.map(([id, l]) => <SelectItem key={id} value={id}>{l}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={state} onValueChange={(v) => { setState(v); refresh() }}>
          <SelectTrigger className="h-9 text-xs max-sm:h-11" aria-label="Return state" data-testid="loop-state-filter"><SelectValue /></SelectTrigger>
          <SelectContent>{STATE_FILTERS.map(([id, l]) => <SelectItem key={id} value={id} data-testid={`loop-state-${id}`}>{l}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {error ? (
        <p className="text-xs text-red-700" data-testid="loop-error">Couldn't load Loop returns. <button type="button" onClick={onRetry} className="font-medium underline max-sm:min-h-11">Try again</button></p>
      ) : looking || !returns || !s ? (
        <div className="space-y-2"><p className="text-xs text-ink-muted" role="status" data-testid="loop-looking">Looking up Loop returns…</p><Skeleton className="h-24 w-full rounded-xl" /></div>
      ) : returns.length === 0 ? (
        <p className="text-sm text-ink-muted" data-testid="loop-empty">{all?.length ? 'No returns match these filters' : 'No returns with Loop'}</p>
      ) : (
        <>
          <dl className="grid grid-cols-3 gap-2" data-testid="loop-stats">
            <div className="min-w-0 rounded-lg bg-surface-muted px-2.5 py-2"><dt className="text-[11px] text-ink-muted">Returns</dt><dd className="mt-0.5 text-sm text-ink" data-testid="loop-count"><Num value={String(s.count)} /></dd></div>
            <div className="min-w-0 rounded-lg bg-surface-muted px-2.5 py-2"><dt className="text-[11px] text-ink-muted">Returned $</dt><dd className="mt-0.5 truncate text-sm text-ink" data-testid="loop-dollars"><Num value={usd(s.dollars)} /></dd></div>
            <div className="min-w-0 rounded-lg bg-surface-muted px-2.5 py-2"><dt className="text-[11px] text-ink-muted">Return rate</dt><dd className="mt-0.5 text-sm text-ink" data-testid="loop-rate"><Num value={s.rate === null ? '—' : `${s.rate.toFixed(1)}%`} /></dd><dd className="text-[10px] leading-tight text-ink-muted">of lifetime spend</dd></div>
          </dl>
          {s.rate !== null && s.rate > 30 && <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900 ring-1 ring-inset ring-amber-300" data-testid="loop-high-rate">High return rate</span>}
          <div className="space-y-2">{returns.map((r) => <LoopReturnCard key={r.id} r={r} />)}</div>
        </>
      )}
    </section>
  )
}

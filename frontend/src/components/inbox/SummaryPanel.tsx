import { ChevronLeft, ChevronRight, PanelRightClose, PanelRightOpen, RotateCcw, ShieldAlert, ShoppingBag, User } from 'lucide-react'
import type { LoopReturn, TicketDetail } from '@/types'
import { Button } from '@/components/ui/button'
import { usd } from '@/lib/format'
import { cn } from '@/lib/utils'
import { lifetimeSpend, loopStats, paidOrders } from '@/lib/customerFacts'

const HIGH_RETURN = 30

function Row({ label, children, testId, tone }: { label: string; children: React.ReactNode; testId: string; tone?: 'risk' }) {
  return (
    <div className="grid grid-cols-[84px_1fr] gap-2 border-b border-border py-2.5 text-[13px] last:border-0" data-testid={testId}>
      <dt className="text-ink-muted">{label}</dt>
      <dd className={cn('min-w-0 text-ink', tone === 'risk' && 'font-medium text-red-700')}>{children}</dd>
    </div>
  )
}

function facts(d: TicketDetail, returns?: LoopReturn[]) {
  const orders = paidOrders(d.customer?.orders)
  const spend = lifetimeSpend(d.customer?.orders)
  const s = loopStats(returns ?? [], spend)
  return { orders, spend, latest: [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0], stats: s, high: s.rate !== null && s.rate > HIGH_RETURN, risky: d.fraudAlert?.status === 'open' }
}

// Collapsed rail (REQ-683): expand button and four row indicators.
export function SummaryRail({ d, returns, onExpand }: { d: TicketDetail; returns?: LoopReturn[]; onExpand: () => void }) {
  const f = facts(d, returns)
  const items: [string, React.ComponentType<{ className?: string }>, string, string][] = [
    ['customer', User, `Customer: ${d.ticket.customer.name}`, 'text-ink-muted'],
    ['order', ShoppingBag, f.latest ? `Latest order ${f.latest.number} · ${usd(f.latest.total)}` : 'No orders yet', 'text-ink-muted'],
    ['returns', RotateCcw, f.stats.count ? `Returns: ${f.stats.count} · ${f.stats.rate?.toFixed(1)}%${f.high ? ' (high return rate)' : ''}` : 'No returns with Loop', f.high ? 'text-amber-700' : 'text-ink-muted'],
    ['risk', ShieldAlert, f.risky ? `Risk ${d.fraudAlert!.riskScore}: ${d.fraudAlert!.signals[0]?.label ?? 'fraud signals'}` : 'No risk signals', f.risky ? 'text-red-700' : 'text-ink-muted'],
  ]
  return (
    <div className="flex w-11 flex-col items-center gap-1 py-2" data-testid="summary-rail">
      <Button variant="ghost" size="icon-sm" aria-label="Expand details panel" aria-expanded={false} onClick={onExpand} data-testid="summary-expand"><PanelRightOpen aria-hidden /></Button>
      <span className="my-1 h-px w-6 bg-border" aria-hidden />
      {items.map(([id, Icon, tip, tone]) => (
        <button key={id} type="button" onClick={onExpand} title={tip} aria-label={`${tip}. Expand details panel`} className={cn('flex h-8 w-8 items-center justify-center rounded-md hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', tone)} data-testid={`summary-rail-${id}`} data-tone={tone.includes('red') ? 'risk' : tone.includes('amber') ? 'high' : 'plain'}>
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  )
}

// Compact 4-row summary (REQ-657): Customer / Latest order / Returns / Risk.
export function SummaryPanel({ d, returns, full, onToggle, onCollapse }: { d: TicketDetail; returns?: LoopReturn[]; full: boolean; onToggle: () => void; onCollapse?: () => void }) {
  const c = d.customer
  const { orders, spend, latest: o, stats, high } = facts(d, returns)
  const alert = d.fraudAlert
  return (
    <div data-testid="summary-panel">
      <div className="flex h-[72px] items-center justify-between gap-2 border-b border-border px-4 max-sm:h-14">
        <h2 className="text-[15px] font-semibold text-ink" data-testid="summary-title">{full ? 'Details' : 'Summary'}</h2>
        <span className="flex items-center gap-1">
          {full && <ToggleFull full onToggle={onToggle} />}
          {onCollapse && <Button variant="ghost" size="icon-sm" className="max-sm:h-11 max-sm:w-11" aria-label="Collapse details panel" aria-expanded onClick={onCollapse} data-testid="summary-collapse"><PanelRightClose aria-hidden /></Button>}
        </span>
      </div>
      {!full && (
        <div className="px-4 pb-4 pt-2">
          <dl data-testid="summary-rows">
            <Row label="Customer" testId="summary-customer">
              <span className="block truncate font-medium">{d.ticket.customer.name}</span>
              <span className="block truncate text-xs text-ink-muted">{d.ticket.customer.email}</span>
              <span className="block text-xs text-ink-muted">{usd(spend)} lifetime · {countOf(orders.length, 'order')}{c?.customerSince ? ` · since ${new Date(c.customerSince).getFullYear()}` : ''}</span>
              <span className="block text-xs text-ink-muted" data-testid="summary-past-tickets">{countOf(d.pastTickets.length, 'past ticket')}</span>
              {c && c.tags.length > 0 && <span className="mt-1 flex flex-wrap gap-1">{c.tags.slice(0, 2).map((t) => <span key={t} className="rounded bg-surface-muted px-1.5 text-[11px] text-ink-muted">{t}</span>)}</span>}
            </Row>
        <Row label="Latest order" testId="summary-order">
          {o ? (
            <>
              <span className="block font-medium">{o.number} · {usd(o.total)}</span>
              <span className="mt-1 flex items-center gap-1" aria-hidden>{o.lineItems.slice(0, 3).map((l) => <img key={l.sku} src={l.image} alt="" className="h-7 w-7 rounded object-cover ring-1 ring-border" loading="lazy" />)}</span>
              <span className="mt-1 block text-xs capitalize text-ink-muted">{o.financialStatus.replace('_', ' ')} · {o.fulfillmentStatus.replace('_', ' ')}{o.trackingNumber ? ` · ${o.carrier} ${o.trackingNumber}` : ''}</span>
            </>
          ) : <span className="text-ink-muted">No orders yet</span>}
        </Row>
        <Row label="Returns" testId="summary-returns">
          {returns === undefined ? <span className="text-ink-muted">Loading…</span> : stats.count ? <span className={cn(high && 'font-medium text-amber-800')}>Loop {stats.count} · {usd(stats.dollars)} · {stats.rate?.toFixed(1)}%{high && ' · High'}</span> : <span className="text-ink-muted">No returns with Loop</span>}
        </Row>
        <Row label="Risk" testId="summary-risk" tone={alert?.status === 'open' ? 'risk' : undefined}>
          {alert ? <span className="inline-flex flex-col">{alert.status === 'open' ? <span className="inline-flex items-center gap-1"><ShieldAlert className="h-3.5 w-3.5" aria-hidden />Score {alert.riskScore}</span> : <span>Score {alert.riskScore} · Reviewed</span>}<span className="text-xs font-normal text-ink-muted">{alert.signals[0]?.label}</span></span> : <span className="text-ink-muted">No risk signals</span>}
        </Row>
          </dl>
          <ToggleFull full={false} onToggle={onToggle} />
        </div>
      )}
    </div>
  )
}

const countOf = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

function ToggleFull({ full, onToggle }: { full: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} aria-expanded={full} aria-controls="full-details" className={cn('inline-flex min-h-8 items-center gap-1 rounded px-1 text-[13px] font-medium text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-sm:min-h-11', !full && 'mt-2 -ml-1')} data-testid="summary-toggle-full">
      {full ? <><ChevronLeft className="h-4 w-4" aria-hidden />Show summary</> : <>View full details<ChevronRight className="h-4 w-4" aria-hidden /></>}
    </button>
  )
}

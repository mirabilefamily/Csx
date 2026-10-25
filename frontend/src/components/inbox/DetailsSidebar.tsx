import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import * as Collapsible from '@radix-ui/react-collapsible'
import { ChevronDown, PanelRightClose, X } from 'lucide-react'
import type { LoopReturn, TicketDetail } from '@/types'
import { LoopReturnsSection } from './LoopReturns'
import { AuthorBadge } from '@/components/AuthorBadge'
import { StatusPill } from '@/components/StatusPill'
import { focusRing } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CustomerHeader, CustomerStats, OrderCard, newestFirst } from './CustomerPanel'
import { ShopifyMark } from '@/components/brand/ShopifyMark'

function Section({ title, children, testId, icon }: { title: string; children: React.ReactNode; testId: string; icon?: React.ReactNode }) {
  return (
    <section className="space-y-3 border-b border-border px-5 py-5" data-testid={testId}>
      <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-muted">{icon}{title}</h3>
      {children}
    </section>
  )
}

function AttemptLog({ d }: { d: TicketDetail }) {
  const [open, setOpen] = useState(false)
  return (
    <Collapsible.Root open={open} onOpenChange={setOpen} className="border-b border-border px-5 py-5" data-testid="ai-attempt-log">
      <Collapsible.Trigger className={cn('flex w-full items-center justify-between rounded-md text-xs font-semibold uppercase tracking-wider text-ink-muted', focusRing)} data-testid="ai-attempt-log-toggle">
        AI attempt log ({d.attempts.length})
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} aria-hidden />
      </Collapsible.Trigger>
      <Collapsible.Content className="mt-3 space-y-3">
        {d.attempts.length === 0 ? (
          <p className="text-sm text-ink-muted" data-testid="ai-attempts-empty">No AI attempts on this ticket</p>
        ) : (
          d.attempts.map((a) => (
            <div key={a.id} className="space-y-1.5 rounded-lg border border-border p-3 text-xs" data-testid={`ai-attempt-${a.id}`}>
              <div className="flex items-center justify-between gap-2">
                <AuthorBadge type={a.tier} />
                <span className="font-mono text-ink-muted">{a.model}</span>
              </div>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-1">
                <dt className="text-ink-muted">Confidence</dt><dd className="text-right font-medium text-ink">{Math.round(a.confidence * 100)}%</dd>
                <dt className="text-ink-muted">Latency</dt><dd className="text-right font-medium text-ink">{a.latencyMs.toLocaleString()} ms</dd>
                <dt className="text-ink-muted">Outcome</dt><dd className="text-right font-medium capitalize text-ink">{a.outcome.replace('_', ' ')}</dd>
              </dl>
              {a.reason && <p className="text-ink"><span className="text-ink-muted">Reason: </span>{a.reason}</p>}
              <p className="text-ink"><span className="text-ink-muted">Guidance: </span>{a.guidanceIds.map((g) => d.guidanceTitles[g] ?? g).join(', ')}</p>
            </div>
          ))
        )}
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

export function DetailsSidebar({ d, onClose, onCollapse, loop }: { d: TicketDetail; onClose: () => void; onCollapse?: () => void; loop?: { data?: LoopReturn[]; error?: unknown; reload: () => void } }) {
  const { search } = useLocation()
  const c = d.customer
  const orders = newestFirst(c?.orders ?? [])
  return (
    <div className="pb-16" data-testid="details-sidebar">
      <div className="flex items-center justify-between border-b border-border px-5 py-3 lg:hidden">
        <p className="text-sm font-semibold text-ink">Details</p>
        <button type="button" onClick={onClose} aria-label="Close details" className={cn('inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-surface-muted', focusRing)} data-testid="details-close"><X className="h-4 w-4" aria-hidden /></button>
      </div>
      {onCollapse && (
        <div className="hidden items-center justify-between border-b border-border py-1.5 pl-5 pr-2 lg:flex">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Customer &amp; Shopify</p>
          <button type="button" onClick={onCollapse} aria-expanded aria-controls="customer-panel-body" aria-label="Collapse customer panel" className={cn('inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-muted hover:bg-surface-muted hover:text-ink', focusRing)} data-testid="customer-panel-collapse"><PanelRightClose className="h-4 w-4" aria-hidden /></button>
        </div>
      )}
      <Section title="Customer" testId="customer-card">
        <CustomerHeader name={d.ticket.customer.name} email={d.ticket.customer.email} c={c} fraud={d.fraudAlert} />
        {c?.shopifyCustomerId && <CustomerStats orders={orders} />}
        {c?.shopifyCustomerId && orders.length > 0 && <span className="inline-flex rounded-full border border-green-100 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700" data-testid="shopify-customer-tag">Shopify customer</span>}
        {c?.note && <p className="text-xs text-ink-muted">{c.note}</p>}
      </Section>
      <Section title="Shopify orders" testId="shopify-orders" icon={<ShopifyMark size={16} decorative />}>
        {orders.length === 0 ? (
          <p className="text-sm text-ink-muted" data-testid="no-shopify-orders">No Shopify orders</p>
        ) : (
          orders.map((o, i) => <OrderCard key={o.id} o={o} defaultOpen={i === 0} />)
        )}
      </Section>
      {loop && <LoopReturnsSection returns={loop.data} lifetimeSpend={orders.reduce((s, o) => s + o.total, 0)} error={loop.error} onRetry={loop.reload} />}
      <Section title="Past tickets" testId="past-tickets">
        {d.pastTickets.length === 0 ? (
          <p className="text-sm text-ink-muted">No other tickets from this customer</p>
        ) : (
          <ul className="space-y-1">
            {d.pastTickets.map((t) => (
              <li key={t.id}>
                <Link to={{ pathname: `/inbox/${t.id}`, search }} className="block rounded-md p-2 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" data-testid={`past-ticket-${t.id}`}>
                  <span className="flex items-center justify-between gap-2"><span className="text-xs font-medium text-ink-muted">{t.id}</span><StatusPill status={t.status} /></span>
                  <span className="mt-1 block truncate text-sm text-ink">{t.subject}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
      <AttemptLog d={d} />
    </div>
  )
}

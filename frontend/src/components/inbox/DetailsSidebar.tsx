import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import * as Collapsible from '@radix-ui/react-collapsible'
import { ChevronDown, ExternalLink, MapPin, X } from 'lucide-react'
import type { TicketDetail } from '@/types'
import { AuthorBadge } from '@/components/AuthorBadge'
import { StatusPill } from '@/components/StatusPill'
import { focusRing } from '@/components/ui/button'
import { timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'

const money = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
const ORDER_STATUS = { unfulfilled: 'Unfulfilled', in_transit: 'In transit', delivered: 'Delivered', returned: 'Returned', cancelled: 'Cancelled' }

function Section({ title, children, testId }: { title: string; children: React.ReactNode; testId: string }) {
  return (
    <section className="space-y-3 border-b border-border px-5 py-5" data-testid={testId}>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{title}</h3>
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

export function DetailsSidebar({ d, onClose }: { d: TicketDetail; onClose: () => void }) {
  const { search } = useLocation()
  const c = d.customer
  const orders = c?.orders ?? []
  return (
    <div className="pb-16" data-testid="details-sidebar">
      <div className="flex items-center justify-between border-b border-border px-5 py-3 wide:hidden">
        <p className="text-sm font-semibold text-ink">Details</p>
        <button type="button" onClick={onClose} aria-label="Close details" className={cn('inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-surface-muted', focusRing)} data-testid="details-close"><X className="h-4 w-4" aria-hidden /></button>
      </div>
      <Section title="Customer" testId="customer-card">
        <div>
          <p className="text-base font-semibold text-ink">{d.ticket.customer.name}</p>
          <p className="break-all text-sm text-ink-muted">{d.ticket.customer.email}</p>
          {c && <p className="mt-1 flex items-center gap-1 text-sm text-ink-muted"><MapPin className="h-3.5 w-3.5" aria-hidden /> {c.location}</p>}
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-surface-muted p-2.5"><dt className="text-xs text-ink-muted">Orders</dt><dd className="font-semibold text-ink" data-testid="customer-order-count">{orders.length}</dd></div>
          <div className="rounded-lg bg-surface-muted p-2.5"><dt className="text-xs text-ink-muted">Lifetime spend</dt><dd className="font-semibold text-ink" data-testid="customer-lifetime-spend">{money(orders.reduce((s, o) => s + o.total, 0))}</dd></div>
        </dl>
        {c && orders.length > 0 && <span className="inline-flex rounded-full border border-green-100 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700" data-testid="shopify-customer-tag">Shopify customer</span>}
        {c?.note && <p className="text-xs text-ink-muted">{c.note}</p>}
      </Section>
      <Section title="Shopify orders" testId="shopify-orders">
        {orders.length === 0 ? (
          <p className="text-sm text-ink-muted" data-testid="no-shopify-orders">No Shopify orders</p>
        ) : (
          orders.map((o) => (
            <div key={o.id} className="space-y-2 rounded-lg border border-border p-3" data-testid={`order-${o.number}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-ink">{o.number}</span>
                <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-ink">{ORDER_STATUS[o.status]}</span>
              </div>
              <p className="text-xs text-ink-muted">{timeAgo(o.createdAt)} · {money(o.total)}</p>
              <ul className="space-y-1">
                {o.lineItems.map((li) => (
                  <li key={li.sku} className="flex justify-between gap-2 text-xs"><span className="text-ink">{li.title} <span className="text-ink-muted">· {li.variant}</span></span><span className="shrink-0 text-ink-muted">Qty {li.quantity}</span></li>
                ))}
              </ul>
              {o.trackingUrl && (
                <a href={o.trackingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded text-xs font-medium text-tobacco-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" data-testid={`tracking-link-${o.number}`}>
                  Track with {o.carrier} <ExternalLink className="h-3 w-3" aria-hidden /><span className="sr-only">(opens in a new tab)</span>
                </a>
              )}
            </div>
          ))
        )}
      </Section>
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

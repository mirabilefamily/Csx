import { useState } from 'react'
import { Link } from 'react-router-dom'
import * as Collapsible from '@radix-ui/react-collapsible'
import { ChevronDown, ExternalLink, MapPin, PanelRightOpen, Phone, ShieldAlert, ShoppingBag } from 'lucide-react'
import type { Customer, FinancialStatus, FraudAlert, FulfillmentStatus, ShopifyOrder } from '@/types'
import { Num } from '@/components/Num'
import { RISK_LABEL } from '@/components/dashboard/FraudBits'
import { focusRing } from '@/components/ui/button'
import { timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'
import { ShopifyMark } from '@/components/brand/ShopifyMark'

import { usd } from '@/lib/format'
const PILL = 'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium'
const PAY: Record<FinancialStatus, [string, string]> = { paid: ['Paid', 'bg-green-50 text-green-700'], pending: ['Pending', 'bg-amber-50 text-amber-900'], partially_refunded: ['Partially refunded', 'bg-amber-50 text-amber-900'], refunded: ['Refunded', 'bg-slate-100 text-slate-700'] }
const FUL: Record<FulfillmentStatus, [string, string]> = { unfulfilled: ['Unfulfilled', 'bg-amber-50 text-amber-900'], fulfilled: ['Fulfilled', 'bg-green-50 text-green-700'], in_transit: ['In transit', 'bg-brass-50 text-brass-700'], delivered: ['Delivered', 'bg-green-50 text-green-700'] }
const EXT = 'inline-flex items-center gap-1 rounded text-xs font-medium text-tobacco-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-sm:min-h-11'
const NEW_TAB = <><ExternalLink className="h-3 w-3" aria-hidden /><span className="sr-only">(opens in a new tab)</span></>
const SHOP = <ShopifyMark size={14} decorative />
const KEY = 'goorin.customerPanel'

export const initials = (name: string) => name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
export const newestFirst = (orders: ShopifyOrder[]) => [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

// Open/collapsed choice for the ≥1024px customer panel, kept for the session.
export function useCustomerPanel() {
  const [collapsed, set] = useState(() => { try { return sessionStorage.getItem(KEY) === 'collapsed' } catch { return false } })
  const setCollapsed = (v: boolean) => { set(v); try { sessionStorage.setItem(KEY, v ? 'collapsed' : 'open') } catch { /* private mode */ } }
  return [collapsed, setCollapsed] as const
}

export function CustomerHeader({ name, email, c, fraud }: { name: string; email: string; c: Customer | null; fraud: FraudAlert | null }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tobacco-50 text-sm font-semibold text-tobacco-700" aria-hidden>{initials(name)}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold leading-tight text-ink" data-testid="customer-name">{name}</p>
          <p className="mt-0.5 break-all text-xs text-ink-muted" data-testid="customer-email">{email}</p>
        </div>
      </div>
      {fraud && (
        <Link to="/dashboard#fraud" className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-sm:min-h-11" data-testid="customer-fraud-chip">
          <ShieldAlert className="h-3.5 w-3.5" aria-hidden />Fraud risk {RISK_LABEL[fraud.level]}
        </Link>
      )}
      {!c || !c.shopifyCustomerId ? (
        <p className="rounded-lg bg-surface-muted px-3 py-2 text-xs text-ink-muted" data-testid="customer-guest">Guest: no Shopify customer record</p>
      ) : (
        <>
          <ul className="space-y-1 text-xs text-ink-muted">
            {c.phone && <li className="flex items-center gap-1.5" data-testid="customer-phone"><Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />{c.phone}</li>}
            <li className="flex items-center gap-1.5" data-testid="customer-location"><MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />{c.location}</li>
            <li data-testid="customer-since">Customer since {new Date(c.customerSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</li>
          </ul>
          {c.tags.length > 0 && (
            <ul className="flex flex-wrap gap-1.5" aria-label="Shopify customer tags" data-testid="customer-tags">
              {c.tags.map((t) => <li key={t} className="rounded-md bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-ink ring-1 ring-inset ring-border">{t}</li>)}
            </ul>
          )}
          {c.adminUrl && <a href={c.adminUrl} target="_blank" rel="noopener noreferrer" className={EXT} data-testid="customer-view-shopify">{SHOP}View in Shopify{NEW_TAB}</a>}
        </>
      )}
    </div>
  )
}

export function CustomerStats({ orders }: { orders: ShopifyOrder[] }) {
  const spend = orders.reduce((s, o) => s + o.total, 0)
  const last = newestFirst(orders)[0]
  const items: [string, string, string][] = [
    ['Orders', String(orders.length), 'customer-order-count'],
    ['Lifetime spend', usd(spend), 'customer-lifetime-spend'],
    ['Avg order value', orders.length ? usd(spend / orders.length) : '—', 'customer-aov'],
    ['Last order', last ? timeAgo(last.createdAt) : '—', 'customer-last-order'],
  ]
  return (
    <dl className="grid grid-cols-2 gap-2" data-testid="customer-stats">
      {items.map(([label, value, testId]) => (
        <div key={testId} className="min-w-0 rounded-lg bg-surface-muted px-2.5 py-2">
          <dt className="text-[11px] text-ink-muted">{label}</dt>
          <dd className="mt-0.5 truncate text-sm text-ink" data-testid={testId}><Num value={value} /></dd>
        </div>
      ))}
    </dl>
  )
}

export function OrderCard({ o, defaultOpen = false, actions }: { o: ShopifyOrder; defaultOpen?: boolean; actions?: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  const a = o.shippingAddress
  const count = o.lineItems.reduce((s, l) => s + l.quantity, 0)
  return (
    <Collapsible.Root open={open} onOpenChange={setOpen} className="rounded-lg border border-border bg-surface" data-testid={`order-card-${o.id}`}>
      <div data-testid={`order-${o.number}`}>
        <div className="px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <a href={o.adminUrl} target="_blank" rel="noopener noreferrer" className={cn('inline-flex min-w-0 items-center gap-1 rounded text-[13px] font-semibold text-ink underline-offset-2 hover:underline max-sm:min-h-11', focusRing)} data-testid={`order-view-shopify-${o.id}`}>{o.number}<ExternalLink className="h-3 w-3 shrink-0 text-ink-muted" aria-hidden /><span className="sr-only">View in Shopify (opens in a new tab)</span></a>
            {o.isDraft && <span className="rounded-md border border-border px-1.5 text-[11px] font-medium text-ink-muted" data-testid={`order-draft-${o.id}`}>Draft</span>}
            <Num value={usd(o.total)} className="ml-auto text-[13px] font-semibold text-ink" testId={`order-total-${o.id}`} />
            <Collapsible.Trigger className={cn('-mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-muted hover:bg-tobacco-50 max-sm:h-11 max-sm:w-11', focusRing)} aria-label={open ? 'Hide order details' : 'Show order details'} data-testid={`order-toggle-${o.id}`}>
              <ChevronDown className={cn('h-4 w-4 transition-transform motion-reduce:transition-none', open && 'rotate-180')} aria-hidden />
            </Collapsible.Trigger>
          </div>
          <p className="mt-0.5 text-xs text-ink-muted" data-testid={`order-summary-${o.id}`}>{new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {count} item{count === 1 ? '' : 's'}</p>
          <span className="mt-2 flex flex-wrap gap-1">
            <span className={cn(PILL, PAY[o.financialStatus][1])} data-testid={`order-payment-${o.id}`}>{PAY[o.financialStatus][0]}</span>
            <span className={cn(PILL, FUL[o.fulfillmentStatus][1])} data-testid={`order-fulfillment-${o.id}`}>{FUL[o.fulfillmentStatus][0]}</span>
          </span>
        </div>
        <Collapsible.Content className="space-y-4 border-t border-border px-3 py-3">
          <ul className="space-y-2" aria-label="Line items">
            {o.lineItems.map((li) => (
              <li key={li.sku} className="flex items-center gap-2.5" data-testid={`order-line-${li.sku}`}>
                <img src={li.image} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover ring-1 ring-border" loading="lazy" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-ink">{li.title}</span>
                  <span className="block text-xs text-ink-muted">{li.variant} · Qty {li.quantity}</span>
                </span>
                <Num value={usd(li.price)} className="text-[13px] text-ink" />
              </li>
            ))}
          </ul>
          <dl className="grid grid-cols-[96px_minmax(0,1fr)] gap-x-3 gap-y-2 text-[13px]">
            <div className="contents" data-testid={`order-address-${o.id}`}><dt className="pt-0.5 text-ink-muted">Ship to</dt><dd className="min-w-0 text-ink"><address className="not-italic leading-snug">{a.name}, {a.line1}<br />{a.city}{a.region && `, ${a.region}`} {a.zip}, {a.country}</address></dd></div>
            <div className="contents"><dt className="text-ink-muted">Tracking</dt><dd className="min-w-0">{o.trackingUrl ? <a href={o.trackingUrl} target="_blank" rel="noopener noreferrer" className={cn(EXT, 'text-[13px]')} data-testid={`tracking-link-${o.number}`}>{o.carrier} {o.trackingNumber}{NEW_TAB}</a> : <span className="text-ink-muted">No tracking yet</span>}</dd></div>
          </dl>
        </Collapsible.Content>
        {actions && <div className="border-t border-border px-3 py-1">{actions}</div>}
      </div>
    </Collapsible.Root>
  )
}

export function CustomerRail({ name, orders, returns, fraud, onExpand }: { name: string; orders: number; returns?: number; fraud: boolean; onExpand: () => void }) {
  return (
    <div className="hidden flex-col items-center gap-4 py-3 lg:flex" data-testid="customer-rail">
      <button type="button" onClick={onExpand} aria-expanded={false} aria-controls="customer-panel-body" aria-label="Expand customer panel" className={cn('flex h-9 w-9 items-center justify-center rounded-md text-ink-muted hover:bg-surface-muted hover:text-ink', focusRing)} data-testid="customer-panel-collapse">
        <PanelRightOpen className="h-4 w-4" aria-hidden />
      </button>
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-tobacco-50 text-xs font-semibold text-tobacco-700" title={name} aria-hidden>{initials(name)}</span>
      <span className="flex flex-col items-center gap-0.5 text-[11px] font-semibold tabular-nums text-ink" title={`${orders} orders`} data-testid="customer-rail-orders">
        <ShoppingBag className="h-4 w-4 text-ink-muted" aria-hidden />{orders}<span className="sr-only"> orders</span>
      </span>
      {returns !== undefined && (
        <span className="flex flex-col items-center gap-0.5 text-[11px] font-semibold tabular-nums text-ink" title={`${returns} Loop returns`} data-testid="customer-rail-returns">
          <img src="/images/brand/loop-mark.svg" alt="" aria-hidden width={16} height={16} />{returns}<span className="sr-only"> Loop returns</span>
        </span>
      )}
      {fraud && <ShieldAlert role="img" aria-label="Open fraud alert" className="h-4 w-4 text-red-600" />}
    </div>
  )
}

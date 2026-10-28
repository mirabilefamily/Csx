import { lifetimeSpend } from '@/lib/customerFacts'
import { useState, type FormEvent } from 'react'
import * as Collapsible from '@radix-ui/react-collapsible'
import { ChevronDown, PanelRightClose, Plus, RefreshCw, Search, Settings2, Sparkles, Star, User, X } from 'lucide-react'
import type { CsatResponse, LoopReturn, ShopifyOrder, TicketDetail, TicketPatch } from '@/types'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/overlay'
import { CustomerRows, Disclosure, PastTickets, TicketTags } from './PanelParts'
import { ExternalLink } from 'lucide-react'
import { usd as money } from '@/lib/format'
import { OrderActionDialog, OrderButtons } from './OrderActions'
import { customerToolsApi } from '@/api'
import type { InventoryResult } from '@/api/customerTools'
import { useApi } from '@/hooks/useApi'
import { LoopReturnsSection } from './LoopReturns'
import { AuthorBadge } from '@/components/AuthorBadge'
import { StatusPill } from '@/components/StatusPill'
import { Button, focusRing } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'
import { CustomerHeader, CustomerStats, OrderCard, newestFirst } from './CustomerPanel'
import { ShopifyMark } from '@/components/brand/ShopifyMark'

export function Section({ title, children, testId, icon, defaultOpen = true, action }: { title: string; children: React.ReactNode; testId: string; icon?: React.ReactNode; defaultOpen?: boolean; action?: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Collapsible.Root open={open} onOpenChange={setOpen} asChild>
      <section className="border-b border-border px-5 py-4" data-testid={testId}>
        <div className="flex items-center gap-2">
          <Collapsible.Trigger className={cn('flex min-h-9 flex-1 items-center gap-1.5 rounded-md text-left text-sm font-semibold text-ink hover:text-tobacco-700 max-sm:min-h-11', focusRing)} data-testid={`${testId}-toggle`}>
            {icon}{title}
            <ChevronDown className={cn('ml-auto h-4 w-4 transition-transform', open && 'rotate-180')} aria-hidden />
          </Collapsible.Trigger>
          {action}
        </div>
        <Collapsible.Content className="mt-3 space-y-3">{children}</Collapsible.Content>
      </section>
    </Collapsible.Root>
  )
}

function Feedback({ customerId }: { customerId?: string }) {
  const { data, loading } = useApi(() => (customerId ? customerToolsApi.getCustomerCsat(customerId) : Promise.resolve([] as CsatResponse[])), [customerId])
  if (loading) return <Skeleton className="h-12 w-full" />
  if (!data?.length) return <p className="text-sm text-ink-muted" data-testid="customer-feedback-empty">No CSAT responses from this customer yet</p>
  return (
    <ul className="space-y-2" data-testid="customer-feedback-list">
      {data.map((r) => (
        <li key={r.id} className="rounded-lg bg-surface-sunken p-2.5 text-xs" data-testid={`customer-feedback-${r.id}`}>
          <div className="flex items-center gap-1.5"><span className="inline-flex items-center gap-0.5 font-semibold text-ink"><Star className="h-3.5 w-3.5 fill-brass-500 text-brass-500" aria-hidden />{r.score}/5</span><span className="text-ink-muted">· {r.ticketId} · {timeAgo(r.createdAt)}</span></div>
          {r.comment && <p className="mt-1 text-ink">"{r.comment}"</p>}
        </li>
      ))}
    </ul>
  )
}

type Tool = 'find' | 'inventory' | 'details' | null

function OrderTools({ orders }: { orders: ShopifyOrder[] }) {
  const [tool, setTool] = useState<Tool>(null)
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<React.ReactNode>(null)
  const open = (t: Tool) => { setTool(tool === t ? null : t); setResult(null); setQ(t === 'inventory' ? orders[0]?.lineItems[0]?.sku ?? '' : t === 'details' ? orders[0]?.number ?? '' : '') }
  const run = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      if (tool === 'find') {
        const r = await customerToolsApi.findOrder(q)
        setResult(r ? <div data-testid="order-find-result"><p className="font-medium text-ink">{r.order.number} · {r.customerName}</p><p className="text-ink-muted">{r.email} · {money(r.order.total)} · {r.order.status.replace('_', ' ')}</p></div> : <p className="text-ink-muted" data-testid="order-find-empty">No order matches "{q}".</p>)
      } else if (tool === 'inventory') {
        const r: InventoryResult = await customerToolsApi.checkInventory(q)
        setResult(
          <div data-testid="inventory-result">
            <p className="font-medium text-ink">{r.title} · {r.sku}</p>
            <table className="mt-1.5 w-full text-left"><thead><tr className="text-ink-muted"><th className="font-medium">Size</th><th className="font-medium">In stock</th><th className="font-medium">Incoming</th></tr></thead>
              <tbody>{r.rows.map((x) => <tr key={x.size} data-testid={`inventory-${x.size}`}><td>{x.size}</td><td className={x.available === 0 ? 'font-semibold text-red-700' : 'text-ink'}>{x.available}</td><td className="text-ink-muted">{x.incoming || '—'}</td></tr>)}</tbody></table>
          </div>,
        )
      } else if (tool === 'details') {
        const o = await customerToolsApi.lookupOrderDetails(q)
        setResult(<div data-testid="order-details-result"><p className="font-medium text-ink">{o.number} · {o.financialStatus.replace('_', ' ')} · {o.fulfillmentStatus.replace('_', ' ')}</p><p className="text-ink-muted">{o.lineItems.length} items · {o.shippingAddress.city}, {o.shippingAddress.country} · {o.carrier ?? 'No carrier yet'}</p></div>)
      }
    } catch (err) { setResult(<p className="text-red-700" role="alert">{(err as Error).message}</p>) }
    setBusy(false)
  }
  const btn = (t: Exclude<Tool, null>, label: string) => <button type="button" aria-expanded={tool === t} onClick={() => open(t)} className={cn('min-h-8 rounded-full border px-2.5 text-xs font-medium transition-colors max-sm:min-h-11', tool === t ? 'border-tobacco-600 bg-tobacco-50 text-tobacco-800' : 'border-border-strong text-ink hover:bg-surface-muted', focusRing)} data-testid={`order-tool-${t}`}>{label}</button>
  return (
    <div className="space-y-2" data-testid="order-tools">
      <div className="flex flex-wrap gap-1.5">{btn('find', 'Find another order')}{btn('inventory', 'Check inventory by SKU')}{btn('details', 'Lookup details')}</div>
      {tool && (
        <form onSubmit={run} className="space-y-2 rounded-lg bg-surface-sunken p-2.5 text-xs" data-testid="order-tool-panel">
          <div className="flex gap-1.5">
            <Input aria-label={tool === 'find' ? 'Order number or email' : tool === 'inventory' ? 'SKU' : 'Order number'} placeholder={tool === 'find' ? '#GB20398 or email' : tool === 'inventory' ? 'SKU' : '#GB20398'} className="h-9 text-sm" value={q} onChange={(e) => setQ(e.target.value)} data-testid="order-tool-input" />
            <Button type="submit" size="sm" loading={busy} aria-label="Run lookup" data-testid="order-tool-run"><Search aria-hidden /></Button>
          </div>
          {result}
        </form>
      )}
    </div>
  )
}

function Helper() {
  return <p className="text-[11px] text-ink-muted" data-testid="matched-by-email">Matched by the ticket email</p>
}

export function DetailsSidebar({ d, onClose, onCollapse, loop, onPatch, onOrdersChanged, allTags = [], onAsk }: { d: TicketDetail; onClose: () => void; onCollapse?: () => void; loop?: { data?: LoopReturn[]; error?: unknown; reload: () => void; loading?: boolean }; onPatch?: (p: TicketPatch) => void; onOrdersChanged?: () => void; allTags?: string[]; onAsk?: () => void }) {
  const c = d.customer
  const orders = newestFirst(c?.orders ?? [])
  const [ordersKey, setOrdersKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [action, setAction] = useState<{ kind: 'edit' | 'duplicate' | 'refund' | 'create'; o?: ShopifyOrder } | null>(null)
  const openFraud = d.fraudAlert?.status === 'open' ? d.fraudAlert : null
  const refresh = () => { setRefreshing(true); setTimeout(() => { setOrdersKey((k) => k + 1); setRefreshing(false) }, 600) }
  const jump = (id: string) => document.querySelector(`[data-testid="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  return (
    <div className="pb-16" data-testid="details-sidebar">
      <p className="sr-only" data-testid="customer-panel-title">Full details</p>
      {onPatch && <Section title="Ticket details" testId="ticket-details-section"><TicketTags d={d} onPatch={onPatch} allTags={allTags} /></Section>}
      <Section title="Customer" testId="customer-card">
        <CustomerHeader name={d.ticket.customer.name} email={d.ticket.customer.email} c={c} fraud={openFraud} />
        <CustomerRows email={d.ticket.customer.email} c={c} />
        {c?.shopifyCustomerId && <CustomerStats orders={orders} />}
        {c?.shopifyCustomerId && orders.length > 0 && <span className="inline-flex rounded-full border border-green-100 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700" data-testid="shopify-customer-tag">Shopify customer</span>}
        {c?.note && <p className="text-xs text-ink-muted">{c.note}</p>}
        <Helper />
      </Section>
      <Section
        title="Shopify"
        testId="shopify-orders"
        icon={<ShopifyMark size={16} decorative />}
        action={<Button variant="ghost" size="icon-sm" aria-label="Refresh Shopify orders" onClick={refresh} data-testid="shopify-orders-refresh"><RefreshCw className={cn(refreshing && 'animate-spin')} aria-hidden /></Button>}
      >
        {c?.shopifyCustomerId && <a href={`https://admin.shopify.com/store/goorin-bros/customers/${c.shopifyCustomerId}`} target="_blank" rel="noopener noreferrer" className="-mt-1 inline-flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" data-testid="shopify-customer-link">View customer in Shopify <ExternalLink className="h-3 w-3" aria-hidden /><span className="sr-only">(opens in a new tab)</span></a>}
        {c?.customerSince && <p className="text-xs text-ink-muted">Created at {new Date(c.customerSince).toLocaleDateString('en-US')}</p>}
        <Disclosure label="Metafields" testId="shopify-metafields-toggle"><p className="text-xs text-ink-muted" data-testid="shopify-metafields-empty">No metafields</p></Disclosure>
        <Disclosure label="Purchase summary" testId="shopify-purchase-toggle"><CustomerStats orders={orders} /></Disclosure>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-ink" data-testid="shopify-orders-count">Orders <span className="ml-1 rounded-full bg-surface-muted px-1.5 text-xs text-ink-muted">{orders.length}</span></p>
          <Button variant="outline" size="sm" onClick={() => setAction({ kind: 'create' })} data-testid="shopify-create-order"><Plus aria-hidden /> Create order</Button>
        </div>
        <OrderTools orders={orders} />
        {refreshing ? <p className="text-xs text-ink-muted" role="status" data-testid="shopify-orders-loading">Refreshing orders from Shopify…</p> : orders.length === 0 ? (
          <p className="text-sm text-ink-muted" data-testid="no-shopify-orders">No orders yet</p>
        ) : (
          <div key={ordersKey} className="space-y-3">{orders.map((o, i) => <OrderCard key={o.id} o={o} defaultOpen={i === 0} actions={<OrderButtons o={o} onAction={(kind) => setAction({ kind, o })} />} />)}</div>
        )}
        <Helper />
      </Section>
      {loop && <LoopReturnsSection returns={loop.data} lifetimeSpend={lifetimeSpend(c?.orders)} error={loop.error} onRetry={loop.reload} />}
      <Section title="Past tickets" testId="past-tickets" defaultOpen={false}><PastTickets d={d} /></Section>
      <Section title="Customer feedback" testId="customer-feedback" defaultOpen={false}><Feedback customerId={c?.id} /></Section>
      <OrderActionDialog kind={action?.kind ?? null} o={action?.o} ticketId={d.ticket.id} customerId={c?.id} onClose={() => setAction(null)} onChanged={() => onOrdersChanged?.()} />
      <Section title={`AI attempt log (${d.attempts.length})`} testId="ai-attempt-log" defaultOpen={false}>
        {d.attempts.length === 0 ? (
          <p className="text-sm text-ink-muted" data-testid="ai-attempts-empty">No AI attempts on this ticket</p>
        ) : (
          d.attempts.map((a) => (
            <div key={a.id} className="space-y-1.5 rounded-lg border border-border p-3 text-xs" data-testid={`ai-attempt-${a.id}`}>
              <div className="flex items-center justify-between gap-2"><AuthorBadge type={a.tier} /><span className="font-mono text-ink-muted">{a.model}</span></div>
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
      </Section>
    </div>
  )
}

import { ShopifyMark } from '@/components/brand/ShopifyMark'
import { Link } from 'react-router-dom'
import { AlertTriangle, Bot, CheckCircle2, ChevronRight, Circle, Lock, Mail, Send, ShoppingBag, Sparkles, XCircle, type LucideIcon } from 'lucide-react'
import type { IntegrationId, IntegrationStatus, TestResult } from '@/types'
import { settingsApi } from '@/api'
import { useApi } from '@/hooks/useApi'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState, ErrorState } from '@/components/States'
import { timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'

export const STATUS = {
  connected: { label: 'Connected', cls: 'bg-green-50 text-green-700', Icon: CheckCircle2 },
  error: { label: 'Error', cls: 'bg-red-50 text-red-700', Icon: XCircle },
  not_configured: { label: 'Not configured', cls: 'bg-surface-muted text-ink-muted', Icon: Circle },
}

export const META: Record<IntegrationId, { purpose: string; Icon: LucideIcon; tile: string; logo?: string }> = {
  outlook: { purpose: 'Mailbox support@goorin.com via Microsoft Graph', Icon: Mail, tile: 'bg-slate-50 text-slate-700', logo: 'microsoftoffice-color.svg' },
  shopify: { purpose: 'Orders, customers & app embed', Icon: ShoppingBag, tile: 'bg-green-50 text-green-700' },
  claude: { purpose: 'Tier-1 AI replies', Icon: Sparkles, tile: 'bg-amber-50 text-amber-700', logo: 'claude-color.svg' },
  grokbot: { purpose: 'Tier-2 AI fallback', Icon: Bot, tile: 'bg-slate-700 text-white' },
  resend: { purpose: 'Transactional email & CSAT', Icon: Send, tile: 'bg-brass-50 text-brass-700', logo: 'resend-color.svg' },
  loop: { purpose: 'Returns, exchanges & store credit', Icon: Send, tile: 'bg-white', logo: 'loop-mark.svg' },
}

export const lastSync = (i: IntegrationStatus) => `Last sync: ${i.lastSyncAt ? timeAgo(i.lastSyncAt) : 'Never'}`
const shortReason = (e?: string | null) => e?.split(':')[0]

export function StatusPill({ i }: { i: IntegrationStatus }) {
  const s = STATUS[i.status]
  return <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', s.cls)} data-testid={`integration-status-${i.id}`}><s.Icon className="h-3 w-3" aria-hidden /> {s.label}</span>
}

export function LogoTile({ id, size = 'md' }: { id: IntegrationId; size?: 'md' | 'lg' }) {
  const m = META[id]
  const box = size === 'lg' ? 'h-12 w-12' : 'h-11 w-11'
  if (id === 'shopify') return <span className={cn('flex shrink-0 items-center justify-center rounded-xl bg-white ring-1 ring-inset ring-border', box)}><ShopifyMark size={size === 'lg' ? 24 : 22} testId={`integration-logo-${id}`} /></span>
  if (m.logo) return <span className={cn('flex shrink-0 items-center justify-center rounded-xl bg-white ring-1 ring-inset ring-border', box)}><img src={`/images/brand/${m.logo}`} alt="" width={22} height={22} className="h-[22px] w-[22px] object-contain" data-testid={`integration-logo-${id}`} /></span>
  return <span className={cn('flex shrink-0 items-center justify-center rounded-xl', m.tile, box)} aria-hidden data-testid={`integration-logo-${id}`}><m.Icon className="h-5 w-5" /></span>
}

const DOT = { connected: ['bg-green-600', 'Connected', 'text-green-800'], error: ['bg-red-600', 'Error', 'text-red-700'], not_configured: ['bg-slate-400', 'Not connected', 'text-ink-muted'] } as const

export function ConnectionDot({ i }: { i: IntegrationStatus }) {
  const [dot, label, text] = DOT[i.status]
  return <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', text)} data-testid={`integration-connection-${i.id}`}><span className={cn('h-1.5 w-1.5 rounded-full', dot)} aria-hidden />{label}</span>
}

export function ConfiguredPill({ i }: { i: IntegrationStatus }) {
  return <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', i.configured ? 'bg-surface-muted text-ink' : 'bg-white text-ink-muted ring-1 ring-inset ring-border')} data-testid={`integration-configured-${i.id}`}>{i.configured ? 'Configured' : 'Not configured'}</span>
}

export function Result({ r }: { r: TestResult | null }) {
  if (!r) return null
  return <p role="status" className={cn('text-sm font-medium', r.ok ? 'text-green-700' : 'text-red-700')} data-testid="test-result">{r.message}{r.ok && r.message.startsWith('(') ? ` · ${r.ms}ms` : ''}</p>
}

export function Credentials({ i }: { i: IntegrationStatus }) {
  return (
    <div className="rounded-xl bg-surface-sunken p-4" data-testid={`secret-${i.id}`}>
      <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted"><Lock className="h-3.5 w-3.5" aria-hidden /> Credentials</p>
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
        <dt className="text-ink-muted">API key</dt>
        <dd className="truncate font-mono text-ink">{i.secretPreview ?? 'Not set'}</dd>
        <dt className="text-ink-muted">Variable</dt>
        <dd className="truncate font-mono text-ink">{i.envVar}</dd>
      </dl>
      <p className="mt-3 text-xs text-ink-muted">Set via environment variable <code className="font-semibold text-ink">{i.envVar}</code>. Change it in your deployment environment.</p>
    </div>
  )
}

// One integration as a single focusable tile linking to its detail page.
export function IntegrationTile({ i }: { i: IntegrationStatus }) {
  const m = META[i.id]
  const attention = i.attention ?? (i.status === 'error' ? shortReason(i.error) : null)
  return (
    <Link
      to={`/settings/integrations/${i.id}`}
      className={cn(
        'group relative flex flex-col gap-4 overflow-hidden rounded-2xl bg-surface p-5 shadow-card ring-1 transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-popover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        attention ? 'ring-amber-200' : 'ring-black/[0.04]',
      )}
      data-testid={`integration-tile-${i.id}`}
    >
      {attention && <span className="absolute inset-y-0 left-0 w-1 bg-amber-500" aria-hidden data-testid={`integration-attention-edge-${i.id}`} />}
      <div className="flex items-start gap-3">
        <LogoTile id={i.id} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">{i.name}</p>
          {i.model && <p className="truncate font-mono text-xs text-ink-muted" data-testid={`integration-model-${i.id}`}>{i.model}</p>}
          <p className="mt-0.5 text-sm text-ink-muted" data-testid={`integration-purpose-${i.id}`}>{m.purpose}</p>
          {i.widget && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-ink" data-testid="integration-widget-status-shopify">
              <span className={cn('h-1.5 w-1.5 rounded-full', i.widget.embedEnabled ? 'bg-green-600' : 'bg-slate-500')} aria-hidden />
              Chat widget · {i.widget.embedEnabled ? 'Live on store' : 'Embed off'}
            </p>
          )}
        </div>
        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-ink-subtle transition-transform group-hover:translate-x-0.5" aria-hidden />
      </div>
      {attention && <p className="flex items-center gap-1.5 text-xs font-medium text-amber-800" data-testid={`integration-reason-${i.id}`}><AlertTriangle className="h-3.5 w-3.5" aria-hidden /> Needs attention: {attention}</p>}
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1">
        <ConfiguredPill i={i} />
        <ConnectionDot i={i} />
        <span className="ml-auto text-xs font-semibold text-tobacco-700 group-hover:underline" data-testid={`integration-manage-${i.id}`}>Manage</span>
      </div>
      <span className="sr-only" data-testid={`integration-last-sync-${i.id}`}>{lastSync(i)}</span>
    </Link>
  )
}

function summary(list: IntegrationStatus[]) {
  const n = (st: IntegrationStatus['status']) => list.filter((i) => i.status === st).length
  const att = list.filter((i) => i.attention && i.status === 'connected').length
  const off = n('not_configured')
  return [`${n('connected')} connected`, att && `${att} needs attention`, n('error') && `${n('error')} error${n('error') === 1 ? '' : 's'}`, off && `${off} not configured`].filter(Boolean).join(' · ')
}

const GRID = 'grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))]'

export function IntegrationsTab() {
  const { data, loading, error, reload } = useApi(() => settingsApi.listIntegrations(), [])
  if (loading)
    return (
      <div className="space-y-4" data-testid="integrations-loading">
        <Skeleton className="h-4 w-64" />
        <div className={GRID}>{[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-[148px] w-full rounded-2xl" />)}</div>
      </div>
    )
  if (error) return <Card><ErrorState title="Integrations didn't load" onRetry={reload} testId="integrations-error" /></Card>
  if (!data?.length) return <Card><EmptyState title="No integrations yet" description="Connect Office 365, Shopify and your AI providers to get started." testId="integrations-empty" /></Card>
  const hasError = data.some((i) => i.status === 'error' || i.attention)
  return (
    <div className="space-y-4" data-testid="integrations-tab">
      <div>
        <h2 className="text-[15px] font-semibold text-ink">Integrations</h2>
        <p className="mt-0.5 text-sm text-ink-muted" data-testid="integrations-helper">Services the desk connects to. Configured means setup is saved; Connected is the live check.</p>
      </div>
      <p className="flex items-center gap-2 text-sm text-ink-muted" data-testid="integrations-summary">
        <span className={cn('h-2 w-2 rounded-full', hasError ? 'bg-amber-500' : 'bg-green-500')} aria-hidden />
        {summary(data)}
      </p>
      <div className={GRID} data-testid="integrations-grid">{data.map((i) => <IntegrationTile key={i.id} i={i} />)}</div>
    </div>
  )
}

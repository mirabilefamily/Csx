import { useState } from 'react'
import { Link } from 'react-router-dom'
import * as Collapsible from '@radix-ui/react-collapsible'
import { AlertTriangle, Bot, CheckCircle2, ChevronDown, Circle, Loader2, Lock, Mail, Send, ShoppingBag, Sparkles, XCircle, type LucideIcon } from 'lucide-react'
import type { IntegrationId, IntegrationStatus, TestResult } from '@/types'
import { settingsApi } from '@/api'
import { useApi } from '@/hooks/useApi'
import { Button, focusRing } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FieldError, Input, Label, Textarea } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState, ErrorState } from '@/components/States'
import { isValidEmail, timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'

const STATUS = {
  connected: { label: 'Connected', cls: 'bg-green-50 text-green-700', Icon: CheckCircle2 },
  error: { label: 'Error', cls: 'bg-red-50 text-red-700', Icon: XCircle },
  not_configured: { label: 'Not configured', cls: 'bg-surface-muted text-ink-muted', Icon: Circle },
}

const META: Record<IntegrationId, { purpose: string; Icon: LucideIcon; tile: string }> = {
  outlook: { purpose: 'Pulls email from support@goorin.com', Icon: Mail, tile: 'bg-slate-50 text-slate-700' },
  shopify: { purpose: 'Orders, customers & app embed', Icon: ShoppingBag, tile: 'bg-green-50 text-green-700' },
  claude: { purpose: 'Tier-1 AI replies', Icon: Sparkles, tile: 'bg-amber-50 text-amber-700' },
  grokbot: { purpose: 'Tier-2 AI fallback', Icon: Bot, tile: 'bg-tobacco-50 text-tobacco-700' },
  resend: { purpose: 'Transactional email & CSAT', Icon: Send, tile: 'bg-brass-50 text-brass-700' },
}

function Result({ r }: { r: TestResult | null }) {
  if (!r) return null
  return <p role="status" className={cn('text-sm font-medium', r.ok ? 'text-green-700' : 'text-red-700')} data-testid="test-result">{r.message}{r.ok && r.message.startsWith('(') ? ` · ${r.ms}ms` : ''}</p>
}

function Credentials({ i }: { i: IntegrationStatus }) {
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

function PromptTester({ i }: { i: IntegrationStatus }) {
  const [model, setModel] = useState(i.model ?? i.models?.[0] ?? '')
  const [prompt, setPrompt] = useState('What size is a 22.5 inch head?')
  const [busy, setBusy] = useState(false)
  const [res, setRes] = useState<TestResult | null>(null)
  const run = async () => {
    setBusy(true)
    try { setRes(await settingsApi.testPrompt(i.id as 'claude' | 'grokbot', model, prompt)) } catch { setRes({ ok: false, ms: 0, message: 'Request failed: could not reach the server' }) }
    setBusy(false)
  }
  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor={`model-${i.id}`} className="text-xs text-ink-muted">Model</Label>
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger id={`model-${i.id}`} className="mt-1 h-9" data-testid={`model-select-${i.id}`}><SelectValue /></SelectTrigger>
          <SelectContent>{i.models?.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor={`prompt-${i.id}`} className="text-xs text-ink-muted">Test prompt</Label>
        <Textarea id={`prompt-${i.id}`} className="mt-1 min-h-[64px]" value={prompt} onChange={(e) => setPrompt(e.target.value)} data-testid={`prompt-input-${i.id}`} />
      </div>
      <Button size="sm" variant="outline" onClick={run} loading={busy} data-testid={`prompt-run-${i.id}`}>Run prompt</Button>
      <Result r={res} />
    </div>
  )
}

function ResendTester() {
  const [to, setTo] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [res, setRes] = useState<TestResult | null>(null)
  const [busy, setBusy] = useState(false)
  const send = async () => {
    setRes(null)
    if (!isValidEmail(to)) return setErr('Enter a valid email address.')
    setErr(null)
    setBusy(true)
    try { setRes(await settingsApi.sendTestEmail(to)) } catch (e) { setErr((e as Error).message) }
    setBusy(false)
  }
  return (
    <div className="space-y-2">
      <Label htmlFor="resend-to" className="text-xs text-ink-muted">Send test email</Label>
      <div className="flex gap-2">
        <Input id="resend-to" className="h-9" value={to} onChange={(e) => setTo(e.target.value)} aria-invalid={!!err} placeholder="you@goorin.com" data-testid="resend-test-email" />
        <Button size="sm" variant="outline" onClick={send} loading={busy} data-testid="resend-send-test">Send test email</Button>
      </div>
      <FieldError>{err}</FieldError>
      <Result r={res} />
    </div>
  )
}

function Details({ i }: { i: IntegrationStatus }) {
  return (
    <Collapsible.Content data-testid={`integration-details-${i.id}`}>
      <div className="grid gap-6 border-t border-border/70 px-5 pb-6 pt-5 md:grid-cols-2">
      <div className="space-y-5">
        <p className="text-sm text-ink-muted">{i.description}</p>
        {Object.keys(i.details).length > 0 && (
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2.5 text-sm">
            {Object.entries(i.details).map(([k, v]) => <div key={k} className="contents"><dt className="text-ink-muted">{k}</dt><dd className="text-ink">{v}</dd></div>)}
          </dl>
        )}
        {i.id === 'shopify' && <Link to="/settings/widget#install" className="inline-block rounded text-sm font-medium text-tobacco-700 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" data-testid="shopify-widget-install-link">Chat Widget → Install</Link>}
        {i.checklist && (
          <ul className="space-y-1.5" data-testid="resend-checklist">
            <li className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Domain verification</li>
            {i.checklist.map((c) => <li key={c.label} className="flex items-center gap-2 text-sm text-ink">{c.ok ? <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden /> : <XCircle className="h-4 w-4 text-red-600" aria-hidden />}{c.label} <span className="text-xs text-ink-muted">{c.ok ? 'Verified' : 'Pending'}</span></li>)}
          </ul>
        )}
        <Credentials i={i} />
      </div>
      {(i.id === 'claude' || i.id === 'grokbot') && <PromptTester i={i} />}
      {i.id === 'resend' && <ResendTester />}
      </div>
    </Collapsible.Content>
  )
}

export function IntegrationCard({ i }: { i: IntegrationStatus }) {
  const [testing, setTesting] = useState(false)
  const [res, setRes] = useState<TestResult | null>(null)
  const [open, setOpen] = useState(false)
  const s = STATUS[i.status]
  const m = META[i.id]
  const test = async () => {
    setTesting(true)
    setRes(null)
    try { setRes(await settingsApi.testIntegration(i.id)) } catch { setRes({ ok: false, ms: 0, message: 'Connection failed: could not reach the server' }) }
    setTesting(false)
  }
  return (
    <Collapsible.Root open={open} onOpenChange={setOpen} asChild>
      <article className="overflow-hidden rounded-2xl bg-surface shadow-card ring-1 ring-black/[0.04] transition-shadow hover:shadow-popover" data-testid={`integration-${i.id}`}>
        {i.status === 'error' && i.error && (
          <div className="flex items-start gap-2.5 bg-red-50 px-5 py-3 text-sm text-red-800" role="alert" data-testid={`integration-error-${i.id}`}>
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p><span className="font-semibold">Connection error.</span> {i.error}</p>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4">
          <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', m.tile)} aria-hidden><m.Icon className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-ink">{i.name}</p>
              <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', s.cls)} data-testid={`integration-status-${i.id}`}><s.Icon className="h-3 w-3" aria-hidden /> {s.label}</span>
            </div>
            <p className="mt-0.5 truncate text-sm text-ink-muted" data-testid={`integration-purpose-${i.id}`}>{m.purpose}</p>
          </div>
          <p className="whitespace-nowrap text-xs text-ink-subtle" data-testid={`integration-last-sync-${i.id}`}>Last sync: {i.lastSyncAt ? timeAgo(i.lastSyncAt) : 'Never'}</p>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" onClick={test} disabled={testing} data-testid={`test-connection-${i.id}`}>{testing && <Loader2 className="animate-spin" aria-hidden />} Test connection</Button>
            <Collapsible.Trigger className={cn('inline-flex h-8 items-center gap-1 rounded-md px-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink', focusRing)} aria-label={`${open ? 'Hide' : 'Show'} ${i.name} details`} data-testid={`integration-expand-${i.id}`}>
              <span className="hidden sm:inline">Details</span>
              <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} aria-hidden />
            </Collapsible.Trigger>
          </div>
        </div>
        {res && <div className="px-5 pb-4"><Result r={res} /></div>}
        <Details i={i} />
      </article>
    </Collapsible.Root>
  )
}

function summary(list: IntegrationStatus[]) {
  const n = (st: IntegrationStatus['status']) => list.filter((i) => i.status === st).length
  return `${n('connected')} connected · ${n('error')} error${n('error') === 1 ? '' : 's'} · ${n('not_configured')} not configured`
}

export function IntegrationsTab() {
  const { data, loading, error, reload } = useApi(() => settingsApi.listIntegrations(), [])
  if (loading)
    return (
      <div className="space-y-3" data-testid="integrations-loading">
        <Skeleton className="h-4 w-64" />
        {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-[76px] w-full rounded-2xl" />)}
      </div>
    )
  if (error) return <Card><ErrorState title="Integrations didn't load" onRetry={reload} testId="integrations-error" /></Card>
  if (!data?.length) return <Card><EmptyState title="No integrations yet" description="Connect Outlook, Shopify and your AI providers to get started." testId="integrations-empty" /></Card>
  const hasError = data.some((i) => i.status === 'error')
  return (
    <div className="space-y-4" data-testid="integrations-tab">
      <p className="flex items-center gap-2 text-sm text-ink-muted" data-testid="integrations-summary">
        <span className={cn('h-2 w-2 rounded-full', hasError ? 'bg-amber-500' : 'bg-green-500')} aria-hidden />
        {summary(data)}
      </p>
      <div className="space-y-3">{data.map((i) => <IntegrationCard key={i.id} i={i} />)}</div>
    </div>
  )
}

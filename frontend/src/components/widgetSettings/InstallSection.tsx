import { ShopifyMark } from '@/components/brand/ShopifyMark'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Copy, ExternalLink, Loader2, MousePointer2, XCircle } from 'lucide-react'
import { widgetApi } from '@/api'
import { useApi } from '@/hooks/useApi'
import type { ThemeEmbedSettings, VerifyResult, WidgetSettings } from '@/types'
import { Button } from '@/components/ui/button'
import { useUnsavedGuard } from '@/components/UnsavedGuard'
import { SHARED_FIELDS, mergeEffective } from '@/lib/widgetRules'
import { timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'
import { SourceBadge } from './fields'
import type { Update } from './validate'

export const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL || 'https://desk.goorin.com'

function StatusRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right font-medium text-ink">{children}</dd>
    </div>
  )
}

export function InstallSection({ draft, theme, update }: { draft: WidgetSettings; theme: ThemeEmbedSettings; update: Update }) {
  const status = useApi(() => widgetApi.getInstallStatus(), [])
  const [verify, setVerify] = useState<'idle' | 'loading' | VerifyResult>('idle')
  const [copied, setCopied] = useState(false)
  const { confirmLeave } = useUnsavedGuard()
  const navigate = useNavigate()
  const s = status.data
  const domain = s?.shopDomain ?? 'goorin.myshopify.com'
  const snippet = `<script src="${APP_BASE_URL}/widget.js" data-shop="${domain}" async></script>`
  const effective = mergeEffective(draft, theme)
  const value = (f: (typeof SHARED_FIELDS)[number]['id']) =>
    f === 'primary' ? effective.branding.colors.primary : f === 'accent' ? effective.branding.colors.accent : f === 'launcherPosition' ? effective.launcher.position.replace('-', ' ') : effective.display.hideOnMobile ? 'On' : 'Off'

  const copy = async () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    try {
      await navigator.clipboard.writeText(snippet)
    } catch {
      const t = document.createElement('textarea')
      t.value = snippet
      document.body.appendChild(t)
      t.select()
      document.execCommand('copy')
      t.remove()
    }
  }
  const runVerify = async () => {
    setVerify('loading')
    await widgetApi.verifyInstall().then(setVerify, () => setVerify({ detected: false, message: "Couldn't run the check. Try again." }))
    status.reload()
  }

  return (
    <>
      <div className="rounded-lg border border-border p-4" data-testid="install-status-card">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink"><ShopifyMark size={18} decorative />Shopify store</p>
        {status.loading && <p className="mt-2 text-sm text-ink-muted">Checking your store…</p>}
        {status.error && <p className="mt-2 text-sm text-red-600">Couldn't load install status. <button className="underline" onClick={status.reload}>Retry</button></p>}
        {s && (
          <dl className="mt-1 divide-y divide-border">
            <StatusRow label="Connected store"><span data-testid="install-domain">{s.shopDomain}</span></StatusRow>
            <StatusRow label="App embed">
              <span className={cn('rounded-full px-2 py-0.5 text-xs', s.embedEnabled ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')} data-testid="install-embed-status">{s.embedEnabled ? 'Enabled' : 'Disabled'}</span>
            </StatusRow>
            <StatusRow label="Active theme"><span data-testid="install-theme">{s.themeName}</span></StatusRow>
            <StatusRow label="Last widget load"><span data-testid="install-last-seen">{s.lastSeenAt ? timeAgo(s.lastSeenAt) : 'Never'}</span></StatusRow>
            <StatusRow label="Install method"><span data-testid="install-method">{s.method === 'app_embed' ? 'App embed' : s.method === 'script_tag' ? 'Script tag' : 'Not installed'}</span></StatusRow>
          </dl>
        )}
      </div>

      <div className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-[1fr_220px]" data-testid="install-embed-step">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brass-700">Recommended · App embed</p>
          <p className="mt-2 text-sm font-medium text-ink" data-testid="install-embed-path">Online Store → Themes → Customize → App embeds → toggle Goorin Support Desk → Save</p>
          <p className="mt-1 text-sm text-ink-muted">No code needed. The embed loads the widget on every page of your theme.</p>
          <Button className="mt-4" variant="outline" onClick={() => confirmLeave(() => navigate('/widget-demo/theme-editor'))} data-testid="open-theme-editor">
            <ExternalLink aria-hidden /> Open Theme Editor
          </Button>
        </div>
        <div className="relative rounded-lg bg-[#F1F1F1] p-3 font-[system-ui] text-[12px] text-[#303030]" aria-hidden data-testid="install-toggle-illustration">
          <p className="font-semibold">App embeds</p>
          <div className="mt-2 flex items-center gap-2 rounded-md bg-white p-2 shadow-sm">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-tobacco-600 text-[10px] font-bold text-white">G</span>
            <span className="flex-1">Goorin Support Desk</span>
            <span className="relative h-4 w-7 rounded-full bg-[#303030]"><i className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full bg-white" /></span>
          </div>
          <MousePointer2 className="absolute bottom-3 right-6 h-5 w-5 fill-white text-[#303030]" />
          <span className="mt-2 inline-block rounded bg-[#303030] px-2 py-0.5 text-[11px] font-semibold text-white">Save</span>
        </div>
      </div>

      <div className="rounded-lg border border-border p-4">
        <p className="text-sm font-semibold text-ink">Fallback: script tag</p>
        <p className="mt-1 text-sm text-ink-muted">If you can't use the app embed, paste this just before <code className="rounded bg-surface-muted px-1 font-mono text-xs">&lt;/body&gt;</code> in <code className="rounded bg-surface-muted px-1 font-mono text-xs">theme.liquid</code>.</p>
        <div className="mt-3 flex items-start gap-2">
          <pre tabIndex={0} aria-label="Script tag snippet" className="min-w-0 flex-1 overflow-x-auto rounded-md bg-[#1F1D1A] p-3 font-mono text-xs text-[#F1E6CF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" data-testid="install-snippet">{snippet}</pre>
          <Button variant="outline" size="sm" onClick={copy} data-testid="install-copy">
            <Copy aria-hidden /> {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border p-4" data-testid="install-sources">
        <p className="text-sm font-semibold text-ink">Settings source</p>
        <p className="mt-1 text-sm text-ink-muted">Settings saved here override the theme editor defaults.</p>
        <ul className="mt-3 divide-y divide-border">
          {SHARED_FIELDS.map((f) => (
            <li key={f.id} className="flex flex-wrap items-center gap-3 py-2 text-sm" data-testid={`install-source-${f.id}`}>
              <span className="w-36 text-ink">{f.label}</span>
              <span className="font-mono text-xs capitalize text-ink-muted">{value(f.id)}</span>
              <span className="ml-auto"><SourceBadge source={draft.sources[f.id]} /></span>
              {draft.sources[f.id] === 'desk' && (
                <button type="button" onClick={() => update((d) => { d.sources[f.id] = 'theme' })} className="text-xs font-medium text-tobacco-700 underline" data-testid={`install-use-theme-${f.id}`}>Use theme editor value</button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={runVerify} disabled={verify === 'loading'} data-testid="install-verify">
          {verify === 'loading' && <Loader2 className="animate-spin" aria-hidden />}
          Verify installation
        </Button>
        <div aria-live="polite" data-testid="install-verify-result">
          {verify === 'loading' && <span className="text-sm text-ink-muted">Looking for the widget on your storefront…</span>}
          {typeof verify === 'object' && (
            <span className={cn('inline-flex items-center gap-1.5 text-sm font-medium', verify.detected ? 'text-green-700' : 'text-red-700')}>
              {verify.detected ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <XCircle className="h-4 w-4" aria-hidden />}
              {verify.message}
            </span>
          )}
        </div>
      </div>
    </>
  )
}

import { ChevronDown, EyeOff, Monitor, Smartphone, Tablet } from 'lucide-react'
import type { WidgetSettings, WidgetState } from '@/types'
import { SupportWidget } from '@/components/widget/SupportWidget'
import { WIDGET_STATES } from '@/components/storefront/DemoControls'
import { hiddenReason, PAGE_TYPE_LABELS } from '@/lib/widgetRules'
import { cn } from '@/lib/utils'
import { MiniStore, PREVIEW_PATHS, STORE_FONT } from './MiniStore'

export type PreviewPage = 'product' | 'collection' | 'cart'
export type Device = 'desktop' | 'tablet' | 'mobile'
export interface PreviewOptions { page: PreviewPage; device: Device; state: WidgetState; outsideHours: boolean }

function Seg<T extends string>({ label, value, options, onChange, testId }: { label: string; value: T; options: { id: T; label: string; icon?: React.ReactNode }[]; onChange: (v: T) => void; testId: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg p-0.5" data-testid={testId}>
      {options.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={value === o.id} aria-label={o.icon ? o.label : undefined} title={o.icon ? o.label : undefined} onClick={() => onChange(o.id)} className={cn('inline-flex h-7 items-center gap-1 rounded-md px-2.5 text-xs font-medium transition-colors', value === o.id ? 'bg-surface text-ink shadow-card' : 'text-ink-muted hover:text-ink')} data-testid={`${testId}-${o.id}`}>
          {o.icon ?? o.label}
        </button>
      ))}
    </div>
  )
}

export function DeviceStage({ settings, opts, keyExtra = '' }: { settings: WidgetSettings; opts: PreviewOptions; keyExtra?: string }) {
  const isMobile = opts.device === 'mobile'
  const path = PREVIEW_PATHS[opts.page]
  const reason = hiddenReason(settings, { pageType: opts.page, pagePath: path, isMobile, outsideHours: opts.outsideHours })
  const key = [opts.state, opts.device, opts.page, opts.outsideHours, settings.launcher.animation, settings.launcher.bounceAfterSec, keyExtra].join('|')
  const screen = (
    <div className="relative h-full w-full overflow-hidden" style={{ fontFamily: STORE_FONT }} data-testid="preview-screen">
      <MiniStore page={opts.page} compact={opts.device !== 'desktop'} />
      <SupportWidget key={key} settings={settings} mode="contained" viewport={isMobile ? 'mobile' : 'desktop'} forcedState={opts.state} pageType={opts.page} pagePath={path} outsideHours={opts.outsideHours} />
      {reason && (
        <div className="absolute inset-x-3 bottom-3 z-20 flex items-start gap-3 rounded-lg border border-border bg-surface/95 p-3 shadow-popover backdrop-blur" role="status" data-testid="preview-hidden-overlay">
          <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-ink" style={{ fontFamily: 'Inter, sans-serif' }}>{reason.title}</p>
            <p className="text-xs text-ink-muted" style={{ fontFamily: 'Inter, sans-serif' }}>{reason.detail}</p>
          </div>
        </div>
      )}
    </div>
  )
  if (opts.device === 'mobile')
    return (
      <div className="mx-auto h-[600px] w-[290px] rounded-[46px] bg-[#1F1D1A] p-[10px] shadow-popover" data-testid="device-frame-mobile">
        <div className="relative h-full overflow-hidden rounded-[36px] bg-white">
          <div className="absolute left-1/2 top-2 z-30 h-[22px] w-[86px] -translate-x-1/2 rounded-full bg-[#1F1D1A]" aria-hidden />
          <div className="h-full pt-8">{screen}</div>
        </div>
      </div>
    )
  if (opts.device === 'tablet')
    return (
      <div className="mx-auto h-[600px] w-full max-w-[460px] rounded-[28px] bg-[#2A2724] p-3 shadow-popover" data-testid="device-frame-tablet">
        <div className="h-full overflow-hidden rounded-[18px] bg-white">{screen}</div>
      </div>
    )
  return (
    <div className="overflow-hidden rounded-xl border border-border-strong bg-white shadow-card" data-testid="device-frame-desktop">
      <div className="flex items-center gap-2 border-b border-border bg-surface-muted px-3 py-2">
        <span className="flex gap-1" aria-hidden>{['#E0675A', '#E9B44C', '#6DB46B'].map((c) => <i key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />)}</span>
        <span className="ml-2 flex-1 truncate rounded bg-surface px-2 py-0.5 text-[11px] text-ink-muted">goorin.myshopify.com{path}</span>
      </div>
      <div className="h-[560px]">{screen}</div>
    </div>
  )
}

export function WidgetPreview({ settings, opts, onChange }: { settings: WidgetSettings; opts: PreviewOptions; onChange: (o: PreviewOptions) => void }) {
  const set = <K extends keyof PreviewOptions>(k: K, v: PreviewOptions[K]) => onChange({ ...opts, [k]: v })
  const pro = settings.messaging.proactive
  return (
    <div className="space-y-3" data-testid="widget-preview">
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-surface-muted/70 p-1.5" role="toolbar" aria-label="Preview controls" data-testid="preview-toolbar">
        <Seg label="Preview page" testId="preview-page" value={opts.page} onChange={(v) => set('page', v)} options={[{ id: 'product', label: 'Product' }, { id: 'collection', label: 'Collection' }, { id: 'cart', label: 'Cart' }]} />
        <Seg label="Preview device" testId="preview-device" value={opts.device} onChange={(v) => set('device', v)} options={[{ id: 'desktop', label: 'Desktop', icon: <Monitor className="h-3.5 w-3.5" aria-hidden /> }, { id: 'tablet', label: 'Tablet', icon: <Tablet className="h-3.5 w-3.5" aria-hidden /> }, { id: 'mobile', label: 'Mobile', icon: <Smartphone className="h-3.5 w-3.5" aria-hidden /> }]} />
        <label className="relative ml-auto inline-flex items-center">
          <span className="sr-only">Preview state</span>
          <select value={opts.state} onChange={(e) => set('state', e.target.value as WidgetState)} aria-label="Preview state" className="h-8 appearance-none rounded-lg bg-surface pl-2.5 pr-8 text-xs font-medium text-ink shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" data-testid="preview-state">
            {WIDGET_STATES.map((s) => <option key={s.id} value={s.id} data-testid={`preview-state-${s.id}`}>{s.label}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-ink-muted" aria-hidden />
        </label>
      </div>
      <DeviceStage settings={settings} opts={opts} />
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
        <span data-testid="preview-greeting-caption">
          {pro.enabled ? `Greeting bubble appears after ${pro.delaySec}s on ${pro.pages.map((p) => PAGE_TYPE_LABELS[p]).join(', ') || 'no pages'}` : 'Greeting bubble is off'}
          {settings.launcher.animation === 'bounce' && ` · Launcher bounces after ${settings.launcher.bounceAfterSec}s`}
        </span>
        <label className="inline-flex items-center gap-1.5">
          <input type="checkbox" checked={opts.outsideHours} onChange={(e) => set('outsideHours', e.target.checked)} className="accent-[#6B4F3A]" data-testid="preview-outside-hours" />
          Outside business hours
        </label>
      </div>
    </div>
  )
}

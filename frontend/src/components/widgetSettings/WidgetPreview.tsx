import { ChevronDown, EyeOff, Monitor, Smartphone } from 'lucide-react'
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
      <div className="h-[calc(100vh-260px)] min-h-[560px] max-h-[760px]">{screen}</div>
    </div>
  )
}

const VIEWS: { id: WidgetState; label: string }[] = [{ id: 'home', label: 'Home' }, { id: 'active_chat', label: 'Conversation' }, { id: 'order_tracking', label: 'Order tracking' }]

export function WidgetPreview({ settings, opts, onChange }: { settings: WidgetSettings; opts: PreviewOptions; onChange: (o: PreviewOptions) => void }) {
  const set = <K extends keyof PreviewOptions>(k: K, v: PreviewOptions[K]) => onChange({ ...opts, [k]: v })
  return (
    <div className="space-y-3" data-testid="widget-preview">
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-surface-muted/70 p-1.5" role="toolbar" aria-label="Preview controls" data-testid="preview-toolbar">
        <Seg label="Preview device" testId="preview-device" value={opts.device === 'mobile' ? 'mobile' : 'desktop'} onChange={(v) => set('device', v)} options={[{ id: 'desktop', label: 'Desktop', icon: <Monitor className="h-3.5 w-3.5" aria-hidden /> }, { id: 'mobile', label: 'Phone', icon: <Smartphone className="h-3.5 w-3.5" aria-hidden /> }]} />
        <Seg label="Preview view" testId="preview-view" value={VIEWS.some((v) => v.id === opts.state) ? opts.state : 'active_chat'} onChange={(v) => set('state', v)} options={VIEWS} />
      </div>
      <DeviceStage settings={settings} opts={{ ...opts, page: 'product' }} />
      <p className="text-xs text-ink-muted" data-testid="preview-caption">Uses the same code shoppers get. Shows your draft; nothing is sent from the preview.</p>
      <label className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
        <input type="checkbox" checked={opts.outsideHours} onChange={(e) => set('outsideHours', e.target.checked)} className="accent-[#6B4F3A]" data-testid="preview-outside-hours" />
        Outside business hours
      </label>
    </div>
  )
}

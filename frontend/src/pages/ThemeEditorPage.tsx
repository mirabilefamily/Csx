import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Blocks, LayoutTemplate, Monitor, Paintbrush, Search, Smartphone } from 'lucide-react'
import { widgetApi } from '@/api'
import { useApi } from '@/hooks/useApi'
import type { ThemeEmbedSettings, WidgetSettings } from '@/types'
import { mergeEffective } from '@/lib/widgetRules'
import { cn } from '@/lib/utils'
import { DeviceStage, type PreviewPage } from '@/components/widgetSettings/WidgetPreview'

const SHOP = "-apple-system, BlinkMacSystemFont, 'San Francisco', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"

function ShopToggle({ checked, onChange, label, testId }: { checked: boolean; onChange: (v: boolean) => void; label: string; testId: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={cn('relative h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005BD3] focus-visible:ring-offset-1', checked ? 'bg-[#303030]' : 'bg-[#CCCCCC]')} data-testid={testId}>
      <span className={cn('absolute left-0 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-[18px]' : 'translate-x-0.5')} />
    </button>
  )
}

function ColorRow({ id, label, value, overridden, onChange }: { id: string; label: string; value: string; overridden: boolean; onChange: (v: string) => void }) {
  return (
    <div>
      <label htmlFor={`te-${id}`} className="text-[13px] text-[#303030]">{label}</label>
      <div className="mt-1 flex items-center gap-2 rounded-lg border border-[#8A8A8A]/40 bg-white px-2 py-1.5">
        <input id={`te-${id}`} type="color" value={value} onChange={(e) => onChange(e.target.value.toUpperCase())} className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0" data-testid={`te-${id}`} />
        <span className="font-mono text-[12px] text-[#303030]">{value}</span>
      </div>
      {overridden && <p className="mt-1 text-[12px] text-[#616161]" data-testid={`te-${id}-overridden`}>Overridden by Goorin Support Desk</p>}
    </div>
  )
}

function Editor({ desk, initial }: { desk: WidgetSettings; initial: ThemeEmbedSettings }) {
  const [saved, setSaved] = useState(initial)
  const [draft, setDraft] = useState(initial)
  const [page, setPage] = useState<PreviewPage>('product')
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [toast, setToast] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)
  const effective = useMemo(() => mergeEffective(desk, draft), [desk, draft])
  const set = <K extends keyof ThemeEmbedSettings>(k: K, v: ThemeEmbedSettings[K]) => setDraft((d) => ({ ...d, [k]: v }))

  const save = async () => {
    setSaving(true)
    try {
      setSaved(await widgetApi.saveThemeEmbed(draft))
      setToast('Saved')
    } catch {
      setToast("Couldn't save. Try again.")
    }
    setSaving(false)
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-[#F1F1F1] text-[#303030]" style={{ fontFamily: SHOP }} data-testid="theme-editor">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[#E3E3E3] bg-white px-3">
        <Link to="/settings/widget#install" className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[13px] font-medium hover:bg-[#F1F1F1]" data-testid="te-back">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back to Goorin Support Desk
        </Link>
        <span className="hidden h-5 w-px bg-[#E3E3E3] sm:block" />
        <span className="hidden text-[13px] font-semibold sm:inline" data-testid="te-theme-name">Dawn – Goorin 2026</span>
        <span className="hidden rounded-full bg-[#CDFEE1] px-2 py-0.5 text-[11px] font-medium text-[#0C5132] sm:inline">Live</span>
        <label className="ml-auto flex items-center gap-2 text-[13px]">
          <span className="sr-only">Preview page</span>
          <select value={page} onChange={(e) => setPage(e.target.value as PreviewPage)} className="h-8 rounded-lg border border-[#8A8A8A]/40 bg-white px-2 text-[13px]" data-testid="te-page">
            <option value="product">Product page</option>
            <option value="collection">Collection page</option>
            <option value="cart">Cart</option>
          </select>
        </label>
        <div className="flex rounded-lg border border-[#E3E3E3]" role="radiogroup" aria-label="Preview device">
          {(['desktop', 'mobile'] as const).map((d) => (
            <button key={d} type="button" role="radio" aria-checked={device === d} aria-label={d} onClick={() => setDevice(d)} className={cn('flex h-8 w-9 items-center justify-center', device === d && 'bg-[#F1F1F1]')} data-testid={`te-device-${d}`}>
              {d === 'desktop' ? <Monitor className="h-4 w-4" aria-hidden /> : <Smartphone className="h-4 w-4" aria-hidden />}
            </button>
          ))}
        </div>
        <button type="button" onClick={save} disabled={!dirty || saving} className="h-8 rounded-lg bg-[#303030] px-3 text-[13px] font-semibold text-white shadow-[inset_0_-1px_0_rgba(0,0,0,0.5)] disabled:bg-[#B5B5B5]" data-testid="te-save">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </header>
      <div className="flex min-h-0 flex-1">
        <nav className="flex w-[52px] shrink-0 flex-col items-center gap-1 border-r border-[#E3E3E3] bg-white py-2" aria-label="Theme editor panels">
          {[[LayoutTemplate, 'Sections'], [Paintbrush, 'Theme settings'], [Blocks, 'App embeds']].map(([Icon, label], i) => {
            const I = Icon as typeof Blocks
            return <span key={label as string} title={label as string} className={cn('flex h-9 w-9 items-center justify-center rounded-lg', i === 2 ? 'bg-[#EBEBEB] text-[#303030]' : 'text-[#8A8A8A]')}><I className="h-[18px] w-[18px]" aria-hidden /></span>
          })}
        </nav>
        <aside className="w-[300px] shrink-0 overflow-y-auto border-r border-[#E3E3E3] bg-white p-3" aria-label="App embeds" data-testid="te-app-embeds">
          <p className="px-1 text-[14px] font-semibold">App embeds</p>
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-[#E3E3E3] px-2 py-1.5 text-[13px] text-[#616161]"><Search className="h-4 w-4" aria-hidden /> Search app embeds</div>
          <div className="mt-3 rounded-xl border border-[#E3E3E3] bg-white shadow-[0_1px_0_rgba(0,0,0,0.05)]" data-testid="te-embed-block">
            <div className="flex items-center gap-2 border-b border-[#E3E3E3] p-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#6B4F3A] text-[12px] font-bold text-white">G</span>
              <span className="flex-1 text-[13px] font-semibold">Goorin Support Desk</span>
              <ShopToggle checked={draft.enabled} onChange={(v) => set('enabled', v)} label="Enable Goorin Support Desk" testId="te-enable-header" />
            </div>
            <div className="space-y-4 p-3">
              <label className="flex items-center justify-between gap-2 text-[13px]">
                Enable Goorin Support Desk
                <ShopToggle checked={draft.enabled} onChange={(v) => set('enabled', v)} label="Enable Goorin Support Desk toggle" testId="te-enable" />
              </label>
              <ColorRow id="primary" label="Primary color" value={draft.primary} overridden={desk.sources.primary === 'desk'} onChange={(v) => set('primary', v)} />
              <ColorRow id="accent" label="Accent color" value={draft.accent} overridden={desk.sources.accent === 'desk'} onChange={(v) => set('accent', v)} />
              <div>
                <label htmlFor="te-position" className="text-[13px]">Launcher position</label>
                <select id="te-position" value={draft.launcherPosition} onChange={(e) => set('launcherPosition', e.target.value as ThemeEmbedSettings['launcherPosition'])} className="mt-1 h-8 w-full rounded-lg border border-[#8A8A8A]/40 bg-white px-2 text-[13px]" data-testid="te-position">
                  <option value="bottom-right">Bottom right</option>
                  <option value="bottom-left">Bottom left</option>
                </select>
                {desk.sources.launcherPosition === 'desk' && <p className="mt-1 text-[12px] text-[#616161]">Overridden by Goorin Support Desk</p>}
              </div>
              <label className="flex items-center gap-2 text-[13px]">
                <input type="checkbox" checked={draft.hideOnMobile} onChange={(e) => set('hideOnMobile', e.target.checked)} className="h-4 w-4 accent-[#303030]" data-testid="te-hide-mobile" />
                Hide on mobile
              </label>
              <p className="text-[12px] text-[#616161]" data-testid="te-helper">
                <Link to="/settings/widget" className="text-[#005BD3] underline" data-testid="te-helper-link">Advanced settings are managed in Goorin Support Desk</Link>
              </p>
            </div>
          </div>
        </aside>
        <main className="min-w-0 flex-1 overflow-auto p-6 pb-20" data-testid="te-preview">
          {draft.enabled ? (
            <DeviceStage settings={effective} opts={{ page, device, state: 'launcher_closed', outsideHours: false }} keyExtra={`${draft.launcherPosition}`} />
          ) : (
            <div className="relative">
              <DeviceStage settings={{ ...effective, display: { ...effective.display, mode: 'page_types', pageTypes: [] } }} opts={{ page, device, state: 'launcher_closed', outsideHours: false }} />
              <p className="mt-3 text-center text-[13px] text-[#616161]" data-testid="te-embed-off">The Goorin Support Desk app embed is off, so the widget doesn't load on your store.</p>
            </div>
          )}
        </main>
      </div>
      {toast && <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-[#1A1A1A] px-4 py-2.5 text-[13px] font-medium text-white shadow-lg" role="status" data-testid="te-toast">{toast}</div>}
    </div>
  )
}

export default function ThemeEditorPage() {
  const desk = useApi(() => widgetApi.getWidgetSettings(), [])
  const theme = useApi(() => widgetApi.getThemeEmbed(), [])
  useEffect(() => {
    document.title = 'Customize Dawn – Goorin 2026 · Shopify'
  }, [])
  if (desk.error || theme.error)
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-[#F1F1F1]" style={{ fontFamily: SHOP }} data-testid="te-error">
        <div className="rounded-xl bg-white p-6 text-center shadow">
          <p className="text-[14px] font-semibold text-[#303030]">The theme editor couldn't load</p>
          <button type="button" onClick={() => { desk.reload(); theme.reload() }} className="mt-3 h-8 rounded-lg bg-[#303030] px-3 text-[13px] font-semibold text-white" data-testid="te-retry">Try again</button>
        </div>
      </div>
    )
  if (!desk.data || !theme.data)
    return (
      <div className="flex h-[100dvh] flex-col bg-[#F1F1F1]" data-testid="te-loading">
        <div className="h-14 border-b border-[#E3E3E3] bg-white" />
        <div className="flex flex-1 gap-4 p-4">
          <div className="w-[300px] animate-pulse rounded-xl bg-white" />
          <div className="flex-1 animate-pulse rounded-xl bg-[#E3E3E3]" />
        </div>
      </div>
    )
  return <Editor desk={desk.data} initial={theme.data} />
}

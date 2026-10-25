import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CircleDot, ExternalLink, Filter, MessageSquareText, PackageCheck, Palette, Star, type LucideIcon } from 'lucide-react'
import { toast } from 'sonner'
import { csatApi, widgetApi } from '@/api'
import { useApi } from '@/hooks/useApi'
import type { ThemeEmbedSettings, WidgetSettings } from '@/types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/States'
import { useUnsavedGuard } from '@/components/UnsavedGuard'
import { SaveBar } from '@/components/settings/SaveBar'
import { mergeEffective } from '@/lib/widgetRules'
import { Section } from './fields'
import { sectionSummary } from './summaries'
import { BrandingSection } from './BrandingSection'
import { LauncherSection } from './LauncherSection'
import { MessagingSection } from './MessagingSection'
import { CsatInChatSection, DisplaySection } from './DisplaySection'
import { InstallSection } from './InstallSection'
import { WidgetPreview, type PreviewOptions } from './WidgetPreview'
import { sanitizeForPreview, validateWidget, type WidgetErrors } from './validate'

const SECTIONS: [string, string, string, LucideIcon][] = [
  ['branding', 'Branding', 'Colors, logo, avatars, font, corners and shadow', Palette],
  ['launcher', 'Launcher', 'Icon, style, size, position and attention', CircleDot],
  ['messaging', 'Messaging', 'Header, greeting, pre-chat, handoff, offline and quick replies', MessageSquareText],
  ['display', 'Display rules', 'Where the widget shows and what the AI can see', Filter],
  ['csat', 'CSAT in chat', 'Inline survey style and questions', Star],
  ['install', 'Install', 'Shopify app embed, script tag and verification', PackageCheck],
]

function Loaded({ saved: initial, theme, onRetry }: { saved: WidgetSettings; theme: ThemeEmbedSettings; onRetry: () => void }) {
  void onRetry
  const { hash } = useLocation()
  const [saved, setSaved] = useState(initial)
  const [draft, setDraft] = useState(initial)
  const [uploadErrors, setUploadErrors] = useState<WidgetErrors>({})
  const [open, setOpen] = useState<Set<string>>(() => new Set(hash === '#install' ? ['install'] : ['branding']))
  const [opts, setOpts] = useState<PreviewOptions>({ page: 'product', device: 'desktop', state: 'active_chat', outsideHours: false })
  const [saving, setSaving] = useState(false)
  const questions = useApi(() => csatApi.getCsatSurvey(), [])
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved])
  const errors = useMemo(() => validateWidget(draft, uploadErrors), [draft, uploadErrors])
  const invalid = Object.keys(errors).length > 0
  useUnsavedGuard('widget-settings', dirty)
  const preview = useMemo(() => mergeEffective(sanitizeForPreview(draft, saved), theme), [draft, saved, theme])

  useEffect(() => {
    if (hash !== '#install') return
    setOpen((o) => new Set(o).add('install'))
    requestAnimationFrame(() => document.getElementById('install')?.scrollIntoView({ block: 'start' }))
  }, [hash])

  const update = (fn: (d: WidgetSettings) => void) =>
    setDraft((d) => {
      const n = structuredClone(d)
      fn(n)
      return n
    })
  const setUploadError = (k: string, e?: string) => setUploadErrors(({ [k]: _, ...rest }) => (e ? { ...rest, [k]: e } : rest))
  const toggle = (id: string) => setOpen((o) => { const n = new Set(o); if (n.has(id)) n.delete(id); else n.add(id); return n })

  const save = async () => {
    if (invalid) {
      const el = document.querySelector<HTMLElement>('[data-testid="widget-settings-form"] [aria-invalid="true"], [data-testid="widget-settings-form"] [role="alert"]')
      el?.scrollIntoView({ block: 'center' })
      el?.focus?.()
      return
    }
    setSaving(true)
    try {
      const s = await widgetApi.saveWidgetSettings(draft)
      setSaved(s)
      setDraft(s)
      toast.success('Widget settings saved')
    } catch {
      toast.error("Couldn't save widget settings. Try again.")
    }
    setSaving(false)
  }
  const previewOnStore = () => {
    widgetApi.stashDeskPreview(preview)
    window.open('/widget-demo?desk_preview=1', '_blank', 'noopener')
  }

  return (
    <div className="grid gap-6 pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)]" data-testid="widget-settings">
      <div className="min-w-0 space-y-3" data-testid="widget-settings-form">
        {SECTIONS.map(([id, title, desc, Icon]) => (
          <Section key={id} id={id} title={title} description={desc} Icon={Icon} summary={sectionSummary(id, draft, theme)} open={open.has(id)} onToggle={() => toggle(id)}>
            {id === 'branding' && <BrandingSection draft={draft} update={update} uploadErrors={uploadErrors} setUploadError={setUploadError} />}
            {id === 'launcher' && <LauncherSection draft={draft} update={update} errors={errors} setUploadError={setUploadError} />}
            {id === 'messaging' && <MessagingSection draft={draft} update={update} errors={errors} />}
            {id === 'display' && <DisplaySection draft={draft} update={update} />}
            {id === 'csat' && <CsatInChatSection draft={draft} update={update} questions={questions.data?.questions} />}
            {id === 'install' && <InstallSection draft={draft} theme={theme} update={update} />}
          </Section>
        ))}
      </div>
      <aside className="min-w-0 lg:sticky lg:top-20 lg:self-start" aria-label="Live preview">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[15px] font-semibold text-ink">Live preview</p>
          <Button variant="outline" size="sm" onClick={previewOnStore} data-testid="preview-on-store">
            <ExternalLink aria-hidden /> Preview on my store
          </Button>
        </div>
        <WidgetPreview settings={preview} opts={opts} onChange={setOpts} />
      </aside>
      {dirty && (
        <SaveBar note={invalid && <span className="hidden text-xs text-red-600 sm:inline" data-testid="ws-invalid-note">Fix the highlighted fields</span>}>
          <Button variant="ghost" size="sm" onClick={() => { setDraft(saved); setUploadErrors({}) }} data-testid="ws-discard">Discard</Button>
          <Button size="sm" onClick={save} loading={saving} aria-disabled={invalid} className={invalid ? 'opacity-50' : ''} data-testid="ws-save">Save</Button>
        </SaveBar>
      )}
    </div>
  )
}

export function WidgetSettingsTab() {
  const settings = useApi(() => widgetApi.getWidgetSettings(), [])
  const theme = useApi(() => widgetApi.getThemeEmbed(), [])
  if (settings.error || theme.error) return <ErrorState title="Widget settings didn't load" onRetry={() => { settings.reload(); theme.reload() }} />
  if (!settings.data || !theme.data)
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_500px]" data-testid="widget-settings-loading">
        <div className="space-y-3">{[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-[72px] w-full rounded-2xl" />)}</div>
        <Skeleton className="h-[640px] w-full rounded-2xl" />
      </div>
    )
  return <Loaded saved={settings.data} theme={theme.data} onRetry={settings.reload} />
}

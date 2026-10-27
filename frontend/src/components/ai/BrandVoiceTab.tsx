import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FlaskConical, MessageCircle, Mail, PenLine, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { BRAND_VOICE_LIMITS, type BrandVoice } from '@/types'
import { aiApi } from '@/api'
import { useApi } from '@/hooks/useApi'
import { useUnsavedGuard } from '@/components/UnsavedGuard'
import { Button } from '@/components/ui/button'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Switch } from '@/components/ui/overlay'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/States'
import { SaveState } from '@/components/PageTabs'
import { timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'

type Key = keyof typeof BRAND_VOICE_LIMITS
const STYLE: [Key, string, string][] = [
  ['tone', 'Tone', 'How Claude should sound. A few adjectives and a picture of the person writing.'],
  ['howToRespond', 'How to respond', 'Structure, length and habits for every reply.'],
  ['phrasesToUse', 'Phrases to use', 'One per line. Claude reaches for these naturally.'],
  ['phrasesToAvoid', 'Phrases to avoid', 'One per line. Claude rewrites around these.'],
  ['examples', 'Example replies', 'Paste one or two replies you love. Claude copies the style, not the facts.'],
]

function Counter({ id, value, max }: { id: string; value: string; max: number }) {
  const over = value.length > max
  return (
    <span id={`${id}-count`} className={cn('text-xs tabular-nums', over ? 'font-semibold text-red-700' : 'text-ink-muted')} data-testid={`bv-count-${id}`}>
      {value.length.toLocaleString()} / {max.toLocaleString()}
    </span>
  )
}

function VoiceField({ id, label, hint, value, max, onChange, rows }: { id: Key; label: string; hint: string; value: string; max: number; onChange: (v: string) => void; rows?: number }) {
  const over = value.length > max
  const Field = rows ? Textarea : Input
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={`bv-${id}`}>{label}</Label>
        <Counter id={id} value={value} max={max} />
      </div>
      <p className="mt-0.5 text-xs text-ink-muted">{hint}</p>
      <Field id={`bv-${id}`} rows={rows} className={cn('mt-2', rows && 'min-h-[96px]')} value={value} onChange={(e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) => onChange(e.target.value)} aria-invalid={over} aria-describedby={`${id}-count${over ? ` bv-${id}-error` : ''}`} data-testid={`bv-${id}`} />
      {over && <p id={`bv-${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-red-700" data-testid={`bv-error-${id}`}>Keep this under {max.toLocaleString()} characters.</p>}
    </div>
  )
}

function Rail({ draft }: { draft: BrandVoice }) {
  const navigate = useNavigate()
  const where: [typeof Mail, string][] = [[FlaskConical, 'Test sandbox answers'], [PenLine, 'Agent ticket drafts'], [Mail, 'Automatic email replies'], [MessageCircle, 'Widget chat']]
  return (
    <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start" data-testid="bv-rail">
      <section className="rounded-2xl bg-surface p-5 shadow-card ring-1 ring-black/[0.04]">
        <h3 className="text-sm font-semibold text-ink">Where it applies</h3>
        <ul className="mt-3 space-y-2.5">
          {where.map(([Icon, l]) => <li key={l} className="flex items-center gap-2.5 text-sm text-ink"><Icon className="h-4 w-4 text-tobacco-500" aria-hidden />{l}</li>)}
        </ul>
      </section>
      <section className="rounded-2xl bg-surface p-5 shadow-card ring-1 ring-black/[0.04]">
        <h3 className="text-sm font-semibold text-ink">Style, never policy</h3>
        <ul className="mt-3 list-disc space-y-1.5 pl-4 text-sm text-ink-muted">
          <li>Voice shapes wording only. Refund limits, returns and shipping come from Guidance.</li>
          <li>Claude never invents a promise because a phrase sounds friendly.</li>
          <li>Safety and escalation rules always win over style.</li>
        </ul>
      </section>
      <section className="rounded-2xl bg-tobacco-50 p-5 ring-1 ring-tobacco-100">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-tobacco-800"><Sparkles className="h-4 w-4" aria-hidden /> Hear it</h3>
        <p className="mt-1.5 text-sm text-tobacco-800/80">Chat with Claude as a customer using this draft, before you save it.</p>
        <Button variant="outline" className="mt-3 w-full bg-white" onClick={() => navigate('/ai/testing', { state: { voice: draft } })} data-testid="bv-test-voice">Test this voice</Button>
      </section>
    </aside>
  )
}

function Loaded({ initial }: { initial: BrandVoice }) {
  const [saved, setSaved] = useState(initial)
  const [draft, setDraft] = useState(initial)
  const [saving, setSaving] = useState(false)
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved])
  const over = (Object.keys(BRAND_VOICE_LIMITS) as Key[]).some((k) => draft[k].length > BRAND_VOICE_LIMITS[k])
  useUnsavedGuard('brand-voice', dirty)
  const set = (patch: Partial<BrandVoice>) => setDraft((d) => ({ ...d, ...patch }))
  const save = async () => {
    setSaving(true)
    try { const s = await aiApi.saveBrandVoice(draft); setSaved(s); setDraft(s); toast.success('Brand voice saved') } catch (e) { toast.error((e as Error).message) }
    setSaving(false)
  }
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_360px]" data-testid="brand-voice-tab">
      <div className="min-w-0 space-y-4">
        <section className="rounded-2xl bg-surface p-6 shadow-card ring-1 ring-black/[0.04] max-sm:px-4" data-testid="bv-card-voice">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-[15px] font-semibold text-ink">Brand voice</h2>
              <p className="mt-0.5 text-sm text-ink-muted">One voice for every AI reply. Last saved {timeAgo(saved.updatedAt)}.</p>
            </div>
            <label className="flex min-h-11 items-center gap-2.5 text-sm font-medium text-ink">
              <Switch checked={draft.enabled} onCheckedChange={(v) => set({ enabled: v })} data-testid="bv-enabled" aria-label="Voice on" />
              Voice on
            </label>
          </div>
          <div className="mt-5 max-w-[480px]">
            <VoiceField id="brandName" label="Brand name" hint="How Claude refers to the shop." value={draft.brandName} max={BRAND_VOICE_LIMITS.brandName} onChange={(v) => set({ brandName: v })} />
          </div>
        </section>
        <section className={cn('space-y-6 rounded-2xl bg-surface p-6 shadow-card ring-1 ring-black/[0.04] transition-opacity max-sm:px-4', !draft.enabled && 'opacity-60')} data-testid="bv-card-style">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">Response style</h2>
            <p className="mt-0.5 text-sm text-ink-muted">{draft.enabled ? 'Write it the way you would brief a new teammate.' : 'Voice is off. Claude uses a neutral, helpful style.'}</p>
          </div>
          <div className="grid gap-6 2xl:grid-cols-2">
            {STYLE.map(([k, label, hint]) => (
              <div key={k} className={cn('max-w-[75ch]', k === 'examples' && '2xl:col-span-2')}>
                <VoiceField id={k} label={label} hint={hint} value={draft[k]} max={BRAND_VOICE_LIMITS[k]} onChange={(v) => set({ [k]: v })} rows={k === 'examples' ? 6 : 4} />
              </div>
            ))}
          </div>
        </section>
        <div className="sticky bottom-[calc(1rem+env(safe-area-inset-bottom))] z-20 flex flex-wrap items-center justify-end gap-3 rounded-2xl bg-surface/95 px-4 py-3 shadow-popover ring-1 ring-black/5 backdrop-blur-md max-sm:bottom-[calc(4.75rem+env(safe-area-inset-bottom))]" data-testid="bv-savebar">
          <span className="mr-auto"><SaveState dirty={dirty} testId="bv-save-state" /></span>
          {over && <span className="text-xs font-medium text-red-700" data-testid="bv-over-note">Shorten the highlighted fields to save.</span>}
          {dirty && <Button variant="ghost" size="sm" onClick={() => setDraft(saved)} data-testid="bv-discard">Discard</Button>}
          <Button size="sm" onClick={save} loading={saving} disabled={!dirty || over} data-testid="bv-save">Save brand voice</Button>
        </div>
      </div>
      <Rail draft={draft} />
    </div>
  )
}

export function BrandVoiceTab() {
  const { data, loading, error, reload } = useApi(() => aiApi.getBrandVoice(), [])
  const [key, setKey] = useState(0)
  useEffect(() => setKey((k) => k + 1), [data])
  if (loading) return <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]" data-testid="bv-loading"><div className="space-y-4"><Skeleton className="h-40 w-full rounded-2xl" /><Skeleton className="h-96 w-full rounded-2xl" /></div><Skeleton className="h-80 w-full rounded-2xl" /></div>
  if (error || !data) return <ErrorState title="Brand voice didn't load" onRetry={reload} testId="bv-error" />
  return <Loaded key={key} initial={data} />
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as SliderPrimitive from '@radix-ui/react-slider'
import * as Collapsible from '@radix-ui/react-collapsible'
import { ArrowRight, ChevronDown, Copy, Mail, MessageCircle, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { AiSettings, RuleCondition } from '@/types'
import { settingsApi } from '@/api'
import { useApi } from '@/hooks/useApi'
import { useUnsavedGuard } from '@/components/UnsavedGuard'
import { Button, focusRing } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FieldError, Input, Label } from '@/components/ui/input'
import { Switch } from '@/components/ui/overlay'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/States'
import { cn } from '@/lib/utils'
import { FormSection, SaveBar } from './SaveBar'

const CONDITIONS: [RuleCondition, string][] = [['keyword', 'Message contains keyword'], ['refund_over', 'Refund amount over ($)'], ['sentiment', 'Sentiment is'], ['order_total_over', 'Order total over ($)']]
const ZONES = ['America/Los_Angeles', 'America/Denver', 'America/Chicago', 'America/New_York', 'Europe/London']
const TIERS = [{ id: 'claude', tier: 'Tier 1', name: 'Claude' }, { id: 'grokbot', tier: 'Tier 2', name: 'Grokbot' }] as const

type SetFn = (patch: Partial<AiSettings>) => void

function Threshold({ value, set }: { value: number; set: SetFn }) {
  return (
    <div className="space-y-3">
      <SliderPrimitive.Root value={[value]} min={0} max={100} step={1} onValueChange={([v]) => set({ threshold: v })} className="relative flex h-6 w-full touch-none items-center" data-testid="threshold-slider">
        <SliderPrimitive.Track className="relative h-2.5 grow overflow-hidden rounded-full" style={{ background: `linear-gradient(to right, #EBC98A 0 ${value}%, #C9B39F ${value}% 100%)` }} data-testid="threshold-band" />
        <SliderPrimitive.Thumb aria-label="Confidence threshold" className="block h-5 w-5 rounded-full border-2 border-tobacco-600 bg-white shadow-card transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
      </SliderPrimitive.Root>
      <div className="flex flex-wrap justify-between gap-2 text-xs text-ink-muted">
        <span className="inline-flex items-center gap-1.5" data-testid="threshold-zone-grokbot"><i className="h-2 w-2 rounded-full bg-[#EBC98A]" aria-hidden /> Escalate to Grokbot · 0–{Math.max(value - 1, 0)}%</span>
        <span className="inline-flex items-center gap-1.5" data-testid="threshold-zone-claude"><i className="h-2 w-2 rounded-full bg-[#C9B39F]" aria-hidden /> Claude handles · {value}–100%</span>
      </div>
      <p className="text-sm font-medium text-ink" data-testid="threshold-line">Replies below {value}% escalate to Grokbot</p>
    </div>
  )
}

function Matrix({ form, set }: { form: AiSettings; set: SetFn }) {
  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-border">
      <table className="w-full text-sm" data-testid="auto-send-matrix">
        <thead className="bg-surface-muted/60">
          <tr>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-ink-muted">Channel</th>
            {TIERS.map((t) => (
              <th key={t.id} className="px-4 py-2.5 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-ink shadow-card"><span className="text-ink-subtle">{t.tier}</span>{t.name}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(['email', 'chat'] as const).map((ch) => (
            <tr key={ch} className="border-t border-border/70">
              <th scope="row" className="px-4 py-3 text-left font-medium capitalize text-ink">
                <span className="inline-flex items-center gap-2">{ch === 'email' ? <Mail className="h-4 w-4 text-ink-subtle" aria-hidden /> : <MessageCircle className="h-4 w-4 text-ink-subtle" aria-hidden />}{ch}</span>
              </th>
              {TIERS.map(({ id: tier }) => (
                <td key={tier} className="px-4 py-3 text-center">
                  <Switch checked={form.autoSend[ch][tier]} onCheckedChange={(v) => set({ autoSend: { ...form.autoSend, [ch]: { ...form.autoSend[ch], [tier]: v } } })} aria-label={`Auto-send ${ch} replies from ${tier}`} data-testid={`auto-send-${ch}-${tier}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Hours({ form, set, hourErr }: { form: AiSettings; set: SetFn; hourErr: (i: number) => boolean }) {
  return (
    <>
      <div className="max-w-xs">
        <Label htmlFor="timezone" className="text-xs text-ink-muted">Timezone</Label>
        <Select value={form.timezone} onValueChange={(v) => set({ timezone: v })}>
          <SelectTrigger id="timezone" className="mt-1" data-testid="timezone-select"><SelectValue /></SelectTrigger>
          <SelectContent>{ZONES.map((z) => <SelectItem key={z} value={z}>{z}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <ul className="divide-y divide-border/70">
        {form.hours.map((h, i) => {
          const upd = (p: Partial<typeof h>) => set({ hours: form.hours.map((x, j) => (j === i ? { ...x, ...p } : x)) })
          return (
            <li key={h.day} className="py-2.5" data-testid={`hours-${h.day.toLowerCase()}`}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="w-24 text-sm font-medium text-ink">{h.day}</span>
                <Switch checked={h.open} onCheckedChange={(v) => upd({ open: v })} aria-label={`${h.day} open`} data-testid={`hours-open-${h.day.toLowerCase()}`} />
                <span className="w-14 text-xs text-ink-muted">{h.open ? 'Open' : 'Closed'}</span>
                <Input type="time" className="h-9 w-32" value={h.from} disabled={!h.open} onChange={(e) => upd({ from: e.target.value })} aria-label={`${h.day} opening time`} data-testid={`hours-from-${h.day.toLowerCase()}`} />
                <span className="text-xs text-ink-muted">to</span>
                <Input type="time" className="h-9 w-32" value={h.to} disabled={!h.open} onChange={(e) => upd({ to: e.target.value })} aria-invalid={hourErr(i)} aria-label={`${h.day} closing time`} data-testid={`hours-to-${h.day.toLowerCase()}`} />
              </div>
              <FieldError>{hourErr(i) ? 'Closing time must be after opening time.' : null}</FieldError>
            </li>
          )
        })}
      </ul>
    </>
  )
}

function Rules({ form, set }: { form: AiSettings; set: SetFn }) {
  return (
    <>
      <ul className="space-y-2" data-testid="escalation-rules">
        {form.rules.map((r, i) => {
          const upd = (p: Partial<typeof r>) => set({ rules: form.rules.map((x) => (x.id === r.id ? { ...x, ...p } : x)) })
          return (
            <li key={r.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-surface-muted/60 px-3 py-2" data-testid={`rule-${i}`}>
              <span className="text-sm font-medium text-ink-muted">If</span>
              <Select value={r.condition} onValueChange={(v) => upd({ condition: v as RuleCondition })}>
                <SelectTrigger className="h-9 w-56 bg-surface" aria-label={`Rule ${i + 1} condition`}><SelectValue /></SelectTrigger>
                <SelectContent>{CONDITIONS.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
              </Select>
              <Input className="h-9 w-32 bg-surface" value={r.value} onChange={(e) => upd({ value: e.target.value })} aria-label={`Rule ${i + 1} value`} />
              <span className="inline-flex items-center gap-1.5 text-sm text-ink-muted"><ArrowRight className="h-4 w-4" aria-hidden /> escalate to</span>
              <Select value={r.target} onValueChange={(v) => upd({ target: v as 'grokbot' | 'human' })}>
                <SelectTrigger className="h-9 w-32 bg-surface" aria-label={`Rule ${i + 1} target`}><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="grokbot">Grokbot</SelectItem><SelectItem value="human">Human</SelectItem></SelectContent>
              </Select>
              <Button size="icon-sm" variant="ghost" className="ml-auto" aria-label={`Remove rule ${i + 1}`} onClick={() => set({ rules: form.rules.filter((x) => x.id !== r.id) })} data-testid={`rule-remove-${i}`}><Trash2 aria-hidden /></Button>
            </li>
          )
        })}
        {form.rules.length === 0 && <li className="rounded-xl bg-surface-muted/60 px-3 py-3 text-sm text-ink-muted" data-testid="rules-empty">No rules yet. Tickets follow the confidence threshold.</li>}
      </ul>
      <Button size="sm" variant="outline" onClick={() => set({ rules: [...form.rules, { id: `r-${Date.now()}`, condition: 'keyword', value: '', target: 'human' }] })} data-testid="rule-add"><Plus aria-hidden /> Add rule</Button>
    </>
  )
}

function PromptViewer({ id, text }: { id: 'claude' | 'grokbot'; text: string }) {
  const [open, setOpen] = useState(true)
  const lines = text.split('\n')
  return (
    <Collapsible.Root open={open} onOpenChange={setOpen} className="overflow-hidden rounded-xl ring-1 ring-border" data-testid={`prompt-${id}`}>
      <div className="flex items-center gap-2 bg-surface-muted/60 px-3 py-2">
        <Collapsible.Trigger className={cn('inline-flex flex-1 items-center gap-2 rounded text-left text-sm font-medium text-ink', focusRing)} data-testid={`prompt-toggle-${id}`}>
          <ChevronDown className={cn('h-4 w-4 text-ink-muted transition-transform', !open && '-rotate-90')} aria-hidden />
          {id === 'claude' ? 'Claude' : 'Grokbot'}
          <span className="text-xs font-normal text-ink-subtle">{lines.length} lines</span>
        </Collapsible.Trigger>
        <Button size="sm" variant="ghost" onClick={async () => { await navigator.clipboard?.writeText(text).catch(() => undefined); toast.success('Prompt copied') }} data-testid={`prompt-copy-${id}`}><Copy aria-hidden /> Copy</Button>
      </div>
      <Collapsible.Content>
        <pre className="max-h-72 overflow-auto bg-surface-sunken py-3 font-mono text-xs leading-relaxed text-ink" data-testid={`prompt-text-${id}`}>
          {lines.map((l, n) => (
            <div key={n} className="flex">
              <span className="w-10 shrink-0 select-none pr-3 text-right text-ink-subtle" aria-hidden>{n + 1}</span>
              <span className="min-w-0 flex-1 whitespace-pre-wrap pr-4">{l || ' '}</span>
            </div>
          ))}
        </pre>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

const limitInvalid = (n: number) => !(n >= 0 && n <= 500)

function AutoRefunds({ form, set }: { form: AiSettings; set: SetFn }) {
  const v = form.autoRefund
  const bad = limitInvalid(v.limit)
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-muted/60 px-4 py-3">
        <span className="text-sm font-medium text-ink" id="auto-refund-toggle-label">Let AI issue refunds automatically</span>
        <Switch checked={v.enabled} onCheckedChange={(enabled) => set({ autoRefund: { ...v, enabled } })} aria-labelledby="auto-refund-toggle-label" data-testid="auto-refund-toggle" />
      </div>
      <div className="max-w-[12rem]">
        <Label htmlFor="auto-refund-limit" className="text-xs text-ink-muted">Max amount (USD)</Label>
        <div className="relative mt-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-muted" aria-hidden>$</span>
          <Input id="auto-refund-limit" type="number" inputMode="decimal" min={0} max={500} className="pl-7" value={Number.isNaN(v.limit) ? '' : v.limit} onChange={(e) => set({ autoRefund: { ...v, limit: e.target.value === '' ? NaN : Number(e.target.value) } })} aria-invalid={bad} aria-describedby="auto-refund-error auto-refund-note" data-testid="auto-refund-limit" />
        </div>
        <FieldError id="auto-refund-error">{bad ? 'Enter an amount between $0 and $500.' : null}</FieldError>
      </div>
      <p id="auto-refund-note" className="text-sm text-ink-muted" data-testid="auto-refund-note">Refunds above this amount, or with an open fraud alert, wait for human approval.</p>
    </div>
  )
}

function AiSkeleton() {
  return (
    <div className="rounded-2xl bg-surface px-6 shadow-card ring-1 ring-black/[0.04]" data-testid="ai-settings-loading">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="grid gap-4 border-b border-border/70 py-8 last:border-0 lg:grid-cols-[1fr_2fr] lg:gap-10">
          <div className="space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-56" /></div>
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ))}
    </div>
  )
}

function Fallback() {
  const { data } = useApi(() => settingsApi.getIntegration('grokbot'), [])
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm" data-testid="ai-fallback">
      <span className="rounded-md bg-surface-muted px-2 py-1 font-mono text-xs text-ink">{data?.model ?? '…'}</span>
      {data?.status === 'error' && <span className="text-xs font-medium text-red-700" data-testid="ai-fallback-error">Not answering: {data.attention}</span>}
      <Link to="/settings/integrations/grokbot" className="inline-flex min-h-11 items-center font-medium text-tobacco-700 underline underline-offset-2" data-testid="ai-fallback-manage">Change model in Integrations</Link>
    </div>
  )
}

function Assignment({ form, set }: { form: AiSettings; set: SetFn }) {
  const opts = [
    { id: 'round_robin', label: 'Round-robin', hint: 'Spread new needs-human tickets evenly across agents who are in.' },
    { id: 'manual', label: 'Manual', hint: 'Tickets wait in Unassigned until someone takes them.' },
  ] as const
  return (
    <div role="radiogroup" aria-label="Assignment rule" className="grid max-w-[560px] gap-2 sm:grid-cols-2" data-testid="ai-assignment">
      {opts.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={form.assignment === o.id} onClick={() => set({ assignment: o.id })} className={cn('rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', form.assignment === o.id ? 'border-tobacco-600 bg-tobacco-50' : 'border-border-strong hover:bg-surface-muted')} data-testid={`ai-assignment-${o.id}`}>
          <span className="block text-sm font-semibold text-ink">{o.label}</span>
          <span className="mt-0.5 block text-xs text-ink-muted">{o.hint}</span>
        </button>
      ))}
    </div>
  )
}

export function AiTab({ part = 'replies' }: { part?: 'replies' | 'workflows' }) {
  const { data, loading, error, reload } = useApi(() => settingsApi.getAiSettings(), [])
  const [saved, setSaved] = useState<AiSettings | null>(null)
  const [form, setForm] = useState<AiSettings | null>(null)
  const [saving, setSaving] = useState(false)
  useEffect(() => { if (data) { setSaved(data); setForm(data) } }, [data])
  const dirty = !!form && JSON.stringify(form) !== JSON.stringify(saved)
  useUnsavedGuard('ai-settings', dirty)

  if (loading) return <AiSkeleton />
  if (error || !form) return <Card><ErrorState title="AI settings didn't load" onRetry={reload} testId="ai-settings-error" /></Card>

  const set: SetFn = (patch) => setForm({ ...form, ...patch })
  const hourErr = (i: number) => form.hours[i].open && form.hours[i].to <= form.hours[i].from
  const save = async () => {
    if (form.hours.some((_, i) => hourErr(i))) return toast.error('Closing time must be after opening time.')
    if (limitInvalid(form.autoRefund.limit)) return toast.error('Enter an amount between $0 and $500.')
    setSaving(true)
    try { const s = await settingsApi.saveAiSettings(form); setSaved(s); setForm(s); toast.success('AI settings saved') } catch (e) { toast.error((e as Error).message) }
    setSaving(false)
  }

  return (
    <div className="pb-24" data-testid={part === 'replies' ? 'ai-tab' : 'workflows-tab'}>
      <div className="divide-y divide-border/70 rounded-2xl bg-surface px-6 py-6 shadow-card ring-1 ring-black/[0.04] max-sm:px-4">
        {part === 'replies' ? (
          <>
            <FormSection title="Confidence threshold" description="Claude only answers on its own when it's at least this confident." testId="ai-section-threshold"><Threshold value={form.threshold} set={set} /></FormSection>
            <FormSection title="Auto-send" description="When off, the AI drafts a reply for an agent to approve." testId="ai-section-auto-send"><Matrix form={form} set={set} /></FormSection>
            <FormSection title="Auto-refunds" description="Small refunds the AI can issue without a person." testId="ai-section-auto-refunds"><AutoRefunds form={form} set={set} /></FormSection>
            <FormSection title="Grokbot fallback" description="Answers what Claude can't, before a person steps in." testId="ai-section-fallback"><Fallback /></FormSection>
            <FormSection title="System prompts" description="Managed in code. Read only." testId="ai-section-prompts">
              {(['claude', 'grokbot'] as const).map((k) => <PromptViewer key={k} id={k} text={form.prompts[k]} />)}
            </FormSection>
          </>
        ) : (
          <>
            <FormSection title="Escalation rules" description="Send matching tickets straight to Grokbot or a human." testId="ai-section-rules"><Rules form={form} set={set} /></FormSection>
            <FormSection title="Business hours" description="Outside these hours AI replies mention when the team is back." testId="ai-section-hours"><Hours form={form} set={set} hourErr={hourErr} /></FormSection>
            <FormSection title="Assignment" description="Who picks up tickets that need a human." testId="ai-section-assignment"><Assignment form={form} set={set} /></FormSection>
          </>
        )}
      </div>
      {dirty && (
        <SaveBar>
          <Button variant="ghost" size="sm" onClick={() => setForm(saved)} data-testid="ai-discard">Discard</Button>
          <Button size="sm" onClick={save} loading={saving} data-testid="ai-save">Save</Button>
        </SaveBar>
      )}
    </div>
  )
}

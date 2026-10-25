import type { FieldMode, StorePageType, WidgetSettings } from '@/types'
import { Switch } from '@/components/ui/overlay'
import { PAGE_TYPE_LABELS } from '@/lib/widgetRules'
import { cn } from '@/lib/utils'
import { FieldError, FieldLabel, Segmented, TextField } from './fields'
import { QuickReplies } from './QuickReplies'
import type { Update, WidgetErrors } from './validate'

export const PAGE_TYPES: StorePageType[] = ['home', 'product', 'collection', 'cart', 'account', 'pages']

export function PageTypePicker({ value, onChange, testId }: { value: StorePageType[]; onChange: (v: StorePageType[]) => void; testId: string }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" data-testid={testId}>
      {PAGE_TYPES.map((p) => {
        const on = value.includes(p)
        return (
          <button key={p} type="button" aria-pressed={on} onClick={() => onChange(on ? value.filter((x) => x !== p) : [...value, p])} className={cn('h-8 rounded-full border px-3 text-sm transition-colors', on ? 'border-tobacco-600 bg-tobacco-600 text-white' : 'border-border-strong text-ink-muted hover:bg-surface-muted')} data-testid={`${testId}-${p}`}>
            {PAGE_TYPE_LABELS[p]}
          </button>
        )
      })}
    </div>
  )
}

export function ToggleRow({ label, hint, checked, onChange, testId }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void; testId: string }) {
  return (
    <label className="flex items-start justify-between gap-4">
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        {hint && <span className="block text-xs text-ink-muted">{hint}</span>}
      </span>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} data-testid={testId} />
    </label>
  )
}

export function MessagingSection({ draft, update, errors }: { draft: WidgetSettings; update: Update; errors: WidgetErrors }) {
  const m = draft.messaging
  const text = (k: 'headerTitle' | 'headerSubtitle' | 'greeting' | 'aiDisclosure' | 'handoffMessage' | 'handoffResponseTime' | 'offlineMessage') => (v: string) => update((d) => { d.messaging[k] = v })
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField id="header-title" label="Header title" value={m.headerTitle} onChange={text('headerTitle')} />
        <TextField id="header-subtitle" label="Header subtitle" value={m.headerSubtitle} onChange={text('headerSubtitle')} />
      </div>
      <TextField id="greeting" label="Greeting message" value={m.greeting} onChange={text('greeting')} multiline />
      <div className="space-y-3 rounded-lg bg-surface-sunken p-4">
        <ToggleRow label="Proactive greeting bubble" hint="Pops up next to the launcher before the customer opens the chat." checked={m.proactive.enabled} onChange={(v) => update((d) => { d.messaging.proactive.enabled = v })} testId="ws-proactive" />
        {m.proactive.enabled && (
          <>
            <div>
              <FieldLabel htmlFor="ws-greeting-delay">Delay (seconds)</FieldLabel>
              <input id="ws-greeting-delay" type="number" min={0} max={120} value={m.proactive.delaySec} onChange={(e) => update((d) => { d.messaging.proactive.delaySec = Number(e.target.value) })} aria-invalid={!!errors['greeting-delay']} className="h-10 w-24 rounded-md border border-border-strong bg-surface px-3 text-sm" data-testid="ws-greeting-delay" />
              <FieldError id="ws-greeting-delay-error">{errors['greeting-delay']}</FieldError>
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium text-ink">Shows on</p>
              <PageTypePicker value={m.proactive.pages} onChange={(v) => update((d) => { d.messaging.proactive.pages = v })} testId="ws-proactive-pages" />
            </div>
          </>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-ink">Pre-chat form</p>
        <p className="mb-3 text-xs text-ink-muted" data-testid="ws-prechat-note">Skipped automatically when the customer is logged into Shopify</p>
        <div className="flex flex-wrap gap-6">
          <Segmented<FieldMode> label="Email" testId="ws-prechat-email" value={m.preChat.email} onChange={(v) => update((d) => { d.messaging.preChat.email = v })} options={[{ id: 'required', label: 'Required' }, { id: 'optional', label: 'Optional' }, { id: 'off', label: 'Off' }]} />
          <Segmented label="Name" testId="ws-prechat-name" value={m.preChat.name === 'off' ? 'off' : 'on'} onChange={(v) => update((d) => { d.messaging.preChat.name = v === 'on' ? 'optional' : 'off' })} options={[{ id: 'on', label: 'On' }, { id: 'off', label: 'Off' }]} />
          <Segmented label="Order number" testId="ws-prechat-order" value={m.preChat.orderNumber === 'off' ? 'off' : 'on'} onChange={(v) => update((d) => { d.messaging.preChat.orderNumber = v === 'on' ? 'optional' : 'off' })} options={[{ id: 'on', label: 'On' }, { id: 'off', label: 'Off' }]} />
        </div>
      </div>
      <TextField id="ai-disclosure" label="AI disclosure line" value={m.aiDisclosure} onChange={text('aiDisclosure')} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField id="handoff-message" label="Handoff message" value={m.handoffMessage} onChange={text('handoffMessage')} />
        <TextField id="handoff-time" label="Expected response time" value={m.handoffResponseTime} onChange={text('handoffResponseTime')} />
      </div>
      <TextField id="offline-message" label="Offline message" value={m.offlineMessage} onChange={text('offlineMessage')} multiline />
      <ToggleRow label='"Email us instead" form when offline' checked={m.offlineEmailFallback} onChange={(v) => update((d) => { d.messaging.offlineEmailFallback = v })} testId="ws-offline-fallback" />
      <QuickReplies value={m.quickReplies} onChange={(v) => update((d) => { d.messaging.quickReplies = v })} error={errors['quick-replies']} />
    </>
  )
}

import type { LauncherIcon, WidgetSettings } from '@/types'
import { LauncherGlyph } from '@/components/widget/icons'
import { cn } from '@/lib/utils'
import { ColorField, FieldError, FieldLabel, RangeField, Segmented, SourceBadge, TextField, UploadField } from './fields'
import type { Update, WidgetErrors } from './validate'

const ICONS: { id: LauncherIcon; label: string }[] = [
  { id: 'chat', label: 'Chat bubble' },
  { id: 'hat', label: 'Hat' },
  { id: 'question', label: 'Question mark' },
  { id: 'envelope', label: 'Envelope' },
  { id: 'headset', label: 'Headset' },
]

interface Props {
  draft: WidgetSettings
  update: Update
  errors: WidgetErrors
  setUploadError: (key: string, e?: string) => void
}

export function LauncherSection({ draft, update, errors, setUploadError }: Props) {
  const l = draft.launcher
  return (
    <>
      <div>
        <p className="mb-1.5 text-sm font-medium text-ink" id="ws-icon-label">Icon</p>
        <div role="radiogroup" aria-labelledby="ws-icon-label" className="flex flex-wrap gap-2">
          {ICONS.map((i) => (
            <button key={i.id} type="button" role="radio" aria-checked={l.icon === i.id} aria-label={i.label} title={i.label} onClick={() => update((d) => { d.launcher.icon = i.id })} className={cn('flex h-12 w-12 items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', l.icon === i.id ? 'border-tobacco-600 bg-tobacco-50 text-tobacco-700' : 'border-border-strong text-ink-muted hover:bg-surface-muted')} data-testid={`ws-icon-${i.id}`}>
              <LauncherGlyph icon={i.id} customUrl={null} size={22} />
            </button>
          ))}
        </div>
        <div className="mt-3">
          <UploadField id="custom-icon" label="Custom icon (SVG or PNG)" value={l.customIconUrl} error={errors['custom-icon']} onError={(e) => setUploadError('custom-icon', e)} onChange={(v) => update((d) => { d.launcher.customIconUrl = v; d.launcher.icon = v ? 'custom' : 'hat' })} />
        </div>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <ColorField id="iconColor" label="Icon color" value={l.iconColor} onChange={(v) => update((d) => { d.launcher.iconColor = v })} />
        <ColorField id="launcherBg" label="Background color" value={l.backgroundColor} onChange={(v) => update((d) => { d.launcher.backgroundColor = v })} contrast={{ against: l.iconColor, label: 'Icon on launcher', fgIsThis: false }} />
        <ColorField id="badgeColor" label="Unread badge color" value={l.badgeColor} onChange={(v) => update((d) => { d.launcher.badgeColor = v })} />
      </div>
      <div className="flex flex-wrap items-end gap-6">
        <Segmented label="Style" testId="ws-style" value={l.style} onChange={(v) => update((d) => { d.launcher.style = v })} options={[{ id: 'circle', label: 'Icon only' }, { id: 'pill', label: 'Pill with label' }]} />
        <Segmented label="Size" testId="ws-size" value={l.size} onChange={(v) => update((d) => { d.launcher.size = v })} options={[{ id: 's', label: 'S' }, { id: 'm', label: 'M' }, { id: 'l', label: 'L' }]} />
      </div>
      {l.style === 'pill' && (
        <div className="max-w-sm">
          <TextField id="launcher-label" label="Pill label" value={l.label} onChange={(v) => update((d) => { d.launcher.label = v })} error={errors['launcher-label']} />
        </div>
      )}
      <div>
        <div className="flex items-center gap-2"><SourceBadge source={draft.sources.launcherPosition} /></div>
        <div className="mt-2">
          <Segmented label="Position" testId="ws-position" value={l.position} onChange={(v) => update((d) => { d.launcher.position = v; d.sources.launcherPosition = 'desk' })} options={[{ id: 'bottom-right', label: 'Bottom right' }, { id: 'bottom-left', label: 'Bottom left' }]} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <RangeField id="offset-x" label="Desktop X offset" value={l.offset.x} min={0} max={64} onChange={(n) => update((d) => { d.launcher.offset.x = n })} />
        <RangeField id="offset-y" label="Desktop Y offset" value={l.offset.y} min={0} max={64} onChange={(n) => update((d) => { d.launcher.offset.y = n })} />
        <RangeField id="mobile-offset-x" label="Mobile X offset" value={l.mobileOffset.x} min={0} max={48} onChange={(n) => update((d) => { d.launcher.mobileOffset.x = n })} />
        <RangeField id="mobile-offset-y" label="Mobile Y offset" value={l.mobileOffset.y} min={0} max={48} onChange={(n) => update((d) => { d.launcher.mobileOffset.y = n })} />
      </div>
      <p className="-mt-3 text-xs text-ink-muted">Mobile offsets apply below 640px. Switch the preview to Mobile to see them.</p>
      <div className="flex flex-wrap items-end gap-4">
        <Segmented label="Attention animation" testId="ws-animation" value={l.animation} onChange={(v) => update((d) => { d.launcher.animation = v })} options={[{ id: 'none', label: 'None' }, { id: 'pulse_once', label: 'Pulse once' }, { id: 'bounce', label: 'Bounce after…' }]} />
        {l.animation === 'bounce' && (
          <div>
            <FieldLabel htmlFor="ws-bounce-after">Seconds</FieldLabel>
            <input id="ws-bounce-after" type="number" min={1} max={60} value={l.bounceAfterSec} onChange={(e) => update((d) => { d.launcher.bounceAfterSec = Number(e.target.value) })} aria-invalid={!!errors['bounce-after']} className="h-10 w-24 rounded-md border border-border-strong bg-surface px-3 text-sm" data-testid="ws-bounce-after" />
          </div>
        )}
      </div>
      <FieldError id="ws-bounce-after-error">{errors['bounce-after']}</FieldError>
    </>
  )
}

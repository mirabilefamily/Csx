import type { WidgetSettings } from '@/types'
import { ColorField, RangeField, Segmented, UploadField } from './fields'
import type { Update, WidgetErrors } from './validate'

interface Props {
  draft: WidgetSettings
  update: Update
  uploadErrors: WidgetErrors
  setUploadError: (key: string, e?: string) => void
}

export function BrandingSection({ draft, update, uploadErrors, setUploadError }: Props) {
  const c = draft.branding.colors
  const set = (k: keyof typeof c) => (v: string) =>
    update((d) => {
      d.branding.colors[k] = v
      if (k === 'primary' || k === 'accent') d.sources[k] = 'desk'
    })
  return (
    <>
      <div className="grid gap-5 xl:grid-cols-2">
        <ColorField id="primary" label="Primary" value={c.primary} onChange={set('primary')} source={draft.sources.primary} contrast={{ against: '#FFFFFF', label: 'White on primary', fgIsThis: false }} />
        <ColorField id="accent" label="Accent" value={c.accent} onChange={set('accent')} source={draft.sources.accent} />
        <ColorField id="headerBackground" label="Header background" value={c.headerBackground} onChange={set('headerBackground')} />
        <ColorField id="headerText" label="Header text" value={c.headerText} onChange={set('headerText')} contrast={{ against: c.headerBackground, label: 'Header text on header background' }} />
        <ColorField id="customerBubble" label="Customer bubble" value={c.customerBubble} onChange={set('customerBubble')} contrast={{ against: '#FFFFFF', label: 'Customer bubble text', fgIsThis: false }} />
        <ColorField id="aiBubble" label="AI / agent bubble" value={c.aiBubble} onChange={set('aiBubble')} contrast={{ against: '#1F1D1A', label: 'AI bubble text', fgIsThis: false }} />
        <ColorField id="link" label="Link" value={c.link} onChange={set('link')} contrast={{ against: '#FFFFFF', label: 'Link on white' }} />
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <UploadField id="logo" label="Header logo" value={draft.branding.logoUrl} onChange={(v) => update((d) => { d.branding.logoUrl = v })} error={uploadErrors.logo} onError={(e) => setUploadError('logo', e)} />
        <UploadField id="ai-avatar" label="AI avatar" value={draft.branding.aiAvatarUrl} onChange={(v) => update((d) => { d.branding.aiAvatarUrl = v })} error={uploadErrors['ai-avatar']} onError={(e) => setUploadError('ai-avatar', e)} />
        <UploadField id="agent-avatar" label="Human agent avatar" value={draft.branding.agentAvatarUrl} onChange={(v) => update((d) => { d.branding.agentAvatarUrl = v })} error={uploadErrors['agent-avatar']} onError={(e) => setUploadError('agent-avatar', e)} />
      </div>
      <div className="flex flex-wrap gap-6">
        <Segmented label="Font" testId="ws-font" value={draft.branding.font} onChange={(v) => update((d) => { d.branding.font = v })} options={[{ id: 'inherit', label: 'Inherit from store theme' }, { id: 'inter', label: 'Inter' }]} />
        <Segmented label="Shadow" testId="ws-shadow" value={draft.branding.shadow} onChange={(v) => update((d) => { d.branding.shadow = v })} options={[{ id: 'none', label: 'None' }, { id: 'soft', label: 'Soft' }, { id: 'strong', label: 'Strong' }]} />
      </div>
      <div className="max-w-sm">
        <RangeField id="radius" label="Corner radius" value={draft.branding.radius} min={0} max={20} onChange={(n) => update((d) => { d.branding.radius = n })} />
      </div>
    </>
  )
}

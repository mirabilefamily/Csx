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
      <div className="grid max-w-[480px] gap-4 sm:grid-cols-2">
        <ColorField id="primary" label="Primary" value={c.primary} onChange={set('primary')} source={draft.sources.primary} contrast={{ against: '#FFFFFF', label: 'White on primary', fgIsThis: false }} />
        <ColorField id="accent" label="Accent" value={c.accent} onChange={set('accent')} source={draft.sources.accent} />
        <ColorField id="panelColor" label="Panel colour" value={draft.branding.panelColor} onChange={(v) => update((d) => { d.branding.panelColor = v })} contrast={{ against: '#1F1D1A', label: 'Text on panel', fgIsThis: false }} />
        <ColorField id="link" label="Link" value={c.link} onChange={set('link')} contrast={{ against: '#FFFFFF', label: 'Link on white' }} />
      </div>
      <Segmented label="Panel style" testId="ws-panel-style" value={draft.branding.panelStyle} onChange={(v) => update((d) => { d.branding.panelStyle = v })} options={[{ id: 'frosted', label: 'Frosted' }, { id: 'solid', label: 'Solid' }]} />
      <div className="max-w-[280px]">
        <UploadField id="logo" label="Logo" thumbBg="#3E2D21" value={draft.branding.logoUrl} onChange={(v) => update((d) => { d.branding.logoUrl = v })} error={uploadErrors.logo} onError={(e) => setUploadError('logo', e)} />
      </div>
      <Segmented label="Font" testId="ws-font" value={draft.branding.font} onChange={(v) => update((d) => { d.branding.font = v })} options={[{ id: 'inter', label: 'Goorin sans' }, { id: 'inherit', label: 'Inherit from store theme' }]} />
    </>
  )
}

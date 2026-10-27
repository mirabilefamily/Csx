import type { ThemeEmbedSettings, WidgetSettings } from '@/types'
import { PAGE_TYPE_LABELS } from '@/lib/widgetRules'
import { PRESETS } from './fields'

const colorName = (hex: string) => PRESETS.find(([, h]) => h === hex.toUpperCase())?.[0] ?? hex.toUpperCase()
const SIZE = { s: 'Small', m: 'Medium', l: 'Large' }
const OUTSIDE = { keep_ai: 'AI after hours', offline_form: 'Offline form after hours', hide: 'Hidden after hours' }

// One-line value summaries shown on collapsed Chat Widget section headers.
export function sectionSummary(id: string, d: WidgetSettings, theme: ThemeEmbedSettings): string {
  const b = d.branding
  const l = d.launcher
  const m = d.messaging
  switch (id) {
    case 'branding':
      return `${colorName(b.colors.primary)} & ${colorName(b.colors.accent)} · ${b.radius}px radius · ${b.font === 'inter' ? 'Inter' : 'Store font'}`
    case 'launcher':
      return `${l.style === 'pill' ? `Pill "${l.label || '…'}"` : 'Circle'} · ${SIZE[l.size]} · ${l.position.replace('-', ' ').replace(/^./, (c) => c.toUpperCase())}`
    case 'messaging':
      return `"${m.headerTitle}" · ${m.quickReplies.filter(Boolean).length} quick replies · Greeting bubble ${m.proactive.enabled ? `after ${m.proactive.delaySec}s` : 'off'}`
    case 'display': {
      const pages = d.display.mode === 'all' ? 'All pages' : d.display.pageTypes.map((p) => PAGE_TYPE_LABELS[p]).join(', ') || 'No pages'
      return `${pages}${d.display.hideOnMobile ? ' · Hidden on mobile' : ''} · ${OUTSIDE[d.display.outsideHours]}`
    }
    case 'csat':
      return d.csat.enabled ? `${d.csat.style[0].toUpperCase()}${d.csat.style.slice(1)} survey after chat` : 'Off'
    case 'install':
      return theme.enabled ? 'Shopify app embed enabled' : 'Shopify app embed off'
    default:
      return ''
  }
}

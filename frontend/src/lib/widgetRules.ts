import type { SharedWidgetField, StorePageType, ThemeEmbedSettings, WidgetSettings } from '@/types'

export const PAGE_TYPE_LABELS: Record<StorePageType, string> = {
  home: 'Home',
  product: 'Product',
  collection: 'Collection',
  cart: 'Cart',
  account: 'Account',
  pages: 'Pages',
  other: 'Other',
}

export const SHARED_FIELDS: { id: SharedWidgetField; label: string }[] = [
  { id: 'primary', label: 'Primary color' },
  { id: 'accent', label: 'Accent color' },
  { id: 'launcherPosition', label: 'Launcher position' },
  { id: 'hideOnMobile', label: 'Hide on mobile' },
]

// Theme editor values apply only to fields whose source is the theme editor.
export function mergeEffective(desk: WidgetSettings, theme: ThemeEmbedSettings): WidgetSettings {
  const s = structuredClone(desk)
  if (s.sources.primary === 'theme') s.branding.colors.primary = theme.primary
  if (s.sources.accent === 'theme') s.branding.colors.accent = theme.accent
  if (s.sources.launcherPosition === 'theme') s.launcher.position = theme.launcherPosition
  if (s.sources.hideOnMobile === 'theme') s.display.hideOnMobile = theme.hideOnMobile
  return s
}

// URL patterns support * wildcards and match the whole path.
export function matchesPattern(path: string, pattern: string) {
  const re = new RegExp(`^${pattern.trim().replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`)
  return re.test(path)
}

export interface HiddenReason { title: string; detail: string }

export function hiddenReason(s: WidgetSettings, ctx: { pageType: StorePageType; pagePath: string; isMobile: boolean; outsideHours: boolean }): HiddenReason | null {
  const d = s.display
  if (d.mode === 'page_types' && !d.pageTypes.includes(ctx.pageType)) {
    const on = d.pageTypes.map((p) => PAGE_TYPE_LABELS[p]).join(', ') || 'no pages'
    return { title: `Hidden on ${PAGE_TYPE_LABELS[ctx.pageType].toLowerCase()} pages`, detail: `Display rules show the widget on: ${on}.` }
  }
  const include = d.urlInclude.filter(Boolean)
  if (include.length && !include.some((p) => matchesPattern(ctx.pagePath, p)))
    return { title: 'Hidden by URL rules', detail: `${ctx.pagePath} doesn't match an include pattern (${include.join(', ')}).` }
  const excluded = d.urlExclude.find((p) => p && matchesPattern(ctx.pagePath, p))
  if (excluded) return { title: 'Hidden by URL rules', detail: `${ctx.pagePath} matches the exclude pattern ${excluded}.` }
  if (d.hideOnMobile && ctx.isMobile) return { title: 'Hidden on mobile', detail: '"Hide on mobile" is on in Display rules.' }
  if (ctx.outsideHours && d.outsideHours === 'hide') return { title: 'Hidden outside business hours', detail: 'Outside-hours behavior is set to "Hide widget".' }
  return null
}

export const isHex = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v)

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: string, b: string) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}

// Returns "Contrast 2.8:1, below WCAG AA 4.5:1" when the pair fails, otherwise null.
export function contrastWarning(fg: string, bg: string) {
  if (!isHex(fg) || !isHex(bg)) return null
  const r = contrastRatio(fg, bg)
  return r < 4.5 ? `Contrast ${(Math.floor(r * 10) / 10).toFixed(1)}:1, below WCAG AA 4.5:1` : null
}

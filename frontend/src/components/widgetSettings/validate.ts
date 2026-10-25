import type { WidgetSettings } from '@/types'
import { isHex } from '@/lib/widgetRules'

export type WidgetErrors = Record<string, string>
export type Update = (fn: (d: WidgetSettings) => void) => void

export const COLOR_KEYS = ['primary', 'accent', 'headerBackground', 'headerText', 'customerBubble', 'aiBubble', 'link'] as const

export function validateWidget(s: WidgetSettings, uploadErrors: WidgetErrors): WidgetErrors {
  const e: WidgetErrors = { ...uploadErrors }
  COLOR_KEYS.forEach((k) => {
    if (!isHex(s.branding.colors[k])) e[`color-${k}`] = 'Enter a 6-digit hex color like #6B4F3A.'
  })
  if (!isHex(s.launcher.iconColor)) e['color-iconColor'] = 'Enter a 6-digit hex color like #6B4F3A.'
  if (!isHex(s.launcher.backgroundColor)) e['color-launcherBg'] = 'Enter a 6-digit hex color like #6B4F3A.'
  if (!isHex(s.launcher.badgeColor)) e['color-badgeColor'] = 'Enter a 6-digit hex color like #6B4F3A.'
  if (s.launcher.style === 'pill' && !s.launcher.label.trim()) e['launcher-label'] = 'Add a label for the pill launcher.'
  if (!(s.launcher.bounceAfterSec >= 1 && s.launcher.bounceAfterSec <= 60)) e['bounce-after'] = 'Choose between 1 and 60 seconds.'
  if (!(s.messaging.proactive.delaySec >= 0 && s.messaging.proactive.delaySec <= 120)) e['greeting-delay'] = 'Choose between 0 and 120 seconds.'
  if (s.messaging.quickReplies.some((q) => !q.trim())) e['quick-replies'] = "Quick replies can't be empty."
  else if (s.messaging.quickReplies.length > 6) e['quick-replies'] = 'Up to 6 quick replies.'
  return e
}

// Invalid colors fall back to the last saved value so the preview never renders garbage.
export function sanitizeForPreview(draft: WidgetSettings, saved: WidgetSettings): WidgetSettings {
  const s = structuredClone(draft)
  COLOR_KEYS.forEach((k) => {
    if (!isHex(s.branding.colors[k])) s.branding.colors[k] = saved.branding.colors[k]
  })
  if (!isHex(s.launcher.iconColor)) s.launcher.iconColor = saved.launcher.iconColor
  if (!isHex(s.launcher.backgroundColor)) s.launcher.backgroundColor = saved.launcher.backgroundColor
  if (!isHex(s.launcher.badgeColor)) s.launcher.badgeColor = saved.launcher.badgeColor
  s.messaging.quickReplies = s.messaging.quickReplies.filter((q) => q.trim()).slice(0, 6)
  return s
}

import { useSyncExternalStore } from 'react'

export type TitleFontId = 'inter-display' | 'geist' | 'manrope' | 'jakarta'

// Dev-only title font comparison. Inter Display (Inter Variable, opsz) ships in the main bundle; the alternates load on demand.
export const TITLE_FONTS: { id: TitleFontId; label: string; family: string; scale: number; load: () => Promise<unknown> }[] = [
  { id: 'inter-display', label: 'Inter Display', family: "'Inter Variable'", scale: 1, load: () => Promise.resolve() },
  { id: 'geist', label: 'Geist', family: "'Geist Variable'", scale: 1, load: () => import('@fontsource-variable/geist') },
  { id: 'manrope', label: 'Manrope', family: "'Manrope Variable'", scale: 0.97, load: () => import('@fontsource-variable/manrope') },
  { id: 'jakarta', label: 'Plus Jakarta Sans', family: "'Plus Jakarta Sans Variable'", scale: 0.97, load: () => import('@fontsource-variable/plus-jakarta-sans') },
]

const KEY = 'goorin.titleFont'
let current: TitleFontId = 'inter-display'
const listeners = new Set<() => void>()

export async function setTitleFont(id: TitleFontId) {
  const f = TITLE_FONTS.find((x) => x.id === id) ?? TITLE_FONTS[0]
  await f.load()
  document.documentElement.style.setProperty('--font-title', f.family)
  document.documentElement.style.setProperty('--title-scale', String(f.scale))
  current = f.id
  try { localStorage.setItem(KEY, f.id) } catch { /* private mode */ }
  listeners.forEach((l) => l())
}

export function initTitleFont() {
  try {
    const saved = localStorage.getItem(KEY) as TitleFontId | null
    if (saved && saved !== 'inter-display' && TITLE_FONTS.some((f) => f.id === saved)) void setTitleFont(saved)
  } catch { /* private mode */ }
}

export const useTitleFont = () => useSyncExternalStore((l) => { listeners.add(l); return () => { listeners.delete(l) } }, () => current)

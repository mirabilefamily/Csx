import { useEffect, useState, useSyncExternalStore } from 'react'

const PHONE = '(max-width: 639px)'
const subscribe = (cb: () => void) => {
  const m = window.matchMedia(PHONE)
  m.addEventListener('change', cb)
  return () => m.removeEventListener('change', cb)
}

// True below Tailwind's `sm` breakpoint (640px).
export const useIsPhone = () => useSyncExternalStore(subscribe, () => window.matchMedia(PHONE).matches, () => false)

// Visible viewport height (shrinks when the on-screen keyboard opens); null when unsupported.
export function useVisualViewportHeight(enabled: boolean) {
  const [h, setH] = useState<number | null>(null)
  useEffect(() => {
    const vv = window.visualViewport
    if (!enabled || !vv) return setH(null)
    const on = () => setH(vv.height)
    on()
    vv.addEventListener('resize', on)
    return () => vv.removeEventListener('resize', on)
  }, [enabled])
  return h
}

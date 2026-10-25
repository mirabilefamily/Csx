export type DemoState = 'live' | 'loading' | 'empty' | 'error'

let current: DemoState = 'live'
const listeners = new Set<() => void>()

export const getDemoState = () => current

export function setDemoState(next: DemoState) {
  current = next
  listeners.forEach((l) => l())
}

export function subscribeDemoState(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

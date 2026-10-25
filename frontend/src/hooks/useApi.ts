import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { getDemoState, subscribeDemoState } from '@/api'

export const useDemoState = () => useSyncExternalStore(subscribeDemoState, getDemoState)

interface ApiState<T> {
  data: T | undefined
  error: Error | null
  loading: boolean
}

// Fetches through the API layer and refetches whenever deps or the demo state change.
export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[], enabled = true) {
  const demo = useDemoState()
  const [nonce, setNonce] = useState(0)
  const [state, setState] = useState<ApiState<T>>({ data: undefined, error: null, loading: enabled })

  useEffect(() => {
    if (!enabled) return
    let active = true
    setState({ data: undefined, error: null, loading: true })
    fetcher().then(
      (data) => active && setState({ data, error: null, loading: false }),
      (error: Error) => active && setState({ data: undefined, error, loading: false }),
    )
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, demo, nonce, enabled])

  const reload = useCallback(() => setNonce((n) => n + 1), [])
  return { ...state, reload }
}

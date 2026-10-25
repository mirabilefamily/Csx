import { getDemoState } from './demoState'

export class ApiError extends Error {
  constructor(message: string, public status = 500) {
    super(message)
    this.name = 'ApiError'
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const latency = () => 300 + Math.random() * 400

interface RequestOptions<T> {
  // Value returned when the demo switcher is set to Empty. Defaults to the live value.
  empty?: () => T
}

// Every mock call goes through here: simulated latency + the global demo state.
export async function request<T>(resolve: () => T, options: RequestOptions<T> = {}): Promise<T> {
  const mode = getDemoState()
  if (mode === 'loading') return new Promise<T>(() => {})
  await sleep(latency())
  if (mode === 'error') throw new ApiError("We couldn't reach the Goorin desk just now.")
  const value = mode === 'empty' && options.empty ? options.empty() : resolve()
  return structuredClone(value)
}

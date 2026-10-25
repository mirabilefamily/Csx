import { FlaskConical } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { setDemoState, type DemoState } from '@/api'
import { useDemoState } from '@/hooks/useApi'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/overlay'
import { cn } from '@/lib/utils'
import { TITLE_FONTS, setTitleFont, useTitleFont } from '@/lib/titleFont'

const OPTIONS: { id: DemoState; label: string; hint: string }[] = [
  { id: 'live', label: 'Live', hint: 'Mock data with simulated latency' },
  { id: 'loading', label: 'Loading', hint: 'Requests never resolve' },
  { id: 'empty', label: 'Empty', hint: 'Every list comes back empty' },
  { id: 'error', label: 'Error', hint: 'Every request fails' },
]

export const demoToolsEnabled = import.meta.env.DEV || import.meta.env.VITE_DEMO_TOOLS === 'true'

// On /widget-demo the switcher docks inside the demo controls panel so it never covers the widget launcher.
export function DemoStateSwitcher({ inline = false }: { inline?: boolean }) {
  const state = useDemoState()
  const titleFont = useTitleFont()
  const { pathname } = useLocation()
  if (!demoToolsEnabled || (!inline && pathname === '/widget-demo')) return null
  const current = OPTIONS.find((o) => o.id === state)!
  const inConversation = /^\/inbox\/.+/.test(pathname)
  return (
    <div className={inline ? '' : cn('fixed bottom-4 right-4 z-40', inConversation ? 'max-sm:bottom-auto max-sm:right-2 max-sm:top-[calc(4.25rem+env(safe-area-inset-top))]' : 'max-sm:bottom-[calc(4.5rem+env(safe-area-inset-bottom))] max-sm:right-3')}>
      <Popover>
        <PopoverTrigger
          data-testid="demo-state-trigger"
          aria-label={`Demo state: ${current.label}`}
          className={cn(
            'inline-flex h-9 items-center gap-2 rounded-full border bg-surface px-3.5 text-xs font-medium text-ink shadow-popover transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 max-sm:h-11 max-sm:min-w-11 max-sm:justify-center max-sm:px-3',
            state === 'live' ? 'border-border-strong' : 'border-amber-500 ring-2 ring-amber-100',
          )}
        >
          <FlaskConical className="h-3.5 w-3.5 text-brass-700" aria-hidden />
          <span className="max-sm:sr-only">Demo state:</span> <span className={cn('font-semibold', state === 'live' && 'max-sm:sr-only')}>{current.label}</span>
        </PopoverTrigger>
        <PopoverContent side={inline ? 'bottom' : 'top'} className="w-64 p-2" data-testid="demo-state-panel">
          <p className="px-2 pb-2 pt-1 text-xs font-medium text-ink-muted" id="demo-state-label">
            Demo state (applies to every API call)
          </p>
          <div role="radiogroup" aria-labelledby="demo-state-label" className="space-y-1">
            {OPTIONS.map((o) => (
              <button
                key={o.id}
                role="radio"
                aria-checked={state === o.id}
                data-testid={`demo-state-option-${o.id}`}
                onClick={() => setDemoState(o.id)}
                className={cn(
                  'flex w-full flex-col items-start rounded-md px-2.5 py-2 text-left transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-sm:min-h-11',
                  state === o.id && 'bg-brass-50',
                )}
              >
                <span className="text-sm font-medium text-ink">{o.label}</span>
                <span className="text-xs text-ink-muted">{o.hint}</span>
              </button>
            ))}
          </div>
          <div className="mt-2 border-t border-border pt-2">
            <p className="px-2 pb-2 pt-1 text-xs font-medium text-ink-muted" id="title-font-label">Title font (page titles, saved in this browser)</p>
            <div role="radiogroup" aria-labelledby="title-font-label" className="grid grid-cols-2 gap-1" data-testid="title-font-group">
              {TITLE_FONTS.map((f) => (
                <button
                  key={f.id}
                  role="radio"
                  aria-checked={titleFont === f.id}
                  onClick={() => void setTitleFont(f.id)}
                  className={cn('rounded-md px-2.5 py-2 text-left text-[14px] font-semibold leading-tight tracking-tight text-ink transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-sm:min-h-11', titleFont === f.id && 'bg-brass-50')}
                  style={{ fontFamily: `${f.family}, system-ui, sans-serif` }}
                  data-testid={`title-font-option-${f.id}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

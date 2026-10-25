import { useSearchParams } from 'react-router-dom'
import type { InboxViewId } from '@/types'
import { INBOX_VIEWS } from '@/lib/inboxViews'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface Props {
  active: InboxViewId
  counts: Record<InboxViewId, number> | undefined
  loading: boolean
}

function useSetView() {
  const [params, setParams] = useSearchParams()
  return (id: InboxViewId) => {
    const next = new URLSearchParams(params)
    next.set('view', id)
    setParams(next)
  }
}

export function ViewsNav({ active, counts, loading }: Props) {
  const setView = useSetView()
  return (
    <nav aria-label="Inbox views" className="hidden w-44 shrink-0 flex-col gap-1 overflow-y-auto border-r border-border bg-surface p-3 lg:flex" data-testid="inbox-views">
      <p className="px-2 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-ink-muted">Views</p>
      {INBOX_VIEWS.map((v) => (
        <button
          key={v.id}
          type="button"
          onClick={() => setView(v.id)}
          aria-current={active === v.id ? 'page' : undefined}
          data-testid={`view-${v.id}`}
          className={cn(
            'flex h-9 items-center justify-between gap-2 rounded-lg px-2.5 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            active === v.id ? 'bg-tobacco-50 text-tobacco-800' : 'text-ink-muted hover:bg-surface-muted hover:text-ink',
          )}
        >
          <span className="truncate">{v.label}</span>
          {loading ? (
            <Skeleton className="h-4 w-6" />
          ) : (
            <span
              data-testid={`view-count-${v.id}`}
              className={cn('min-w-[24px] rounded-full px-1.5 text-center text-xs font-semibold leading-5', v.id === 'needs_human' && counts?.[v.id] ? 'bg-amber-400 text-amber-900' : 'bg-surface-muted text-ink-muted')}
            >
              {counts?.[v.id] ?? '—'}
            </span>
          )}
        </button>
      ))}
    </nav>
  )
}

export function ViewsDropdown({ active, counts }: Props) {
  const setView = useSetView()
  return (
    <Select value={active} onValueChange={(v) => setView(v as InboxViewId)}>
      <SelectTrigger className="h-9 lg:hidden" aria-label="Inbox view" data-testid="views-dropdown">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {INBOX_VIEWS.map((v) => (
          <SelectItem key={v.id} value={v.id} data-testid={`views-dropdown-${v.id}`}>
            {v.label} ({counts?.[v.id] ?? 0})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

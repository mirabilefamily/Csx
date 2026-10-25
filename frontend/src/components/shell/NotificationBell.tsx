import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/overlay'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState, ErrorState } from '@/components/States'
import { useShellData } from './ShellData'
import { timeAgo } from '@/lib/format'
import { focusRing } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function BellList({ onPick }: { onPick: () => void }) {
  const { needsHuman, loading, error, reload } = useShellData()
  if (loading) return <div className="space-y-3 p-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
  if (error) return <ErrorState compact title="Notifications didn't load" description={undefined} onRetry={reload} testId="bell-error" />
  if (!needsHuman?.length)
    return <EmptyState compact title="You're all caught up" description="No tickets need a human right now." icon={<CheckCheck className="h-5 w-5" aria-hidden />} testId="bell-empty" />
  return (
    <ul className="max-h-[420px] divide-y divide-border overflow-y-auto" data-testid="bell-list">
      {needsHuman.map((t) => (
        <li key={t.id}>
          <Link
            to={`/inbox/${t.id}`}
            onClick={onPick}
            data-testid={`bell-item-${t.id}`}
            className="flex gap-3 px-4 py-3 transition-colors hover:bg-surface-sunken focus-visible:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          >
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-400 ring-2 ring-amber-100" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-semibold text-ink">{t.customer.name}</span>
                <span className="shrink-0 text-xs text-ink-muted">{timeAgo(t.updatedAt)}</span>
              </span>
              <span className="mt-0.5 block truncate text-sm text-ink-muted">{t.subject}</span>
              <span className="mt-0.5 block text-xs text-ink-subtle">{t.id}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const picked = useRef(false)
  const { needsHuman } = useShellData()
  const count = needsHuman?.length ?? 0
  return (
    <Popover open={open} onOpenChange={(o) => { if (o) picked.current = false; setOpen(o) }} modal>
      <PopoverTrigger
        aria-label={count ? `Notifications, ${count} tickets need a human` : 'Notifications'}
        data-testid="notification-bell"
        className={cn('relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink', focusRing)}
      >
        <Bell className="h-5 w-5" aria-hidden />
        {count > 0 && (
          <span data-testid="notification-bell-count" className="absolute right-1 top-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-semibold text-amber-900 ring-2 ring-surface">
            {count}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent
        className="w-[380px] max-w-[calc(100vw-2rem)] p-0"
        data-testid="notification-panel"
        aria-label="Needs a human"
        onCloseAutoFocus={(e) => {
          // After navigating from an item, don't yank focus back to the bell (it would steal focus from ⌘K search).
          if (picked.current) e.preventDefault()
        }}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-ink">Needs a human</p>
          <span className="text-xs text-ink-muted">{count} ticket{count === 1 ? '' : 's'}</span>
        </div>
        <BellList onPick={() => { picked.current = true; setOpen(false) }} />
      </PopoverContent>
    </Popover>
  )
}

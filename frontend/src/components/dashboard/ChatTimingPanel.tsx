import { Clock, Hourglass, MessageCircle, Timer } from 'lucide-react'
import { dashboardApi } from '@/api'
import { useApi } from '@/hooks/useApi'
import { ErrorState } from '@/components/States'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// Last 30 complete minutes vs the 30 before. Independent of the dashboard date filter.
export function ChatTimingPanel() {
  const { data, loading, error, reload } = useApi(() => dashboardApi.getChatReplyTiming(), [])
  const stats = data && [
    { key: 'firstReply', label: 'Median first reply', Icon: Timer, now: data.current.medianFirstReplySec, prev: data.previous.medianFirstReplySec, sec: true },
    { key: 'reply', label: 'Median reply time', Icon: Clock, now: data.current.medianReplySec, prev: data.previous.medianReplySec, sec: true },
    { key: 'waiting', label: 'Chats waiting now', Icon: MessageCircle, now: data.current.waitingNow, prev: data.previous.waitingNow, sec: false },
    { key: 'longest', label: 'Longest wait', Icon: Hourglass, now: data.current.longestWaitSec, prev: data.previous.longestWaitSec, sec: true },
  ]
  return (
    <section className="rounded-2xl bg-surface p-6 shadow-card ring-1 ring-black/[0.04] max-sm:px-4" aria-labelledby="chat-timing-title" data-testid="chat-timing-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="chat-timing-title" className="text-[15px] font-semibold text-ink">Chat reply timing</h2>
          <p className="mt-0.5 text-sm text-ink-muted">Last 30 complete minutes vs the 30 before{data && ` · ${data.windowLabel}`}</p>
        </div>
        <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-ink-muted" data-testid="chat-timing-independent">Independent of the dashboard date filter</span>
      </div>
      {loading ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
      ) : error || !stats ? (
        <ErrorState compact title="Chat timing didn't load" onRetry={reload} testId="chat-timing-error" />
      ) : (
        <dl className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => {
            const better = s.now <= s.prev
            const fmt = (v: number) => (s.sec ? (v < 60 ? `${v}s` : `${Math.floor(v / 60)}m ${String(v % 60).padStart(2, '0')}s`) : String(v))
            return (
              <div key={s.key} className="rounded-xl bg-surface-sunken p-4" data-testid={`chat-timing-${s.key}`}>
                <dt className="flex items-center gap-1.5 text-xs font-medium text-ink-muted"><s.Icon className="h-3.5 w-3.5" aria-hidden />{s.label}</dt>
                <dd className="mt-1.5 text-2xl tabular-nums text-ink">{fmt(s.now)}</dd>
                <dd className={cn('mt-1 text-xs', s.now === s.prev ? 'text-ink-muted' : better ? 'text-green-700' : 'text-red-700')}>was {fmt(s.prev)}</dd>
              </div>
            )
          })}
        </dl>
      )}
    </section>
  )
}

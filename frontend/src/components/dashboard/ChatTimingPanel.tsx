import { Info } from 'lucide-react'
import { dashboardApi } from '@/api'
import { useApi } from '@/hooks/useApi'
import { ErrorState } from '@/components/States'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/overlay'
import { focusRing } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const INDEPENDENT = 'Independent of the dashboard date filter'

// 2×2 mini-grid inside AI performance (REQ-762): last 30 complete minutes vs the 30 before.
export function ChatTimingGrid() {
  const { data, loading, error, reload } = useApi(() => dashboardApi.getChatReplyTiming(), [])
  const stats = data && [
    { key: 'firstReply', label: 'Median first reply', now: data.current.medianFirstReplySec, prev: data.previous.medianFirstReplySec, sec: true },
    { key: 'reply', label: 'Median reply time', now: data.current.medianReplySec, prev: data.previous.medianReplySec, sec: true },
    { key: 'waiting', label: 'Chats waiting now', now: data.current.waitingNow, prev: data.previous.waitingNow, sec: false },
    { key: 'longest', label: 'Longest wait', now: data.current.longestWaitSec, prev: data.previous.longestWaitSec, sec: true },
  ]
  return (
    <section aria-labelledby="chat-timing-title" data-testid="chat-timing-panel">
      <div className="mb-2 flex items-center gap-1">
        <h4 id="chat-timing-title" className="text-[13px] font-semibold text-ink">Chat reply timing</h4>
        <Tooltip>
          <TooltipTrigger className={cn('inline-flex h-7 w-7 items-center justify-center rounded-full text-ink-muted hover:text-ink max-sm:h-11 max-sm:w-11', focusRing)} aria-label={`About chat reply timing: ${INDEPENDENT}`} data-testid="chat-timing-independent">
            <Info className="h-4 w-4" aria-hidden /><span className="sr-only">{INDEPENDENT}</span>
          </TooltipTrigger>
          <TooltipContent data-testid="chat-timing-tooltip">{INDEPENDENT}. Last 30 complete minutes vs the 30 before{data ? ` · ${data.windowLabel}` : ''}.</TooltipContent>
        </Tooltip>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 gap-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div>
      ) : error || !stats ? (
        <div><ErrorState compact title="Chat timing didn't load" onRetry={reload} testId="chat-timing-error" /></div>
      ) : (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
          {stats.map((s) => {
            const better = s.now <= s.prev
            const fmt = (v: number) => (s.sec ? (v < 60 ? `${v}s` : `${Math.floor(v / 60)}m ${String(v % 60).padStart(2, '0')}s`) : String(v))
            return (
              <div key={s.key} className="min-w-0" data-testid={`chat-timing-${s.key}`}>
                <dt className="truncate text-xs font-medium text-ink-muted">{s.label}</dt>
                <dd className="mt-0.5 flex items-baseline gap-2">
                  <span className="text-lg tabular-nums text-ink">{fmt(s.now)}</span>
                  <span className={cn('text-xs', s.now === s.prev ? 'text-ink-muted' : better ? 'text-green-700' : 'text-red-700')}>was {fmt(s.prev)}</span>
                </dd>
              </div>
            )
          })}
        </dl>
      )}
    </section>
  )
}

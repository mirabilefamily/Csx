import type { ReactNode } from 'react'
import { BarChart3 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { EmptyState, ErrorState } from '@/components/States'
import { cn } from '@/lib/utils'

interface PanelProps {
  title: string
  description?: ReactNode
  action?: ReactNode
  loading?: boolean
  empty?: boolean
  error?: boolean
  onRetry?: () => void
  height?: number
  testId: string
  className?: string
  bare?: boolean
  children?: ReactNode
}

// Dashboard card: one internal grid (24px padding, identical header row) with loading, empty and error states (REQ-765).
export function Panel({ title, description, action, loading, empty, error, onRetry, height = 220, testId, className, bare, children }: PanelProps) {
  const body = loading ? (
    <Skeleton className="w-full rounded-xl" style={{ height }} data-testid={`${testId}-skeleton`} />
  ) : error ? (
    <ErrorState compact title={`${title} didn't load`} onRetry={onRetry} testId={`${testId}-error`} />
  ) : empty ? (
    <div style={{ minHeight: height }} className="flex items-center justify-center">
      <EmptyState compact title="No data for this period" description="Try a wider date range." icon={<BarChart3 className="h-5 w-5" aria-hidden />} testId={`${testId}-empty`} />
    </div>
  ) : (
    children
  )
  if (bare) return <div className={cn('flex min-w-0 flex-1 flex-col', className)} data-testid={testId}>{body}</div>
  return (
    <section className={cn('flex h-full min-w-0 flex-col rounded-2xl bg-surface p-6 shadow-[0_1px_2px_rgba(31,29,26,0.04)] max-sm:p-4', className)} data-testid={testId}>
      <header className="mb-6 flex min-h-10 flex-wrap items-start justify-between gap-x-4 gap-y-2" data-testid={`${testId}-header`}>
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold leading-5 text-ink">{title}</h3>
          {description && <div className="mt-0.5 text-sm text-ink-muted">{description}</div>}
        </div>
        {action}
      </header>
      <div className="flex min-h-0 flex-1 flex-col">{body}</div>
    </section>
  )
}

export function PillTabs<T extends string>({ tabs, value, onChange, label, testId }: { tabs: { id: T; label: string }[]; value: T; onChange: (v: T) => void; label: string; testId: string }) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex h-10 w-fit max-w-full gap-0.5 overflow-x-auto rounded-full bg-surface-muted p-1 max-sm:h-auto" data-testid={testId}>
      {tabs.map((t) => (
        <button key={t.id} type="button" role="tab" id={`${testId}-${t.id}`} aria-selected={value === t.id} onClick={() => onChange(t.id)} data-testid={`${testId}-${t.id}`}
          className={cn('h-8 shrink-0 whitespace-nowrap rounded-full px-3 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-sm:h-11', value === t.id ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink')}>
          {t.label}
        </button>
      ))}
    </div>
  )
}

export function ViewAll({ count, onClick, testId, min = 3 }: { count: number; onClick: () => void; testId: string; min?: number }) {
  if (count <= min) return null
  return <Button size="sm" variant="ghost" className="-mr-2" onClick={onClick} data-testid={testId}>View all ({count})</Button>
}

export function RankedList({ rows, color, testId }: { rows: { key: string; label: string; count: number }[]; color: string; testId: string }) {
  const sorted = [...rows].sort((a, b) => b.count - a.count)
  const max = Math.max(1, ...sorted.map((r) => r.count))
  return (
    <ol className="space-y-3" aria-label={sorted.map((r) => `${r.label} ${r.count}`).join(', ')}>
      {sorted.map((r) => (
        <li key={r.key} data-testid={`${testId}-${r.key}`}>
          <div className="flex items-baseline gap-3 text-sm">
            <span className="min-w-0 flex-1 truncate text-ink">{r.label}</span>
            <span className="tabular-nums font-medium text-ink">{r.count.toLocaleString()}</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-muted" aria-hidden>
            <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${(r.count / max) * 100}%`, background: color }} />
          </div>
        </li>
      ))}
    </ol>
  )
}

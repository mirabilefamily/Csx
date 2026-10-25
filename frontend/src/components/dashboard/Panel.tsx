import type { ReactNode } from 'react'
import { BarChart3 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/States'
import { cn } from '@/lib/utils'

interface PanelProps {
  title: string
  description?: ReactNode
  action?: ReactNode
  loading?: boolean
  empty?: boolean
  height?: number
  testId: string
  className?: string
  children?: ReactNode
}

// Borderless dashboard surface with built-in loading and empty states.
export function Panel({ title, description, action, loading, empty, height = 220, testId, className, children }: PanelProps) {
  return (
    <section className={cn('flex min-w-0 flex-col rounded-2xl bg-surface p-6 shadow-[0_1px_2px_rgba(31,29,26,0.04)]', className)} data-testid={testId}>
      <header className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
          {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
        </div>
        {action}
      </header>
      {loading ? (
        <Skeleton className="w-full rounded-xl" style={{ height }} data-testid={`${testId}-skeleton`} />
      ) : empty ? (
        <div style={{ minHeight: height }} className="flex items-center justify-center">
          <EmptyState compact title="No data for this period" description="Try a wider date range." icon={<BarChart3 className="h-5 w-5" aria-hidden />} testId={`${testId}-empty`} />
        </div>
      ) : (
        children
      )}
    </section>
  )
}

export function RankedList({ rows, color, testId }: { rows: { key: string; label: string; count: number }[]; color: string; testId: string }) {
  const sorted = [...rows].sort((a, b) => b.count - a.count)
  const max = Math.max(1, ...sorted.map((r) => r.count))
  return (
    <ol className="space-y-3.5" aria-label={sorted.map((r) => `${r.label} ${r.count}`).join(', ')}>
      {sorted.map((r, i) => (
        <li key={r.key} data-testid={`${testId}-${r.key}`}>
          <div className="flex items-baseline gap-3 text-sm">
            <span className="w-4 tabular-nums text-ink-subtle">{i + 1}</span>
            <span className="min-w-0 flex-1 truncate text-ink">{r.label}</span>
            <span className="tabular-nums font-medium text-ink">{r.count.toLocaleString()}</span>
          </div>
          <div className="ml-7 mt-1.5 h-1 overflow-hidden rounded-full bg-surface-muted" aria-hidden>
            <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${(r.count / max) * 100}%`, background: color }} />
          </div>
        </li>
      ))}
    </ol>
  )
}

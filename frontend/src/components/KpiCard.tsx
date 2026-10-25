import type { KpiMetric } from '@/types'
import { formatKpiValue } from '@/lib/format'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

function delta(m: KpiMetric) {
  if (m.value === null || m.previous === null) return null
  const diff = m.value - m.previous
  let text: string
  if (m.format === 'percent') text = `${Math.abs(diff).toFixed(1)} pts`
  else if (m.format === 'score') text = Math.abs(diff).toFixed(2)
  else text = m.previous === 0 ? '—' : `${Math.abs((diff / m.previous) * 100).toFixed(0)}%`
  const flat = Math.abs(diff) < 1e-9 || text === '0%' || text === '0.0 pts' || text === '0.00'
  const good = m.betterWhen === 'neutral' || flat ? null : (diff > 0) === (m.betterWhen === 'higher')
  return { flat, up: diff > 0, text, good }
}

export function KpiCard({ metric, comparisonLabel }: { metric: KpiMetric; comparisonLabel: string }) {
  const d = delta(metric)
  const tone = !d || d.good === null ? 'text-ink-muted' : d.good ? 'text-green-700' : 'text-red-600'
  return (
    <Card className="flex flex-col gap-3 p-5" data-testid={`kpi-card-${metric.key}`}>
      <p className="text-sm font-medium text-ink-muted">{metric.label}</p>
      <p className="font-display text-3xl font-medium tracking-tight text-ink" data-testid={`kpi-value-${metric.key}`}>
        {formatKpiValue(metric.value, metric.format)}
      </p>
      <p className={cn('text-xs font-medium', tone)} data-testid={`kpi-delta-${metric.key}`} data-tone={d?.good === null ? 'neutral' : d?.good ? 'good' : 'bad'}>
        {!d ? (
          <span className="text-ink-muted">{metric.value === null ? 'No data for this period' : 'No prior data'}</span>
        ) : d.flat ? (
          <>No change {comparisonLabel}</>
        ) : (
          <>
            <span aria-hidden>{d.up ? '▲' : '▼'}</span> {d.text}{' '}
            <span className="sr-only">{d.up ? 'up' : 'down'}{d.good === null ? '' : d.good ? ', an improvement' : ', a regression'}</span>
            <span className="font-normal text-ink-muted">{comparisonLabel}</span>
          </>
        )}
      </p>
      <p className="text-xs text-ink-subtle">{metric.hint}</p>
    </Card>
  )
}

export function KpiCardSkeleton() {
  return (
    <Card className="flex flex-col gap-3 p-5" data-testid="kpi-card-skeleton">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-9 w-24" />
      <Skeleton className="h-3 w-36" />
      <Skeleton className="h-3 w-24" />
    </Card>
  )
}

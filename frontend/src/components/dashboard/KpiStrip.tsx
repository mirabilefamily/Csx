import type { KpiMetric } from '@/types'
import { formatKpiValue } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'
import { palette } from '@/theme/tokens'
import { cn } from '@/lib/utils'
import { Num } from '@/components/Num'

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

function Sparkline({ values }: { values?: number[] }) {
  if (!values || values.length < 2) return <div className="mt-auto h-8" aria-hidden />
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${29 - ((v - min) / span) * 26}`).join(' ')
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="mt-auto h-8 w-full" aria-hidden data-testid="kpi-sparkline">
      <polyline points={pts} fill="none" stroke={palette.brass[500]} strokeWidth={1.5} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function Stat({ metric, comparisonLabel, className }: { metric: KpiMetric; comparisonLabel: string; className?: string }) {
  const d = metric.key === 'open' ? null : delta(metric)
  const chip = !d || d.good === null ? 'bg-surface-muted text-ink-muted' : d.good ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
  return (
    <div className={cn('flex min-w-0 flex-col bg-surface px-5 py-5', className)} data-testid={`kpi-card-${metric.key}`} title={metric.hint}>
      <p className="line-clamp-2 text-[13px] font-medium leading-5 text-ink-muted xl:min-h-10" title={metric.label}>{metric.label}</p>
      <p className="mt-2 text-[28px] leading-8 text-ink" data-testid={`kpi-value-${metric.key}`}><Num value={formatKpiValue(metric.value, metric.format)} /></p>
      <p className="mt-2 flex min-h-[22px] flex-wrap items-center gap-x-1.5 gap-y-1 text-xs" data-testid={`kpi-delta-${metric.key}`} data-tone={!d || d.good === null ? 'neutral' : d.good ? 'good' : 'bad'}>
        {!d ? (
          <span className="text-ink-muted">{metric.key === 'open' ? 'Current snapshot' : metric.value === null ? 'No data for this period' : 'No prior data'}</span>
        ) : d.flat ? (
          <span className="rounded-full bg-surface-muted px-1.5 py-0.5 font-medium text-ink-muted">No change {comparisonLabel}</span>
        ) : (
          <>
            <span className={cn('rounded-full px-1.5 py-0.5 font-medium tabular-nums', chip)}>
              <span aria-hidden>{d.up ? '↑' : '↓'}</span> {d.text}
              <span className="sr-only"> {d.up ? 'up' : 'down'}{d.good === null ? '' : d.good ? ', an improvement' : ', a regression'}</span>
            </span>
            <span className="text-ink-subtle">{comparisonLabel}</span>
          </>
        )}
      </p>
      <div className="mt-3 flex flex-1 flex-col"><Sparkline values={metric.series} /></div>
    </div>
  )
}

const GRID = 'grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-border/70 shadow-[0_1px_2px_rgba(31,29,26,0.04)] sm:grid-cols-4 xl:grid-cols-7'

export function KpiStrip({ kpis, comparisonLabel, loading }: { kpis?: KpiMetric[]; comparisonLabel?: string; loading: boolean }) {
  return (
    <section aria-label="Key metrics" className={GRID} data-testid="kpi-grid">
      {loading || !kpis
        ? Array.from({ length: 7 }, (_, i) => (
            <div key={i} className={cn('flex flex-col gap-3 bg-surface px-5 py-5', i === 6 && 'max-sm:col-span-2')} data-testid="kpi-card-skeleton">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-full" />
            </div>
          ))
        : kpis.map((k, i) => <Stat key={k.key} metric={k} comparisonLabel={comparisonLabel ?? ''} className={i === 6 ? 'max-sm:col-span-2' : undefined} />)}
      {!loading && kpis && <div className="hidden bg-surface sm:block xl:hidden" aria-hidden />}
    </section>
  )
}

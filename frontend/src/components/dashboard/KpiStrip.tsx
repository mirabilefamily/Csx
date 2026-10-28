import type { KpiMetric } from '@/types'
import { formatKpiValue } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'
import { palette } from '@/theme/tokens'
import { cn } from '@/lib/utils'
import { Num } from '@/components/Num'

// Phase 12: five KPIs (REQ-691). Tickets created moves to Ticket volume, CSAT response rate to the CSAT card.
export const KPI_KEYS = ['open', 'aiRate', 'frt', 'resolution', 'csatAvg']

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

// Plain coloured delta with arrow, then muted comparison (REQ-692). No pill.
export function DeltaText({ metric, comparisonLabel, testId }: { metric: KpiMetric; comparisonLabel: string; testId: string }) {
  const d = delta(metric)
  const tone = !d || d.good === null ? 'neutral' : d.good ? 'good' : 'bad'
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5 text-xs" data-testid={testId} data-tone={tone}>
      {!d ? <span className="text-ink-muted">{metric.value === null ? 'No data for this period' : 'No prior data'}</span> : d.flat ? <span className="text-ink-muted">No change {comparisonLabel}</span> : (
        <>
          <span className={cn('font-medium tabular-nums', tone === 'good' ? 'text-green-700' : tone === 'bad' ? 'text-red-700' : 'text-ink-muted')}>
            <span aria-hidden>{d.up ? '↑' : '↓'}</span> {d.text}
            <span className="sr-only"> {d.up ? 'up' : 'down'}{d.good === null ? '' : d.good ? ', an improvement' : ', a regression'}</span>
          </span>
          <span className="text-ink-muted">{comparisonLabel}</span>
        </>
      )}
    </span>
  )
}

function Sparkline({ values }: { values?: number[] }) {
  if (!values || values.length < 2) return <div className="mt-auto h-8" aria-hidden />
  const min = Math.min(...values)
  const span = Math.max(...values) - min || 1
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${29 - ((v - min) / span) * 26}`).join(' ')
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="mt-auto h-8 w-full" aria-hidden data-testid="kpi-sparkline">
      <polyline points={pts} fill="none" stroke={palette.brass[500]} strokeOpacity={0.7} strokeWidth={1.25} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function Stat({ metric, comparisonLabel, className }: { metric: KpiMetric; comparisonLabel: string; className?: string }) {
  const open = metric.key === 'open'
  return (
    <div className={cn('flex min-w-0 flex-col bg-surface p-6 max-sm:p-4', className)} data-testid={`kpi-card-${metric.key}`} title={metric.hint}>
      <p className="truncate text-[13px] font-medium leading-5 text-ink-muted" title={metric.label}>{metric.label}</p>
      <p className="mt-2 text-[28px] leading-8 text-ink" data-testid={`kpi-value-${metric.key}`}><Num value={formatKpiValue(metric.value, metric.format)} /></p>
      <p className="mt-2 min-h-5">
        {open ? <span className="text-xs text-ink-muted" data-testid="kpi-delta-open" data-tone="neutral">Current snapshot</span> : <DeltaText metric={metric} comparisonLabel={comparisonLabel} testId={`kpi-delta-${metric.key}`} />}
      </p>
      {!open && <div className="mt-3 flex flex-1 flex-col"><Sparkline values={metric.series} /></div>}
    </div>
  )
}

const GRID = 'grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-border/70 shadow-[0_1px_2px_rgba(31,29,26,0.04)] sm:grid-cols-3 xl:grid-cols-5'

export function KpiStrip({ kpis, comparisonLabel, loading }: { kpis?: KpiMetric[]; comparisonLabel?: string; loading: boolean }) {
  const shown = KPI_KEYS.map((k) => kpis?.find((m) => m.key === k)).filter((m): m is KpiMetric => !!m)
  return (
    <section aria-label="Key metrics" className={GRID} data-testid="kpi-grid">
      {loading || !kpis
        ? KPI_KEYS.map((k, i) => (
            <div key={k} className={cn('flex flex-col gap-3 bg-surface p-6 max-sm:p-4', i === 4 && 'max-sm:col-span-2')} data-testid="kpi-card-skeleton">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-full" />
            </div>
          ))
        : shown.map((k, i) => <Stat key={k.key} metric={k} comparisonLabel={comparisonLabel ?? ''} className={i === 4 ? 'max-sm:col-span-2' : undefined} />)}
      <div className="hidden bg-surface sm:block xl:hidden" aria-hidden />
    </section>
  )
}

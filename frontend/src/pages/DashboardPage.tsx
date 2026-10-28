import { useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import type { DateRange, RangePreset } from '@/types'
import { dashboardApi } from '@/api'
import { useApi } from '@/hooks/useApi'
import { PageHeader } from '@/components/PageHeader'
import { KpiStrip } from '@/components/dashboard/KpiStrip'
import { ErrorState } from '@/components/States'
import { DateRangePicker } from '@/components/dashboard/DateRangePicker'
import { AiPerformanceCard, VolumeChart } from '@/components/dashboard/OverviewCharts'
import { CsatCard } from '@/components/dashboard/CsatCharts'
import { RefundsFraudCard } from '@/components/dashboard/RefundsFraudCard'
import { formatRangeLabel, rangeForPreset } from '@/lib/dateRange'

// Dashboard revision 2 (REQ-760): header, KPI row, then a strict 2×2 grid of equal cards.
export default function DashboardPage() {
  const [preset, setPreset] = useState<RangePreset>('30d')
  const [range, setRange] = useState<DateRange>(() => rangeForPreset('30d'))
  const { data, loading, error, reload } = useApi(() => dashboardApi.getDashboardSummary(range), [range.from, range.to])
  const [refundsKey, setRefundsKey] = useState(0)
  const [params] = useSearchParams()
  if (params.get('csat') === 'settings') return <Navigate to="/settings/csat" replace />
  const p = { data, loading, error: !!error, onRetry: reload }

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      <PageHeader
        title="Dashboard"
        description={<>How the desk is doing, <span className="font-semibold text-ink" data-testid="dashboard-range-label">{formatRangeLabel(range)}</span>.</>}
        actions={<DateRangePicker preset={preset} range={range} onChange={(pr, r) => { setPreset(pr); setRange(r) }} />}
      />
      {error ? (
        <div className="rounded-2xl bg-surface p-6"><ErrorState compact title="Key metrics didn't load" onRetry={reload} testId="dashboard-error" /></div>
      ) : (
        <KpiStrip kpis={data?.kpis} comparisonLabel={data?.comparisonLabel} loading={loading} />
      )}
      <section aria-label="Dashboard modules" className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-2" data-testid="dashboard-grid">
        <VolumeChart {...p} />
        <AiPerformanceCard {...p} />
        <RefundsFraudCard range={range} refreshKey={refundsKey} onReviewed={() => setRefundsKey((k) => k + 1)} />
        <CsatCard csat={data?.csat} rate={data?.kpis.find((k) => k.key === 'csatRate')} loading={loading} error={!!error} onRetry={reload} />
      </section>
    </div>
  )
}

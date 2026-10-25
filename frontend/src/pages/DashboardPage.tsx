import { useState } from 'react'
import type { DateRange, RangePreset } from '@/types'
import { dashboardApi } from '@/api'
import { useApi } from '@/hooks/useApi'
import { PageHeader } from '@/components/PageHeader'
import { KpiStrip } from '@/components/dashboard/KpiStrip'
import { ErrorState } from '@/components/States'
import { Card } from '@/components/ui/card'
import { DateRangePicker } from '@/components/dashboard/DateRangePicker'
import { EscalationChart, ResolvedByChart, TopTagsChart, VolumeChart } from '@/components/dashboard/OverviewCharts'
import { CsatSection } from '@/components/dashboard/CsatSection'
import { RefundsPanel } from '@/components/dashboard/RefundsPanel'
import { FraudPanel } from '@/components/dashboard/FraudPanel'
import { formatRangeLabel, rangeForPreset } from '@/lib/dateRange'

export default function DashboardPage() {
  const [preset, setPreset] = useState<RangePreset>('30d')
  const [range, setRange] = useState<DateRange>(() => rangeForPreset('30d'))
  const { data, loading, error, reload } = useApi(() => dashboardApi.getDashboardSummary(range), [range.from, range.to])
  const [refundsKey, setRefundsKey] = useState(0)

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      <PageHeader
        title="Dashboard"
        description={<>How the desk is doing, <span className="font-medium text-ink" data-testid="dashboard-range-label">{formatRangeLabel(range)}</span>.</>}
        actions={<DateRangePicker preset={preset} range={range} onChange={(p, r) => { setPreset(p); setRange(r) }} />}
      />
      {error ? (
        <Card>
          <ErrorState title="The dashboard didn't load" description="We couldn't fetch metrics for this period." onRetry={reload} testId="dashboard-error" />
        </Card>
      ) : (
        <>
          <KpiStrip kpis={data?.kpis} comparisonLabel={data?.comparisonLabel} loading={loading} />
          <VolumeChart data={data} loading={loading} />
        </>
      )}
      <section aria-label="Refunds and fraud" className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2" data-testid="refunds-fraud-row">
        <RefundsPanel range={range} refreshKey={refundsKey} />
        <FraudPanel onReviewed={() => setRefundsKey((k) => k + 1)} />
      </section>
      {!error && (
        <>
          <section aria-label="Ticket breakdown" className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ResolvedByChart data={data} loading={loading} />
            <EscalationChart data={data} loading={loading} />
            <TopTagsChart data={data} loading={loading} />
          </section>
          <CsatSection csat={data?.csat} loading={loading} />
        </>
      )}
    </div>
  )
}

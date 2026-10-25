import { useState } from 'react'
import { BookOpen, Inbox, LayoutDashboard } from 'lucide-react'
import type { DashboardSummary, KpiMetric } from '@/types'
import { settingsApi } from '@/api'
import { useApi } from '@/hooks/useApi'
import { KpiStrip } from '@/components/dashboard/KpiStrip'
import { ResolvedByChart } from '@/components/dashboard/OverviewCharts'
import { Panel, RankedList } from '@/components/dashboard/Panel'
import { navItemClass, NAV_BADGE_COLLAPSED } from '@/components/shell/Sidebar'
import { IntegrationCard } from '@/components/settings/IntegrationsTab'
import { FormSection } from '@/components/settings/SaveBar'
import { Segmented } from '@/components/widgetSettings/fields'
import { Input, Label } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { palette } from '@/theme/tokens'
import { cn } from '@/lib/utils'
import { Specimen } from './SgSection'

const series = [12, 14, 11, 15, 17, 16, 19, 18, 21, 20]
const KPIS: KpiMetric[] = [
  { key: 'sg-open', label: 'Open tickets', value: 21, previous: 28, format: 'count', betterWhen: 'lower', hint: 'Lower is better', series },
  { key: 'sg-created', label: 'Tickets created', value: 1089, previous: 1047, format: 'count', betterWhen: 'neutral', hint: 'Neutral', series },
  { key: 'sg-ai', label: 'AI resolution rate', value: 77.8, previous: 76.3, format: 'percent', betterWhen: 'higher', hint: 'Higher is better', series: [...series].reverse() },
  { key: 'sg-frt', label: 'First response time', value: 5.7, previous: 6.3, format: 'duration', betterWhen: 'lower', hint: 'Lower is better', series },
  { key: 'sg-res', label: 'Resolution time', value: 364, previous: 395, format: 'duration', betterWhen: 'lower', hint: 'Lower is better', series: [...series].reverse() },
  { key: 'sg-csat', label: 'CSAT average', value: 4.49, previous: 4.49, format: 'score', betterWhen: 'higher', hint: 'No change', series },
  { key: 'sg-rate', label: 'CSAT response rate', value: 33.2, previous: 30.8, format: 'percent', betterWhen: 'higher', hint: 'Higher is better', series },
]
const RESOLVED = { resolvedBy: [{ key: 'claude', label: 'Claude', count: 612 }, { key: 'grokbot', label: 'Grokbot', count: 148 }, { key: 'human', label: 'Human', count: 216 }] } as unknown as DashboardSummary
const REASONS = [{ key: 'low', label: 'Low confidence', count: 64 }, { key: 'refund', label: 'Refund over limit', count: 41 }, { key: 'angry', label: 'Negative sentiment', count: 23 }]

// Refreshed dashboard pieces: KPI strip items with sparklines, stacked bar, ranked list.
export function DashboardSamples() {
  return (
    <div className="space-y-6">
      <Specimen label="KPI stat strip items with delta chips and sparklines"><KpiStrip kpis={KPIS} comparisonLabel="vs prior 30 days" loading={false} /></Specimen>
      <div className="grid gap-6 lg:grid-cols-2">
        <Specimen label="Stacked proportion bar"><ResolvedByChart data={RESOLVED} loading={false} /></Specimen>
        <Specimen label="Ranked bar list">
          <Panel title="Escalation reasons" description="Why tickets left Claude" testId="sg-ranked"><RankedList rows={REASONS} color={palette.tobacco[600]} testId="sg-ranked-list" /></Panel>
        </Specimen>
      </div>
    </div>
  )
}

const ITEMS = [
  { label: 'Default', Icon: LayoutDashboard, active: false, hover: false },
  { label: 'Hover', Icon: BookOpen, active: false, hover: true },
  { label: 'Active', Icon: Inbox, active: true, hover: false },
]

function Bar() {
  return <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#B08D57]" aria-hidden />
}

// Sidebar nav item states, using the same class builder as the live sidebar.
export function NavSamples() {
  return (
    <div className="flex flex-wrap items-start gap-8">
      <Specimen label="Expanded">
        <div className="w-60 space-y-1.5 rounded-xl bg-white p-3 ring-1 ring-border">
          {ITEMS.map(({ label, Icon, active, hover }) => (
            <span key={label} className={navItemClass(active, false, hover)} data-testid={`sg-nav-${label.toLowerCase()}`}>
              {active && <Bar />}
              <Icon className={cn('h-[19px] w-[19px]', active ? 'text-tobacco-600' : hover ? 'text-ink' : 'text-ink-muted')} aria-hidden />
              {label}
            </span>
          ))}
        </div>
      </Specimen>
      <Specimen label="Collapsed · active with badge">
        <div className="flex w-[72px] flex-col gap-1.5 rounded-xl bg-white py-3 ring-1 ring-border">
          <span className={navItemClass(false, true)}><LayoutDashboard className="h-[19px] w-[19px] text-ink-muted" aria-hidden /></span>
          <span className={navItemClass(true, true)} data-testid="sg-nav-collapsed-badge">
            <Bar />
            <span className="relative flex">
              <Inbox className="h-[19px] w-[19px] text-tobacco-600" aria-hidden />
              <span className={cn('inline-flex items-center justify-center rounded-full bg-amber-400 font-semibold text-amber-950', NAV_BADGE_COLLAPSED)}>7</span>
            </span>
          </span>
        </div>
      </Specimen>
    </div>
  )
}

export function SegmentedSample() {
  const [v, setV] = useState<'stars' | 'emoji' | 'numeric'>('stars')
  return <Segmented label="Survey style" value={v} onChange={setV} testId="sg-segmented" options={[{ id: 'stars', label: 'Stars' }, { id: 'emoji', label: 'Emoji' }, { id: 'numeric', label: 'Numeric' }]} />
}

// Integration card (live mock data) and the label-left settings form section.
export function SettingsSamples() {
  const { data } = useApi(() => settingsApi.listIntegrations(), [])
  const grok = data?.find((i) => i.id === 'grokbot')
  return (
    <div className="space-y-8">
      <Specimen label="Integration card · error state with callout">{grok ? <IntegrationCard i={grok} /> : <Skeleton className="h-[120px] w-full rounded-2xl" />}</Specimen>
      <Specimen label="Settings form section · label + help left, controls right (stacks below 1024px)">
        <div className="rounded-2xl bg-surface px-6 shadow-card ring-1 ring-black/[0.04]">
          <FormSection title="Business hours" description="Outside these hours AI replies mention when the team is back.">
            <div className="max-w-xs"><Label htmlFor="sg-tz" className="text-xs text-ink-muted">Timezone</Label><Input id="sg-tz" className="mt-1" defaultValue="America/Los_Angeles" /></div>
          </FormSection>
        </div>
      </Specimen>
    </div>
  )
}

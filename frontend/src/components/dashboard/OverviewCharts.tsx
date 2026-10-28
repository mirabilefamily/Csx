import { useState } from 'react'
import { Area, AreaChart, Tooltip, XAxis, YAxis } from 'recharts'
import type { DashboardSummary } from '@/types'
import { Legend } from '@/components/ChartCard'
import { chartColors } from '@/theme/tokens'
import { ChartFigure, Responsive, axisProps, tooltipProps } from './chartTheme'
import { Panel, PillTabs, RankedList } from './Panel'
import { DeltaText } from './KpiStrip'
import { ChatTimingGrid } from './ChatTimingPanel'
import { Num } from '@/components/Num'

type Props = { data?: DashboardSummary; loading: boolean; error?: boolean; onRetry?: () => void }
const mutedAxis = { ...axisProps, axisLine: false, tick: { ...axisProps.tick, fontSize: 11 } } as const

export function VolumeChart({ data, loading, error, onRetry }: Props) {
  const rows = data?.volumeByChannel ?? []
  const email = rows.reduce((s, r) => s + r.email, 0)
  const chat = rows.reduce((s, r) => s + r.chat, 0)
  const created = data?.kpis.find((k) => k.key === 'created')
  return (
    <Panel
      title="Ticket volume"
      description={created && (
        <span className="flex flex-wrap items-center gap-x-2" data-testid="volume-created">
          <span>Tickets created <span className="font-semibold text-ink" data-testid="kpi-value-created">{created.value?.toLocaleString() ?? '—'}</span></span>
          <DeltaText metric={created} comparisonLabel={data?.comparisonLabel ?? ''} testId="kpi-delta-created" />
        </span>
      )}
      loading={loading}
      error={error}
      onRetry={onRetry}
      empty={email + chat === 0}
      height={320}
      testId="chart-volume-by-channel"
      action={<Legend items={[{ label: 'Email', color: chartColors.email, value: email.toLocaleString() }, { label: 'Chat', color: chartColors.chat, value: chat.toLocaleString() }]} />}
    >
      <ChartFigure summary={`Email ${email} tickets, chat ${chat} tickets`} height={320}>
        <Responsive>
          <AreaChart data={rows} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="vol-email" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors.email} stopOpacity={0.28} />
                <stop offset="100%" stopColor={chartColors.email} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="vol-chat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors.chat} stopOpacity={0.32} />
                <stop offset="100%" stopColor={chartColors.chat} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" {...mutedAxis} minTickGap={32} />
            <YAxis {...mutedAxis} width={44} allowDecimals={false} tickCount={4} />
            <Tooltip {...tooltipProps} cursor={{ stroke: chartColors.grid }} />
            <Area type="monotone" dataKey="email" name="Email" stackId="v" stroke={chartColors.email} strokeWidth={2} fill="url(#vol-email)" />
            <Area type="monotone" dataKey="chat" name="Chat" stackId="v" stroke={chartColors.chat} strokeWidth={2} fill="url(#vol-chat)" />
          </AreaChart>
        </Responsive>
      </ChartFigure>
    </Panel>
  )
}

const RESOLVER_COLORS = { claude: chartColors.claude, grokbot: chartColors.grokbot, human: chartColors.human }

// "AI performance" (REQ-762): Overview (resolved by + chat reply timing), Handover reasons, Top topics.
export function AiPerformanceCard({ data, loading, error, onRetry }: Props) {
  const [tab, setTab] = useState<'overview' | 'reasons' | 'topics'>('overview')
  const rows = data?.resolvedBy ?? []
  const total = rows.reduce((s, r) => s + r.count, 0)
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0)
  const ai = rows.filter((r) => r.key !== 'human').reduce((s, r) => s + r.count, 0)
  const ranked = tab === 'reasons' ? (data?.escalationReasons ?? []).map((r) => ({ key: r.key, label: r.label, count: r.count })) : (data?.topTags ?? []).map((t) => ({ key: t.tag, label: t.tag, count: t.count }))
  const top6 = [...ranked].sort((a, b) => b.count - a.count).slice(0, 6)
  return (
    <Panel
      title="AI performance"
      description={`${total.toLocaleString()} tickets resolved`}
      loading={loading}
      error={error}
      onRetry={onRetry}
      height={320}
      testId="ai-performance-card"
      action={<PillTabs tabs={[{ id: 'overview', label: 'Overview' }, { id: 'reasons', label: 'Handover reasons' }, { id: 'topics', label: 'Top topics' }]} value={tab} onChange={setTab} label="AI performance" testId="ai-tab" />}
    >
      {tab === 'overview' ? (
        <div role="tabpanel" aria-labelledby="ai-tab-overview" className="flex flex-1 flex-col" data-testid="chart-resolved-by">
          <p className="text-[28px] leading-8 text-ink" data-testid="resolved-by-ai-headline"><Num value={`${pct(ai)}%`} /> <span className="text-base text-ink-muted">resolved by AI</span></p>
          <div className="mt-3 flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full" role="img" aria-label={rows.map((r) => `${r.label} ${r.count}, ${pct(r.count)}%`).join('; ')} data-testid="resolved-by-bar">
            {rows.filter((r) => r.count > 0).map((r) => <div key={r.key} className="h-full first:rounded-l-full last:rounded-r-full" style={{ width: `${(r.count / total) * 100}%`, background: RESOLVER_COLORS[r.key] }} />)}
          </div>
          <ul className="mt-3 grid grid-cols-3 gap-3">
            {rows.map((r) => (
              <li key={r.key} className="min-w-0 text-sm" data-testid={`resolved-by-${r.key}`}>
                <span className="flex items-center gap-1.5 text-ink-muted"><span className="h-2 w-2 rounded-full" style={{ background: RESOLVER_COLORS[r.key] }} aria-hidden />{r.label}</span>
                <span className="font-medium tabular-nums text-ink">{r.count.toLocaleString()}</span> <span className="tabular-nums text-ink-muted">· {pct(r.count)}%</span>
              </li>
            ))}
          </ul>
          <div className="mt-auto border-t border-border/70 pt-4"><ChatTimingGrid /></div>
        </div>
      ) : (
        <div role="tabpanel" aria-labelledby={`ai-tab-${tab}`} className="flex-1" data-testid={tab === 'reasons' ? 'chart-escalation-reasons' : 'chart-top-tags'}>
          {top6.every((r) => r.count === 0) ? (
            <p className="flex min-h-[240px] items-center justify-center text-sm text-ink-muted" data-testid="why-person-empty">No data for this period</p>
          ) : (
            <RankedList rows={top6} color={tab === 'reasons' ? chartColors.escalation : chartColors.tags} testId={tab === 'reasons' ? 'escalation-row' : 'tag-row'} />
          )}
        </div>
      )}
    </Panel>
  )
}

import { Area, AreaChart, Tooltip, XAxis, YAxis } from 'recharts'
import type { DashboardSummary } from '@/types'
import { Legend } from '@/components/ChartCard'
import { chartColors } from '@/theme/tokens'
import { ChartFigure, Responsive, axisProps, tooltipProps } from './chartTheme'
import { Panel, RankedList } from './Panel'

type Props = { data?: DashboardSummary; loading: boolean }
const mutedAxis = { ...axisProps, axisLine: false, tick: { ...axisProps.tick, fontSize: 11 } } as const

export function VolumeChart({ data, loading }: Props) {
  const rows = data?.volumeByChannel ?? []
  const email = rows.reduce((s, r) => s + r.email, 0)
  const chat = rows.reduce((s, r) => s + r.chat, 0)
  return (
    <Panel
      title="Ticket volume"
      description="New tickets by channel"
      loading={loading}
      empty={email + chat === 0}
      height={280}
      testId="chart-volume-by-channel"
      action={<Legend items={[{ label: 'Email', color: chartColors.email, value: email.toLocaleString() }, { label: 'Chat', color: chartColors.chat, value: chat.toLocaleString() }]} />}
    >
      <ChartFigure summary={`Email ${email} tickets, chat ${chat} tickets`} height={280}>
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

export function ResolvedByChart({ data, loading }: Props) {
  const rows = data?.resolvedBy ?? []
  const total = rows.reduce((s, r) => s + r.count, 0)
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0)
  return (
    <Panel title="Resolved by" description={`${total.toLocaleString()} tickets closed`} loading={loading} empty={total === 0} height={96} testId="chart-resolved-by">
      <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full" role="img" aria-label={rows.map((r) => `${r.label} ${r.count}, ${pct(r.count)}%`).join('; ')} data-testid="resolved-by-bar">
        {rows.filter((r) => r.count > 0).map((r) => (
          <div key={r.key} className="h-full transition-[width] duration-500 first:rounded-l-full last:rounded-r-full" style={{ width: `${(r.count / total) * 100}%`, background: RESOLVER_COLORS[r.key] }} />
        ))}
      </div>
      <ul className="mt-5 grid grid-cols-3 gap-4">
        {rows.map((r) => (
          <li key={r.key} className="min-w-0" data-testid={`resolved-by-${r.key}`}>
            <span className="flex items-center gap-1.5 text-xs text-ink-muted">
              <span className="h-2 w-2 rounded-full" style={{ background: RESOLVER_COLORS[r.key] }} aria-hidden />
              {r.label}
            </span>
            <span className="mt-1 block text-sm tabular-nums text-ink-muted">
              <span className="font-display text-xl font-medium text-ink">{pct(r.count)}%</span> · {r.count.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

export function EscalationChart({ data, loading }: Props) {
  const rows = (data?.escalationReasons ?? []).map((r) => ({ key: r.key, label: r.label, count: r.count }))
  return (
    <Panel title="Escalation reasons" description="Why tickets reached a human" loading={loading} empty={rows.every((r) => r.count === 0)} testId="chart-escalation-reasons">
      <RankedList rows={rows} color={chartColors.escalation} testId="escalation-row" />
    </Panel>
  )
}

export function TopTagsChart({ data, loading }: Props) {
  const rows = (data?.topTags ?? []).map((t) => ({ key: t.tag, label: t.tag, count: t.count }))
  return (
    <Panel title="Top tags" description="Most common topics" loading={loading} empty={rows.length === 0} testId="chart-top-tags">
      <RankedList rows={rows} color={chartColors.tags} testId="tag-row" />
    </Panel>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import { Flag, MessageSquareQuote } from 'lucide-react'
import type { CsatResponse, CsatSummary, ScoreSplit } from '@/types'
import { ScoreChip } from '@/components/ScoreChip'
import { EmptyState } from '@/components/States'
import { Skeleton } from '@/components/ui/skeleton'
import { chartColors } from '@/theme/tokens'
import { CHANNEL_LABELS, RESOLVER_LABELS } from '@/lib/labels'
import { timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'
import { ChartFigure, Responsive, axisProps, tooltipProps } from './chartTheme'
import { Panel } from './Panel'

type Props = { csat?: CsatSummary; loading: boolean }
const mutedAxis = { ...axisProps, axisLine: false, tick: { ...axisProps.tick, fontSize: 11 } } as const

export function CsatTrend({ csat, loading }: Props) {
  const rows = csat?.trend ?? []
  return (
    <Panel title="Average score" description={`${csat?.totalResponses?.toLocaleString() ?? 0} responses`} loading={loading} empty={!csat?.totalResponses} testId="chart-csat-trend" className="lg:col-span-2" height={200}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <p className="shrink-0" data-testid="csat-average">
          <span className="font-display text-5xl font-medium tracking-tight text-ink">{csat?.average?.toFixed(2) ?? '—'}</span>
          <span className="ml-1 text-sm text-ink-muted">/ 5</span>
        </p>
        <div className="min-w-0 flex-1">
          <ChartFigure summary={`CSAT average ${csat?.average?.toFixed(2) ?? 'n/a'}`} height={180}>
            <Responsive>
              <LineChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="label" {...mutedAxis} minTickGap={32} />
                <YAxis domain={[1, 5]} ticks={[1, 3, 5]} {...mutedAxis} width={24} />
                <Tooltip {...tooltipProps} cursor={{ stroke: chartColors.grid }} />
                <Line type="monotone" dataKey="average" name="Average" stroke={chartColors.trend} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: chartColors.chat, strokeWidth: 0 }} connectNulls />
              </LineChart>
            </Responsive>
          </ChartFigure>
        </div>
      </div>
    </Panel>
  )
}

export function CsatDistribution({ csat, loading }: Props) {
  const rows = [...(csat?.distribution ?? [])].sort((a, b) => b.score - a.score)
  const total = rows.reduce((s, r) => s + r.count, 0)
  return (
    <Panel title="Score distribution" description="Responses by score" loading={loading} empty={!csat?.totalResponses} testId="chart-csat-distribution" height={200}>
      <ul className="space-y-3" aria-label={rows.map((r) => `${r.score} stars: ${r.count}`).join(', ')}>
        {rows.map((r) => (
          <li key={r.score} className="flex items-center gap-3 text-sm" data-testid={`csat-dist-${r.score}`}>
            <span className="w-7 tabular-nums text-ink-muted">{r.score}★</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted" aria-hidden>
              <span className="block h-full rounded-full" style={{ width: `${total ? (r.count / total) * 100 : 0}%`, background: chartColors.scores[r.score - 1] }} />
            </span>
            <span className="w-10 text-right tabular-nums font-medium text-ink">{r.count}</span>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

function SplitRows<K extends string>({ title, rows, testId }: { title: string; rows: ScoreSplit<K>[]; testId: string }) {
  return (
    <div data-testid={testId}>
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-ink-subtle">{title}</p>
      <ul className="divide-y divide-border/70">
        {rows.map((r) => (
          <li key={r.key} className="flex items-baseline justify-between gap-3 py-2 text-sm" data-testid={`csat-split-${r.key}`}>
            <span className="text-ink">{r.label}</span>
            <span className="tabular-nums text-ink-muted">
              <span className="font-semibold text-ink">{r.average?.toFixed(2) ?? '—'}</span> · {r.responses}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function CsatSplits({ csat, loading }: Props) {
  return (
    <Panel title="Splits" description="Average score · responses" loading={loading} empty={!csat?.totalResponses} testId="csat-splits" height={200}>
      <div className="space-y-5">
        <SplitRows title="By channel" rows={csat?.byChannel ?? []} testId="chart-csat-by-channel" />
        <SplitRows title="By resolver" rows={csat?.byResolver ?? []} testId="chart-csat-by-resolver" />
      </div>
    </Panel>
  )
}

function ResponseRow({ r, flag }: { r: CsatResponse; flag?: boolean }) {
  return (
    <li>
      <Link to={`/inbox/${r.ticketId}`} data-testid={`${flag ? 'low-score' : 'csat-comment'}-${r.id}`} className="flex gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <ScoreChip score={r.score} className="self-start" />
        <span className="min-w-0 flex-1">
          {r.comment && <span className="block text-sm text-ink">“{r.comment}”</span>}
          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
            <span className="font-medium text-ink">{r.customerName}</span>
            <span aria-hidden>·</span>
            <span>{r.ticketId}</span>
            <span aria-hidden>·</span>
            <span>{CHANNEL_LABELS[r.channel]}, {RESOLVER_LABELS[r.resolvedBy]}</span>
            <span aria-hidden>·</span>
            <span>{timeAgo(r.createdAt)}</span>
            {flag && r.needsFollowUp && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-700" data-testid="needs-follow-up-flag">
                <Flag className="h-3 w-3" aria-hidden /> Needs follow-up
              </span>
            )}
          </span>
        </span>
      </Link>
    </li>
  )
}

export function CsatFeedback({ csat, loading }: Props) {
  const [tab, setTab] = useState<'comments' | 'followup'>('comments')
  const comments = csat?.latestComments ?? []
  const low = csat?.lowScores ?? []
  const tabs = [
    { id: 'comments' as const, label: 'Latest comments' },
    { id: 'followup' as const, label: `Needs follow-up (${low.length})` },
  ]
  return (
    <section className="flex min-w-0 flex-col rounded-2xl bg-surface p-6 shadow-[0_1px_2px_rgba(31,29,26,0.04)]" data-testid="csat-feedback">
      <div role="tablist" aria-label="Customer feedback" className="mb-4 inline-flex w-fit gap-0.5 rounded-full bg-surface-muted p-1">
        {tabs.map((t) => (
          <button key={t.id} type="button" role="tab" id={`csat-tab-${t.id}`} aria-selected={tab === t.id} aria-controls={`csat-panel-${t.id}`} onClick={() => setTab(t.id)} className={cn('h-8 rounded-full px-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', tab === t.id ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(31,29,26,0.12)]' : 'text-ink-muted hover:text-ink')} data-testid={`csat-tab-${t.id}`}>
            {t.label}
          </button>
        ))}
      </div>
      {loading ? (
        <Skeleton className="h-[240px] w-full rounded-xl" />
      ) : tab === 'comments' ? (
        <div role="tabpanel" id="csat-panel-comments" aria-labelledby="csat-tab-comments" data-testid="csat-latest-comments">
          {comments.length === 0 ? (
            <EmptyState compact title="No data for this period" description="No comments in this range yet." icon={<MessageSquareQuote className="h-5 w-5" aria-hidden />} testId="csat-latest-comments-empty" />
          ) : (
            <ul className="-mx-3 grid md:grid-cols-2 md:gap-x-4">{comments.map((r) => <ResponseRow key={r.id} r={r} />)}</ul>
          )}
        </div>
      ) : (
        <div role="tabpanel" id="csat-panel-followup" aria-labelledby="csat-tab-followup" data-testid="csat-low-scores">
          <p className="mb-2 text-sm text-ink-muted">Scores of 2 or lower, newest first</p>
          {low.length === 0 ? (
            <EmptyState compact title="No data for this period" description="No low scores in this range." icon={<Flag className="h-5 w-5" aria-hidden />} testId="csat-low-scores-empty" />
          ) : (
            <ul className="-mx-3 grid md:grid-cols-2 md:gap-x-4">{low.map((r) => <ResponseRow key={r.id} r={r} flag />)}</ul>
          )}
        </div>
      )}
    </section>
  )
}

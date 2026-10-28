import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import { Flag, MessageSquareQuote } from 'lucide-react'
import type { CsatResponse, CsatSummary, KpiMetric } from '@/types'
import { ScoreChip } from '@/components/ScoreChip'
import { EmptyState } from '@/components/States'
import { chartColors } from '@/theme/tokens'
import { CHANNEL_LABELS, RESOLVER_LABELS } from '@/lib/labels'
import { timeAgo } from '@/lib/format'
import { useAuth } from '@/components/auth/AuthContext'
import { Num } from '@/components/Num'
import { ChartFigure, Responsive, axisProps, tooltipProps } from './chartTheme'
import { Panel, PillTabs, ViewAll } from './Panel'
import { Sheet, SheetCloseButton, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'

type Props = { csat?: CsatSummary; rate?: KpiMetric; loading: boolean; error?: boolean; onRetry?: () => void }
const mutedAxis = { ...axisProps, axisLine: false, tick: { ...axisProps.tick, fontSize: 11 } } as const

function ResponseRow({ r, flag }: { r: CsatResponse; flag?: boolean }) {
  return (
    <li>
      <Link to={`/inbox/${r.ticketId}`} data-testid={`${flag ? 'low-score' : 'csat-comment'}-${r.id}`} className="flex gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <ScoreChip score={r.score} className="self-start" />
        <span className="min-w-0 flex-1">
          {r.comment && <span className="block truncate text-sm text-ink">“{r.comment}”</span>}
          <span className="mt-0.5 block truncate text-xs text-ink-muted">
            <span className="font-medium text-ink">{r.customerName}</span> · {r.ticketId} · {CHANNEL_LABELS[r.channel]}, {RESOLVER_LABELS[r.resolvedBy]} · {timeAgo(r.createdAt)}
            {flag && r.needsFollowUp && <span className="ml-2 font-medium text-amber-700" data-testid="needs-follow-up-flag">Needs follow-up</span>}
          </span>
        </span>
      </Link>
    </li>
  )
}

// One "Customer satisfaction" card (REQ-704..706).
export function CsatCard({ csat, rate, loading, error, onRetry }: Props) {
  const { user } = useAuth()
  const [tab, setTab] = useState<'comments' | 'followup'>('comments')
  const dist = [...(csat?.distribution ?? [])].sort((a, b) => b.score - a.score)
  const total = dist.reduce((s, r) => s + r.count, 0)
  const allComments = csat?.latestComments ?? []
  const allLow = csat?.lowScores ?? []
  const comments = allComments.slice(0, 3)
  const low = allLow.slice(0, 3)
  const [sheet, setSheet] = useState(false)
  const splits = [...(csat?.byChannel ?? []), ...(csat?.byResolver ?? [])]
  return (
    <Panel
      title="Customer satisfaction"
      description={csat?.totalResponses ? `${csat.totalResponses.toLocaleString()} responses` : undefined}
      loading={loading}
      error={error}
      onRetry={onRetry}
      empty={!csat?.totalResponses}
      height={320}
      testId="csat-section"
      action={user?.role === 'admin' && <Link to="/settings/csat" className="inline-flex shrink-0 items-center rounded text-[13px] font-medium text-tobacco-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-sm:min-h-11" data-testid="csat-settings-button">CSAT settings</Link>}
    >
      <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <div className="flex items-end gap-6">
            <div><p className="text-xs font-medium text-ink-muted">Average</p><p className="text-[28px] leading-8 text-ink" data-testid="csat-average"><Num value={`${csat?.average?.toFixed(2) ?? '—'} / 5`} /></p></div>
            <div><p className="text-xs font-medium text-ink-muted">Response rate</p><p className="text-[28px] leading-8 text-ink" data-testid="csat-response-rate"><Num value={rate?.value != null ? `${rate.value.toFixed(1)}%` : '—'} /></p></div>
          </div>
          <div data-testid="chart-csat-trend" className="mt-3">
            <ChartFigure summary={`CSAT average ${csat?.average?.toFixed(2) ?? 'n/a'}`} height={80}>
              <Responsive>
                <LineChart data={csat?.trend ?? []} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <XAxis dataKey="label" {...mutedAxis} minTickGap={40} />
                  <YAxis domain={[1, 5]} ticks={[1, 5]} {...mutedAxis} width={20} />
                  <Tooltip {...tooltipProps} cursor={{ stroke: chartColors.grid }} />
                  <Line type="monotone" dataKey="average" name="Average" stroke={chartColors.trend} strokeWidth={2} dot={false} connectNulls />
                </LineChart>
              </Responsive>
            </ChartFigure>
          </div>
        </div>
        <ul className="space-y-2" aria-label={dist.map((r) => `${r.score} stars: ${r.count}`).join(', ')} data-testid="chart-csat-distribution">
          {dist.map((r) => (
            <li key={r.score} className="flex items-center gap-3 text-sm" data-testid={`csat-dist-${r.score}`}>
              <span className="w-7 tabular-nums text-ink-muted">{r.score}★</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted" aria-hidden><span className="block h-full rounded-full" style={{ width: `${total ? (r.count / total) * 100 : 0}%`, background: chartColors.scores[r.score - 1] }} /></span>
              <span className="w-10 text-right tabular-nums font-medium text-ink">{r.count}</span>
            </li>
          ))}
        </ul>
      </div>
      <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-y border-border/70 py-3 text-[13px]" data-testid="csat-splits">
        {splits.map((r) => <li key={r.key} className="whitespace-nowrap text-ink-muted" data-testid={`csat-split-${r.key}`}>{r.label} <span className="font-semibold tabular-nums text-ink">{r.average?.toFixed(2) ?? '—'}</span></li>)}
      </ul>
      <div className="mt-4 flex flex-1 flex-col" data-testid="csat-feedback">
        <div className="flex items-center justify-between gap-2"><PillTabs tabs={[{ id: 'comments', label: 'Latest comments' }, { id: 'followup', label: `Needs follow-up (${csat?.lowScores.length ?? 0})` }]} value={tab} onChange={setTab} label="Customer feedback" testId="csat-tab" /><ViewAll count={tab === 'comments' ? allComments.length : allLow.length} onClick={() => setSheet(true)} testId="csat-view-all" /></div>
        <div role="tabpanel" aria-labelledby={`csat-tab-${tab}`} className="mt-3" data-testid={tab === 'comments' ? 'csat-latest-comments' : 'csat-low-scores'}>
          {tab === 'comments' ? (
            comments.length === 0 ? <EmptyState compact title="No comments in this period" icon={<MessageSquareQuote className="h-5 w-5" aria-hidden />} testId="csat-latest-comments-empty" /> : <ul className="-mx-3">{comments.map((r) => <ResponseRow key={r.id} r={r} />)}</ul>
          ) : low.length === 0 ? (
            <EmptyState compact title="No low scores in this period." icon={<Flag className="h-5 w-5" aria-hidden />} testId="csat-low-scores-empty" />
          ) : <ul className="-mx-3">{low.map((r) => <ResponseRow key={r.id} r={r} flag />)}</ul>}
        </div>
      </div>
      <Sheet open={sheet} onOpenChange={setSheet}>
        <SheetContent className="sm:max-w-[520px]" data-testid="csat-sheet">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div><SheetTitle className="text-[15px] font-semibold text-ink">Customer feedback</SheetTitle><SheetDescription className="text-sm text-ink-muted">{allComments.length} comments · {allLow.length} need follow-up</SheetDescription></div>
            <SheetCloseButton label="Close customer feedback" data-testid="csat-sheet-close" />
          </div>
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-4">
            <section><h4 className="mb-2 text-[13px] font-semibold text-ink">Needs follow-up</h4>{allLow.length ? <ul className="-mx-3" data-testid="csat-sheet-low">{allLow.map((r) => <ResponseRow key={r.id} r={r} flag />)}</ul> : <p className="text-sm text-ink-muted">No low scores in this period.</p>}</section>
            <section><h4 className="mb-2 text-[13px] font-semibold text-ink">Latest comments</h4><ul className="-mx-3" data-testid="csat-sheet-comments">{allComments.map((r) => <ResponseRow key={r.id} r={r} />)}</ul></section>
          </div>
        </SheetContent>
      </Sheet>
    </Panel>
  )
}

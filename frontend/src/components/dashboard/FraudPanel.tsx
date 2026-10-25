import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import type { FraudAction, FraudAlert } from '@/types'
import { refundsApi, ticketsApi } from '@/api'
import { useApi, useDemoState } from '@/hooks/useApi'
import { useAuth } from '@/components/auth/AuthContext'
import { useShellData } from '@/components/shell/ShellData'
import { EmptyState, ErrorState } from '@/components/States'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Panel } from './Panel'
import { FraudAlertRow } from './FraudBits'

const TOAST: Record<FraudAction, string> = { safe: 'Marked safe', held: 'Refund held', escalated: 'Escalated to admin' }
const FAIL = "Couldn't update the alert. Try again."

export function FraudPanel({ onReviewed }: { onReviewed: () => void }) {
  const { data, loading, error, reload } = useApi(() => refundsApi.getFraudAlerts(), [])
  const demo = useDemoState()
  const { user } = useAuth()
  const { upsert } = useShellData()
  const { hash } = useLocation()
  const [alerts, setAlerts] = useState<FraudAlert[] | null>(null)
  const [tab, setTab] = useState<'open' | 'reviewed'>('open')
  const [busy, setBusy] = useState<string | null>(null)
  useEffect(() => { if (data) setAlerts(data) }, [data])
  useEffect(() => { if (hash === '#fraud' && alerts) document.getElementById('fraud')?.scrollIntoView({ block: 'start' }) }, [hash, alerts === null])

  const replace = (a: FraudAlert) => setAlerts((cur) => cur?.map((x) => (x.id === a.id ? a : x)) ?? null)
  const synced = (ticketId: string) => { onReviewed(); ticketsApi.getTicket(ticketId).then((t) => t && upsert([t]), () => undefined) }
  const undo = async (a: FraudAlert) => {
    try { replace(await refundsApi.undoFraudReview(a.id)); synced(a.ticketId); toast('Alert moved back to Open') } catch { toast.error(FAIL) }
  }
  const act = async (a: FraudAlert, action: FraudAction) => {
    setBusy(a.id)
    try {
      const r = await refundsApi.reviewFraudAlert(a.id, action, user!)
      replace(r.alert)
      synced(a.ticketId)
      toast.success(TOAST[action], { action: { label: 'Undo', onClick: () => void undo(a) } })
    } catch { toast.error(FAIL) }
    setBusy(null)
  }

  const open = alerts?.filter((a) => a.status === 'open') ?? []
  const reviewed = (alerts ?? []).filter((a) => a.status !== 'open').sort((a, b) => (b.reviewedAt ?? '').localeCompare(a.reviewedAt ?? ''))
  const list = tab === 'open' ? open : reviewed
  return (
    <div id="fraud" className="min-w-0 scroll-mt-24">
      <Panel
        title="Fraud alerts"
        description="Risk-scored refund and order signals"
        loading={demo === 'loading' || (loading && !alerts)}
        height={420}
        testId="fraud-panel"
        action={alerts && <span className="shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700" data-testid="fraud-open-count">{open.length} open</span>}
      >
        {!alerts ? (error && <ErrorState title="Fraud alerts didn't load" description="We couldn't fetch alerts just now." onRetry={reload} testId="fraud-error" />) : (
          <div className="space-y-4">
            {error && (
              <div role="alert" className="flex flex-wrap items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" data-testid="fraud-stale-error">
                <span className="flex-1">Couldn't refresh fraud alerts. Showing the last loaded list.</span>
                <Button size="sm" variant="outline" onClick={reload} data-testid="fraud-retry">Try again</Button>
              </div>
            )}
            <div role="tablist" aria-label="Alert status" className="inline-flex rounded-full bg-surface-muted p-1">
              {(['open', 'reviewed'] as const).map((k) => (
                <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-full px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-sm:min-h-11', tab === k ? 'bg-surface text-ink shadow-card' : 'text-ink-muted hover:text-ink')} data-testid={`fraud-tab-${k}`}>
                  {k === 'open' ? `Open (${open.length})` : `Reviewed (${reviewed.length})`}
                </button>
              ))}
            </div>
            {list.length === 0 ? (
              <div className="flex min-h-[200px] items-center justify-center">
                {tab === 'open'
                  ? <EmptyState compact title="No open fraud alerts. All clear." icon={<ShieldCheck className="h-5 w-5" aria-hidden />} testId="fraud-empty" />
                  : <EmptyState compact title="Nothing reviewed yet." icon={<ShieldCheck className="h-5 w-5" aria-hidden />} testId="fraud-reviewed-empty" />}
              </div>
            ) : (
              <div role="tabpanel" aria-label={tab === 'open' ? 'Open alerts' : 'Reviewed alerts'}>
                <ul className="divide-y divide-border/70" data-testid={`fraud-list-${tab}`}>
                  {list.map((a) => <FraudAlertRow key={a.id} a={a} onAction={act} busy={busy === a.id} />)}
                </ul>
              </div>
            )}
          </div>
        )}
      </Panel>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { MoreHorizontal, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import type { FraudAction, FraudAlert } from '@/types'
import { refundsApi, ticketsApi } from '@/api'
import { useApi, useDemoState } from '@/hooks/useApi'
import { useAuth } from '@/components/auth/AuthContext'
import { useShellData } from '@/components/shell/ShellData'
import { EmptyState, ErrorState } from '@/components/States'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { Panel, ViewAll } from './Panel'
import { Sheet, SheetCloseButton, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { ACTIONS, FraudAlertRow, FraudCompactRow } from './FraudBits'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { buttonVariants } from '@/components/ui/button'

const TOAST: Record<FraudAction, string> = { safe: 'Marked safe', held: 'Refund held', escalated: 'Escalated to admin' }
const FAIL = "Couldn't update the alert. Try again."

export function FraudPanel({ onReviewed, bare, onCount }: { onReviewed: () => void; bare?: boolean; onCount?: (n: number) => void }) {
  const { data, loading, error, reload } = useApi(() => refundsApi.getFraudAlerts(), [])
  const demo = useDemoState()
  const { user } = useAuth()
  const { upsert } = useShellData()
  const { hash } = useLocation()
  const [alerts, setAlerts] = useState<FraudAlert[] | null>(null)
  const [tab, setTab] = useState<'open' | 'reviewed'>('open')
  const [busy, setBusy] = useState<string | null>(null)
  const [pending, setPending] = useState<{ a: FraudAlert; action: FraudAction } | null>(null)
  const [note, setNote] = useState('')
  const [all, setAll] = useState(false)
  const [lastDone, setLastDone] = useState<{ a: FraudAlert; label: string } | null>(null)
  useEffect(() => { if (data) setAlerts(data) }, [data])
  useEffect(() => { if (hash === '#fraud' && alerts) document.getElementById('fraud')?.scrollIntoView({ block: 'start' }) }, [hash, alerts === null])

  const replace = (a: FraudAlert) => setAlerts((cur) => cur?.map((x) => (x.id === a.id ? a : x)) ?? null)
  const synced = (ticketId: string) => { onReviewed(); ticketsApi.getTicket(ticketId).then((t) => t && upsert([t]), () => undefined) }
  const undo = async (a: FraudAlert) => {
    try { replace(await refundsApi.undoFraudReview(a.id)); synced(a.ticketId); toast('Alert moved back to Open') } catch { toast.error(FAIL) }
  }
  const act = (a: FraudAlert, action: FraudAction) => { setNote(''); setPending({ a, action }) }
  const confirm = async () => {
    if (!pending) return
    const { a, action } = pending
    setPending(null)
    setBusy(a.id)
    try {
      const r = await refundsApi.reviewFraudAlert(a.id, action, user!, note)
      replace(r.alert)
      if (all) setLastDone({ a, label: TOAST[action] })
      synced(a.ticketId)
      toast.success(note.trim() ? `${TOAST[action]} · note saved` : TOAST[action], { action: { label: 'Undo', onClick: () => void undo(a) } })
    } catch { toast.error(FAIL) }
    setBusy(null)
  }

  const open = (alerts?.filter((a) => a.status === 'open') ?? []).sort((a, b) => b.riskScore - a.riskScore)
  const reviewed = (alerts ?? []).filter((a) => a.status !== 'open').sort((a, b) => (b.reviewedAt ?? '').localeCompare(a.reviewedAt ?? ''))
  const list = tab === 'open' ? open : reviewed
  useEffect(() => { if (alerts) onCount?.(open.length) }, [alerts])
  const head = alerts && <span className="flex shrink-0 items-center gap-2"><span className="text-[13px] font-medium text-red-700" data-testid="fraud-open-count">{open.length} open (all time)</span><ViewAll count={open.length} onClick={() => { setTab('open'); setAll(true) }} testId="fraud-view-all" /></span>
  return (
    <div id="fraud" className="min-w-0 scroll-mt-24">
      <Panel
        title="Fraud alerts"
        description="Unreviewed flags across all dates"
        loading={demo === 'loading' || (loading && !alerts)}
        height={420}
        testId="fraud-panel"
        bare={bare}
        action={!bare && head}
      >
        {!alerts ? (error && <ErrorState title="Fraud alerts didn't load" description="We couldn't fetch alerts just now." onRetry={reload} testId="fraud-error" />) : (
          <div className="space-y-4">
            <div className="flex min-h-8 items-center justify-between gap-2"><p className="text-xs text-ink-muted" data-testid="fraud-helper">Unreviewed flags across all dates. Signals, not proof of fraud.</p>{bare && head}</div>
            {error && (
              <div role="alert" className="flex flex-wrap items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" data-testid="fraud-stale-error">
                <span className="flex-1">Couldn't refresh fraud alerts. Showing the last loaded list.</span>
                <Button size="sm" variant="outline" onClick={reload} data-testid="fraud-retry">Try again</Button>
              </div>
            )}
            {open.length === 0 ? (
              <div className="flex min-h-[168px] items-center justify-center"><EmptyState compact title="No open fraud alerts. All clear." icon={<ShieldCheck className="h-5 w-5" aria-hidden />} testId={all ? 'fraud-top-empty' : 'fraud-empty'} /></div>
            ) : !all && (
              <ul className="divide-y divide-border/70" data-testid="fraud-top-open">
                {open.slice(0, 3).map((a) => <FraudCompactRow key={a.id} a={a} menu={
                  <DropdownMenu>
                    <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }), 'max-sm:h-11 max-sm:w-11')} disabled={busy === a.id} aria-label={`Actions for ${a.customer}`} data-testid={`fraud-menu-${a.id}`}><MoreHorizontal aria-hidden /></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">{ACTIONS.map(([action, label, id]) => <DropdownMenuItem key={action} onSelect={() => act(a, action)} data-testid={`fraud-action-${id}-${a.id}`}>{label}</DropdownMenuItem>)}</DropdownMenuContent>
                  </DropdownMenu>
                } />)}
              </ul>
            )}
            {reviewed.length > 0 && open.length <= 3 && <Button size="sm" variant="ghost" onClick={() => { setTab('reviewed'); setAll(true) }} data-testid="fraud-view-reviewed">Reviewed ({reviewed.length})</Button>}
          </div>
        )}
      </Panel>
      <Sheet open={all} onOpenChange={setAll}>
        <SheetContent className="sm:max-w-[560px]" data-testid="fraud-sheet">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div><SheetTitle className="text-[15px] font-semibold text-ink">Fraud alerts</SheetTitle><SheetDescription className="text-sm text-ink-muted">Risk flags are signals, not proof of fraud.</SheetDescription></div>
            <SheetCloseButton label="Close fraud alerts" data-testid="fraud-sheet-close" />
          </div>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
            {lastDone && (
              <div role="status" className="flex items-center gap-3 rounded-xl bg-surface-sunken px-3 py-2 text-sm text-ink" data-testid="fraud-sheet-last">
                <span className="flex-1">{lastDone.label}: {lastDone.a.customer}</span>
                <Button size="sm" variant="outline" onClick={() => { void undo(lastDone.a); setLastDone(null) }} data-testid="fraud-sheet-undo">Undo</Button>
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
        </SheetContent>
      </Sheet>
      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent data-testid="fraud-note-dialog">
          <AlertDialogTitle>{pending ? `${TOAST[pending.action]}: ${pending.a.customer}` : ''}</AlertDialogTitle>
          <AlertDialogDescription>Add an optional note for the team. It's saved with the review.</AlertDialogDescription>
          <Textarea aria-label="Review note (optional)" className="mt-3" placeholder="e.g. Called the customer, address confirmed." value={note} onChange={(e) => setNote(e.target.value)} data-testid="fraud-note-input" />
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="fraud-note-cancel">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirm} data-testid="fraud-note-confirm">Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

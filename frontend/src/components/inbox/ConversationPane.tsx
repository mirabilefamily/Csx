import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Mail, MessageCircle, MoreHorizontal, PanelRight, SearchX } from 'lucide-react'
import { DialogTrigger } from '@radix-ui/react-dialog'
import { Dialog, DialogContent, DialogTitle, SheetGrabber } from '@/components/ui/dialog'
import { useIsPhone, useVisualViewportHeight } from '@/hooks/useIsPhone'
import type { Macro, Priority, TicketDetail, TicketStatus, User } from '@/types'
import { inboxApi, loopApi } from '@/api'
import { useApi } from '@/hooks/useApi'
import { useAuth } from '@/components/auth/AuthContext'
import { useShellData } from '@/components/shell/ShellData'
import { StatusPill } from '@/components/StatusPill'
import { EmptyState, ErrorState } from '@/components/States'
import { Skeleton } from '@/components/ui/skeleton'
import { Button, buttonVariants } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CHANNEL_LABELS, STATUS_LABELS } from '@/lib/labels'
import { timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'
import { MessageItem } from './MessageItem'
import { DraftCard } from './DraftCard'
import { EscalationChip, escalationPath } from './EscalationChip'
import { Composer, type ComposerHandle, type ComposerMode } from './Composer'
import { DetailsSidebar } from './DetailsSidebar'
import { CustomerRail, useCustomerPanel } from './CustomerPanel'
import { FraudBanner } from './FraudBanner'

export interface ConversationHandle {
  focusComposer: (mode: ComposerMode) => void
  closeTicket: () => void
}

interface Props {
  ticketId: string
  users: User[]
  macros: Macro[]
  onBack: () => void
}

const PRIORITIES: [Priority, string][] = [['low', 'Low'], ['normal', 'Normal'], ['high', 'High'], ['urgent', 'Urgent']]

function HeaderSelect({ label, value, onChange, children, testId }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode; testId: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-auto min-w-[120px] gap-2 text-xs max-sm:w-full" aria-label={label} data-testid={testId}><SelectValue /></SelectTrigger>
      <SelectContent position="item-aligned">{children}</SelectContent>
    </Select>
  )
}

export const ConversationPane = forwardRef<ConversationHandle, Props>(({ ticketId, users, macros, onBack }, ref) => {
  const { user } = useAuth()
  const { tickets, upsert } = useShellData()
  const { data, loading, error, reload } = useApi(() => inboxApi.getTicketDetail(ticketId), [ticketId])
  const [detail, setDetail] = useState<TicketDetail | null | undefined>()
  const customerId = detail?.customer?.id
  const loop = useApi(() => (customerId ? loopApi.getCustomerReturns(customerId) : Promise.resolve([])), [customerId])
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [collapsed, setCollapsed] = useCustomerPanel()
  const [editingDraft, setEditingDraft] = useState<string | null>(null)
  const [busyDraft, setBusyDraft] = useState<string | null>(null)
  const composer = useRef<ComposerHandle>(null)
  const thread = useRef<HTMLDivElement>(null)
  const isPhone = useIsPhone()
  const vvh = useVisualViewportHeight(isPhone)

  useEffect(() => {
    setDetail(data)
  }, [data])
  useEffect(() => {
    if (thread.current) thread.current.scrollTop = thread.current.scrollHeight
  }, [detail?.messages.length, detail?.drafts.length])

  const run = useCallback(async (fn: () => Promise<TicketDetail>, success?: string) => {
    try {
      const d = await fn()
      setDetail(d)
      upsert([d.ticket])
      if (success) toast.success(success)
      return true
    } catch {
      toast.error("Couldn't update ticket. Try again.")
      return false
    }
  }, [upsert])

  useImperativeHandle(ref, () => ({
    focusComposer: (mode) => composer.current?.focus(mode),
    closeTicket: () => { if (user && detail) void run(() => inboxApi.updateTicket(ticketId, { status: 'closed' }, user), `${ticketId} closed`) },
  }), [user, detail, run, ticketId])

  if (loading) return <div className="flex-1 space-y-4 p-6" data-testid="conversation-loading"><Skeleton className="h-6 w-2/3" /><Skeleton className="h-4 w-1/3" />{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
  if (error) return <div className="flex-1"><ErrorState title="This conversation didn't load" onRetry={reload} testId="conversation-error" /></div>
  if (!detail)
    return (
      <div className="flex-1" data-testid="ticket-not-found">
        <EmptyState title="Ticket not found" description={`We couldn't find ${ticketId}.`} icon={<SearchX className="h-6 w-6" aria-hidden />} action={<Link to="/inbox" className={buttonVariants({ variant: 'outline' })} data-testid="back-to-inbox">Back to inbox</Link>} />
      </div>
    )

  const ticket = tickets?.find((t) => t.id === ticketId) ?? detail.ticket
  const assigneeName = users.find((u) => u.id === ticket.assignee)?.name ?? null
  const steps = escalationPath({ ...detail, ticket }, assigneeName)
  const ChannelIcon = ticket.channel === 'email' ? Mail : MessageCircle
  const order = detail.customer?.orders.find((o) => o.number === ticket.orderNumber) ?? detail.customer?.orders[0]
  const vars: Record<string, string> = {
    'customer.first_name': ticket.customer.name.split(' ')[0],
    'customer.name': ticket.customer.name,
    'order.number': order?.number ?? 'your order',
    'order.carrier': order?.carrier ?? 'our carrier',
    'order.tracking_url': order?.trackingUrl ?? '(tracking link to follow)',
    'agent.first_name': user?.name.split(' ')[0] ?? 'The Goorin team',
  }
  const fill = (s: string) => s.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (m, k: string) => vars[k] ?? m)
  const update = (patch: Parameters<typeof inboxApi.updateTicket>[1]) => user && run(() => inboxApi.updateTicket(ticketId, patch, user))
  const selects = (
    <>
      <HeaderSelect label="Status" value={ticket.status} onChange={(v) => update({ status: v as TicketStatus })} testId="header-status">
        {(Object.keys(STATUS_LABELS) as TicketStatus[]).map((s) => <SelectItem key={s} value={s} data-testid={`header-status-${s}`}><StatusPill status={s} /></SelectItem>)}
      </HeaderSelect>
      <HeaderSelect label="Priority" value={ticket.priority} onChange={(v) => update({ priority: v as Priority })} testId="header-priority">
        {PRIORITIES.map(([p, l]) => <SelectItem key={p} value={p} data-testid={`header-priority-${p}`}>{l} priority</SelectItem>)}
      </HeaderSelect>
      <HeaderSelect label="Assignee" value={ticket.assignee ?? 'unassigned'} onChange={(v) => update({ assignee: v === 'unassigned' ? null : v })} testId="header-assignee">
        <SelectItem value="unassigned" data-testid="header-assignee-unassigned">Unassigned</SelectItem>
        {users.map((u) => <SelectItem key={u.id} value={u.id} data-testid={`header-assignee-${u.id}`}>{u.name}</SelectItem>)}
      </HeaderSelect>
    </>
  )

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 max-sm:fixed max-sm:inset-x-0 max-sm:top-0 max-sm:z-40 max-sm:bg-background max-sm:pt-[env(safe-area-inset-top)]" style={isPhone ? { height: vvh ?? '100dvh' } : undefined} data-testid="conversation">
      <section aria-label="Conversation" className="flex min-w-0 flex-1 flex-col">
        {isPhone ? (
          <header className="flex items-center gap-1 border-b border-border bg-surface px-1 py-1.5" data-testid="conversation-phone-header">
            <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to inbox" data-testid="conversation-back"><ArrowLeft aria-hidden /></Button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink" data-testid="conversation-customer">{ticket.customer.name}</p>
              <div className="flex items-center gap-1.5"><StatusPill status={ticket.status} /><span className="truncate text-xs text-ink-muted">{ticket.id}</span></div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setDetailsOpen(true)} data-testid="details-toggle"><PanelRight aria-hidden /> Details</Button>
            <Dialog>
              <DialogTrigger className={buttonVariants({ variant: 'ghost', size: 'icon' })} aria-label="Ticket actions" data-testid="ticket-actions-trigger"><MoreHorizontal className="h-5 w-5" aria-hidden /></DialogTrigger>
              <DialogContent className="space-y-4 pt-3" aria-describedby={undefined} data-testid="ticket-actions-sheet">
                <SheetGrabber />
                <DialogTitle className="text-base font-semibold text-ink">{ticket.subject}</DialogTitle>
                {selects}
              </DialogContent>
            </Dialog>
          </header>
        ) : (
        <header className="space-y-3 border-b border-border bg-surface px-4 py-4 md:px-6">
          <div className="flex items-start gap-3">
            <Button variant="ghost" size="sm" className="-ml-2 lg:hidden" onClick={onBack} data-testid="conversation-back"><ArrowLeft aria-hidden /> Back</Button>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-ink md:text-lg" data-testid="conversation-subject">{ticket.subject}</h2>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
                <span className="font-medium text-ink">{ticket.id}</span><span aria-hidden>·</span>
                <span>{ticket.customer.name}</span><span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1"><ChannelIcon className="h-3.5 w-3.5" aria-hidden /> {CHANNEL_LABELS[ticket.channel]}</span><span aria-hidden>·</span>
                <span>Opened {timeAgo(ticket.createdAt)}</span>
              </p>
            </div>
            <Button variant="outline" size="sm" className="lg:hidden" aria-expanded={detailsOpen} onClick={() => setDetailsOpen((o) => !o)} data-testid="details-toggle"><PanelRight aria-hidden /> Details</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <EscalationChip steps={steps} />
            <div className="ml-auto flex flex-nowrap items-center gap-2">{selects}</div>
          </div>
        </header>
        )}
        {detail.fraudAlert && <FraudBanner a={detail.fraudAlert} />}
        <div ref={thread} className="min-h-0 flex-1 overflow-y-auto bg-background px-4 py-6 md:px-6 max-sm:py-4">
          {isPhone && steps.length > 1 && <div className="mb-4"><EscalationChip steps={steps} /></div>}
          <ol className="space-y-4" aria-label="Messages" data-testid="message-thread">
            {detail.messages.map((m) => <MessageItem key={m.id} m={m} />)}
          </ol>
          {detail.drafts.length > 0 && (
            <ul className="mt-6 space-y-4" aria-label="Pending AI drafts">
              {detail.drafts.map((d) => (
                <DraftCard
                  key={d.id}
                  draft={d}
                  titles={detail.guidanceTitles}
                  editing={editingDraft === d.id}
                  busy={busyDraft === d.id}
                  onApprove={async () => {
                    if (!user) return
                    setBusyDraft(d.id)
                    await run(() => inboxApi.approveDraft(ticketId, d.id, user), 'Draft approved and sent')
                    setBusyDraft(null)
                  }}
                  onEdit={() => composer.current?.loadDraft(d.body, d.id)}
                  onDiscard={async () => {
                    const ok = await run(() => inboxApi.discardDraft(ticketId, d.id))
                    if (editingDraft === d.id) setEditingDraft(null)
                    if (ok) toast('Draft discarded', { action: { label: 'Undo', onClick: () => void run(() => inboxApi.restoreDraft(d), 'Draft restored') } })
                  }}
                />
              ))}
            </ul>
          )}
        </div>
        <Composer
          ref={composer}
          macros={macros}
          fill={fill}
          onDraftChange={setEditingDraft}
          onSend={(html, isInternal, draftId) => (user ? run(() => inboxApi.sendMessage(ticketId, { html, isInternal, draftId }, user), isInternal ? 'Note added' : 'Reply sent') : Promise.resolve(false))}
        />
      </section>
      <aside
        aria-label="Ticket details"
        className={cn('min-h-0 overflow-y-auto border-l border-border bg-surface lg:static lg:block lg:shrink-0 lg:shadow-none', collapsed ? 'lg:w-14' : 'lg:w-[240px] xl:w-[320px] wide:w-[340px]', detailsOpen ? 'absolute inset-y-0 right-0 z-20 block w-[min(100%,340px)] shadow-popover max-sm:fixed max-sm:inset-0 max-sm:z-50 max-sm:w-full max-sm:border-l-0 max-sm:pb-[env(safe-area-inset-bottom)] max-sm:pt-[env(safe-area-inset-top)]' : 'hidden')}
        data-testid={isPhone && detailsOpen ? 'ticket-details-sheet' : 'customer-panel'}
        data-state={collapsed ? 'collapsed' : 'open'}
      >
        {collapsed && <CustomerRail name={ticket.customer.name} orders={detail.customer?.orders.length ?? 0} returns={loop.data?.length} fraud={!!detail.fraudAlert} onExpand={() => setCollapsed(false)} />}
        <div id="customer-panel-body" className={collapsed ? 'lg:hidden' : undefined}>
          <DetailsSidebar d={{ ...detail, ticket }} loop={{ data: loop.data, error: loop.error, reload: loop.reload }} onClose={() => setDetailsOpen(false)} onCollapse={collapsed ? undefined : () => setCollapsed(true)} />
        </div>
      </aside>
    </div>
  )
})
ConversationPane.displayName = 'ConversationPane'

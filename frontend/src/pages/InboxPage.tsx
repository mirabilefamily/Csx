import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Keyboard, MessagesSquare } from 'lucide-react'
import type { BulkPatch, User } from '@/types'
import { directoryApi, inboxApi } from '@/api'
import { useApi } from '@/hooks/useApi'
import { useAuth } from '@/components/auth/AuthContext'
import { useShellData } from '@/components/shell/ShellData'
import { EmptyState } from '@/components/States'
import { Button } from '@/components/ui/button'
import { ViewsChips, ViewsDropdown, ViewsNav } from '@/components/inbox/ViewsNav'
import { useIsPhone } from '@/hooks/useIsPhone'
import { TicketFilters, activeFilterCount, matchFilters, type Filters } from '@/components/inbox/TicketFilters'
import { TicketList } from '@/components/inbox/TicketList'
import { ConversationPane, type ConversationHandle } from '@/components/inbox/ConversationPane'
import { ShortcutHelp } from '@/components/inbox/ShortcutHelp'
import { viewById, viewCounts } from '@/lib/inboxViews'
import { cn } from '@/lib/utils'

const EXTRA_TAGS = ['vip', 'follow-up', 'priority-shipping']
const plural = (n: number) => `${n} ticket${n === 1 ? '' : 's'}`

function isTyping(e: KeyboardEvent) {
  const el = e.target as HTMLElement | null
  return !!el?.closest('input, textarea, select, [contenteditable="true"], [role="combobox"], [role="dialog"], [role="menu"], [role="listbox"]')
}

export default function InboxPage() {
  const { ticketId } = useParams()
  const [params] = useSearchParams()
  const { search } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { tickets, loading, error, reload, upsert } = useShellData()
  const view = viewById(params.get('view'))
  const [filters, setFilters] = useState<Filters>({})
  const [selected, setSelected] = useState<string[]>([])
  const [help, setHelp] = useState(false)
  const isPhone = useIsPhone()
  const [selectMode, setSelectMode] = useState(false)
  const conv = useRef<ConversationHandle>(null)
  const { data: allUsers } = useApi(() => directoryApi.listUsers(), [])
  const { data: macros } = useApi(() => directoryApi.listMacros(), [])
  const users = useMemo(() => (allUsers ?? []).filter((u) => u.status === 'active'), [allUsers])

  const list = useMemo(() => (tickets ?? []).filter((t) => view.match(t, user?.id) && matchFilters(t, filters)), [tickets, view, user?.id, filters])
  const counts = useMemo(() => (tickets ? viewCounts(tickets, user?.id) : undefined), [tickets, user?.id])
  const tags = useMemo(() => [...new Set([...(tickets ?? []).flatMap((t) => t.tags), ...EXTRA_TAGS])].sort(), [tickets])

  useEffect(() => {
    setSelected([])
  }, [view.id])
  useEffect(() => {
    if (!loading) setSelected((s) => s.filter((id) => list.some((t) => t.id === id)))
  }, [list, loading])

  const open = (id: string) => navigate({ pathname: `/inbox/${id}`, search })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e)) return
      const idx = list.findIndex((t) => t.id === ticketId)
      if (e.key === 'j' && list.length) open(list[Math.min(list.length - 1, idx + 1)].id)
      else if (e.key === 'k' && list.length) open(list[Math.max(0, idx - 1)].id)
      else if (e.key === 'r' && ticketId) conv.current?.focusComposer('reply')
      else if (e.key === 'n' && ticketId) conv.current?.focusComposer('note')
      else if (e.key === 'e' && ticketId) conv.current?.closeTicket()
      else if (e.key === '?') setHelp(true)
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const bulk = async (patch: BulkPatch, message: string) => {
    if (!user) return
    try {
      upsert(await inboxApi.bulkUpdate(selected, patch, user))
      toast.success(message)
      if (patch.status) setSelected([])
    } catch {
      toast.error("Couldn't update tickets. Try again.")
    }
  }

  return (
    <div className="flex h-full min-h-0" data-testid="inbox-page">
      <ViewsNav active={view.id} counts={counts} loading={loading} />
      <section aria-label="Ticket list" className={cn('min-h-0 w-full flex-col border-r border-border bg-surface lg:flex lg:w-[232px] lg:shrink-0 xl:w-[280px] wide:w-[320px]', ticketId ? 'hidden' : 'flex')}>
        <div className="flex items-center gap-2 border-b border-border px-3 py-3">
          <h1 className="sr-only wide:not-sr-only wide:flex-1 wide:truncate wide:font-display wide:text-[24px] wide:text-ink" data-testid="page-title">{view.label}</h1>
          {isPhone ? <div className="min-w-0 flex-1"><h1 className="sr-only">{view.label}</h1><ViewsChips active={view.id} counts={counts} loading={loading} /></div> : <div className="min-w-0 flex-1 wide:hidden"><ViewsDropdown active={view.id} counts={counts} loading={loading} /></div>}
          <Button variant="ghost" size="icon-sm" className="hover-only" aria-label="Keyboard shortcuts" onClick={() => setHelp(true)} data-testid="shortcuts-button"><Keyboard aria-hidden /></Button>
        </div>
        <TicketList
          title={view.label}
          emptyText={view.empty}
          tickets={list}
          activeId={ticketId}
          loading={loading}
          error={error}
          onRetry={reload}
          filtered={activeFilterCount(filters) > 0}
          onClearFilters={() => setFilters({})}
          selected={selected}
          onSelect={setSelected}
          selectable={!isPhone || selectMode}
          users={users}
          tags={tags}
          onAssign={(u: User) => bulk({ assignee: u.id }, `${plural(selected.length)} assigned to ${u.name}`)}
          onTag={(tag) => bulk({ addTag: tag }, `Tag added to ${plural(selected.length)}`)}
          onBulkClose={() => bulk({ status: 'closed' }, `${plural(selected.length)} closed`)}
          toolbar={
            <>
              <span className="text-xs text-ink-muted" data-testid="list-count">{loading ? '…' : `${list.length} shown`}</span>
              {isPhone && <Button variant="ghost" size="sm" className="ml-auto" aria-pressed={selectMode} onClick={() => { setSelectMode((m) => !m); setSelected([]) }} data-testid="select-mode-toggle">{selectMode ? 'Done' : 'Select'}</Button>}
              <div className={isPhone ? '' : 'ml-auto'}><TicketFilters filters={filters} onChange={setFilters} tags={tags} users={users} /></div>
            </>
          }
        />
      </section>
      <div className={cn('min-h-0 min-w-0 flex-1 lg:flex', ticketId ? 'flex' : 'hidden')}>
        {ticketId ? (
          <ConversationPane key={ticketId} ref={conv} ticketId={ticketId} users={users} macros={macros ?? []} onBack={() => navigate({ pathname: '/inbox', search })} />
        ) : (
          <div className="flex flex-1 items-center justify-center" data-testid="conversation-placeholder">
            <EmptyState title="Select a ticket to view the conversation" description="Press j and k to move through the list, or ? for every shortcut." icon={<MessagesSquare className="h-6 w-6" aria-hidden />} />
          </div>
        )}
      </div>
      <ShortcutHelp open={help} onOpenChange={setHelp} />
    </div>
  )
}
